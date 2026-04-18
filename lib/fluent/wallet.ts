import { type Address } from "viem";

import { DataUnavailableError, ExplorerError } from "@/lib/errors";
import {
  getAddressTransactions,
  type ExplorerAddressTransactions,
} from "@/lib/fluent/explorer-client";
import { fluentClient, fluentTestnetChain } from "@/lib/fluent/client";
import type { ExplorerTransaction } from "@/lib/fluent/schemas";

const RPC_FALLBACK_TIMEOUT_MS = 8_000;

type SnapshotState = "ok" | "no_fluent_activity" | "partial_data";

function withTimeout<T>(operation: Promise<T>, timeoutMs: number, timeoutMessage: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new DataUnavailableError(timeoutMessage));
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

function toIsoFromUnix(timestamp: string) {
  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return new Date(parsed * 1000).toISOString();
}

function uniqueContractCount(transactions: ExplorerTransaction[]) {
  const uniqueContracts = new Set<string>();

  for (const tx of transactions) {
    if (tx.contractAddress && tx.contractAddress !== "0x") {
      uniqueContracts.add(tx.contractAddress.toLowerCase());
      continue;
    }

    const hasContractCallData =
      typeof tx.input === "string" && tx.input.length > 2 && tx.input !== "0x";
    if (hasContractCallData && tx.to && tx.to.startsWith("0x")) {
      uniqueContracts.add(tx.to.toLowerCase());
    }
  }

  return uniqueContracts.size;
}

function activeDaysCount(transactions: ExplorerTransaction[]) {
  const uniqueDays = new Set<string>();

  for (const tx of transactions) {
    const iso = toIsoFromUnix(tx.timeStamp);
    if (!iso) continue;
    uniqueDays.add(iso.slice(0, 10));
  }

  return uniqueDays.size;
}

function buildNoActivitySnapshot(
  address: Address,
  source: "explorer" | "rpc_fallback",
): NormalizedWalletSnapshot {
  return {
    address,
    chainId: fluentTestnetChain.id,
    fetchedAt: new Date().toISOString(),
    transactionCount: 0,
    uniqueContracts: 0,
    activeDays: 0,
    firstTxTimestamp: null,
    lastTxTimestamp: null,
    dataState: "no_fluent_activity",
    source,
    rawPayload: {
      source,
      reason: "no_fluent_activity",
    },
  };
}

export interface NormalizedWalletSnapshot {
  address: Address;
  chainId: number;
  fetchedAt: string;
  transactionCount: number;
  uniqueContracts: number | null;
  activeDays: number | null;
  firstTxTimestamp: string | null;
  lastTxTimestamp: string | null;
  dataState: SnapshotState;
  source: "explorer" | "rpc_fallback";
  rawPayload: Record<string, unknown>;
}

async function fromExplorer(
  address: Address,
  txPayload: ExplorerAddressTransactions,
): Promise<NormalizedWalletSnapshot> {
  if (txPayload.noActivity || txPayload.transactions.length === 0) {
    return buildNoActivitySnapshot(address, "explorer");
  }

  const firstTx = txPayload.transactions[0];
  const lastTx = txPayload.transactions[txPayload.transactions.length - 1];

  return {
    address,
    chainId: fluentTestnetChain.id,
    fetchedAt: new Date().toISOString(),
    transactionCount: txPayload.transactions.length,
    uniqueContracts: uniqueContractCount(txPayload.transactions),
    activeDays: activeDaysCount(txPayload.transactions),
    firstTxTimestamp: toIsoFromUnix(firstTx.timeStamp),
    lastTxTimestamp: toIsoFromUnix(lastTx.timeStamp),
    dataState: "ok",
    source: "explorer",
    rawPayload: {
      source: "explorer",
      transactions: txPayload.transactions,
    },
  };
}

async function fromRpcFallback(address: Address): Promise<NormalizedWalletSnapshot> {
  let txCount: number;
  try {
    txCount = await withTimeout(
      fluentClient.getTransactionCount({ address }),
      RPC_FALLBACK_TIMEOUT_MS,
      "RPC fallback timed out.",
    );
  } catch {
    throw new DataUnavailableError("Explorer and RPC sources are unavailable.");
  }

  if (!Number.isFinite(txCount) || txCount <= 0) {
    return buildNoActivitySnapshot(address, "rpc_fallback");
  }

  return {
    address,
    chainId: fluentTestnetChain.id,
    fetchedAt: new Date().toISOString(),
    transactionCount: txCount,
    uniqueContracts: null,
    activeDays: null,
    firstTxTimestamp: null,
    lastTxTimestamp: null,
    dataState: "partial_data",
    source: "rpc_fallback",
    rawPayload: {
      source: "rpc_fallback",
      transactionCount: String(txCount),
      reason: "explorer_unavailable",
    },
  };
}

export async function getNormalizedWalletSnapshot(
  address: Address,
): Promise<NormalizedWalletSnapshot> {
  try {
    const transactions = await getAddressTransactions(address);
    return fromExplorer(address, transactions);
  } catch (error) {
    if (error instanceof ExplorerError) {
      return fromRpcFallback(address);
    }
    throw new DataUnavailableError("Unable to normalize wallet snapshot.");
  }
}
