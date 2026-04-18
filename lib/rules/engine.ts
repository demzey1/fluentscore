import type { RuleConditionType } from "@prisma/client";

import type { WalletScoreResult } from "@/lib/scoring/types";

export interface RuleConditionForEvaluation {
  id: string;
  type: RuleConditionType;
  threshold: number;
}

export interface RuleEvaluationContext {
  score: WalletScoreResult;
  firstTransactionAt: Date | null;
  evaluatedAt: Date;
}

export interface EvaluatedCondition {
  conditionId: string;
  type: RuleConditionType;
  threshold: number;
  passed: boolean;
  explanation: string;
}

export interface EligibilityEvaluationResult {
  passed: boolean;
  passedConditions: string[];
  failedConditions: string[];
  explanations: string[];
  conditionResults: EvaluatedCondition[];
}

function daysSince(firstTransactionAt: Date | null, evaluatedAt: Date) {
  if (!firstTransactionAt) {
    return null;
  }

  const deltaMs = evaluatedAt.getTime() - firstTransactionAt.getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return 0;
  }

  return Math.floor(deltaMs / (24 * 60 * 60 * 1000));
}

function evaluateCondition(
  condition: RuleConditionForEvaluation,
  context: RuleEvaluationContext,
): EvaluatedCondition {
  const { score, firstTransactionAt, evaluatedAt } = context;

  if (condition.type === "MIN_TRANSACTION_COUNT") {
    const value = score.metrics.transactionCount;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Transaction count ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  if (condition.type === "MIN_UNIQUE_CONTRACTS") {
    const value = score.metrics.uniqueContracts;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Unique contracts ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  if (condition.type === "MIN_ACTIVE_DAYS") {
    const value = score.metrics.activeDays;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Active days ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  if (condition.type === "FIRST_TRANSACTION_OLDER_THAN_DAYS") {
    const ageDays = daysSince(firstTransactionAt, evaluatedAt);
    if (ageDays === null) {
      return {
        conditionId: condition.id,
        type: condition.type,
        threshold: condition.threshold,
        passed: false,
        explanation:
          "First Fluent transaction age could not be determined for this wallet.",
      };
    }

    const passed = ageDays >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `First Fluent transaction age ${ageDays} days ${passed ? "meets" : "does not meet"} minimum ${condition.threshold} days.`,
    };
  }

  if (condition.type === "MIN_TRANSACTION_ACTIVITY_SCORE") {
    const value = score.breakdown.activity;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Transaction activity score ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  if (condition.type === "MIN_CONTRACT_DIVERSITY_SCORE") {
    const value = score.breakdown.diversity;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Contract diversity score ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  if (condition.type === "MIN_CONSISTENCY_SCORE") {
    const value = score.breakdown.consistency;
    const passed = value >= condition.threshold;
    return {
      conditionId: condition.id,
      type: condition.type,
      threshold: condition.threshold,
      passed,
      explanation: `Consistency score ${value} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
    };
  }

  const totalScore = score.totalScore;
  const passed = totalScore >= condition.threshold;
  return {
    conditionId: condition.id,
    type: condition.type,
    threshold: condition.threshold,
    passed,
    explanation: `Total score ${totalScore} ${passed ? "meets" : "does not meet"} minimum ${condition.threshold}.`,
  };
}

export function evaluateRuleConditions(
  conditions: RuleConditionForEvaluation[],
  context: RuleEvaluationContext,
): EligibilityEvaluationResult {
  const conditionResults = conditions.map((condition) =>
    evaluateCondition(condition, context),
  );

  const passedConditions = conditionResults
    .filter((condition) => condition.passed)
    .map((condition) => condition.explanation);
  const failedConditions = conditionResults
    .filter((condition) => !condition.passed)
    .map((condition) => condition.explanation);
  const explanations = conditionResults.map((condition) => condition.explanation);

  return {
    passed: failedConditions.length === 0,
    passedConditions,
    failedConditions,
    explanations,
    conditionResults,
  };
}
