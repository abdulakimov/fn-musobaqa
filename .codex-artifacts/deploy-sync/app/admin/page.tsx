import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { ExportButton } from "@/components/admin/ExportButton";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { hasAdminSession } from "@/lib/admin-auth";

interface SearchParams {
  holat?: string;
  contactStatus?: string;
  yoshGuruhi?: string;
  yonalish?: string;
  utmType?: string;
  smsStatus?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: string;
  duplicates?: string;
}

const HOLAT_VALUES = ["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"] as const;
const YOSH_VALUES = ["YOSH_9_11", "YOSH_12_14", "YOSH_9_14"] as const;
const YONALISH_VALUES = ["MATEMATIKA", "TYPING"] as const;
const UTM_TYPE_VALUES = ["MAKTAB", "BANNER", "ORGANIK"] as const;
const SMS_STATUS_VALUES = ["PENDING", "SENT", "FAILED"] as const;
const CONTACT_STATUS_VALUES = ["BOGLANILMAGAN", "BOGLANIB_BOLMADI", "QAYTA_ALOQA", "BOGLANILGAN"] as const;
const PAGE_SIZE_VALUES = [15, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 15;
const SORT_BY_VALUES = ["createdAt", "resultScore", "resultUpdatedAt", "resultStatus"] as const;
const SORT_DIR_VALUES = ["asc", "desc"] as const;

function getSanitizedSearchQuery(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return value.slice(0, 80);
}

function getDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function parseEnum<T extends readonly string[]>(raw: string | undefined, values: T): T[number] | undefined {
  if (!raw) return undefined;
  return (values as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
}

function parsePage(raw: string | undefined) {
  const numeric = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(numeric) || numeric < 1) return 1;
  return numeric;
}

function parsePageSize(raw: string | undefined) {
  const numeric = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(numeric)) return DEFAULT_PAGE_SIZE;
  if (!PAGE_SIZE_VALUES.includes(numeric as (typeof PAGE_SIZE_VALUES)[number])) return DEFAULT_PAGE_SIZE;
  return numeric;
}

