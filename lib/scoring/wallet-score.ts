import { unstable_cache } from "next/cache";
import { type Address, getAddress } from "viem";
import { z } from "zod";

import {
  getRecentWalletSnapshot,
  upsertWalletSnapshotAndScore,
} from "@/lib/db/wallet-snapshots";
import { normalizeFluentWalletSnapshot } from "@/lib/fluent/wallet";
import { computeFluentWalletScore } from "@/lib/scoring/compute";
import type { WalletScoreResult } from "@/lib/scoring/types";

const addressSchema = z.string().trim().min(1);

function fromStoredBreakdown(
  address: Address,
  chainId: number,
  totalScore: number,
  breakdown: unknown,
): WalletScoreResult {
  const breakdownShape = z.object({
    activity: z.number().int().min(0),
    diversity: z.number().int().min(0),
    consistency: z.number().int().min(0),
    balance: z.number().int().min(0),
    metrics: z.object({
      transactionCount: z.number().int().min(0),
      uniqueContracts: z.number().int().min(0),
      activeDays: z.number().int().min(0),
      nativeBalanceWei: z.string().regex(/^\d+$/),
      nativeBalanceEth: z.string(),
    }),
    calculatedAt: z.string(),
  });

  const parsed = breakdownShape.parse(breakdown);

  return {
    address,
    chainId,
    totalScore,
    breakdown: {
      activity: parsed.activity,
      diversity: parsed.diversity,
      consistency: parsed.consistency,
      balance: parsed.balance,
    },
    metrics: parsed.metrics,
    calculatedAt: parsed.calculatedAt,
  };
}

async function getWalletScoreFresh(address: Address) {
  const recentSnapshot = await getRecentWalletSnapshot(address);
  if (recentSnapshot?.score) {
    return fromStoredBreakdown(
      address,
      recentSnapshot.chainId,
      recentSnapshot.score.totalScore,
      recentSnapshot.score.breakdown,
    );
  }

  const normalized = await normalizeFluentWalletSnapshot(address);
  const computed = computeFluentWalletScore(normalized);

  await upsertWalletSnapshotAndScore(normalized, computed);
  return computed;
}

export async function getFluentWalletScore(inputAddress: string) {
  const rawAddress = addressSchema.parse(inputAddress);
  const address = getAddress(rawAddress);

  const cachedQuery = unstable_cache(
    () => getWalletScoreFresh(address),
    [`wallet-score:${address.toLowerCase()}`],
    {
      revalidate: 120,
      tags: [`wallet-score:${address.toLowerCase()}`],
    },
  );

  return cachedQuery();
}
