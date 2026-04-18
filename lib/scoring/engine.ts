import type { ScoreSummaryLabel } from "@/lib/scoring/types";

export interface WalletActivityData {
  totalTransactions: number;
  uniqueContracts: number;
  activeDays: number;
  firstTransactionAt: string | Date | null;
  lastActivityAt: string | Date | null;
}

export interface WalletPhase1ScoreResult {
  transactionActivityScore: number;
  contractDiversityScore: number;
  consistencyScore: number;
  totalScore: number;
  summaryLabel: ScoreSummaryLabel;
  reasons: string[];
}

export interface Phase1ScoreConfig {
  weights: {
    transactionActivity: number;
    contractDiversity: number;
    consistency: number;
  };
  milestones: {
    transactionsForMax: number;
    uniqueContractsForMax: number;
    activeDaysForStrong: number;
    spanDaysForStrong: number;
    maxSpanDaysForConsistency: number;
  };
}

export const PHASE1_SCORE_CONFIG: Phase1ScoreConfig = {
  weights: {
    transactionActivity: 40,
    contractDiversity: 25,
    consistency: 20,
  },
  milestones: {
    transactionsForMax: 120,
    uniqueContractsForMax: 30,
    activeDaysForStrong: 30,
    spanDaysForStrong: 45,
    maxSpanDaysForConsistency: 180,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toNonNegativeInt(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function toDateOrNull(value: string | Date | null) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function getActivitySpanDays(
  firstTransactionAt: string | Date | null,
  lastActivityAt: string | Date | null,
) {
  const firstDate = toDateOrNull(firstTransactionAt);
  const lastDate = toDateOrNull(lastActivityAt);
  if (!firstDate || !lastDate) return 0;

  const diffMs = lastDate.getTime() - firstDate.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0;

  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function scoreLinear(value: number, maxValue: number, maxScore: number) {
  if (maxValue <= 0 || maxScore <= 0) return 0;
  const ratio = clamp(value / maxValue, 0, 1);
  return Math.round(ratio * maxScore);
}

function chooseSummaryLabel(
  data: WalletActivityData,
  totalScore: number,
  activitySpanDays: number,
): ScoreSummaryLabel {
  if (data.totalTransactions <= 0) return "No Fluent activity";

  if (data.activeDays >= 15 && activitySpanDays >= 30) {
    return "Consistent user";
  }

  if (totalScore >= 65) {
    return "Strong activity";
  }

  if (data.totalTransactions <= 12 && data.activeDays <= 4) {
    return "Early participant";
  }

  return "Low activity";
}

function buildReasons(
  data: WalletActivityData,
  result: {
    transactionActivityScore: number;
    contractDiversityScore: number;
    consistencyScore: number;
    totalScore: number;
  },
  activitySpanDays: number,
): string[] {
  if (data.totalTransactions <= 0) {
    return ["No Fluent transactions were found for this address yet."];
  }

  const reasons: string[] = [];
  reasons.push(
    `Transaction activity score is ${result.transactionActivityScore} from ${data.totalTransactions} Fluent transactions.`,
  );
  reasons.push(
    `Contract diversity score is ${result.contractDiversityScore} from ${data.uniqueContracts} unique contracts interacted with.`,
  );
  reasons.push(
    `Consistency score is ${result.consistencyScore} from ${data.activeDays} active days${activitySpanDays > 0 ? ` across ${activitySpanDays} days of activity span` : ""}.`,
  );
  reasons.push(`Total FluentScore is ${result.totalScore}/100.`);
  return reasons;
}

export function scoreWallet(
  activityData: WalletActivityData,
  config: Phase1ScoreConfig = PHASE1_SCORE_CONFIG,
): WalletPhase1ScoreResult {
  const normalizedData: WalletActivityData = {
    totalTransactions: toNonNegativeInt(activityData.totalTransactions),
    uniqueContracts: toNonNegativeInt(activityData.uniqueContracts),
    activeDays: toNonNegativeInt(activityData.activeDays),
    firstTransactionAt: activityData.firstTransactionAt,
    lastActivityAt: activityData.lastActivityAt,
  };

  if (normalizedData.totalTransactions === 0) {
    return {
      transactionActivityScore: 0,
      contractDiversityScore: 0,
      consistencyScore: 0,
      totalScore: 0,
      summaryLabel: "No Fluent activity",
      reasons: ["No Fluent transactions were found for this address yet."],
    };
  }

  const transactionActivityScore = scoreLinear(
    normalizedData.totalTransactions,
    config.milestones.transactionsForMax,
    config.weights.transactionActivity,
  );

  const contractDiversityScore = scoreLinear(
    normalizedData.uniqueContracts,
    config.milestones.uniqueContractsForMax,
    config.weights.contractDiversity,
  );

  const activitySpanDays = getActivitySpanDays(
    normalizedData.firstTransactionAt,
    normalizedData.lastActivityAt,
  );

  const consistencyFromActiveDays = scoreLinear(
    normalizedData.activeDays,
    config.milestones.activeDaysForStrong,
    Math.round(config.weights.consistency * 0.7),
  );
  const consistencyFromLongevity = scoreLinear(
    activitySpanDays,
    config.milestones.maxSpanDaysForConsistency,
    config.weights.consistency - Math.round(config.weights.consistency * 0.7),
  );
  const consistencyScore = clamp(
    consistencyFromActiveDays + consistencyFromLongevity,
    0,
    config.weights.consistency,
  );

  const totalRaw =
    transactionActivityScore + contractDiversityScore + consistencyScore;
  const totalPossible =
    config.weights.transactionActivity +
    config.weights.contractDiversity +
    config.weights.consistency;
  const totalScore = clamp(Math.round((totalRaw / totalPossible) * 100), 0, 100);

  const summaryLabel = chooseSummaryLabel(normalizedData, totalScore, activitySpanDays);

  const reasons = buildReasons(
    normalizedData,
    {
      transactionActivityScore,
      contractDiversityScore,
      consistencyScore,
      totalScore,
    },
    activitySpanDays,
  );

  return {
    transactionActivityScore,
    contractDiversityScore,
    consistencyScore,
    totalScore,
    summaryLabel,
    reasons,
  };
}
