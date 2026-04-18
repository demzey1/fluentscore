import { NextResponse } from "next/server";

import {
  buildBuilderErrorPayload,
  deleteRuleSetPayload,
  getRuleSetPayload,
  parseRuleSetIdParam,
  parseUpdateRuleSetRequestBody,
  updateRuleSetPayload,
} from "@/lib/api/builder-phase2";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ruleSetId = parseRuleSetIdParam(id);
    const ruleSet = await getRuleSetPayload(ruleSetId);

    return NextResponse.json(
      {
        data: ruleSet,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ruleSetId = parseRuleSetIdParam(id);
    const body = await parseUpdateRuleSetRequestBody(request);
    const updated = await updateRuleSetPayload(ruleSetId, body);

    return NextResponse.json(
      {
        data: updated,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ruleSetId = parseRuleSetIdParam(id);
    const deleted = await deleteRuleSetPayload(ruleSetId);

    return NextResponse.json(
      {
        data: deleted,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
