import { z } from "zod";
import { type Address, getAddress } from "viem";

import { env } from "@/lib/env";

const explorerTransactionSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  nonce: z.string(),
  blockHash: z.string().optional(),
  transactionIndex: z.string().optional(),
  from: z.string(),
  to: z.string().nullable(),
  value: z.string(),
  gas: z.string().optional(),
  gasPrice: z.string().optional(),
  input: z.string().optional(),
  contractAddress: z.string().optional(),
});

const explorerResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.union([z.array(explorerTransactionSchema), z.string()]),
});

export type FluentExplorerTransaction = z.infer<typeof explorerTransactionSchema>;

function getExplorerApiUrl(address: Address) {
  const url = new URL(env.FLUENT_EXPLORER_API_URL);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", address);
  url.searchParams.set("sort", "desc");
  return url;
}

export async function fetchFluentWalletActivity(
  walletAddress: string,
): Promise<FluentExplorerTransaction[]> {
  const address = getAddress(walletAddress);
  const endpoint = getExplorerApiUrl(address);
  const response = await fetch(endpoint, {
    next: {
      revalidate: 120,
      tags: [`wallet-activity:${address.toLowerCase()}`],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Fluent explorer activity (${response.status}).`);
  }

  const json: unknown = await response.json();
  const parsed = explorerResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected explorer response shape.");
  }

  if (!Array.isArray(parsed.data.result)) {
    return [];
  }

  return parsed.data.result;
}