function parseDateInput(raw: string | undefined) {
  const value = (raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function tashkentDayStart(value: string) {
  return new Date(`${value}T00:00:00+05:00`);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const holat = parseEnum(params.holat, HOLAT_VALUES);
  const contactStatus = parseEnum(params.contactStatus, CONTACT_STATUS_VALUES);
  const yoshGuruhi = parseEnum(params.yoshGuruhi, YOSH_VALUES);
  const yonalish = parseEnum(params.yonalish, YONALISH_VALUES);
  const utmType = parseEnum(params.utmType, UTM_TYPE_VALUES);
  const smsStatus = parseEnum(params.smsStatus, SMS_STATUS_VALUES);
  const sortBy = parseEnum(params.sortBy, SORT_BY_VALUES) ?? "createdAt";
  const sortDir = parseEnum(params.sortDir, SORT_DIR_VALUES) ?? "desc";
  const pageSize = parsePageSize(params.pageSize);
  const dateFrom = parseDateInput(params.dateFrom);
  const dateTo = parseDateInput(params.dateTo);
  const duplicatesOnly = params.duplicates === "1";
  const orderBy: Prisma.RoyxatOrderByWithRelationInput[] =
    sortBy === "createdAt"
      ? [{ createdAt: sortDir }]
      : sortBy === "resultScore"
        ? [{ resultScore: { sort: sortDir, nulls: "last" } }, { createdAt: "desc" }]
        : sortBy === "resultUpdatedAt"
          ? [{ resultUpdatedAt: { sort: sortDir, nulls: "last" } }, { createdAt: "desc" }]
          : [{ resultStatus: { sort: sortDir, nulls: "last" } }, { createdAt: "desc" }];
  const searchQuery = getSanitizedSearchQuery(params.q);
  const requestedPage = parsePage(params.page);
  const store = await cookies();

  if (!hasAdminSession(store)) {
    redirect("/admin/login");
  }

  const where: Prisma.RoyxatWhereInput = {};
  if (holat) where.holat = holat;
  if (contactStatus) where.aloqaStatus = contactStatus;
  if (yoshGuruhi) where.yoshGuruhi = yoshGuruhi;
  if (yonalish) where.yonalish = yonalish;
  if (utmType) where.utmType = utmType;
  if (smsStatus) where.smsStatus = smsStatus;
  if (dateFrom || dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (dateFrom) {
      createdAt.gte = tashkentDayStart(dateFrom);
    }
    if (dateTo) {
      createdAt.lt = new Date(tashkentDayStart(dateTo).getTime() + 24 * 60 * 60 * 1000);
    }
    where.createdAt = createdAt;
  }
  if (searchQuery) {
    const digitsQuery = getDigitsOnly(searchQuery);
    const phoneSearch: Prisma.RoyxatWhereInput[] = [{ telefon: { contains: searchQuery } }];
    if (digitsQuery && digitsQuery !== searchQuery) {
      phoneSearch.push({ telefon: { contains: digitsQuery } });
    }
    where.OR = [
      { ism: { contains: searchQuery, mode: "insensitive" } },
      { familiya: { contains: searchQuery, mode: "insensitive" } },
      { participantId: { contains: searchQuery, mode: "insensitive" } },
      ...phoneSearch,
    ];
  }
  if (duplicatesOnly) {
    let duplicateNameKeys: string[] = [];
    try {
      const rows = await db.$queryRaw<Array<{ nameKey: string }>>`
        SELECT "nameKey"
        FROM "Royxat"
        GROUP BY "nameKey"
        HAVING COUNT(*) > 1
      `;
      duplicateNameKeys = rows.map((row) => row.nameKey);
    } catch {
      duplicateNameKeys = [];
    }
    if (duplicateNameKeys.length === 0) {
      where.id = "__no-duplicates__";
    } else {
      where.nameKey = { in: duplicateNameKeys };
    }
  }

  type DashboardRow = {
    id: string;
    participantId: string | null;
    ism: string;
    familiya: string;
    otasiningIsmi: string;
    telefon: string;
    yonalish: string;
    yoshGuruhi: string;
    utmType: "MAKTAB" | "BANNER" | "ORGANIK";
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    smsStatus: "PENDING" | "SENT" | "FAILED";
    aloqaStatus: "BOGLANILMAGAN" | "BOGLANIB_BOLMADI" | "QAYTA_ALOQA" | "BOGLANILGAN";
    smsSentAt: Date | null;
    smsError: string | null;
    smsMessageId: string | null;
    resultStatus: string | null;
    resultScore: number | null;
    resultNote: string | null;
    resultUpdatedAt: Date | null;
    holat: "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";
    createdAt: Date;
    nameKey: string;
  };
  type DashboardViewRow = DashboardRow & {
    contactStatus: "BOGLANILMAGAN" | "BOGLANIB_BOLMADI" | "QAYTA_ALOQA" | "BOGLANILGAN";
    isDuplicate: boolean;
    duplicateCount: number;
  };

  let royxatlar: DashboardViewRow[] = [];
  let totalCount = 0;
  let filteredCount = 0;
  let currentPage = requestedPage;
  let totalPages = 1;
  let holatMap: Record<string, number> = {};
  let yoshMap: Record<string, number> = {};
  let yonalishMap: Record<string, number> = {};

  const loadDashboardData = async (activeWhere: Prisma.RoyxatWhereInput) => {
    let dbFilteredCount = 0;
    let holatStats: Array<{ holat: string; _count: { _all: number } }> = [];
    let dbTotal = 0;
    try {
      [dbFilteredCount, holatStats, dbTotal] = await Promise.all([
        db.royxat.count({ where: activeWhere }),
        db.royxat.groupBy({ by: ["holat"], _count: { _all: true } }),
        db.royxat.count(),
      ]);
    } catch {
      return null;
    }

    let yoshStats: Array<{ yoshGuruhi: string; _count: { _all: number } }> = [];
    let yonalishStats: Array<{ yonalish: string; _count: { _all: number } }> = [];

    try {
      const rows = await db.$queryRaw<Array<{ yoshGuruhi: string; count: number }>>`
        SELECT "yoshGuruhi", COUNT(*)::int AS count
        FROM "Royxat"
        GROUP BY "yoshGuruhi"
      `;
      yoshStats = rows.map((row) => ({
        yoshGuruhi: row.yoshGuruhi,
        _count: { _all: Number(row.count) },
      }));
    } catch {
      console.warn("[admin-page] unable to load yosh summary");
    }

    try {
      const rows = await db.$queryRaw<Array<{ yonalish: string; count: number }>>`
        SELECT "yonalish", COUNT(*)::int AS count
        FROM "Royxat"
        GROUP BY "yonalish"
      `;
      yonalishStats = rows.map((row) => ({
        yonalish: row.yonalish,
        _count: { _all: Number(row.count) },
      }));
    } catch {
      console.warn("[admin-page] unable to load yonalish summary");
    }

    const nextTotalPages = Math.max(1, Math.ceil(dbFilteredCount / pageSize));
    const nextCurrentPage = Math.min(requestedPage, nextTotalPages);
    const skip = (nextCurrentPage - 1) * pageSize;

    let dbRoyxatlar: DashboardRow[] = [];
    let duplicateCountByNameKey: Record<string, number> = {};
    try {
      dbRoyxatlar = await db.royxat.findMany({
        where: activeWhere,
        orderBy,
        take: pageSize,
        skip,
      });
      const pageNameKeys = Array.from(new Set(dbRoyxatlar.map((item) => item.nameKey)));
      if (pageNameKeys.length > 0) {
        const duplicateRows = await db.$queryRaw<Array<{ nameKey: string; count: number }>>`
          SELECT "nameKey", COUNT(*)::int AS count
          FROM "Royxat"
          WHERE "nameKey" IN (${Prisma.join(pageNameKeys)})
          GROUP BY "nameKey"
        `;
        duplicateCountByNameKey = Object.fromEntries(
          duplicateRows.map((row) => [row.nameKey, Number(row.count)]),
        );
      }
    } catch {
      return null;
    }

    return {
      dbFilteredCount,
      dbTotal,
      nextCurrentPage,
      nextTotalPages,
      holatStats,
      yoshStats,
      yonalishStats,
      dbRoyxatlar,
      duplicateCountByNameKey,
    };
  };

  try {
    const data = await loadDashboardData(where);

    if (!data) {
      throw new Error("dashboard query failed");
    }

    filteredCount = data.dbFilteredCount;
    totalCount = data.dbTotal;
    currentPage = data.nextCurrentPage;
    totalPages = data.nextTotalPages;

    royxatlar = data.dbRoyxatlar.map((r: DashboardRow) => ({
      ...r,
      contactStatus: r.aloqaStatus,
      yoshGuruhi: r.yoshGuruhi as string,
      holat: r.holat as "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI",
      duplicateCount: data.duplicateCountByNameKey[r.nameKey] ?? 1,
      isDuplicate: (data.duplicateCountByNameKey[r.nameKey] ?? 1) > 1,
    }));
    holatMap = Object.fromEntries(
      data.holatStats.map((s: { holat: string; _count: { _all: number } }) => [s.holat, s._count._all]),
    );
    yoshMap = Object.fromEntries(
      data.yoshStats.map((s: { yoshGuruhi: string; _count: { _all: number } }) => [s.yoshGuruhi, s._count._all]),
    );
    yonalishMap = Object.fromEntries(
      data.yonalishStats.map((s: { yonalish: string; _count: { _all: number } }) => [s.yonalish, s._count._all]),
    );
  } catch {
    console.warn("[admin-page] failed to load dashboard data; rendered fallback state");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1" />
          <ExportButton
            filters={{
              ...(holat ? { holat } : {}),
              ...(yoshGuruhi ? { yoshGuruhi } : {}),
              ...(yonalish ? { yonalish } : {}),
              ...(utmType ? { utmType } : {}),
              ...(smsStatus ? { smsStatus } : {}),
              ...(contactStatus ? { contactStatus } : {}),
              ...(searchQuery ? { q: searchQuery } : {}),
              ...(dateFrom ? { dateFrom } : {}),
              ...(dateTo ? { dateTo } : {}),
              ...(sortBy ? { sortBy } : {}),
              ...(sortDir ? { sortDir } : {}),
              ...(pageSize !== DEFAULT_PAGE_SIZE ? { pageSize: String(pageSize) } : {}),
              ...(duplicatesOnly ? { duplicates: "1" } : {}),
            }}
          />
        </div>

        <AdminFilters
          holat={holat}
          yoshGuruhi={yoshGuruhi}
          yonalish={yonalish}
          utmType={utmType}
          smsStatus={smsStatus}
          contactStatus={contactStatus}
          query={searchQuery}
          pageSize={pageSize}
          dateFrom={dateFrom}
          dateTo={dateTo}
          sortBy={sortBy}
          sortDir={sortDir}
          duplicates={duplicatesOnly}
          yoshOptions={Object.entries(YOSH_GURUH_LABELS) as [string, string][]}
          yonalishOptions={Object.entries(YONALISH_LABELS) as [string, string][]}
        />
      </div>

      <AdminDashboardClient
        key={`${currentPage}:${pageSize}:${holat ?? "all"}:${contactStatus ?? "all"}:${yoshGuruhi ?? "all"}:${yonalish ?? "all"}:${utmType ?? "all"}:${smsStatus ?? "all"}:${searchQuery}:${dateFrom ?? "none"}:${dateTo ?? "none"}:${sortBy}:${sortDir}:${duplicatesOnly ? "1" : "0"}:${holatMap.KUTILMOQDA ?? 0}:${holatMap.TASDIQLANDI ?? 0}:${holatMap.RAD_ETILDI ?? 0}`}
        initialRows={royxatlar.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          smsSentAt: r.smsSentAt ? r.smsSentAt.toISOString() : null,
          resultUpdatedAt: r.resultUpdatedAt ? r.resultUpdatedAt.toISOString() : null,
        }))}
        filteredCount={filteredCount}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        queryState={{
          holat,
          yoshGuruhi,
          yonalish,
          utmType,
          smsStatus,
          contactStatus,
          q: searchQuery || undefined,
          pageSize: String(pageSize),
          dateFrom,
          dateTo,
          sortBy,
          sortDir,
          duplicates: duplicatesOnly ? "1" : undefined,
        }}
        statusCounts={{
          total: totalCount,
          KUTILMOQDA: holatMap.KUTILMOQDA ?? 0,
          TASDIQLANDI: holatMap.TASDIQLANDI ?? 0,
          RAD_ETILDI: holatMap.RAD_ETILDI ?? 0,
        }}
        yoshCounts={yoshMap}
        yonalishCounts={yonalishMap}
      />
    </div>
  );
}
