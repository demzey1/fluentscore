import type { Prisma } from "@prisma/client";
import type { Address } from "viem";

import { prisma } from "@/lib/db/client";
import type { NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import type { WalletScoreResult } from "@/lib/scoring/types";

export async function getRecentWalletSnapshot(address: Address, maxAgeMinutes = 5) {
  const staleCutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  return prisma.walletSnapshot.findUnique({
    where: { address: address.toLowerCase() },
    include: { score: true },
  }).then((snapshot) => {
    if (!snapshot || snapshot.lastSyncedAt < staleCutoff || !snapshot.score) {
      return null;
    }
    return snapshot;
  });
}

export async function upsertWalletSnapshotAndScore(
  snapshot: NormalizedWalletSnapshot,
  score: WalletScoreResult,
) {
  const normalizedPayload: Prisma.JsonObject = {
    ...snapshot,
  };

  const scoreBreakdown: Prisma.JsonObject = {
    ...score.breakdown,
    metrics: score.metrics,
    calculatedAt: score.calculatedAt,
  };

  return prisma.walletSnapshot.upsert({
    where: { address: snapshot.address.toLowerCase() },
    create: {
      address: snapshot.address.toLowerCase(),
      chainId: snapshot.chainId,
      normalized: normalizedPayload,
      transactionCount: snapshot.transactionCount,
      uniqueContracts: snapshot.uniqueContracts,
      activeDays: snapshot.activeDays,
      nativeBalanceWei: snapshot.nativeBalanceWei,
      firstSeenAt: snapshot.firstSeenAt ? new Date(snapshot.firstSeenAt) : null,
      lastSeenAt: snapshot.lastSeenAt ? new Date(snapshot.lastSeenAt) : null,
      lastSyncedAt: new Date(snapshot.fetchedAt),
      score: {
        create: {
          totalScore: score.totalScore,
          breakdown: scoreBreakdown,
          calculatedAt: new Date(score.calculatedAt),
        },
      },
    },
    update: {
      chainId: snapshot.chainId,
      normalized: normalizedPayload,
      transactionCount: snapshot.transactionCount,
      uniqueContracts: snapshot.uniqueContracts,
      activeDays: snapshot.activeDays,
      nativeBalanceWei: snapshot.nativeBalanceWei,
      firstSeenAt: snapshot.firstSeenAt ? new Date(snapshot.firstSeenAt) : null,
      lastSeenAt: snapshot.lastSeenAt ? new Date(snapshot.lastSeenAt) : null,
      lastSyncedAt: new Date(snapshot.fetchedAt),
      score: {
        upsert: {
          create: {
            totalScore: score.totalScore,
            breakdown: scoreBreakdown,
            calculatedAt: new Date(score.calculatedAt),
          },
          update: {
            totalScore: score.totalScore,
            breakdown: scoreBreakdown,
            calculatedAt: new Date(score.calculatedAt),
          },
        },
      },
    },
    include: { score: true },
  });
}
