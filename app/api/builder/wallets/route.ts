import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api/http-errors";
import { hasBuilderSession } from "@/lib/auth/builder-session";
import { listBuilderWalletHistory } from "@/lib/db/rules";

const querySchema = z.object({
  limit: z.number().int().min(1).max(500).default(200),
});

export async function GET(request: Request) {
  if (!(await hasBuilderSession())) {
    return jsonError(
      401,
      "BUILDER_SESSION_REQUIRED",
      "Builder Mode is locked for this browser session.",
    );
  }

  const requestUrl = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: requestUrl.searchParams.get("limit")
      ? Number(requestUrl.searchParams.get("limit"))
      : undefined,
  });

  if (!parsed.success) {
    return jsonError(400, "INVALID_QUERY", "Invalid /api/builder/wallets query.", parsed.error.issues);
  }

  const payload = await listBuilderWalletHistory(parsed.data.limit);
  return NextResponse.json({ data: payload }, { status: 200 });
}
