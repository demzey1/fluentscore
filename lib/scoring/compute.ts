import { type NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import { scoreWallet } from "@/lib/scoring/engine";
import type { WalletScoreResult } from "@/lib/scoring/types";

function getWalletDataState(snapshot: NormalizedWalletSnapshot): WalletScoreResult["dataState"] {
  if (snapshot.sourceHealth.explorer === "degraded" && snapshot.transactionCount === 0) {
    return "explorer_unavailable";
  }

  if (snapshot.transactionCount === 0) {
    return "no_fluent_activity";
  }

  const isSparseSignal =
    snapshot.transactionCount <= 3 &&
    snapshot.activeDays <= 2 &&
    snapshot.uniqueContracts <= 1;

  if (isSparseSignal) {
    return "testnet_sparse";
  }

  return "ok";
}

export function computeFluentWalletScore(
  snapshot: NormalizedWalletSnapshot,
): WalletScoreResult {
  const computedScore = scoreWallet({
    totalTransactions: snapshot.transactionCount,
    uniqueContracts: snapshot.uniqueContracts,
    activeDays: snapshot.activeDays,
    firstTransactionAt: snapshot.firstSeenAt,
    lastActivityAt: snapshot.lastSeenAt,
  });

  return {
    address: snapshot.address,
    chainId: snapshot.chainId,
    totalScore: computedScore.totalScore,
    queriedAt: snapshot.fetchedAt,
    dataState: getWalletDataState(snapshot),
    sourceHealth: snapshot.sourceHealth,
    breakdown: {
      activity: computedScore.transactionActivityScore,
      diversity: computedScore.contractDiversityScore,
      consistency: computedScore.consistencyScore,
    },
    summaryLabel: computedScore.summaryLabel,
    reasons: computedScore.reasons,
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
