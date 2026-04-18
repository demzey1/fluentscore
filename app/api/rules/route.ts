import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api/http-errors";
import { hasBuilderSession } from "@/lib/auth/builder-session";
import {
  createActiveThresholdRuleSet,
  getActiveRuleThresholdSet,
} from "@/lib/db/rules";

const createRuleSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(300).optional(),
  minTransactionCount: z.number().int().min(0),
  minUniqueContracts: z.number().int().min(0),
  minActiveDays: z.number().int().min(0),
  minTotalScore: z.number().int().min(0),
});

function unauthorizedResponse() {
  return jsonError(
    401,
    "BUILDER_SESSION_REQUIRED",
    "Builder Mode is locked for this browser session.",
  );
}

export async function GET() {
  if (!(await hasBuilderSession())) {
    return unauthorizedResponse();
  }

  const activeRule = await getActiveRuleThresholdSet();
  return NextResponse.json({ data: activeRule }, { status: 200 });
}

export async function POST(request: Request) {
  if (!(await hasBuilderSession())) {
    return unauthorizedResponse();
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = createRuleSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid /api/rules payload.", parsed.error.issues);
  }

  const savedRule = await createActiveThresholdRuleSet({
    name: parsed.data.name ?? "Builder Threshold Rule",
    description: parsed.data.description,
    minTransactionCount: parsed.data.minTransactionCount,
    minUniqueContracts: parsed.data.minUniqueContracts,
    minActiveDays: parsed.data.minActiveDays,
    minTotalScore: parsed.data.minTotalScore,
  });

  return NextResponse.json({ data: savedRule }, { status: 201 });
}
