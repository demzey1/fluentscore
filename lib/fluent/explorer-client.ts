import { z } from "zod";
import { type Address } from "viem";

import { env } from "@/lib/env";

const EXPLORER_TIMEOUT_MS = 8_000;
const EXPLORER_MAX_RETRIES = 2;

const decimalStringSchema = z.string().regex(/^\d+$/);
const nullableStringSchema = z.union([z.string(), z.null()]).transform((value) => {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
});

export const explorerTransactionSchema = z
  .object({
    blockNumber: decimalStringSchema,
    timeStamp: decimalStringSchema,
    hash: z.string().min(1),
    nonce: decimalStringSchema,
    blockHash: z.string().optional(),
    transactionIndex: z.string().optional(),
    from: z.string().min(1),
    to: nullableStringSchema,
    value: decimalStringSchema,
    gas: decimalStringSchema.optional(),
    gasPrice: decimalStringSchema.optional(),
    input: z.string().optional(),
    contractAddress: z.string().optional(),
  })
  .passthrough();

const explorerResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.union([z.array(explorerTransactionSchema), z.string()]),
});

export type FluentExplorerTransaction = z.infer<typeof explorerTransactionSchema>;

type ExplorerFailureReason = "timeout" | "network" | "http" | "invalid-response";

export type ExplorerClientResult =
  | {
      ok: true;
      transactions: FluentExplorerTransaction[];
      warnings: string[];
    }
  | {
      ok: false;
      reason: ExplorerFailureReason;
      warnings: string[];
    };

export interface FluentExplorerDataSource {
  getAddressTransactions(address: Address): Promise<ExplorerClientResult>;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildExplorerUrl(address: Address) {
  const url = new URL(env.FLUENT_EXPLORER_API_URL);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", address);
  url.searchParams.set("sort", "desc");
  return url;
}

function isNoTransactionMessage(message: string, result: string) {
  const text = `${message} ${result}`.toLowerCase();
  return text.includes("no transactions");
}

function isRetryableExplorerMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate limit") ||
    normalized.includes("timeout") ||
    normalized.includes("temporarily unavailable")
  );
}

function isRetryableHttpStatus(statusCode: number) {
  return statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

async function fetchWithTimeout(
  input: URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseExplorerPayload(payload: unknown): ExplorerClientResult {
  const parsed = explorerResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid-response",
      warnings: ["Explorer payload failed schema validation."],
    };
  }

  const { status, message, result } = parsed.data;
  if (Array.isArray(result)) {
    return {
      ok: true,
      transactions: result,
      warnings: status === "1" ? [] : [`Explorer returned status ${status}: ${message}`],
    };
  }

  if (isNoTransactionMessage(message, result)) {
    return {
      ok: true,
      transactions: [],
      warnings: [],
    };
  }

  if (isRetryableExplorerMessage(`${message} ${result}`)) {
    return {
      ok: false,
      reason: "http",
      warnings: [`Explorer temporary response: ${message} (${result})`],
    };
  }

  return {
    ok: false,
    reason: "invalid-response",
    warnings: [`Explorer error response: ${message} (${result})`],
  };
}

export function createFluentExplorerClient(): FluentExplorerDataSource {
  return {
    async getAddressTransactions(address) {
      const endpoint = buildExplorerUrl(address);
      const warnings: string[] = [];

      for (let attempt = 0; attempt <= EXPLORER_MAX_RETRIES; attempt += 1) {
        try {
          const response = await fetchWithTimeout(
            endpoint,
            {
              method: "GET",
              next: {
                revalidate: 120,
                tags: [`wallet-activity:${address.toLowerCase()}`],
              },
            },
            EXPLORER_TIMEOUT_MS,
          );

          if (!response.ok) {
            warnings.push(`Explorer HTTP ${response.status} on attempt ${attempt + 1}.`);
            if (attempt < EXPLORER_MAX_RETRIES && isRetryableHttpStatus(response.status)) {
              await sleep(300 * (attempt + 1));
              continue;
            }

            return {
              ok: false,
              reason: "http",
              warnings,
            };
          }

          const payload: unknown = await response.json();
          const parsedPayload = parseExplorerPayload(payload);
          if (!parsedPayload.ok && attempt < EXPLORER_MAX_RETRIES) {
            warnings.push(...parsedPayload.warnings);
            await sleep(300 * (attempt + 1));
            continue;
          }

          if (parsedPayload.ok) {
            return {
              ok: true,
              transactions: parsedPayload.transactions,
              warnings: [...warnings, ...parsedPayload.warnings],
            };
          }

          return {
            ok: false,
            reason: parsedPayload.reason,
            warnings: [...warnings, ...parsedPayload.warnings],
          };
        } catch (error) {
          const isTimeout =
            error instanceof Error &&
            (error.name === "AbortError" ||
              error.message.toLowerCase().includes("aborted"));

          warnings.push(
            `${isTimeout ? "Explorer timeout" : "Explorer network error"} on attempt ${
              attempt + 1
            }.`,
          );

          if (attempt < EXPLORER_MAX_RETRIES) {
            await sleep(300 * (attempt + 1));
            continue;
          }

          return {
            ok: false,
            reason: isTimeout ? "timeout" : "network",
            warnings,
          };
        }
      }

      return {
        ok: false,
        reason: "network",
        warnings: ["Explorer request exhausted retries."],
      };
    },
  };
}

export const fluentExplorerClient = createFluentExplorerClient();
