import { getAddress } from "viem";

import {
  fluentExplorerClient,
  type ExplorerClientResult,
  type FluentExplorerTransaction,
} from "@/lib/fluent/explorer-client";

function toTimestampNumber(unixTimestamp: string) {
  const parsed = Number(unixTimestamp);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUtcDay(unixTimestamp: string) {
  const timestamp = toTimestampNumber(unixTimestamp);
  if (timestamp <= 0) return null;
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function sortByTimestampAsc(transactions: readonly FluentExplorerTransaction[]) {
  return [...transactions].sort(
    (left, right) => toTimestampNumber(left.timeStamp) - toTimestampNumber(right.timeStamp),
  );
}

export async function getAddressTransactionsResult(
  walletAddress: string,
): Promise<ExplorerClientResult> {
  const address = getAddress(walletAddress);
  return fluentExplorerClient.getAddressTransactions(address);
}

export async function getAddressTransactions(
  walletAddress: string,
): Promise<FluentExplorerTransaction[]> {
  const result = await getAddressTransactionsResult(walletAddress);
  if (!result.ok) {
    console.warn(
      `[fluent][explorer] Failed to load address transactions (${result.reason}): ${result.warnings.join(
        " ",
      )}`,
    );
    return [];
  }

  if (result.warnings.length > 0) {
    console.warn(`[fluent][explorer] Address transactions warnings: ${result.warnings.join(" ")}`);
  }

  return result.transactions;
}

async function resolveTransactions(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
) {
  return providedTransactions ? [...providedTransactions] : getAddressTransactions(walletAddress);
}

export async function getTransactionCount(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
): Promise<number> {
  const transactions = await resolveTransactions(walletAddress, providedTransactions);
  return transactions.length;
}

export async function getFirstSeenTransaction(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
): Promise<FluentExplorerTransaction | null> {
  const transactions = await resolveTransactions(walletAddress, providedTransactions);
  const sorted = sortByTimestampAsc(transactions);
  return sorted.length > 0 ? sorted[0] : null;
}

export async function getLastActivity(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
): Promise<Date | null> {
  const transactions = await resolveTransactions(walletAddress, providedTransactions);
  if (transactions.length === 0) return null;

  const newestTimestamp = Math.max(...transactions.map((tx) => toTimestampNumber(tx.timeStamp)));
  if (newestTimestamp <= 0) return null;
  return new Date(newestTimestamp * 1000);
}

export async function getUniqueContractsInteractedWith(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
): Promise<string[]> {
  const transactions = await resolveTransactions(walletAddress, providedTransactions);
  const uniqueContracts = new Set<string>();

  for (const transaction of transactions) {
    if (transaction.contractAddress && transaction.contractAddress.trim().length > 0) {
      uniqueContracts.add(transaction.contractAddress.toLowerCase());
      continue;
    }

    const hasContractLikeInput =
      typeof transaction.input === "string" &&
      transaction.input.length > 2 &&
      transaction.input !== "0x";

    if (transaction.to && hasContractLikeInput) {
      uniqueContracts.add(transaction.to.toLowerCase());
    }
  }

  return [...uniqueContracts];
}

export async function getActiveDays(
  walletAddress: string,
  providedTransactions?: readonly FluentExplorerTransaction[],
): Promise<number> {
  const transactions = await resolveTransactions(walletAddress, providedTransactions);
  const uniqueDays = new Set<string>();

  for (const transaction of transactions) {
    const utcDay = toUtcDay(transaction.timeStamp);
    if (utcDay) {
      uniqueDays.add(utcDay);
    }
  }

  return uniqueDays.size;
}

export const fetchFluentWalletActivity = getAddressTransactions;
