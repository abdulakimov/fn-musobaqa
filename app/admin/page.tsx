import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { hasAdminSession } from "@/lib/admin-auth";

interface SearchParams {
  holat?: string;
  yoshGuruhi?: string;
  yonalish?: string;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const store = await cookies();

  if (!hasAdminSession(store)) {
    redirect("/admin/login");
  }

  const where: Record<string, unknown> = {};
  if (params.holat) where.holat = params.holat;
  if (params.yoshGuruhi) where.yoshGuruhi = params.yoshGuruhi;
  if (params.yonalish) where.yonalish = params.yonalish;

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

    royxatlar = dbRoyxatlar.map((r) => ({
      ...r,
      yoshGuruhi: r.yoshGuruhi as string,
      holat: r.holat as "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI",
    }));
    totalCount = dbTotal;
    holatMap = Object.fromEntries(stats.map((s) => [s.holat, s._count._all]));
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

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 font-display text-xl font-bold">
          Ro&apos;yxatdan o&apos;tganlar
          <span className="ml-2 text-base font-normal text-muted-foreground">({royxatlar.length})</span>
        </h1>

        <div className="flex flex-wrap gap-2">
          {["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"].map((h) => (
            <a
              key={h}
              href={`/admin${params.holat === h ? "" : `?holat=${h}${params.yoshGuruhi ? `&yoshGuruhi=${params.yoshGuruhi}` : ""}${params.yonalish ? `&yonalish=${params.yonalish}` : ""}`}`}
              className={`ui-filter-chip ${
                params.holat === h
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
              href={`/admin?${params.holat ? `holat=${params.holat}&` : ""}${params.yoshGuruhi === key ? "" : `yoshGuruhi=${key}`}${params.yonalish ? `&yonalish=${params.yonalish}` : ""}`}
              className={`ui-filter-chip ${
                params.yoshGuruhi === key
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
              href={`/admin?${params.holat ? `holat=${params.holat}&` : ""}${params.yoshGuruhi ? `yoshGuruhi=${params.yoshGuruhi}&` : ""}${params.yonalish === key ? "" : `yonalish=${key}`}`}
              className={`ui-filter-chip ${
                params.yonalish === key
                  ? "border-border bg-electric-blue/10 text-electric-blue"
                  : "text-muted-foreground hover:border-electric-blue/30"
              }`}
            >
              {label}
            </a>
          ))}
          {(params.holat || params.yoshGuruhi || params.yonalish) && (
            <a
              href="/admin"
              className="ui-filter-chip text-muted-foreground hover:border-red-300 hover:text-red-400"
            >
              Filtrni o&apos;chirish
            </a>
          )}
        </div>

        <ExportButton
          filters={{
            ...(params.holat ? { holat: params.holat } : {}),
            ...(params.yoshGuruhi ? { yoshGuruhi: params.yoshGuruhi } : {}),
            ...(params.yonalish ? { yonalish: params.yonalish } : {}),
          }}
        />
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

