import type { RuleConditionType } from "@prisma/client";
import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { evaluateRuleConditions, type RuleConditionForEvaluation } from "./engine";
import type { WalletScoreResult } from "@/lib/scoring/types";

function createScore(overrides?: Partial<WalletScoreResult>): WalletScoreResult {
  return {
    address: "0x0000000000000000000000000000000000000000" as Address,
    chainId: 20_994,
    totalScore: 82,
    breakdown: {
      activity: 85,
      diversity: 70,
      consistency: 75,
    },
    summaryLabel: "Strong activity",
    reasons: ["test reason"],
    queriedAt: "2026-04-18T00:00:00.000Z",
    dataState: "ok",
    sourceHealth: {
      explorer: "ok",
      rpc: "ok",
      warnings: [],
    },
    metrics: {
      transactionCount: 120,
      uniqueContracts: 24,
      activeDays: 18,
    },
    firstTxTimestamp: "2026-02-01T00:00:00.000Z",
    lastTxTimestamp: "2026-04-18T00:00:00.000Z",
    calculatedAt: "2026-04-18T00:00:00.000Z",
    ...overrides,
  };
}

function condition(
  id: string,
  type: RuleConditionType,
  threshold: number,
): RuleConditionForEvaluation {
  return {
    id,
    type,
    threshold,
  };
}

describe("evaluateRuleConditions", () => {
  it("passes when all configured conditions are met", () => {
    const conditions: RuleConditionForEvaluation[] = [
      condition("c1", "MIN_TRANSACTION_COUNT", 100),
      condition("c2", "MIN_UNIQUE_CONTRACTS", 20),
      condition("c3", "MIN_ACTIVE_DAYS", 10),
      condition("c4", "MIN_TRANSACTION_ACTIVITY_SCORE", 70),
      condition("c5", "MIN_CONTRACT_DIVERSITY_SCORE", 60),
      condition("c6", "MIN_CONSISTENCY_SCORE", 60),
      condition("c7", "MIN_TOTAL_SCORE", 75),
      condition("c8", "FIRST_TRANSACTION_OLDER_THAN_DAYS", 30),
    ];

    const result = evaluateRuleConditions(conditions, {
      score: createScore(),
      firstTransactionAt: new Date("2026-02-01T00:00:00.000Z"),
      evaluatedAt: new Date("2026-04-18T00:00:00.000Z"),
    });

    expect(result.passed).toBe(true);
    expect(result.failedConditions).toHaveLength(0);
    expect(result.passedConditions).toHaveLength(8);
    expect(result.explanations).toHaveLength(8);
  });

  it("returns failed conditions and explanations when thresholds are not met", () => {
    const result = evaluateRuleConditions(
      [
        condition("c1", "MIN_TRANSACTION_COUNT", 200),
        condition("c2", "MIN_TOTAL_SCORE", 80),
      ],
      {
        score: createScore({
          metrics: {
            transactionCount: 42,
            uniqueContracts: 9,
            activeDays: 6,
          },
          totalScore: 74,
        }),
        firstTransactionAt: new Date("2026-04-01T00:00:00.000Z"),
        evaluatedAt: new Date("2026-04-18T00:00:00.000Z"),
      },
    );

    expect(result.passed).toBe(false);
    expect(result.passedConditions).toHaveLength(0);
    expect(result.failedConditions).toHaveLength(2);
    expect(result.failedConditions[0]).toContain("Transaction count 42");
    expect(result.failedConditions[1]).toContain("Total score 74");
  });

  it("fails age-based condition when first Fluent transaction is unknown", () => {
    const result = evaluateRuleConditions(
      [condition("c1", "FIRST_TRANSACTION_OLDER_THAN_DAYS", 10)],
      {
        score: createScore(),
        firstTransactionAt: null,
        evaluatedAt: new Date("2026-04-18T00:00:00.000Z"),
      },
    );

    expect(result.passed).toBe(false);
    expect(result.failedConditions).toHaveLength(1);
    expect(result.failedConditions[0]).toContain("could not be determined");
  });

  it("is deterministic for identical input", () => {
    const conditions: RuleConditionForEvaluation[] = [
      condition("c1", "MIN_TRANSACTION_ACTIVITY_SCORE", 80),
      condition("c2", "MIN_CONTRACT_DIVERSITY_SCORE", 60),
      condition("c3", "MIN_CONSISTENCY_SCORE", 70),
    ];
    const context = {
      score: createScore(),
      firstTransactionAt: new Date("2026-01-01T00:00:00.000Z"),
      evaluatedAt: new Date("2026-04-18T00:00:00.000Z"),
    };

    const first = evaluateRuleConditions(conditions, context);
    const second = evaluateRuleConditions(conditions, context);

    expect(second).toEqual(first);
  });
});
