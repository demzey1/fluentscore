"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function resolveOrigin(host: string | null, forwardedProto: string | null) {
  if (!host) {
    return "http://localhost:3000";
  }
  const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function unlockBuilderModeAction(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "").trim();

  const requestHeaders = await headers();
  const origin = resolveOrigin(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto"),
  );

  const response = await fetch(new URL("/api/builder/unlock", origin), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ passcode }),
  });

  if (response.status === 401) {
    redirect("/builder-access?error=1");
  }

  if (!response.ok) {
    redirect("/builder-access?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("builder_session", "unlocked", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  redirect("/builder");
}
