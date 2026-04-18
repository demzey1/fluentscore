import { z } from "zod";
import { type Address, createPublicClient, fallback, http, webSocket } from "viem";

import { env } from "@/lib/env";
import { fluentTestnetChain } from "@/lib/fluent/chain";

const RPC_TIMEOUT_MS = 8_000;

export const fluentPublicClient = createPublicClient({
  chain: fluentTestnetChain,
  transport: fallback(
    [
      webSocket(env.FLUENT_WS_RPC_URL, {
        retryCount: 2,
      }),
      http(env.FLUENT_RPC_URL, {
        timeout: RPC_TIMEOUT_MS,
        retryCount: 2,
      }),
    ],
    {
      rank: true,
    },
  ),
});

export type RpcClientResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function withTimeout<T>(operation: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`RPC request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    operation
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export async function getNativeBalance(address: Address): Promise<RpcClientResult<bigint>> {
  try {
    const balance = await withTimeout(
      fluentPublicClient.getBalance({ address }),
      RPC_TIMEOUT_MS,
    );

    return {
      ok: true,
      data: z.bigint().parse(balance),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Fluent RPC getBalance failure.";

    return {
      ok: false,
      error: message,
    };
  }
}
