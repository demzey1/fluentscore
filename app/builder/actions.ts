"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireBuilderSession } from "@/lib/auth/builder-session";
import {
  createRuleSet,
  parseRuleDefinitionJson,
  updateRuleSet,
} from "@/lib/db/rules";
import { mutableRuleSetInputSchema } from "@/lib/rules/schema";

function getTextField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function parseRuleSetInput(formData: FormData, includeId: boolean) {
  const rawInput = {
    id: includeId ? getTextField(formData, "id") : undefined,
    name: getTextField(formData, "name"),
    description: getTextField(formData, "description"),
    definition: getTextField(formData, "definition"),
    isActive: formData.get("isActive") === "on",
  };

  return mutableRuleSetInputSchema.extend({
    id: includeId ? z.string().cuid() : z.string().cuid().optional(),
  }).parse(rawInput);
}

function toRedirectError(message: string) {
  const params = new URLSearchParams({
    status: "error",
    message,
  });
  return `/builder?${params.toString()}`;
}

export async function createRuleSetAction(formData: FormData) {
  await requireBuilderSession();

  try {
    const input = parseRuleSetInput(formData, false);
    const definition = parseRuleDefinitionJson(input.definition);

    await createRuleSet({
      name: input.name,
      description: input.description || undefined,
      definition,
      isActive: input.isActive,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create rule set.";
    redirect(toRedirectError(message));
  }

  revalidatePath("/builder");
  redirect("/builder?status=success&message=Rule+set+created");
}

export async function updateRuleSetAction(formData: FormData) {
  await requireBuilderSession();

  try {
    const input = parseRuleSetInput(formData, true);
    const definition = parseRuleDefinitionJson(input.definition);
    await updateRuleSet({
      id: input.id!,
      name: input.name,
      description: input.description || undefined,
      definition,
      isActive: input.isActive,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update rule set.";
    redirect(toRedirectError(message));
  }

  revalidatePath("/builder");
  redirect("/builder?status=success&message=Rule+set+updated");
}
