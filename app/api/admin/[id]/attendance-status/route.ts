import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

const attendanceStatusSchema = z.object({
  attendanceStatus: z.enum(["KELGAN", "KELMADI"]),
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
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "So'rov formati noto'g'ri", code: "INVALID_JSON" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const parsed = attendanceStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Noto'g'ri kelish statusi", code: "INVALID_ATTENDANCE_STATUS" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const { id } = await params;

  try {
    const existing = await db.royxat.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Ro'yxat topilmadi", code: "NOT_FOUND" },
        { status: 404, headers: { "x-request-id": requestId } }
      );
    }

    const updated = await db.royxat.update({
      where: { id },
      data: { kelishStatus: parsed.data.attendanceStatus },
      select: { kelishStatus: true },
    });

    return NextResponse.json(
      { success: true, attendanceStatus: updated.kelishStatus },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    logApiError("admin-attendance-status", requestId, error);
    return NextResponse.json(
      { error: "Ro'yxat topilmadi", code: "NOT_FOUND" },
      { status: 404, headers: { "x-request-id": requestId } }
    );
  }
}
