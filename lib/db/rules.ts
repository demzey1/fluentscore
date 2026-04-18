import type { Prisma, RuleConditionType } from "@prisma/client";
import { getAddress, isAddress } from "viem";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import {
  getWalletProfileWithLatestSnapshot,
  hydrateWalletScoreResultFromRecord,
  listRecentScoredWallets,
} from "@/lib/db/wallet-snapshots";
import { evaluateRuleConditions } from "@/lib/rules/engine";
import {
  parseRuleConditionsJson,
  type RuleConditionInput,
  type SupportedRuleConditionType,
} from "@/lib/rules/schema";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";
import type { WalletScoreResult } from "@/lib/scoring/types";

function toConditionType(value: SupportedRuleConditionType): RuleConditionType {
  return value;
}

function serializeConditionsForCreate(conditions: RuleConditionInput[]) {
  return conditions.map((condition, index) => ({
    type: toConditionType(condition.type),
    threshold: condition.threshold,
    sortOrder: index,
  }));
}

export async function listRuleSets() {
  return prisma.ruleSet.findMany({
    include: {
      conditions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRuleSetById(ruleSetId: string) {
  return prisma.ruleSet.findUnique({
    where: { id: ruleSetId },
    include: {
      conditions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function getActiveRuleSet() {
  return prisma.ruleSet.findFirst({
    where: { isActive: true },
    include: {
      conditions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function createRuleSet(input: {
  name: string;
  description?: string;
  conditions: RuleConditionInput[];
  isActive: boolean;
}) {
  return prisma.ruleSet.create({
    data: {
      name: input.name,
      description: input.description || null,
      isActive: input.isActive,
      conditions: {
        create: serializeConditionsForCreate(input.conditions),
      },
    },
    include: {
      conditions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

export async function updateRuleSet(input: {
  id: string;
  name: string;
  description?: string;
  conditions: RuleConditionInput[];
  isActive: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.ruleCondition.deleteMany({
      where: {
        ruleSetId: input.id,
      },
    });

    return tx.ruleSet.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description || null,
        isActive: input.isActive,
        conditions: {
          create: serializeConditionsForCreate(input.conditions),
        },
      },
      include: {
        conditions: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  });
}

export async function deleteRuleSet(ruleSetId: string) {
  return prisma.ruleSet.delete({
    where: { id: ruleSetId },
  });
}

export interface ActiveRuleThresholdSet {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  thresholds: {
    minTransactionCount: number;
    minUniqueContracts: number;
    minActiveDays: number;
    minTotalScore: number;
  };
}

function toThresholdSet(ruleSet: Awaited<ReturnType<typeof getActiveRuleSet>>): ActiveRuleThresholdSet | null {
  if (!ruleSet) {
    return null;
  }

  const thresholdByType = new Map<RuleConditionType, number>();
  for (const condition of ruleSet.conditions) {
    thresholdByType.set(condition.type, condition.threshold);
  }

  return {
    id: ruleSet.id,
    name: ruleSet.name,
    description: ruleSet.description,
    isActive: ruleSet.isActive,
    updatedAt: ruleSet.updatedAt.toISOString(),
    createdAt: ruleSet.createdAt.toISOString(),
    thresholds: {
      minTransactionCount: thresholdByType.get("MIN_TRANSACTION_COUNT") ?? 0,
      minUniqueContracts: thresholdByType.get("MIN_UNIQUE_CONTRACTS") ?? 0,
      minActiveDays: thresholdByType.get("MIN_ACTIVE_DAYS") ?? 0,
      minTotalScore: thresholdByType.get("MIN_TOTAL_SCORE") ?? 0,
    },
  };
}

export async function getActiveRuleThresholdSet() {
  const activeRuleSet = await getActiveRuleSet();
  return toThresholdSet(activeRuleSet);
}

const thresholdRuleInputSchema = z.object({
  name: z.string().trim().min(2).max(80).default("Builder Threshold Rule"),
  description: z.string().trim().max(300).optional(),
  minTransactionCount: z.number().int().min(0),
  minUniqueContracts: z.number().int().min(0),
  minActiveDays: z.number().int().min(0),
  minTotalScore: z.number().int().min(0),
});

export async function createActiveThresholdRuleSet(input: z.infer<typeof thresholdRuleInputSchema>) {
  const parsed = thresholdRuleInputSchema.parse(input);

  const created = await prisma.$transaction(async (tx) => {
    await tx.ruleSet.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return tx.ruleSet.create({
      data: {
        name: parsed.name,
        description: parsed.description || null,
        isActive: true,
        conditions: {
          create: [
            {
              type: "MIN_TRANSACTION_COUNT",
              threshold: parsed.minTransactionCount,
              sortOrder: 0,
            },
            {
              type: "MIN_UNIQUE_CONTRACTS",
              threshold: parsed.minUniqueContracts,
              sortOrder: 1,
            },
            {
              type: "MIN_ACTIVE_DAYS",
              threshold: parsed.minActiveDays,
              sortOrder: 2,
            },
            {
              type: "MIN_TOTAL_SCORE",
              threshold: parsed.minTotalScore,
              sortOrder: 3,
            },
          ],
        },
      },
      include: {
        conditions: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  });

  return toThresholdSet(created);
}

function evaluateScoreWithThresholdSet(
  score: WalletScoreResult,
  thresholdSet: ActiveRuleThresholdSet,
) {
  const conditions = [
    {
      id: "tx",
      type: "MIN_TRANSACTION_COUNT" as const,
      threshold: thresholdSet.thresholds.minTransactionCount,
    },
    {
      id: "contracts",
      type: "MIN_UNIQUE_CONTRACTS" as const,
      threshold: thresholdSet.thresholds.minUniqueContracts,
    },
    {
      id: "activeDays",
      type: "MIN_ACTIVE_DAYS" as const,
      threshold: thresholdSet.thresholds.minActiveDays,
    },
    {
      id: "total",
      type: "MIN_TOTAL_SCORE" as const,
      threshold: thresholdSet.thresholds.minTotalScore,
    },
  ];

  const evaluation = evaluateRuleConditions(conditions, {
    score,
    firstTransactionAt: score.firstTxTimestamp ? new Date(score.firstTxTimestamp) : null,
    evaluatedAt: new Date(),
  });

  const conditionMap = new Map(
    evaluation.conditionResults.map((condition) => [condition.type, condition.passed]),
  );

  return {
    passed: evaluation.passed,
    passedConditions: evaluation.passedConditions,
    failedConditions: evaluation.failedConditions,
    explanations: evaluation.explanations,
    metricStatus: {
      transactionCount: conditionMap.get("MIN_TRANSACTION_COUNT") ?? true,
      uniqueContracts: conditionMap.get("MIN_UNIQUE_CONTRACTS") ?? true,
      activeDays: conditionMap.get("MIN_ACTIVE_DAYS") ?? true,
      totalScore: conditionMap.get("MIN_TOTAL_SCORE") ?? true,
    },
  };
}

export async function evaluateScoreAgainstActiveRuleSet(score: WalletScoreResult) {
  const activeRuleSet = await getActiveRuleThresholdSet();
  if (!activeRuleSet) {
    return null;
  }

  return {
    ruleSet: activeRuleSet,
    evaluation: evaluateScoreWithThresholdSet(score, activeRuleSet),
  };
}

const evaluateWalletInputSchema = z.object({
  ruleSetId: z.string().cuid(),
  walletAddress: z
    .string()
    .trim()
    .min(1)
    .refine((value) => isAddress(value), "Invalid EVM wallet address."),
  forceRefresh: z.boolean().optional().default(false),
});

export async function evaluateWalletAgainstRuleSet(input: {
  ruleSetId: string;
  walletAddress: string;
  forceRefresh?: boolean;
}) {
  const parsedInput = evaluateWalletInputSchema.parse(input);
  const normalizedAddress = getAddress(parsedInput.walletAddress);

  const ruleSet = await getRuleSetById(parsedInput.ruleSetId);
  if (!ruleSet) {
    throw new Error("Rule set not found.");
  }

  const score = await getFluentWalletScore(normalizedAddress, {
    forceRefresh: parsedInput.forceRefresh,
    maxAgeMinutes: 5,
  });

  const walletProfile = await getWalletProfileWithLatestSnapshot(normalizedAddress);
  const firstTransactionAt =
    walletProfile?.snapshots.length && walletProfile.snapshots[0].firstSeenAt
      ? walletProfile.snapshots[0].firstSeenAt
      : null;

  const evaluation = evaluateRuleConditions(
    ruleSet.conditions.map((condition) => ({
      id: condition.id,
      type: condition.type,
      threshold: condition.threshold,
    })),
    {
      score,
      firstTransactionAt,
      evaluatedAt: new Date(),
    },
  );

  const passedConditionsJson: Prisma.JsonArray = evaluation.passedConditions;
  const failedConditionsJson: Prisma.JsonArray = evaluation.failedConditions;
  const explanationsJson: Prisma.JsonArray = evaluation.explanations;
  const scoreSnapshotJson: Prisma.JsonObject = {
    totalScore: score.totalScore,
    breakdown: {
      activity: score.breakdown.activity,
      diversity: score.breakdown.diversity,
      consistency: score.breakdown.consistency,
    },
    metrics: {
      transactionCount: score.metrics.transactionCount,
      uniqueContracts: score.metrics.uniqueContracts,
      activeDays: score.metrics.activeDays,
    },
    firstTransactionAt: firstTransactionAt ? firstTransactionAt.toISOString() : null,
    queriedAt: score.queriedAt,
  };

  const persistedEvaluation = await prisma.ruleEvaluation.create({
    data: {
      ruleSetId: ruleSet.id,
      walletAddress: normalizedAddress.toLowerCase(),
      passed: evaluation.passed,
      passedConditions: passedConditionsJson,
      failedConditions: failedConditionsJson,
      explanations: explanationsJson,
      scoreSnapshot: scoreSnapshotJson,
    },
  });

  return {
    ruleSet: {
      id: ruleSet.id,
      name: ruleSet.name,
      description: ruleSet.description,
      isActive: ruleSet.isActive,
    },
    walletAddress: normalizedAddress,
    evaluatedAt: persistedEvaluation.createdAt.toISOString(),
    passed: evaluation.passed,
    passedConditions: evaluation.passedConditions,
    failedConditions: evaluation.failedConditions,
    explanations: evaluation.explanations,
  };
}

export async function listBuilderWalletHistory(limit = 200) {
  const [activeRuleSet, scoredWallets] = await Promise.all([
    getActiveRuleThresholdSet(),
    listRecentScoredWallets(limit),
  ]);

  const wallets = scoredWallets.map((row) => {
    const score = hydrateWalletScoreResultFromRecord({
      address: getAddress(row.walletProfile.address),
      walletSnapshot: {
        id: row.snapshot.id,
        walletProfileId: row.snapshot.walletProfileId,
        firstSeenAt: row.snapshot.firstSeenAt,
        lastActivityAt: row.snapshot.lastActivityAt,
        txCount: row.snapshot.txCount,
        activeDays: row.snapshot.activeDays,
        uniqueContracts: row.snapshot.uniqueContracts,
        rawPayload: row.snapshot.rawPayload,
        createdAt: row.snapshot.createdAt,
      },
      walletScore: {
        id: row.id,
        walletProfileId: row.walletProfileId,
        snapshotId: row.snapshotId,
        transactionActivityScore: row.transactionActivityScore,
        contractDiversityScore: row.contractDiversityScore,
        consistencyScore: row.consistencyScore,
        totalScore: row.totalScore,
        summaryLabel: row.summaryLabel,
        reasonsJson: row.reasonsJson,
        createdAt: row.createdAt,
      },
    });

    const evaluation =
      activeRuleSet !== null ? evaluateScoreWithThresholdSet(score, activeRuleSet) : null;

    return {
      walletAddress: score.address,
      queriedAt: score.queriedAt,
      calculatedAt: score.calculatedAt,
      totalScore: score.totalScore,
      breakdown: score.breakdown,
      dataState: score.dataState,
      rulePassed: evaluation?.passed ?? null,
      score,
    };
  });

  return {
    activeRuleSet,
    wallets,
  };
}

export function parseRuleConditionsForInput(rawConditionsJson: string) {
  return parseRuleConditionsJson(rawConditionsJson);
}
