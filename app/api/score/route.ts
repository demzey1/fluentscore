import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { z } from "zod";

import { jsonError } from "@/lib/api/http-errors";
import { InvalidAddressError } from "@/lib/errors";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

const scoreBodySchema = z.object({
  address: z.string().trim().min(1),
});

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = scoreBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid /api/score payload.", parsed.error.issues);
  }

  if (!isAddress(parsed.data.address)) {
    return jsonError(400, "INVALID_ADDRESS", "Invalid EVM wallet address.");
  }

  try {
    const score = await getFluentWalletScore(getAddress(parsed.data.address));
    return NextResponse.json(score, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidAddressError) {
      return jsonError(400, error.code, error.message);
    }
    return jsonError(500, "INTERNAL_ERROR", "Unable to compute wallet score.");
  }
}
