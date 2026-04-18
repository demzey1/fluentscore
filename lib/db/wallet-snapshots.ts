import type { Prisma } from "@prisma/client";
import type { Address } from "viem";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { DEFAULT_FLUENT_CONFIG } from "@/lib/env";
import type { NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import type { WalletScoreResult } from "@/lib/scoring/types";

const reasonsJsonSchema = z
  .object({
    queriedAt: z.string().optional(),
    calculatedAt: z.string().optional(),
    reasons: z.array(z.string()).optional(),
    dataState: z
      .enum(["ok", "no_fluent_activity", "partial_data", "data_unavailable"])
      .optional(),
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
    source: z.enum(["explorer", "rpc_fallback"]).optional(),
  })
  .passthrough();

export interface CachedWalletSnapshotScore {
  walletProfile: {
    id: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
  };
  walletSnapshot: {
    id: string;
    walletProfileId: string;
    firstSeenAt: Date | null;
    lastActivityAt: Date | null;
    txCount: number;
    activeDays: number;
    uniqueContracts: number;
    rawPayload: Prisma.JsonValue;
    createdAt: Date;
  };
  walletScore: {
    id: string;
    walletProfileId: string;
    snapshotId: string;
    transactionActivityScore: number;
    contractDiversityScore: number;
    consistencyScore: number;
    totalScore: number;
    summaryLabel: string;
    reasonsJson: Prisma.JsonValue;
    createdAt: Date;
  };
}

function buildReasonsJson(score: WalletScoreResult): Prisma.JsonObject {
  return {
    queriedAt: score.queriedAt,
    calculatedAt: score.calculatedAt,
    reasons: score.reasons,
    dataState: score.dataState,
    sourceHealth: score.sourceHealth,
    firstTxTimestamp: score.firstTxTimestamp,
    lastTxTimestamp: score.lastTxTimestamp,
  };
}

export function hydrateWalletScoreResultFromRecord(input: {
  address: Address;
  walletSnapshot: CachedWalletSnapshotScore["walletSnapshot"];
  walletScore: CachedWalletSnapshotScore["walletScore"];
}): WalletScoreResult {
  const parsedReasons = reasonsJsonSchema.safeParse(input.walletScore.reasonsJson);
  const parsedRawPayload = rawPayloadSchema.safeParse(input.walletSnapshot.rawPayload);

  const queriedAt =
    parsedReasons.success && parsedReasons.data.queriedAt
      ? parsedReasons.data.queriedAt
      : input.walletSnapshot.createdAt.toISOString();

  const calculatedAt =
    parsedReasons.success && parsedReasons.data.calculatedAt
      ? parsedReasons.data.calculatedAt
      : input.walletScore.createdAt.toISOString();

  const reasons =
    parsedReasons.success && parsedReasons.data.reasons
      ? parsedReasons.data.reasons
      : [`Total FluentScore is ${input.walletScore.totalScore}/85.`];

  const dataState =
    parsedReasons.success && parsedReasons.data.dataState
      ? parsedReasons.data.dataState
      : input.walletSnapshot.txCount === 0
        ? "no_fluent_activity"
        : "ok";

  const sourceHealth =
    parsedReasons.success && parsedReasons.data.sourceHealth
      ? parsedReasons.data.sourceHealth
      : {
          explorer:
            parsedRawPayload.success && parsedRawPayload.data.source === "rpc_fallback"
              ? ("degraded" as const)
              : ("ok" as const),
          rpc: "ok" as const,
          warnings:
            parsedRawPayload.success && parsedRawPayload.data.source === "rpc_fallback"
              ? ["Explorer unavailable. Snapshot derived from RPC fallback data."]
              : [],
        };

  return {
    address: input.address,
    chainId: DEFAULT_FLUENT_CONFIG.chainId,
    totalScore: input.walletScore.totalScore,
    breakdown: {
      activity: input.walletScore.transactionActivityScore,
      diversity: input.walletScore.contractDiversityScore,
      consistency: input.walletScore.consistencyScore,
    },
    summaryLabel: input.walletScore.summaryLabel as WalletScoreResult["summaryLabel"],
    reasons,
    queriedAt,
    dataState,
    sourceHealth,
    metrics: {
      transactionCount: input.walletSnapshot.txCount,
      uniqueContracts: input.walletSnapshot.uniqueContracts,
      activeDays: input.walletSnapshot.activeDays,
    },
    firstTxTimestamp: input.walletSnapshot.firstSeenAt
      ? input.walletSnapshot.firstSeenAt.toISOString()
      : null,
    lastTxTimestamp: input.walletSnapshot.lastActivityAt
      ? input.walletSnapshot.lastActivityAt.toISOString()
      : null,
    calculatedAt,
  };
}

export async function getRecentWalletSnapshotScore(
  address: Address,
  maxAgeMinutes = 5,
): Promise<CachedWalletSnapshotScore | null> {
  const staleCutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
  const normalizedAddress = address.toLowerCase();

  const latestSnapshot = await prisma.walletSnapshot.findFirst({
    where: {
      walletProfile: {
        address: normalizedAddress,
      },
    },
    include: {
      walletProfile: true,
      score: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestSnapshot || !latestSnapshot.score) {
    return null;
  }

  if (latestSnapshot.createdAt < staleCutoff) {
    return null;
  }

  return {
    walletProfile: latestSnapshot.walletProfile,
    walletSnapshot: {
      id: latestSnapshot.id,
      walletProfileId: latestSnapshot.walletProfileId,
      firstSeenAt: latestSnapshot.firstSeenAt,
      lastActivityAt: latestSnapshot.lastActivityAt,
      txCount: latestSnapshot.txCount,
      activeDays: latestSnapshot.activeDays,
      uniqueContracts: latestSnapshot.uniqueContracts,
      rawPayload: latestSnapshot.rawPayload,
      createdAt: latestSnapshot.createdAt,
    },
    walletScore: latestSnapshot.score,
  };
}

export async function getWalletProfileWithLatestSnapshot(address: Address) {
  const normalizedAddress = address.toLowerCase();

  return prisma.walletProfile.findUnique({
    where: {
      address: normalizedAddress,
    },
    include: {
      snapshots: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function listRecentScoredWallets(limit = 200) {
  return prisma.walletScore.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      walletProfile: true,
      snapshot: true,
    },
  });
}

export async function persistWalletSnapshotAndScore(
  snapshot: NormalizedWalletSnapshot,
  score: WalletScoreResult,
) {
  const activityScore = score.breakdown.activity;
  const diversityScore = score.breakdown.diversity;
  const consistencyScore = score.breakdown.consistency;
  const totalScore = score.totalScore;

  if (
    totalScore === null ||
    activityScore === null ||
    diversityScore === null ||
    consistencyScore === null ||
    score.metrics.transactionCount === null ||
    score.metrics.uniqueContracts === null ||
    score.metrics.activeDays === null
  ) {
    throw new Error("Cannot persist incomplete wallet score.");
  }

  const normalizedAddress = snapshot.address.toLowerCase();
  const reasonsJson = buildReasonsJson(score);

  return prisma.$transaction(async (tx) => {
    const walletProfile = await tx.walletProfile.upsert({
      where: { address: normalizedAddress },
      create: { address: normalizedAddress },
      update: {},
    });

    const walletSnapshot = await tx.walletSnapshot.create({
      data: {
        walletProfileId: walletProfile.id,
        firstSeenAt: snapshot.firstTxTimestamp ? new Date(snapshot.firstTxTimestamp) : null,
        lastActivityAt: snapshot.lastTxTimestamp ? new Date(snapshot.lastTxTimestamp) : null,
        txCount: snapshot.transactionCount,
        activeDays: snapshot.activeDays ?? 0,
        uniqueContracts: snapshot.uniqueContracts ?? 0,
        rawPayload: snapshot.rawPayload as Prisma.JsonObject,
      },
    });

    const walletScore = await tx.walletScore.create({
      data: {
        walletProfileId: walletProfile.id,
        snapshotId: walletSnapshot.id,
        transactionActivityScore: activityScore,
        contractDiversityScore: diversityScore,
        consistencyScore,
        totalScore,
        summaryLabel: score.summaryLabel,
        reasonsJson,
      },
    });

    return {
      walletProfile,
      walletSnapshot,
      walletScore,
    };
  });
}
