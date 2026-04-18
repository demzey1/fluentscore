import { Prisma } from "@prisma/client";
import { getAddress, isAddress } from "viem";
import { z } from "zod";

import { hasBuilderSession, unlockBuilderSession } from "@/lib/auth/builder-session";
import {
  createRuleSet,
  deleteRuleSet,
  evaluateWalletAgainstRuleSet,
  getRuleSetById,
  listRuleSets,
  updateRuleSet,
} from "@/lib/db/rules";
import { ruleConditionInputSchema } from "@/lib/rules/schema";

const ruleSetIdSchema = z.string().cuid();

const createRuleSetBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  conditions: z.array(ruleConditionInputSchema).min(1),
  isActive: z.boolean().optional().default(true),
});

const updateRuleSetBodySchema = createRuleSetBodySchema;

const unlockBodySchema = z.object({
  passcode: z.string().trim().min(1).max(64),
});

const evaluateRuleBodySchema = z.object({
  ruleSetId: ruleSetIdSchema,
  walletAddress: z
    .string()
    .trim()
    .min(1)
    .refine((value) => isAddress(value), "Invalid EVM wallet address.")
    .transform((value) => getAddress(value)),
  forceRefresh: z.boolean().optional().default(false),
});

type RuleSetWithConditions = NonNullable<Awaited<ReturnType<typeof getRuleSetById>>>;

export class BuilderApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface BuilderErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

function nowIso() {
  return new Date().toISOString();
}

function trimToUndefined(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function mapRuleSet(ruleSet: RuleSetWithConditions) {
  return {
    id: ruleSet.id,
    name: ruleSet.name,
    description: ruleSet.description,
    isActive: ruleSet.isActive,
    createdAt: ruleSet.createdAt.toISOString(),
    updatedAt: ruleSet.updatedAt.toISOString(),
    conditions: ruleSet.conditions.map((condition) => ({
      id: condition.id,
      type: condition.type,
      threshold: condition.threshold,
    })),
  };
}

async function parseRequestBody<T>(request: Request, schema: z.ZodSchema<T>, routeLabel: string) {
  let jsonPayload: unknown;
  try {
    jsonPayload = await request.json();
  } catch {
    throw new BuilderApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = schema.safeParse(jsonPayload);
  if (!parsed.success) {
    throw new BuilderApiError(400, "INVALID_BODY", `Invalid ${routeLabel} payload.`, {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

function mapPrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return new BuilderApiError(404, "RULE_SET_NOT_FOUND", "Rule set not found.");
  }
  return error;
}

async function requireBuilderSessionForApi() {
  if (!(await hasBuilderSession())) {
    throw new BuilderApiError(
      401,
      "BUILDER_SESSION_REQUIRED",
      "Builder Mode is locked for this browser session.",
    );
  }
}

export async function parseUnlockRequestBody(request: Request) {
  return parseRequestBody(request, unlockBodySchema, "/api/builder/unlock");
}

export async function unlockBuilderModeForSession(passcode: string) {
  // Temporary private gate only. This is not production authentication.
  const unlocked = await unlockBuilderSession(passcode);
  if (!unlocked) {
    throw new BuilderApiError(401, "INVALID_PASSCODE", "Builder passcode is incorrect.");
  }

  return {
    unlocked: true as const,
    scope: "browser_session" as const,
    note: "Temporary private access gate. Not production authentication.",
  };
}

export async function getRuleSetListPayload() {
  await requireBuilderSessionForApi();
  const ruleSets = await listRuleSets();
  return ruleSets.map((ruleSet) => mapRuleSet(ruleSet));
}

export async function parseCreateRuleSetRequestBody(request: Request) {
  return parseRequestBody(request, createRuleSetBodySchema, "/api/rules");
}

export async function createRuleSetPayload(input: z.infer<typeof createRuleSetBodySchema>) {
  await requireBuilderSessionForApi();
  const created = await createRuleSet({
    name: input.name,
    description: trimToUndefined(input.description),
    conditions: input.conditions,
    isActive: input.isActive,
  });
  return mapRuleSet(created);
}

export function parseRuleSetIdParam(id: string) {
  const parsed = ruleSetIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BuilderApiError(400, "INVALID_RULE_SET_ID", "Rule set id is invalid.", {
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}

export async function getRuleSetPayload(ruleSetId: string) {
  await requireBuilderSessionForApi();
  const ruleSet = await getRuleSetById(ruleSetId);
  if (!ruleSet) {
    throw new BuilderApiError(404, "RULE_SET_NOT_FOUND", "Rule set not found.");
  }
  return mapRuleSet(ruleSet);
}

export async function parseUpdateRuleSetRequestBody(request: Request) {
  return parseRequestBody(request, updateRuleSetBodySchema, "/api/rules/[id]");
}

export async function updateRuleSetPayload(
  ruleSetId: string,
  input: z.infer<typeof updateRuleSetBodySchema>,
) {
  await requireBuilderSessionForApi();
  try {
    const updated = await updateRuleSet({
      id: ruleSetId,
      name: input.name,
      description: trimToUndefined(input.description),
      conditions: input.conditions,
      isActive: input.isActive,
    });
    return mapRuleSet(updated);
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function deleteRuleSetPayload(ruleSetId: string) {
  await requireBuilderSessionForApi();
  try {
    await deleteRuleSet(ruleSetId);
  } catch (error) {
    throw mapPrismaError(error);
  }

  return {
    deleted: true as const,
    id: ruleSetId,
  };
}

export async function parseEvaluateRuleRequestBody(request: Request) {
  return parseRequestBody(request, evaluateRuleBodySchema, "/api/rules/evaluate");
}

export async function evaluateRuleSetPayload(input: z.infer<typeof evaluateRuleBodySchema>) {
  await requireBuilderSessionForApi();
  return evaluateWalletAgainstRuleSet({
    ruleSetId: input.ruleSetId,
    walletAddress: input.walletAddress,
    forceRefresh: input.forceRefresh,
  });
}

export function buildBuilderErrorPayload(error: unknown): {
  status: number;
  body: BuilderErrorPayload;
} {
  if (error instanceof BuilderApiError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
        timestamp: nowIso(),
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred.",
      },
      timestamp: nowIso(),
    },
  };
}
