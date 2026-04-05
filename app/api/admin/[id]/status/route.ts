import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

const statusSchema = z.object({
  holat: z.enum(["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"]),
});

function isAuthorized(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestIdFromHeaders(req.headers);
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yoq" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Notogri holat" }, { status: 422, headers: { "x-request-id": requestId } });
  }

  try {
    const updated = await db.royxat.update({
      where: { id },
      data: { holat: parsed.data.holat },
    });

    return NextResponse.json({ success: true, holat: updated.holat }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    logApiError("admin-status", requestId, error);
    return NextResponse.json({ error: "Royxat topilmadi" }, { status: 404, headers: { "x-request-id": requestId } });
  }
}

