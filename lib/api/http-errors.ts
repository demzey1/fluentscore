import { NextResponse } from "next/server";

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details: details ?? null,
      },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}
