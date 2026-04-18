import { z } from "zod";

export const eligibilityRuleDefinitionSchema = z
  .object({
    minScore: z.number().int().min(0).max(100).optional(),
    minTransactions: z.number().int().min(0).optional(),
    minActiveDays: z.number().int().min(0).optional(),
    minUniqueContracts: z.number().int().min(0).optional(),
    minNativeBalanceWei: z.string().regex(/^\d+$/).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one eligibility rule condition is required.",
  });

export type EligibilityRuleDefinition = z.infer<
  typeof eligibilityRuleDefinitionSchema
>;

export const mutableRuleSetInputSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  definition: z.string().min(2),
  isActive: z.boolean().default(true),
});
