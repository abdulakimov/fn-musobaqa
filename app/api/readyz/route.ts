import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

export async function GET(request: Request) {
  const requestId = getRequestIdFromHeaders(request.headers);

  try {
    await db.$queryRaw`SELECT 1`;

    const indexRows = await db.$queryRaw<Array<{ indexdef: string }>>`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'Royxat'
        AND indexname = 'Royxat_telefon_active_unique'
      LIMIT 1
    `;

    const indexDef = indexRows[0]?.indexdef ?? "";
    const isActiveIndex = /WHERE\s+\("deletedAt"\s+IS\s+NULL\)/i.test(indexDef);
    if (!isActiveIndex) {
      logApiError("readyz-schema-drift", requestId, new Error("Royxat_telefon_active_unique missing or invalid"));
      return NextResponse.json(
        {
          ok: false,
          db: "up",
          schema: "drift",
          code: "SCHEMA_MIGRATION_REQUIRED",
        },
        { status: 503, headers: { "x-request-id": requestId } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        db: "up",
        schema: "ok",
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
