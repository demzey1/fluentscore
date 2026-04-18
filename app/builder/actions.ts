"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireBuilderSession } from "@/lib/auth/builder-session";

const thresholdFormSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(300).optional(),
  minTransactionCount: z.coerce.number().int().min(0),
  minUniqueContracts: z.coerce.number().int().min(0),
  minActiveDays: z.coerce.number().int().min(0),
  minTotalScore: z.coerce.number().int().min(0),
});

function resolveOrigin(host: string | null, forwardedProto: string | null) {
  if (!host) {
    return "http://localhost:3000";
  }
  const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function getTextField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function toErrorUrl(message: string) {
  return `/builder?status=error&message=${encodeURIComponent(message)}`;
}

export async function saveActiveRuleSetAction(formData: FormData) {
  await requireBuilderSession();

  const parsed = thresholdFormSchema.safeParse({
    name: getTextField(formData, "name") || undefined,
    description: getTextField(formData, "description") || undefined,
    minTransactionCount: getTextField(formData, "minTransactionCount"),
    minUniqueContracts: getTextField(formData, "minUniqueContracts"),
    minActiveDays: getTextField(formData, "minActiveDays"),
    minTotalScore: getTextField(formData, "minTotalScore"),
  });

  if (!parsed.success) {
    redirect(toErrorUrl("Invalid threshold values."));
  }

  const requestHeaders = await headers();
  const origin = resolveOrigin(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto"),
  );

  const response = await fetch(new URL("/api/rules", origin), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: requestHeaders.get("cookie") ?? "",
    },
    cache: "no-store",
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    redirect(toErrorUrl("Unable to save active rule set."));
  }

  revalidatePath("/builder");
  redirect("/builder?status=success&message=Active+rule+set+saved");
}
