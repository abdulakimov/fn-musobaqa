import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";
import { buildAdminAbsoluteUrl, shouldRedirectToAdminDomain } from "@/lib/admin-domain";

const resultSchema = z.object({
  resultStatus: z.string().trim().max(80).nullable().optional(),
  resultScore: z.number().int().min(0).max(1000).nullable().optional(),
  resultNote: z.string().trim().max(500).nullable().optional(),
});

function isAuthorized(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (shouldRedirectToAdminDomain(req.headers)) {
    const location = buildAdminAbsoluteUrl(`${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(location, 308);
  }

  const requestId = getRequestIdFromHeaders(req.headers);
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  const parsed = resultSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Natija qiymatlari noto'g'ri" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const payload = parsed.data;
  const normalizedStatus = payload.resultStatus?.trim() ? payload.resultStatus.trim() : null;
  const normalizedNote = payload.resultNote?.trim() ? payload.resultNote.trim() : null;
  const normalizedScore = typeof payload.resultScore === "number" ? payload.resultScore : null;

  const hasAnyResult = normalizedStatus !== null || normalizedScore !== null || normalizedNote !== null;

  const { id } = await params;

  try {
    const updated = await db.royxat.update({
      where: { id },
      data: {
        resultStatus: normalizedStatus,
        resultScore: normalizedScore,
        resultNote: normalizedNote,
        resultUpdatedAt: hasAnyResult ? new Date() : null,
      },
      select: {
        id: true,
        resultStatus: true,
        resultScore: true,
        resultNote: true,
        resultUpdatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    logApiError("admin-result", requestId, error);
    return NextResponse.json({ error: "Ishtirokchi topilmadi" }, { status: 404, headers: { "x-request-id": requestId } });
  }
}
