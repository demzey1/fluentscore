import { timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";

const BUILDER_COOKIE_NAME = "fluent_builder_mode";
const BUILDER_COOKIE_VALUE = "unlocked";

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hasBuilderSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(BUILDER_COOKIE_NAME)?.value;
  return cookieValue === BUILDER_COOKIE_VALUE;
}

export async function unlockBuilderSession(passcode: string) {
  // Temporary gate only. The default passcode "123456" is not real authentication.
  if (!constantTimeEquals(passcode, env.BUILDER_MODE_PASSCODE)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(BUILDER_COOKIE_NAME, BUILDER_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  });

  return true;
}

export async function clearBuilderSession() {
  const cookieStore = await cookies();
  cookieStore.delete(BUILDER_COOKIE_NAME);
}

export async function requireBuilderSession() {
  if (!(await hasBuilderSession())) {
    redirect("/builder-access");
  }
}
