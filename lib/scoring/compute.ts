import type { NormalizedWalletSnapshot } from "@/lib/fluent/wallet";
import type { ScoreSummaryLabel, WalletScoreResult } from "@/lib/scoring/types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function summaryLabelFromScore(
  transactionCount: number,
  activeDays: number,
  totalScore: number,
): ScoreSummaryLabel {
  if (transactionCount === 0) {
    return "No Fluent activity";
  }
  if (activeDays >= 10) {
    return "Consistent user";
  }
  if (totalScore >= 60) {
    return "Strong activity";
  }
  if (transactionCount <= 10) {
    return "Early participant";
  }
  return "Low activity";
}

export function computeFluentWalletScore(
  snapshot: NormalizedWalletSnapshot,
): WalletScoreResult {
  if (snapshot.dataState === "partial_data") {
    return {
      address: snapshot.address,
      chainId: snapshot.chainId,
      queriedAt: snapshot.fetchedAt,
      calculatedAt: new Date().toISOString(),
      dataState: "partial_data",
      sourceHealth: {
        explorer: "degraded",
        rpc: "ok",
        warnings: [
          "Explorer data unavailable. Transaction count was recovered from RPC fallback only.",
        ],
      },
      totalScore: null,
      breakdown: {
        activity: null,
        diversity: null,
        consistency: null,
      },
      summaryLabel: "Data unavailable",
      reasons: [
        "Partial Fluent data only. Score was not computed because explorer-derived metrics are unavailable.",
      ],
      metrics: {
        transactionCount: snapshot.transactionCount,
        uniqueContracts: null,
        activeDays: null,
      },
      firstTxTimestamp: null,
      lastTxTimestamp: null,
    };
  }

  const transactionCount = snapshot.transactionCount;
  const uniqueContracts = snapshot.uniqueContracts ?? 0;
  const activeDays = snapshot.activeDays ?? 0;

  const activity = clamp(transactionCount * 2, 0, 40);
  const diversity = clamp(uniqueContracts * 4, 0, 25);
  const consistency = clamp(activeDays * 2, 0, 20);
  const totalScore = activity + diversity + consistency;

  const summaryLabel = summaryLabelFromScore(transactionCount, activeDays, totalScore);
  const reasons =
    transactionCount === 0
      ? ["No Fluent transactions were found for this address."]
      : [
          `Transaction activity score is ${activity} from ${transactionCount} Fluent transactions.`,
          `Contract diversity score is ${diversity} from ${uniqueContracts} unique contracts.`,
          `Consistency score is ${consistency} from ${activeDays} active days.`,
          `Total FluentScore is ${totalScore}/85.`,
        ];

  return {
    address: snapshot.address,
    chainId: snapshot.chainId,
    queriedAt: snapshot.fetchedAt,
    calculatedAt: new Date().toISOString(),
    dataState: snapshot.dataState,
    sourceHealth: {
      explorer: snapshot.source === "explorer" ? "ok" : "degraded",
      rpc: "ok",
      warnings:
        snapshot.source === "rpc_fallback"
          ? ["Explorer data unavailable. Snapshot derived from RPC fallback."]
          : [],
    },
    totalScore,
    breakdown: {
      activity,
      diversity,
      consistency,
    },
    summaryLabel,
    reasons,
    metrics: {
      transactionCount,
      uniqueContracts,
      activeDays,
    },
    firstTxTimestamp: snapshot.firstTxTimestamp,
    lastTxTimestamp: snapshot.lastTxTimestamp,
  };
}
