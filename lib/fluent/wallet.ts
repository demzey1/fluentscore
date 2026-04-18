import { type Address, formatEther, getAddress } from "viem";

import {
  getActiveDays,
  getAddressTransactionsResult,
  getFirstSeenTransaction,
  getLastActivity,
  getTransactionCount,
  getUniqueContractsInteractedWith,
} from "@/lib/fluent/activity";
import { fluentTestnetChain } from "@/lib/fluent/chain";
import { getNativeBalance } from "@/lib/fluent/client";
import { type FluentExplorerTransaction } from "@/lib/fluent/explorer-client";

export interface NormalizedWalletRawPayload {
  chainId: number;
  normalizedAt: string;
  explorer: {
    transactions: FluentExplorerTransaction[];
  };
  rpc: {
    nativeBalanceWei: string;
    nativeBalanceEth: string;
  };
  sourceHealth: {
    explorer: "ok" | "degraded";
    rpc: "ok" | "degraded";
    warnings: string[];
  };
}

export interface NormalizedWalletSnapshot {
  address: Address;
  chainId: number;
  fetchedAt: string;
  transactionCount: number;
  uniqueContracts: number;
  activeDays: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  nativeBalanceWei: string;
  nativeBalanceEth: string;
  rawPayload: NormalizedWalletRawPayload;
  sourceHealth: {
    explorer: "ok" | "degraded";
    rpc: "ok" | "degraded";
    warnings: string[];
  };
}

export async function normalizeFluentWalletSnapshot(
  walletAddress: string,
): Promise<NormalizedWalletSnapshot> {
  const address = getAddress(walletAddress);
  const [transactionsResult, balanceResult] = await Promise.allSettled([
    getAddressTransactionsResult(address),
    getNativeBalance(address),
  ]);

  const warnings: string[] = [];

  const transactions =
    transactionsResult.status === "fulfilled" && transactionsResult.value.ok
      ? transactionsResult.value.transactions
      : [];

  if (transactionsResult.status === "fulfilled" && !transactionsResult.value.ok) {
    warnings.push(...transactionsResult.value.warnings);
  } else if (transactionsResult.status === "fulfilled") {
    warnings.push(...transactionsResult.value.warnings);
  } else {
    warnings.push("Explorer client promise rejected.");
  }

  const balanceWei =
    balanceResult.status === "fulfilled" && balanceResult.value.ok
      ? balanceResult.value.data
      : BigInt(0);

  if (balanceResult.status === "fulfilled" && !balanceResult.value.ok) {
    warnings.push(balanceResult.value.error);
  } else if (balanceResult.status === "rejected") {
    warnings.push("RPC balance promise rejected.");
  }

  const [transactionCount, uniqueContracts, activeDays, firstSeenTransaction, lastActivity] =
    await Promise.all([
      getTransactionCount(address, transactions),
      getUniqueContractsInteractedWith(address, transactions),
      getActiveDays(address, transactions),
      getFirstSeenTransaction(address, transactions),
      getLastActivity(address, transactions),
    ]);

  const sourceHealth = {
    explorer:
      transactionsResult.status === "fulfilled" && transactionsResult.value.ok
        ? "ok"
        : "degraded",
    rpc: balanceResult.status === "fulfilled" && balanceResult.value.ok ? "ok" : "degraded",
    warnings,
  } as const;

  const firstSeenAt = firstSeenTransaction
    ? new Date(Number(firstSeenTransaction.timeStamp) * 1000).toISOString()
    : null;
  const lastSeenAt = lastActivity ? lastActivity.toISOString() : null;

  if (sourceHealth.explorer === "degraded" || sourceHealth.rpc === "degraded") {
    console.warn(
      `[fluent][snapshot] Degraded data collection for ${address}: ${sourceHealth.warnings.join(
        " ",
      )}`,
    );
  }

  return {
    address,
    chainId: fluentTestnetChain.id,
    fetchedAt: new Date().toISOString(),
    transactionCount,
    uniqueContracts: uniqueContracts.length,
    activeDays,
    firstSeenAt,
    lastSeenAt,
    nativeBalanceWei: balanceWei.toString(),
    nativeBalanceEth: formatEther(balanceWei),
    rawPayload: {
      chainId: fluentTestnetChain.id,
      normalizedAt: new Date().toISOString(),
      explorer: {
        transactions,
      },
      rpc: {
        nativeBalanceWei: balanceWei.toString(),
        nativeBalanceEth: formatEther(balanceWei),
      },
      sourceHealth,
    },
    sourceHealth,
  };
}
