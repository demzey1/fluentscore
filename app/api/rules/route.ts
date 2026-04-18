import { NextResponse } from "next/server";

import {
  buildBuilderErrorPayload,
  createRuleSetPayload,
  getRuleSetListPayload,
  parseCreateRuleSetRequestBody,
} from "@/lib/api/builder-phase2";

export async function GET() {
  try {
    const rules = await getRuleSetListPayload();
    return NextResponse.json(
      {
        data: rules,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseCreateRuleSetRequestBody(request);
    const created = await createRuleSetPayload(body);

    return NextResponse.json(
      {
        data: created,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
