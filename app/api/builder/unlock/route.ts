import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { jsonError } from "@/lib/api/http-errors";
import { env } from "@/lib/env";

const unlockSchema = z.object({
  passcode: z.string().trim().min(1),
});

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = unlockSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid /api/builder/unlock payload.", parsed.error.issues);
  }

  const configuredPasscode = process.env.BUILDER_PASSCODE ?? env.BUILDER_PASSCODE;
  if (!constantTimeEquals(parsed.data.passcode, configuredPasscode)) {
    return jsonError(401, "INCORRECT_PASSCODE", "Builder passcode is incorrect.");
  }

  const cookieStore = await cookies();
  cookieStore.set("builder_session", "unlocked", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
