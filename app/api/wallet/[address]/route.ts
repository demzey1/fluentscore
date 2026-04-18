import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";

import { jsonError } from "@/lib/api/http-errors";
import { DataUnavailableError } from "@/lib/errors";
import { getNormalizedWalletSnapshot } from "@/lib/fluent/wallet";

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
    const snapshot = await getNormalizedWalletSnapshot(getAddress(address));
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    if (error instanceof DataUnavailableError) {
      return jsonError(503, error.code, error.message);
    }
    return jsonError(500, "INTERNAL_ERROR", "Unable to fetch wallet snapshot.");
  }
}
