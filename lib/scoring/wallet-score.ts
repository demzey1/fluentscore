import { revalidateTag, unstable_cache } from "next/cache";
import { type Address, getAddress } from "viem";
import { z } from "zod";

import {
  getRecentWalletSnapshotScore,
  persistWalletSnapshotAndScore,
} from "@/lib/db/wallet-snapshots";
import { DEFAULT_FLUENT_CONFIG } from "@/lib/env";
import { normalizeFluentWalletSnapshot } from "@/lib/fluent/wallet";
import { computeFluentWalletScore } from "@/lib/scoring/compute";
import type { ScoreSummaryLabel, WalletScoreResult } from "@/lib/scoring/types";

const addressSchema = z.string().trim().min(1);
const summaryLabelSchema = z.enum([
  "Strong activity",
  "Early participant",
  "Consistent user",
  "Low activity",
  "No Fluent activity",
]);
const dataStateSchema = z.enum([
  "ok",
  "no_fluent_activity",
  "explorer_unavailable",
  "testnet_sparse",
]);

const reasonsJsonSchema = z
  .object({
    chainId: z.number().int().optional(),
    calculatedAt: z.string().optional(),
    queriedAt: z.string().optional(),
    dataState: dataStateSchema.optional(),
    summaryLabel: summaryLabelSchema.optional(),
    reasons: z.array(z.string()).optional(),
    sourceHealth: z
      .object({
        explorer: z.enum(["ok", "degraded"]),
        rpc: z.enum(["ok", "degraded"]),
        warnings: z.array(z.string()),
      })
      .optional(),
  })
  .passthrough();

const rawPayloadSchema = z
  .object({
    chainId: z.number().int().optional(),
    rpc: z
      .object({
        nativeBalanceWei: z.string().regex(/^\d+$/),
        nativeBalanceEth: z.string(),
      })
      .optional(),
  })
  .passthrough();

export interface GetFluentWalletScoreOptions {
  forceRefresh?: boolean;
  maxAgeMinutes?: number;
}

function fromCachedScore(
  address: Address,
  cached: Awaited<ReturnType<typeof getRecentWalletSnapshotScore>>,
) {
  if (!cached) {
    return null;
  }

  const parsedReasons = reasonsJsonSchema.safeParse(cached.walletScore.reasonsJson);
  const parsedRawPayload = rawPayloadSchema.safeParse(cached.walletSnapshot.rawPayload);

  const nativeBalanceWei = parsedRawPayload.success
    ? parsedRawPayload.data.rpc?.nativeBalanceWei ?? "0"
    : "0";
  const nativeBalanceEth = parsedRawPayload.success
    ? parsedRawPayload.data.rpc?.nativeBalanceEth ?? "0"
    : "0";

  const chainId =
    parsedReasons.success && parsedReasons.data.chainId
      ? parsedReasons.data.chainId
      : parsedRawPayload.success && parsedRawPayload.data.chainId
        ? parsedRawPayload.data.chainId
        : DEFAULT_FLUENT_CONFIG.chainId;

  const calculatedAt =
    parsedReasons.success && parsedReasons.data.calculatedAt
      ? parsedReasons.data.calculatedAt
      : cached.walletScore.createdAt.toISOString();
  const queriedAt =
    parsedReasons.success && parsedReasons.data.queriedAt
      ? parsedReasons.data.queriedAt
      : cached.walletSnapshot.createdAt.toISOString();

  const parsedStoredSummaryLabel = summaryLabelSchema.safeParse(cached.walletScore.summaryLabel);
  const summaryLabel: ScoreSummaryLabel =
    parsedReasons.success && parsedReasons.data.summaryLabel
      ? parsedReasons.data.summaryLabel
      : parsedStoredSummaryLabel.success
        ? parsedStoredSummaryLabel.data
        : "Low activity";

  const reasons =
    parsedReasons.success && parsedReasons.data.reasons
      ? parsedReasons.data.reasons
      : [`Score classified as ${summaryLabel}.`];
  const dataState =
    parsedReasons.success && parsedReasons.data.dataState
      ? parsedReasons.data.dataState
      : cached.walletSnapshot.txCount === 0
        ? "no_fluent_activity"
        : "ok";
  const sourceHealth =
    parsedReasons.success && parsedReasons.data.sourceHealth
      ? parsedReasons.data.sourceHealth
      : {
          explorer: "ok" as const,
          rpc: "ok" as const,
          warnings: [] as string[],
        };

  const scoreResult: WalletScoreResult = {
    address,
    chainId,
    totalScore: cached.walletScore.totalScore,
    queriedAt,
    dataState,
    sourceHealth,
    breakdown: {
      activity: cached.walletScore.transactionActivityScore,
      diversity: cached.walletScore.contractDiversityScore,
      consistency: cached.walletScore.consistencyScore,
    },
    summaryLabel,
    reasons,
    metrics: {
      transactionCount: cached.walletSnapshot.txCount,
      uniqueContracts: cached.walletSnapshot.uniqueContracts,
      activeDays: cached.walletSnapshot.activeDays,
      nativeBalanceWei,
      nativeBalanceEth,
    },
    calculatedAt,
  };

  return scoreResult;
}

async function getWalletScoreFresh(
  address: Address,
  options: Required<GetFluentWalletScoreOptions>,
) {
  if (!options.forceRefresh) {
    const recentSnapshot = await getRecentWalletSnapshotScore(address, options.maxAgeMinutes);
    const cachedScore = fromCachedScore(address, recentSnapshot);
    if (cachedScore) {
      return cachedScore;
    }
  }

  const normalized = await normalizeFluentWalletSnapshot(address);
  const computed = computeFluentWalletScore(normalized);

  await persistWalletSnapshotAndScore(normalized, computed);
  return computed;
}

export async function getFluentWalletScore(
  inputAddress: string,
  options: GetFluentWalletScoreOptions = {},
) {
  const rawAddress = addressSchema.parse(inputAddress);
  const address = getAddress(rawAddress);

  const resolvedOptions: Required<GetFluentWalletScoreOptions> = {
    forceRefresh: options.forceRefresh ?? false,
    maxAgeMinutes: options.maxAgeMinutes ?? 5,
  };

  if (resolvedOptions.forceRefresh) {
    return getWalletScoreFresh(address, resolvedOptions);
  }

  const cachedQuery = unstable_cache(
    () => getWalletScoreFresh(address, resolvedOptions),
    [`wallet-score:${address.toLowerCase()}:maxAge:${resolvedOptions.maxAgeMinutes}`],
    {
      revalidate: 120,
      tags: [`wallet-score:${address.toLowerCase()}`],
    },
  );

  return cachedQuery();
}

export async function refreshWalletSnapshotOnDemand(inputAddress: string) {
  const rawAddress = addressSchema.parse(inputAddress);
  const address = getAddress(rawAddress);
  const refreshedScore = await getFluentWalletScore(address, {
    forceRefresh: true,
  });
  revalidateTag(`wallet-score:${address.toLowerCase()}`, "max");
  return refreshedScore;
}
