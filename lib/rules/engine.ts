import type { WalletScoreResult } from "@/lib/scoring/types";
import type { EligibilityRuleDefinition } from "@/lib/rules/schema";

export interface EligibilityEvaluationResult {
  eligible: boolean;
  passed: string[];
  failed: string[];
}

export function evaluateEligibilityRuleSet(
  rules: EligibilityRuleDefinition,
  score: WalletScoreResult,
): EligibilityEvaluationResult {
  const passed: string[] = [];
  const failed: string[] = [];

  if (rules.minScore !== undefined) {
    const condition = `Score >= ${rules.minScore}`;
    if (score.totalScore >= rules.minScore) passed.push(condition);
    else failed.push(condition);
  }

  if (rules.minTransactions !== undefined) {
    const condition = `Transactions >= ${rules.minTransactions}`;
    if (score.metrics.transactionCount >= rules.minTransactions) passed.push(condition);
    else failed.push(condition);
  }

  if (rules.minActiveDays !== undefined) {
    const condition = `Active days >= ${rules.minActiveDays}`;
    if (score.metrics.activeDays >= rules.minActiveDays) passed.push(condition);
    else failed.push(condition);
  }

  if (rules.minUniqueContracts !== undefined) {
    const condition = `Unique contracts >= ${rules.minUniqueContracts}`;
    if (score.metrics.uniqueContracts >= rules.minUniqueContracts) passed.push(condition);
    else failed.push(condition);
  }

  if (rules.minNativeBalanceWei !== undefined) {
    const condition = `Native balance >= ${rules.minNativeBalanceWei} wei`;
    if (BigInt(score.metrics.nativeBalanceWei) >= BigInt(rules.minNativeBalanceWei)) {
      passed.push(condition);
    } else {
      failed.push(condition);
    }
  }

  return {
    eligible: failed.length === 0,
    passed,
    failed,
  };
}
