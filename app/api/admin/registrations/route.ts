import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import { fullRegistrationSchema, YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { isValidAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";
import {
  createRegistrationWithId,
  DuplicatePhoneError,
} from "@/lib/participant-id";
import { enqueueRegistrationSms } from "@/lib/sms-queue";
import { getCompetitionRules } from "@/lib/competition";
import {
  CONTACT_STATUS_VALUES,
  buildAdminRegistrationsOrderBy,
  buildAdminRegistrationsWhere,
  parseAdminRegistrationsFilters,
} from "@/lib/admin-registration-filters";

function isAuthorized(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function escapeCsv(value: string) {
  const normalized = value.replace(/[\r\n]+/g, " ");
  const escaped = normalized.replace(/"/g, '""');
  const safePrefix = /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped;
  return `"${safePrefix}"`;
}

function parseEnum<T extends readonly string[]>(raw: string | null, values: T): T[number] | null {
  if (!raw) return null;
  return (values as readonly string[]).includes(raw) ? (raw as T[number]) : null;
}

const DELETE_BATCH_LIMIT = 200;

function getContactStatusLabel(value: (typeof CONTACT_STATUS_VALUES)[number]) {
  if (value === "BOGLANIB_BOLMADI") return "Bog'lanib bo'lmadi";
  if (value === "QAYTA_ALOQA") return "Qayta aloqa";
  if (value === "BOGLANILGAN") return "Bog'lanilgan";
  return "Bog'lanilmagan";
}

export async function POST(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  let requestPhone = "";
  try {
    const body = await req.json();
    const data = fullRegistrationSchema.parse(body);
    requestPhone = data.telefon;

    const created = await createRegistrationWithId(db, data, {
      skipDeadlineCheck: true,
      skipLimitCheck: true,
    });

    let smsStatus: "PENDING" | "FAILED" | "SENT" = "PENDING";
    try {
      await enqueueRegistrationSms({
        registrationId: created.id,
        phone: data.telefon,
        participantId: created.participantId ?? "",
        ism: data.ism,
        familiya: data.familiya,
        otasiningIsmi: data.otasiningIsmi,
      });
    } catch (smsQueueError) {
      smsStatus = "FAILED";
      await db.royxat.update({
        where: { id: created.id },
        data: {
          smsStatus: "FAILED",
          smsError: (smsQueueError instanceof Error ? smsQueueError.message : "SMS queue error").slice(0, 300),
        },
      });
    }

    const rules = getCompetitionRules();
    return NextResponse.json(
      {
        success: true,
        id: created.id,
        participantId: created.participantId,
        smsStatus,
        registrationDeadline: rules.registrationDeadlineIso,
      },
      { status: 201, headers: { "x-request-id": requestId } },
    );
  } catch (error) {
    if (error instanceof DuplicatePhoneError) {
      const existingActive = requestPhone
        ? await db.royxat
            .findFirst({
              where: { telefon: requestPhone, deletedAt: null },
              select: { participantId: true, id: true },
              orderBy: { createdAt: "desc" },
            })
            .catch(() => null)
        : null;
      if (existingActive) {
        return NextResponse.json(
          {
            error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
            code: "DUPLICATE_PHONE",
            existing: existingActive,
          },
          { status: 409, headers: { "x-request-id": requestId } },
        );
      }

      const existingArchived = requestPhone
        ? await db.royxat
            .findFirst({
              where: { telefon: requestPhone, deletedAt: { not: null } },
              select: { participantId: true, id: true },
              orderBy: { createdAt: "desc" },
            })
            .catch(() => null)
        : null;

      if (existingArchived) {
        logApiError(
          "admin-registration-schema-drift",
          requestId,
          new Error(`phone=${requestPhone} archivedRegistrationId=${existingArchived.id}`)
        );
        return NextResponse.json(
          {
            error: "Serverda migratsiya to'liq qo'llanmagan. Administratorga murojaat qiling.",
            code: "SCHEMA_MIGRATION_REQUIRED",
          },
          { status: 503, headers: { "x-request-id": requestId } },
        );
      }

      return NextResponse.json(
        {
          error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
          code: "DUPLICATE_PHONE",
          existing: null,
        },
        { status: 409, headers: { "x-request-id": requestId } },
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { errors: error.flatten(), code: "VALIDATION_ERROR" },
        { status: 422, headers: { "x-request-id": requestId } },
      );
    }
    logApiError("admin-registrations-post", requestId, error);
    return NextResponse.json(
      { error: "Server xatosi yuz berdi" },
      { status: 500, headers: { "x-request-id": requestId } },
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401, headers: { "x-request-id": requestId } });
  }

  const format = req.nextUrl.searchParams.get("format");
  const qRaw = req.nextUrl.searchParams.get("q") ?? "";
  if (qRaw.trim().length > 80) {
    return NextResponse.json(
      { error: "Qidiruv matni juda uzun", code: "QUERY_TOO_LONG" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }
  const filters = parseAdminRegistrationsFilters(req.nextUrl.searchParams);

  const where = buildAdminRegistrationsWhere(filters);
  if (filters.duplicatesOnly) {
    let duplicateNameKeys: string[] = [];
    try {
      const rows = await db.$queryRaw<Array<{ nameKey: string }>>`
        SELECT "nameKey"
        FROM "Royxat"
        WHERE "deletedAt" IS NULL
        GROUP BY "nameKey"
        HAVING COUNT(*) > 1
      `;
      duplicateNameKeys = rows.map((row: { nameKey: string }) => row.nameKey);
    } catch {
      duplicateNameKeys = [];
    }
    if (duplicateNameKeys.length === 0) {
      where.id = "__no-duplicates__";
    } else {
      where.nameKey = { in: duplicateNameKeys };
    }
  }

  const orderBy = buildAdminRegistrationsOrderBy(filters);

  let royxatlar;
  try {
    royxatlar = await db.royxat.findMany({
      where,
      orderBy,
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
      "UTM Type",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "SMS Status",
      "SMS Sent At",
      "SMS Error",
      "Natija statusi",
      "Natija ball",
      "Natija izoh",
      "Natija yangilangan",
      "Aloqa statusi",
      "Holat",
      "Sana",
    ].join(",");

    const rows = royxatlar.map((r: (typeof royxatlar)[number]) =>
      [
        escapeCsv(r.id),
        escapeCsv(r.participantId ?? ""),
        escapeCsv(r.ism),
        escapeCsv(r.familiya),
        escapeCsv(r.otasiningIsmi),
        escapeCsv(r.telefon),
        escapeCsv(YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi),
        escapeCsv(YONALISH_LABELS[r.yonalish] ?? r.yonalish),
        escapeCsv(r.utmType),
        escapeCsv(r.utmSource ?? ""),
        escapeCsv(r.utmMedium ?? ""),
        escapeCsv(r.utmCampaign ?? ""),
        escapeCsv(r.smsStatus),
        escapeCsv(r.smsSentAt ? r.smsSentAt.toISOString() : ""),
        escapeCsv(r.smsError ?? ""),
        escapeCsv(r.resultStatus ?? ""),
        escapeCsv(r.resultScore === null ? "" : String(r.resultScore)),
        escapeCsv(r.resultNote ?? ""),
        escapeCsv(r.resultUpdatedAt ? r.resultUpdatedAt.toISOString() : ""),
        escapeCsv(getContactStatusLabel(r.aloqaStatus)),
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

export async function PATCH(req: NextRequest) {
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

  const contactStatus = parseEnum((body as { contactStatus?: string })?.contactStatus ?? null, CONTACT_STATUS_VALUES);
  if (!contactStatus) {
    return NextResponse.json(
      { error: "Noto'g'ri aloqa statusi", code: "INVALID_CONTACT_STATUS" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const idsRaw = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(idsRaw) || idsRaw.length === 0) {
    return NextResponse.json(
      { error: "Yangilash uchun IDs ro'yxati bo'sh", code: "IDS_REQUIRED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  if (idsRaw.length > DELETE_BATCH_LIMIT) {
    return NextResponse.json(
      { error: `Bir martada ko'pi bilan ${DELETE_BATCH_LIMIT} ta yozuv yangilanadi`, code: "BATCH_LIMIT_EXCEEDED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const ids = Array.from(new Set(idsRaw))
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Yangilash uchun IDs ro'yxati bo'sh", code: "IDS_REQUIRED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  try {
    const result = await db.royxat.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: { aloqaStatus: contactStatus },
    });
    return NextResponse.json(
      { success: true, updatedCount: result.count, contactStatus },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    logApiError("admin-registrations-patch", requestId, error);
    return NextResponse.json(
      { error: "Aloqa statusini yangilashda xatolik yuz berdi" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

  const idsRaw = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(idsRaw) || idsRaw.length === 0) {
    return NextResponse.json(
      { error: "O'chirish uchun IDs ro'yxati bo'sh", code: "IDS_REQUIRED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  if (idsRaw.length > DELETE_BATCH_LIMIT) {
    return NextResponse.json(
      { error: `Bir martada ko'pi bilan ${DELETE_BATCH_LIMIT} ta yozuv o'chiriladi`, code: "BATCH_LIMIT_EXCEEDED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  const ids = Array.from(new Set(idsRaw))
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "O'chirish uchun IDs ro'yxati bo'sh", code: "IDS_REQUIRED" },
      { status: 422, headers: { "x-request-id": requestId } }
    );
  }

  try {
    const result = await db.royxat.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return NextResponse.json(
      { success: true, deletedCount: result.count },
      { headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    logApiError("admin-registrations-delete", requestId, error);
    return NextResponse.json(
      { error: "Tanlanganlarni o'chirishda xatolik yuz berdi" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}
