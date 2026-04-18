import { revalidateTag } from "next/cache";
import { getAddress } from "viem";
import { z } from "zod";

import {
  getRecentWalletSnapshotScore,
  hydrateWalletScoreResultFromRecord,
  persistWalletSnapshotAndScore,
} from "@/lib/db/wallet-snapshots";
import { DataUnavailableError, InvalidAddressError } from "@/lib/errors";
import { DEFAULT_FLUENT_CONFIG } from "@/lib/env";
import { getNormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import { computeFluentWalletScore } from "@/lib/scoring/compute";
import type { WalletScoreResult } from "@/lib/scoring/types";

const addressSchema = z.string().trim().min(1);

export interface GetFluentWalletScoreOptions {
  forceRefresh?: boolean;
  maxAgeMinutes?: number;
}

function buildDataUnavailableScore(address: `0x${string}`): WalletScoreResult {
  const now = new Date().toISOString();
  return {
    address,
    chainId: DEFAULT_FLUENT_CONFIG.chainId,
    totalScore: null,
    breakdown: {
      activity: null,
      diversity: null,
      consistency: null,
    },
    summaryLabel: "Data unavailable",
    reasons: ["Fluent Testnet data sources are currently unavailable."],
    queriedAt: now,
    dataState: "data_unavailable",
    sourceHealth: {
      explorer: "degraded",
      rpc: "degraded",
      warnings: ["Unable to reach Fluent explorer and RPC fallback."],
    },
    metrics: {
      transactionCount: null,
      uniqueContracts: null,
      activeDays: null,
    },
    firstTxTimestamp: null,
    lastTxTimestamp: null,
    calculatedAt: now,
  };
}

function parseAddressOrThrow(inputAddress: string) {
  const parsedAddress = addressSchema.safeParse(inputAddress);
  if (!parsedAddress.success) {
    throw new InvalidAddressError("Wallet address is required.");
  }

  try {
    return getAddress(parsedAddress.data);
  } catch {
    throw new InvalidAddressError("Invalid EVM wallet address.");
  }
}

function canPersistScore(score: WalletScoreResult) {
  return (
    (score.dataState === "ok" || score.dataState === "no_fluent_activity") &&
    score.totalScore !== null &&
    score.breakdown.activity !== null &&
    score.breakdown.diversity !== null &&
    score.breakdown.consistency !== null &&
    score.metrics.transactionCount !== null &&
    score.metrics.uniqueContracts !== null &&
    score.metrics.activeDays !== null
  );
}

export async function getFluentWalletScore(
  inputAddress: string,
  options: GetFluentWalletScoreOptions = {},
) {
  const address = parseAddressOrThrow(inputAddress);
  const resolvedOptions: Required<GetFluentWalletScoreOptions> = {
    forceRefresh: options.forceRefresh ?? false,
    maxAgeMinutes: options.maxAgeMinutes ?? 5,
  };

  if (!resolvedOptions.forceRefresh) {
    const cached = await getRecentWalletSnapshotScore(address, resolvedOptions.maxAgeMinutes);
    if (cached) {
      return hydrateWalletScoreResultFromRecord({
        address,
        walletSnapshot: cached.walletSnapshot,
        walletScore: cached.walletScore,
      });
    }
  }

  let normalizedSnapshot;
  try {
    normalizedSnapshot = await getNormalizedWalletSnapshot(address);
  } catch (error) {
    if (error instanceof DataUnavailableError) {
      return buildDataUnavailableScore(address);
    }
    throw error;
  }

  const score = computeFluentWalletScore(normalizedSnapshot);
  if (canPersistScore(score)) {
    await persistWalletSnapshotAndScore(normalizedSnapshot, score);
  }

  return score;
}

export async function refreshWalletSnapshotOnDemand(inputAddress: string) {
  const address = parseAddressOrThrow(inputAddress);
  const refreshedScore = await getFluentWalletScore(address, {
    forceRefresh: true,
  });
  revalidateTag(`wallet-score:${address.toLowerCase()}`, "max");
  return refreshedScore;
}
