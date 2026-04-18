import type { Prisma } from "@prisma/client";
import type { Address } from "viem";

import { prisma } from "@/lib/db/client";
import type { NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import type { WalletScoreResult } from "@/lib/scoring/types";

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

function buildReasonsJson(
  score: WalletScoreResult,
  snapshot: NormalizedWalletSnapshot,
): Prisma.JsonObject {
  return {
    chainId: score.chainId,
    calculatedAt: score.calculatedAt,
    queriedAt: score.queriedAt,
    dataState: score.dataState,
    summaryLabel: score.summaryLabel,
    reasons: score.reasons,
    breakdown: {
      activity: score.breakdown.activity,
      diversity: score.breakdown.diversity,
      consistency: score.breakdown.consistency,
    },
    metrics: {
      transactionCount: score.metrics.transactionCount,
      uniqueContracts: score.metrics.uniqueContracts,
      activeDays: score.metrics.activeDays,
      nativeBalanceWei: score.metrics.nativeBalanceWei,
      nativeBalanceEth: score.metrics.nativeBalanceEth,
    },
    sourceHealth: snapshot.sourceHealth,
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

export async function persistWalletSnapshotAndScore(
  snapshot: NormalizedWalletSnapshot,
  score: WalletScoreResult,
) {
  const normalizedAddress = snapshot.address.toLowerCase();
  const reasonsJson = buildReasonsJson(score, snapshot);

  return prisma.$transaction(async (tx) => {
    const walletProfile = await tx.walletProfile.upsert({
      where: { address: normalizedAddress },
      create: { address: normalizedAddress },
      update: {},
    });

    const walletSnapshot = await tx.walletSnapshot.create({
      data: {
        walletProfileId: walletProfile.id,
        firstSeenAt: snapshot.firstSeenAt ? new Date(snapshot.firstSeenAt) : null,
        lastActivityAt: snapshot.lastSeenAt ? new Date(snapshot.lastSeenAt) : null,
        txCount: snapshot.transactionCount,
        activeDays: snapshot.activeDays,
        uniqueContracts: snapshot.uniqueContracts,
        rawPayload: snapshot.rawPayload as unknown as Prisma.JsonObject,
      },
    });

    const walletScore = await tx.walletScore.create({
      data: {
        walletProfileId: walletProfile.id,
        snapshotId: walletSnapshot.id,
        transactionActivityScore: score.breakdown.activity,
        contractDiversityScore: score.breakdown.diversity,
        consistencyScore: score.breakdown.consistency,
        totalScore: score.totalScore,
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
