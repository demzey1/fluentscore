import { type RuleConditionType } from "@prisma/client";
import { z } from "zod";

export const ruleConditionTypeSchema = z.enum([
  "MIN_TRANSACTION_COUNT",
  "MIN_UNIQUE_CONTRACTS",
  "MIN_ACTIVE_DAYS",
  "FIRST_TRANSACTION_OLDER_THAN_DAYS",
  "MIN_TRANSACTION_ACTIVITY_SCORE",
  "MIN_CONTRACT_DIVERSITY_SCORE",
  "MIN_CONSISTENCY_SCORE",
  "MIN_TOTAL_SCORE",
]);

export type SupportedRuleConditionType = z.infer<typeof ruleConditionTypeSchema>;

export const ruleConditionInputSchema = z.object({
  type: ruleConditionTypeSchema,
  threshold: z.number().int().min(0),
});

export type RuleConditionInput = z.infer<typeof ruleConditionInputSchema>;

export const ruleConditionsJsonSchema = z
  .array(ruleConditionInputSchema)
  .min(1, "At least one rule condition is required.");

export const mutableRuleSetInputSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  conditionsJson: z.string().min(2),
  isActive: z.boolean().default(true),
});

export function parseRuleConditionsJson(rawConditionsJson: string): RuleConditionInput[] {
  const parsed = JSON.parse(rawConditionsJson) as unknown;
  return ruleConditionsJsonSchema.parse(parsed);
}

export function assertRuleConditionType(value: RuleConditionType): SupportedRuleConditionType {
  return ruleConditionTypeSchema.parse(value);
}
