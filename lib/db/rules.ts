import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import {
  eligibilityRuleDefinitionSchema,
  type EligibilityRuleDefinition,
} from "@/lib/rules/schema";

function toDefinitionJson(definition: EligibilityRuleDefinition): Prisma.JsonObject {
  return {
    ...definition,
  };
}

export async function listRuleSets() {
  return prisma.ruleSet.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function createRuleSet(input: {
  name: string;
  description?: string;
  definition: EligibilityRuleDefinition;
  isActive: boolean;
}) {
  return prisma.ruleSet.create({
    data: {
      name: input.name,
      description: input.description || null,
      definition: toDefinitionJson(input.definition),
      isActive: input.isActive,
    },
  });
}

export async function updateRuleSet(input: {
  id: string;
  name: string;
  description?: string;
  definition: EligibilityRuleDefinition;
  isActive: boolean;
}) {
  return prisma.ruleSet.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description || null,
      definition: toDefinitionJson(input.definition),
      isActive: input.isActive,
    },
  });
}

export function parseRuleDefinitionJson(rawDefinition: string) {
  const parsed = JSON.parse(rawDefinition) as unknown;
  return eligibilityRuleDefinitionSchema.parse(parsed);
}
