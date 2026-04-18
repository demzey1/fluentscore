import { type Address } from "viem";

import { env } from "@/lib/env";
import { ExplorerError } from "@/lib/errors";
import {
  ExplorerBalanceResponseSchema,
  ExplorerTxListResponseSchema,
  type ExplorerTransaction,
  type ExplorerTxListResponse,
} from "@/lib/fluent/schemas";

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ExplorerError("Fluentscan request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestExplorer(url: URL): Promise<unknown> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        throw new ExplorerError("Fluentscan unavailable.");
      }
      return (await response.json()) as unknown;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        if (error instanceof ExplorerError) {
          throw error;
        }
        throw new ExplorerError("Fluentscan unavailable.");
      }
      await delay(RETRY_DELAY_MS);
    }
  }

  throw new ExplorerError("Fluentscan unavailable.");
}

function buildBaseApiUrl() {
  return new URL(env.FLUENTSCAN_API_URL);
}

function buildAccountUrl(
  action: "txlist" | "balance",
  address: Address,
  extra?: Record<string, string>,
) {
  const url = buildBaseApiUrl();
  url.searchParams.set("module", "account");
  url.searchParams.set("action", action);
  url.searchParams.set("address", address);

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export interface ExplorerAddressTransactions {
  transactions: ExplorerTransaction[];
  noActivity: boolean;
}

export interface ExplorerAddressInfo {
  balanceWei: string;
}

function isVerifiedNoActivityResponse(response: ExplorerTxListResponse) {
  const messageText = response.message.toLowerCase();
  const resultText = typeof response.result === "string" ? response.result.toLowerCase() : "";
  const combined = `${messageText} ${resultText}`;

  const hasNoTransactionSemantics =
    combined.includes("no transactions") || combined.includes("no transaction");

  if (!hasNoTransactionSemantics) {
    return false;
  }

  if (typeof response.result === "string") {
    return true;
  }

  return Array.isArray(response.result) && response.result.length === 0;
}

function toTransactionsOrThrow(response: ExplorerTxListResponse): ExplorerAddressTransactions {
  if (response.status === "1") {
    if (!Array.isArray(response.result)) {
      throw new ExplorerError("Invalid txlist response payload.");
    }
    return {
      transactions: response.result,
      noActivity: response.result.length === 0,
    };
  }

  if (isVerifiedNoActivityResponse(response)) {
    return {
      transactions: [],
      noActivity: true,
    };
  }

  throw new ExplorerError("Fluentscan txlist unavailable.");
}

export async function getAddressTransactions(
  address: Address,
): Promise<ExplorerAddressTransactions> {
  const url = buildAccountUrl("txlist", address, { sort: "asc" });
  const payload = await requestExplorer(url);
  const parsed = ExplorerTxListResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ExplorerError("Invalid txlist response from Fluentscan.");
  }

  return toTransactionsOrThrow(parsed.data);
}

export async function getAddressInfo(address: Address): Promise<ExplorerAddressInfo> {
  const url = buildAccountUrl("balance", address);
  const payload = await requestExplorer(url);
  const parsed = ExplorerBalanceResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ExplorerError("Invalid balance response from Fluentscan.");
  }

  if (parsed.data.status === "0") {
    const combined = `${parsed.data.message} ${parsed.data.result}`.toLowerCase();
    if (!combined.includes("no") && !combined.includes("found")) {
      throw new ExplorerError("Fluentscan balance unavailable.");
    }
    return {
      balanceWei: "0",
    };
  }

  return {
    balanceWei: parsed.data.result,
  };
}
