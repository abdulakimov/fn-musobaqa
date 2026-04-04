import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request.headers);

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        ok: true,
        db: "up",
        timestamp: new Date().toISOString(),
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    logApiError("readyz", requestId, error);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
      },
      { status: 503, headers: { "x-request-id": requestId } }
    );
  }
}
