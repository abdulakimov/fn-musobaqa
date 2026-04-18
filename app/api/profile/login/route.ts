import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/validations";
import {
  createParticipantSessionValue,
  PARTICIPANT_SESSION_COOKIE,
} from "@/lib/participant-auth";
import { participantSessionCookieOptions } from "@/lib/session-cookie";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

const PARTICIPANT_ID_REGEX = /^(?:[ABCDKT])[1-9]{4}$/;

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

export async function POST(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  try {
    const body = await req.json();
    const rawPhone = String(body?.telefon ?? "").trim();
    const rawParticipantId = String(body?.participantId ?? "")
      .trim()
      .toUpperCase();

    const normalizedPhone = normalizePhone(rawPhone);

    if (!/^\+998\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Telefon formati noto'g'ri", code: "PHONE_INVALID" },
        { status: 422, headers: { "x-request-id": requestId } }
      );
    }

    if (!PARTICIPANT_ID_REGEX.test(rawParticipantId)) {
      return NextResponse.json(
        { error: "ID formati noto'g'ri", code: "ID_INVALID" },
        { status: 422, headers: { "x-request-id": requestId } }
      );
    }

    const participantByPhone = await db.royxat.findFirst({
      where: { telefon: normalizedPhone, deletedAt: null },
      select: { id: true, participantId: true },
    });

    if (!participantByPhone) {
      return NextResponse.json(
        { error: "Bu telefon raqam ro'yxatdan o'tmagan", code: "NOT_REGISTERED" },
        { status: 404, headers: { "x-request-id": requestId } }
      );
    }

    if (participantByPhone.participantId !== rawParticipantId) {
      return NextResponse.json(
        { error: "Telefon yoki ID noto'g'ri", code: "CREDENTIALS_INVALID" },
        { status: 401, headers: { "x-request-id": requestId } }
      );
    }

    const response = NextResponse.json({ success: true }, { headers: { "x-request-id": requestId } });
    response.cookies.set(
      PARTICIPANT_SESSION_COOKIE,
      createParticipantSessionValue(participantByPhone.id),
      participantSessionCookieOptions(req)
    );

    return response;
  } catch (error) {
    const errorCode = getErrorCode(error);
    const isDbUnavailable =
      errorCode === "P1001" ||
      errorCode === "P1002" ||
      (error instanceof Error &&
        /ECONNREFUSED|Can't reach database server|Timed out fetching a new connection/i.test(
          `${error.name} ${error.message}`
        ));

    if (isDbUnavailable) {
      logApiError("profile-login-db-unavailable", requestId, error);
      return NextResponse.json(
        { error: "Ma'lumotlar bazasiga ulanib bo'lmadi", code: "DB_UNAVAILABLE" },
        { status: 503, headers: { "x-request-id": requestId } }
      );
    }

    logApiError("profile-login", requestId, error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
