import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";

function isAuthorized(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function escapeCsv(value: string) {
  const normalized = value.replace(/[\r\n]+/g, " ");
  const escaped = normalized.replace(/"/g, '""');
  const safePrefix = /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped;
  return `"${safePrefix}"`;
}

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  const format = req.nextUrl.searchParams.get("format");
  const holat = req.nextUrl.searchParams.get("holat") as
    | "KUTILMOQDA"
    | "TASDIQLANDI"
    | "RAD_ETILDI"
    | null;
  const yoshGuruhi = req.nextUrl.searchParams.get("yoshGuruhi") as
    | "YOSH_9_11"
    | "YOSH_12_14"
    | "YOSH_9_14"
    | null;
  const yonalish = req.nextUrl.searchParams.get("yonalish") as
    | "MATEMATIKA"
    | "TYPING"
    | null;

  const where: Record<string, unknown> = {};
  if (holat) where.holat = holat;
  if (yoshGuruhi) where.yoshGuruhi = yoshGuruhi;
  if (yonalish) where.yonalish = yonalish;

  let royxatlar;
  try {
    royxatlar = await db.royxat.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logApiError("admin-registrations", requestId, error);
    return NextResponse.json(
      { error: "Ro'yxatni olishda xatolik yuz berdi" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }

  if (format === "csv") {
    const headers = [
      "ID",
      "Ishtirokchi ID",
      "Ism",
      "Familiya",
      "Otasining ismi",
      "Telefon",
      "Yosh guruhi",
      "Yo'nalish",
      "Natija statusi",
      "Natija ball",
      "Natija izoh",
      "Natija yangilangan",
      "Holat",
      "Sana",
    ].join(",");

    const rows = royxatlar.map((r) =>
      [
        escapeCsv(r.id),
        escapeCsv(r.participantId ?? ""),
        escapeCsv(r.ism),
        escapeCsv(r.familiya),
        escapeCsv(r.otasiningIsmi),
        escapeCsv(r.telefon),
        escapeCsv(YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi),
        escapeCsv(YONALISH_LABELS[r.yonalish] ?? r.yonalish),
        escapeCsv(r.resultStatus ?? ""),
        escapeCsv(r.resultScore === null ? "" : String(r.resultScore)),
        escapeCsv(r.resultNote ?? ""),
        escapeCsv(r.resultUpdatedAt ? r.resultUpdatedAt.toISOString() : ""),
        escapeCsv(r.holat),
        escapeCsv(r.createdAt.toISOString()),
      ].join(",")
    );

    const csv = [headers, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="royxatlar-${Date.now()}.csv"`,
        "x-request-id": requestId,
      },
    });
  }

  return NextResponse.json({ data: royxatlar, total: royxatlar.length }, { headers: { "x-request-id": requestId } });
}

