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
  yoshGuruhi?: string;
  yonalish?: string;
  q?: string;
  page?: string;
}

const HOLAT_VALUES = ["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"] as const;
const YOSH_VALUES = ["YOSH_9_11", "YOSH_12_14", "YOSH_9_14"] as const;
const YONALISH_VALUES = ["MATEMATIKA", "TYPING"] as const;
const PAGE_SIZE = 15;

function getSanitizedSearchQuery(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return value.slice(0, 80);
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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const holat = parseEnum(params.holat, HOLAT_VALUES);
  const yoshGuruhi = parseEnum(params.yoshGuruhi, YOSH_VALUES);
  const yonalish = parseEnum(params.yonalish, YONALISH_VALUES);
  const searchQuery = getSanitizedSearchQuery(params.q);
  const requestedPage = parsePage(params.page);
  const store = await cookies();

  if (!hasAdminSession(store)) {
    redirect("/admin/login");
  }

  const where: Prisma.RoyxatWhereInput = {};
  if (holat) where.holat = holat;
  if (yoshGuruhi) where.yoshGuruhi = yoshGuruhi;
  if (yonalish) where.yonalish = yonalish;
  if (searchQuery) {
    where.OR = [
      { ism: { contains: searchQuery, mode: "insensitive" } },
      { familiya: { contains: searchQuery, mode: "insensitive" } },
      { participantId: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  let royxatlar: Array<{
    id: string;
    participantId: string | null;
    ism: string;
    familiya: string;
    otasiningIsmi: string;
    telefon: string;
    yonalish: string;
    yoshGuruhi: string;
    resultStatus: string | null;
    resultScore: number | null;
    resultNote: string | null;
    resultUpdatedAt: Date | null;
    holat: "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";
    createdAt: Date;
  }> = [];
  let totalCount = 0;
  let filteredCount = 0;
  let currentPage = requestedPage;
  let totalPages = 1;
  let holatMap: Record<string, number> = {};
  let yoshMap: Record<string, number> = {};
  let yonalishMap: Record<string, number> = {};

  try {
    const [dbFilteredCount, holatStats, yoshStats, yonalishStats, dbTotal] = await Promise.all([
      db.royxat.count({ where }),
      db.royxat.groupBy({ by: ["holat"], _count: { _all: true } }),
      db.royxat.groupBy({ by: ["yoshGuruhi"], _count: { _all: true } }),
      db.royxat.groupBy({ by: ["yonalish"], _count: { _all: true } }),
      db.royxat.count(),
    ]);

    filteredCount = dbFilteredCount;
    totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
    currentPage = Math.min(requestedPage, totalPages);
    const skip = (currentPage - 1) * PAGE_SIZE;

    const dbRoyxatlar = await db.royxat.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    });

    royxatlar = dbRoyxatlar.map((r: (typeof royxatlar)[number]) => ({
      ...r,
      yoshGuruhi: r.yoshGuruhi as string,
      holat: r.holat as "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI",
    }));
    totalCount = dbTotal;
    holatMap = Object.fromEntries(
      holatStats.map((s: { holat: string; _count: { _all: number } }) => [s.holat, s._count._all]),
    );
    yoshMap = Object.fromEntries(
      yoshStats.map((s: { yoshGuruhi: string; _count: { _all: number } }) => [s.yoshGuruhi, s._count._all]),
    );
    yonalishMap = Object.fromEntries(
      yonalishStats.map((s: { yonalish: string; _count: { _all: number } }) => [s.yonalish, s._count._all]),
    );
  } catch (error) {
    console.error("[admin-page] failed to load dashboard data", error);
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
              ...(searchQuery ? { q: searchQuery } : {}),
            }}
          />
        </div>

        <AdminFilters
          holat={holat}
          yoshGuruhi={yoshGuruhi}
          yonalish={yonalish}
          query={searchQuery}
          yoshOptions={Object.entries(YOSH_GURUH_LABELS) as [string, string][]}
          yonalishOptions={Object.entries(YONALISH_LABELS) as [string, string][]}
        />
      </div>

      <AdminDashboardClient
        key={`${currentPage}:${holat ?? "all"}:${yoshGuruhi ?? "all"}:${yonalish ?? "all"}:${searchQuery}:${holatMap.KUTILMOQDA ?? 0}:${holatMap.TASDIQLANDI ?? 0}:${holatMap.RAD_ETILDI ?? 0}`}
        initialRows={royxatlar.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          resultUpdatedAt: r.resultUpdatedAt ? r.resultUpdatedAt.toISOString() : null,
        }))}
        filteredCount={filteredCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        queryState={{
          holat,
          yoshGuruhi,
          yonalish,
          q: searchQuery || undefined,
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

