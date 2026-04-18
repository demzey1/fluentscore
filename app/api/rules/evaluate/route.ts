import { NextResponse } from "next/server";

import {
  buildBuilderErrorPayload,
  evaluateRuleSetPayload,
  parseEvaluateRuleRequestBody,
} from "@/lib/api/builder-phase2";

export async function POST(request: Request) {
  try {
    const body = await parseEvaluateRuleRequestBody(request);
    const evaluation = await evaluateRuleSetPayload(body);

    return NextResponse.json(
      {
        data: evaluation,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
