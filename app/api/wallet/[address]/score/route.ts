import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { getFluentWalletScore } from "@/lib/scoring/wallet-score";

interface RouteContext {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { address } = await params;
  if (!isAddress(address)) {
    return NextResponse.json(
      {
        error: "Invalid wallet address.",
      },
      { status: 400 },
    );
  }

  try {
    const score = await getFluentWalletScore(address);
    return NextResponse.json(score, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to calculate wallet score.";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
