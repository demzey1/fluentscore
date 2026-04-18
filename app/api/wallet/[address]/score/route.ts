import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";

import { jsonError } from "@/lib/api/http-errors";
import { InvalidAddressError } from "@/lib/errors";
import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

interface RouteContext {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { address } = await params;

  if (!isAddress(address)) {
    return jsonError(400, "INVALID_ADDRESS", "Invalid EVM wallet address.");
  }

  try {
    const score = await getFluentWalletScore(getAddress(address));
    return NextResponse.json(score, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidAddressError) {
      return jsonError(400, error.code, error.message);
    }
    return jsonError(500, "INTERNAL_ERROR", "Unable to fetch wallet score.");
  }
}
