import { NextResponse } from "next/server";
import { getRequestIdFromHeaders } from "@/lib/api-log";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request.headers);
  return NextResponse.json(
    {
      ok: true,
      service: "fn-musobaqa",
      timestamp: new Date().toISOString(),
    },
    { headers: { "x-request-id": requestId } }
  );
}
