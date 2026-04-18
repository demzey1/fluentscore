import { NextResponse } from "next/server";

import {
  buildErrorPayload,
  getWalletSnapshotPayload,
  parseAddressParam,
  parseScoreQuery,
} from "@/lib/api/fluentscore-phase1";

interface RouteContext {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { address } = await params;
    const parsedAddress = parseAddressParam(address);
    const requestUrl = new URL(request.url);
    const query = parseScoreQuery(requestUrl.searchParams);

    const walletPayload = await getWalletSnapshotPayload({
      address: parsedAddress,
      maxAgeMinutes: query.maxAgeMinutes,
    });

    return NextResponse.json(
      {
        data: walletPayload,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    const shapedError = buildErrorPayload(error);
    return NextResponse.json(shapedError.body, { status: shapedError.status });
  }
}
