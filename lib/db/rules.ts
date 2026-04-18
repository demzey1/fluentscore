import type { Prisma, RuleConditionType } from "@prisma/client";
import { getAddress, isAddress } from "viem";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { getWalletProfileWithLatestSnapshot } from "@/lib/db/wallet-snapshots";
import { evaluateRuleConditions } from "@/lib/rules/engine";
import {
  parseRuleConditionsJson,
  type RuleConditionInput,
  type SupportedRuleConditionType,
} from "@/lib/rules/schema";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

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

export function parseRuleConditionsForInput(rawConditionsJson: string) {
  return parseRuleConditionsJson(rawConditionsJson);
}
