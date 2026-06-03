import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { ExportButton } from "@/components/admin/ExportButton";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { hasAdminSession } from "@/lib/admin-auth";
import {
  buildAdminRegistrationsFilterQuery,
  buildAdminRegistrationsOrderBy,
  buildAdminRegistrationsWhere,
  parseAdminRegistrationsFilters,
} from "@/lib/admin-registration-filters";

interface SearchParams {
  holat?: string;
  contactStatus?: string;
  yoshGuruhi?: string;
  yonalish?: string;
  utmType?: string;
  smsStatus?: string;
  kelishStatus?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: string;
  duplicates?: string;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseAdminRegistrationsFilters(params as Record<string, string | string[] | undefined>);
  const {
    holat,
    contactStatus,
    yoshGuruhi,
    yonalish,
    utmType,
    smsStatus,
    kelishStatus,
    sortBy,
    sortDir,
    pageSize,
    dateFrom,
    dateTo,
    duplicatesOnly,
    q: searchQuery,
    page: requestedPage,
  } = filters;
  const orderBy = buildAdminRegistrationsOrderBy(filters);
  const store = await cookies();

  if (!hasAdminSession(store)) {
    redirect("/admin/login");
  }

  const where = buildAdminRegistrationsWhere(filters);
  if (duplicatesOnly) {
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
    kelishStatus: "KELGAN" | "KELMADI";
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
  let kelishMap: Record<string, number> = {};

  const loadDashboardData = async (activeWhere: typeof where) => {
    let dbFilteredCount = 0;
    let holatStats: Array<{ holat: string; _count: { _all: number } }> = [];
    let dbTotal = 0;
    try {
      [dbFilteredCount, holatStats, dbTotal] = await Promise.all([
        db.royxat.count({ where: activeWhere }),
        db.royxat.groupBy({ by: ["holat"], where: activeWhere, _count: { _all: true } }),
        db.royxat.count({ where: { deletedAt: null } }),
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
        WHERE "deletedAt" IS NULL
        GROUP BY "yoshGuruhi"
      `;
      yoshStats = rows.map((row: { yoshGuruhi: string; count: number }) => ({
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
        WHERE "deletedAt" IS NULL
        GROUP BY "yonalish"
      `;
      yonalishStats = rows.map((row: { yonalish: string; count: number }) => ({
        yonalish: row.yonalish,
        _count: { _all: Number(row.count) },
      }));
    } catch {
      console.warn("[admin-page] unable to load yonalish summary");
    }

    let kelishStats: Array<{ kelishStatus: string; count: number }> = [];
    try {
      kelishStats = await db.$queryRaw<Array<{ kelishStatus: string; count: number }>>`
        SELECT "kelishStatus", COUNT(*)::int AS count
        FROM "Royxat"
        WHERE "deletedAt" IS NULL
        GROUP BY "kelishStatus"
      `;
    } catch {
      console.warn("[admin-page] unable to load kelish summary");
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
          WHERE "deletedAt" IS NULL
            AND "nameKey" = ANY(${pageNameKeys}::text[])
          GROUP BY "nameKey"
        `;
        duplicateCountByNameKey = Object.fromEntries(
          duplicateRows.map((row: { nameKey: string; count: number }) => [row.nameKey, Number(row.count)]),
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
      kelishStats,
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
    kelishMap = Object.fromEntries(
      data.kelishStats.map((s: { kelishStatus: string; count: number }) => [s.kelishStatus, Number(s.count)]),
    );
  } catch {
    console.warn("[admin-page] failed to load dashboard data; rendered fallback state");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1" />
          <ExportButton filters={buildAdminRegistrationsFilterQuery(filters)} />
        </div>

        <AdminFilters
          holat={holat}
          contactStatus={contactStatus}
          yoshGuruhi={yoshGuruhi}
          yonalish={yonalish}
          utmType={utmType}
          smsStatus={smsStatus}
          kelishStatus={kelishStatus}
          query={searchQuery}
          dateFrom={dateFrom}
          dateTo={dateTo}
          yoshOptions={Object.entries(YOSH_GURUH_LABELS) as [string, string][]}
          yonalishOptions={Object.entries(YONALISH_LABELS) as [string, string][]}
        />
      </div>

      <AdminDashboardClient
        key={`${currentPage}:${pageSize}:${holat ?? "all"}:${contactStatus ?? "all"}:${yoshGuruhi ?? "all"}:${yonalish ?? "all"}:${utmType ?? "all"}:${smsStatus ?? "all"}:${kelishStatus ?? "all"}:${searchQuery}:${dateFrom ?? "none"}:${dateTo ?? "none"}:${sortBy}:${sortDir}:${duplicatesOnly ? "1" : "0"}:${holatMap.KUTILMOQDA ?? 0}:${holatMap.TASDIQLANDI ?? 0}:${holatMap.RAD_ETILDI ?? 0}`}
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
          contactStatus,
          yoshGuruhi,
          yonalish,
          utmType,
          smsStatus,
          kelishStatus,
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
        kelishCounts={kelishMap}
      />
    </div>
  );
}
