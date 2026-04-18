import { type Address, formatEther, getAddress } from "viem";

import { fetchFluentWalletActivity } from "@/lib/fluent/activity";
import { fluentTestnetChain } from "@/lib/fluent/chain";
import { fluentPublicClient } from "@/lib/fluent/client";

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
}

function toUtcDateKey(unixTimestamp: string) {
  const asDate = new Date(Number(unixTimestamp) * 1000);
  return asDate.toISOString().slice(0, 10);
}

export async function normalizeFluentWalletSnapshot(
  walletAddress: string,
): Promise<NormalizedWalletSnapshot> {
  const address = getAddress(walletAddress);
  const [transactions, balanceWei] = await Promise.all([
    fetchFluentWalletActivity(address),
    fluentPublicClient.getBalance({ address }),
  ]);

  const activeDaysSet = new Set<string>();
  const uniqueContractsSet = new Set<string>();

  for (const tx of transactions) {
    activeDaysSet.add(toUtcDateKey(tx.timeStamp));
    if (tx.to) {
      uniqueContractsSet.add(tx.to.toLowerCase());
    }
  }

  const timestamps = transactions
    .map((tx) => Number(tx.timeStamp))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const firstSeenAt = timestamps.length
    ? new Date(timestamps[0] * 1000).toISOString()
    : null;
  const lastSeenAt = timestamps.length
    ? new Date(timestamps[timestamps.length - 1] * 1000).toISOString()
    : null;

  return {
    address,
    chainId: fluentTestnetChain.id,
    fetchedAt: new Date().toISOString(),
    transactionCount: transactions.length,
    uniqueContracts: uniqueContractsSet.size,
    activeDays: activeDaysSet.size,
    firstSeenAt,
    lastSeenAt,
    nativeBalanceWei: balanceWei.toString(),
    nativeBalanceEth: formatEther(balanceWei),
  };
}
