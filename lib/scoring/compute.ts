import { type NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import type { WalletScoreResult } from "@/lib/scoring/types";

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, value));
}

export function computeFluentWalletScore(
  snapshot: NormalizedWalletSnapshot,
): WalletScoreResult {
  const activity = clampScore(snapshot.transactionCount * 2, 40);
  const diversity = clampScore(snapshot.uniqueContracts * 4, 25);
  const consistency = clampScore(snapshot.activeDays * 2, 20);

  const balanceAsFloat = Number(snapshot.nativeBalanceEth);
  const balance = Number.isFinite(balanceAsFloat)
    ? clampScore(Math.floor(balanceAsFloat * 15), 15)
    : 0;

  const totalScore = clampScore(activity + diversity + consistency + balance, 100);

  return {
    address: snapshot.address,
    chainId: snapshot.chainId,
    totalScore,
    breakdown: {
      activity,
      diversity,
      consistency,
      balance,
    },
    metrics: {
      transactionCount: snapshot.transactionCount,
      uniqueContracts: snapshot.uniqueContracts,
      activeDays: snapshot.activeDays,
      nativeBalanceWei: snapshot.nativeBalanceWei,
      nativeBalanceEth: snapshot.nativeBalanceEth,
    },
    calculatedAt: new Date().toISOString(),
  };
}
