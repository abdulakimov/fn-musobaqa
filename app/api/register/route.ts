import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fullRegistrationSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { createRegistrationWithId, DuplicatePhoneError } from "@/lib/participant-id";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

export async function POST(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  try {
    const body = await req.json();
    const data = fullRegistrationSchema.parse(body);
    const royxat = await createRegistrationWithId(db, data);

    return NextResponse.json(
      { success: true, id: royxat.id, participantId: royxat.participantId },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    if (error instanceof DuplicatePhoneError) {
      return NextResponse.json(
        { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
        { status: 409, headers: { "x-request-id": requestId } }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten() }, { status: 422, headers: { "x-request-id": requestId } });
    }
    logApiError("register", requestId, error);
    return NextResponse.json({ error: "Server xatosi yuz berdi" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
