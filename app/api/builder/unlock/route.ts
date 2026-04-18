import { NextResponse } from "next/server";

import {
  buildBuilderErrorPayload,
  parseUnlockRequestBody,
  unlockBuilderModeForSession,
} from "@/lib/api/builder-phase2";

export async function POST(request: Request) {
  try {
    const body = await parseUnlockRequestBody(request);
    const unlockPayload = await unlockBuilderModeForSession(body.passcode);

    return NextResponse.json(
      {
        data: unlockPayload,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildBuilderErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
