import { NextResponse } from "next/server";

import {
  buildErrorPayload,
  executeScoreFlow,
  parsePostScoreBody,
} from "@/lib/api/fluentscore-phase1";

export async function POST(request: Request) {
  try {
    const body = await parsePostScoreBody(request);
    const scorePayload = await executeScoreFlow({
      address: body.address,
      refresh: body.refresh,
      maxAgeMinutes: body.maxAgeMinutes,
    });

    return NextResponse.json(
      {
        data: scorePayload,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
