import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

const contactStatusSchema = z.object({
  contactStatus: z.enum(["BOGLANILMAGAN", "BOGLANIB_BOLMADI", "QAYTA_ALOQA", "BOGLANILGAN"]),
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

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "So'rov formati noto'g'ri", code: "INVALID_JSON" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const parsed = contactStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Noto'g'ri aloqa statusi", code: "INVALID_CONTACT_STATUS" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  try {
    const updated = await db.royxat.update({
      where: { id },
      data: { aloqaStatus: parsed.data.contactStatus },
    });

    return NextResponse.json(
      { success: true, contactStatus: updated.aloqaStatus },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    logApiError("admin-contact-status", requestId, error);
    return NextResponse.json(
      { error: "Ro'yxat topilmadi", code: "NOT_FOUND" },
      { status: 404, headers: { "x-request-id": requestId } }
    );
  }
}
