import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { hasAdminSession } from "@/lib/admin-auth";

interface SearchParams {
  holat?: string;
  yoshGuruhi?: string;
  yonalish?: string;
  q?: string;
}

const HOLAT_VALUES = ["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"] as const;
const YOSH_VALUES = ["YOSH_9_11", "YOSH_12_14", "YOSH_9_14"] as const;
const YONALISH_VALUES = ["MATEMATIKA", "TYPING"] as const;

function getSanitizedSearchQuery(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return value.slice(0, 80);
}

function parseEnum<T extends readonly string[]>(raw: string | undefined, values: T): T[number] | undefined {
  if (!raw) return undefined;
  return (values as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
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

  const buildAdminHref = (updates: Partial<Record<keyof SearchParams, string | undefined>>) => {
    const next: SearchParams = {
      holat,
      yoshGuruhi,
      yonalish,
      q: searchQuery || undefined,
      ...updates,
    };

    const query = new URLSearchParams();
    (["holat", "yoshGuruhi", "yonalish", "q"] as const).forEach((key) => {
      const value = next[key];
      if (typeof value === "string" && value.trim()) {
        query.set(key, value);
      }
    });

    const qs = query.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };

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
  let holatMap: Record<string, number> = {};

  try {
    const [dbRoyxatlar, stats, dbTotal] = await Promise.all([
      db.royxat.findMany({ where, orderBy: { createdAt: "desc" } }),
      db.royxat.groupBy({ by: ["holat"], _count: { _all: true } }),
      db.royxat.count(),
    ]);

    royxatlar = dbRoyxatlar.map((r: (typeof royxatlar)[number]) => ({
      ...r,
      yoshGuruhi: r.yoshGuruhi as string,
      holat: r.holat as "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI",
    }));
    totalCount = dbTotal;
    holatMap = Object.fromEntries(stats.map((s: { holat: string; _count: { _all: number } }) => [s.holat, s._count._all]));
  } catch (error) {
    console.error("[admin-page] failed to load dashboard data", error);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Jami", value: totalCount, color: "text-foreground" },
          { label: "Kutilmoqda", value: holatMap.KUTILMOQDA ?? 0, color: "text-yellow-400" },
          { label: "Tasdiqlandi", value: holatMap.TASDIQLANDI ?? 0, color: "text-green-400" },
          { label: "Rad etildi", value: holatMap.RAD_ETILDI ?? 0, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="ui-surface p-4">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex-1 font-display text-xl font-bold">
            Ro&apos;yxatdan o&apos;tganlar
            <span className="ml-2 text-base font-normal text-muted-foreground">({royxatlar.length})</span>
          </h1>

          <ExportButton
            filters={{
              ...(holat ? { holat } : {}),
              ...(yoshGuruhi ? { yoshGuruhi } : {}),
              ...(yonalish ? { yonalish } : {}),
              ...(searchQuery ? { q: searchQuery } : {}),
            }}
          />
        </div>

        <form action="/admin" method="get" className="flex w-full flex-wrap gap-2">
          {holat ? <input type="hidden" name="holat" value={holat} /> : null}
          {yoshGuruhi ? <input type="hidden" name="yoshGuruhi" value={yoshGuruhi} /> : null}
          {yonalish ? <input type="hidden" name="yonalish" value={yonalish} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Qidirish: ism, familiya, participant ID"
            className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-electric-blue/60 focus:ring-2 focus:ring-electric-blue/30 md:flex-1"
          />
          <button
            type="submit"
            className="h-9 rounded-xl bg-electric-blue px-4 text-sm font-medium text-white transition-colors hover:bg-[#2F73EA]"
          >
            Qidirish
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"].map((h) => (
            <a
              key={h}
              href={holat === h ? buildAdminHref({ holat: undefined }) : buildAdminHref({ holat: h })}
              className={`ui-filter-chip ${
                holat === h
                  ? "border-border bg-electric-blue/10 text-electric-blue"
                  : "text-muted-foreground hover:border-electric-blue/30"
              }`}
            >
              {h === "KUTILMOQDA" ? "Kutilmoqda" : h === "TASDIQLANDI" ? "Tasdiqlandi" : "Rad etildi"}
            </a>
          ))}
          {(Object.entries(YOSH_GURUH_LABELS) as [string, string][]).map(([key, label]) => (
            <a
              key={key}
              href={yoshGuruhi === key ? buildAdminHref({ yoshGuruhi: undefined }) : buildAdminHref({ yoshGuruhi: key })}
              className={`ui-filter-chip ${
                yoshGuruhi === key
                  ? "border-border bg-cyber-purple/10 text-cyber-purple"
                  : "text-muted-foreground hover:border-electric-blue/30"
              }`}
            >
              {label}
            </a>
          ))}
          {(Object.entries(YONALISH_LABELS) as [string, string][]).map(([key, label]) => (
            <a
              key={key}
              href={yonalish === key ? buildAdminHref({ yonalish: undefined }) : buildAdminHref({ yonalish: key })}
              className={`ui-filter-chip ${
                yonalish === key
                  ? "border-border bg-electric-blue/10 text-electric-blue"
                  : "text-muted-foreground hover:border-electric-blue/30"
              }`}
            >
              {label}
            </a>
          ))}
          {(holat || yoshGuruhi || yonalish || searchQuery) && (
            <a href="/admin" className="ui-filter-chip text-muted-foreground hover:border-red-300 hover:text-red-400">
              Filtrni o&apos;chirish
            </a>
          )}
        </div>
      </div>

      <RegistrationsTable
        data={royxatlar.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          resultUpdatedAt: r.resultUpdatedAt ? r.resultUpdatedAt.toISOString() : null,
        }))}
      />
    </div>
  );
}

