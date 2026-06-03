"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RegistrationsTable, type AdminRow, type ContactStatus, type Holat } from "@/components/admin/RegistrationsTable";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";

interface AdminDashboardClientProps {
  initialRows: AdminRow[];
  filteredCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  queryState: {
    holat?: string;
    yoshGuruhi?: string;
    yonalish?: string;
    utmType?: string;
    smsStatus?: string;
    contactStatus?: string;
    q?: string;
    pageSize?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: string;
    duplicates?: string;
  };
  statusCounts: {
    total: number;
    KUTILMOQDA: number;
    TASDIQLANDI: number;
    RAD_ETILDI: number;
  };
  yoshCounts: Record<string, number>;
  yonalishCounts: Record<string, number>;
}

const SUMMARY_CARD_COLORS: Record<Holat | "JAMI", string> = {
  JAMI: "text-foreground",
  KUTILMOQDA: "text-yellow-400",
  TASDIQLANDI: "text-green-400",
  RAD_ETILDI: "text-red-400",
};

const YOSH_SUMMARY_COLORS: Record<string, string> = {
  YOSH_9_11: "text-indigo-600",
  YOSH_12_14: "text-fuchsia-600",
  YOSH_9_14: "text-teal-600",
};

const YONALISH_SUMMARY_COLORS: Record<string, string> = {
  MATEMATIKA: "text-violet-600",
  TYPING: "text-sky-600",
};

export function AdminDashboardClient({
  initialRows,
  filteredCount,
  currentPage,
  pageSize,
  totalPages,
  queryState,
  statusCounts,
  yoshCounts,
  yonalishCounts,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [stats, setStats] = useState(statusCounts);
  const [visibleCount, setVisibleCount] = useState(filteredCount);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    setStats(statusCounts);
  }, [statusCounts]);

  useEffect(() => {
    setVisibleCount(filteredCount);
  }, [filteredCount]);

  const handleStatusChanged = ({
    id,
    prevHolat,
    nextHolat,
  }: {
    id: string;
    prevHolat: Holat;
    nextHolat: Holat;
  }) => {
    setRows((prev) => {
      const nextRows = prev
        .map((row) => (row.id === id ? { ...row, holat: nextHolat } : row))
        .filter((row) => (queryState.holat ? row.holat === queryState.holat : true));
      return nextRows;
    });

    setStats((prev) => ({
      ...prev,
      [prevHolat]: Math.max(0, prev[prevHolat] - 1),
      [nextHolat]: prev[nextHolat] + 1,
    }));

    router.refresh();
  };

  const patchRow = (id: string, patch: Partial<AdminRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleContactStatusChanged = ({
    id,
    nextContactStatus,
  }: {
    id: string;
    nextContactStatus: ContactStatus;
  }) => {
    setRows((prev) =>
      prev
        .map((row) => (row.id === id ? { ...row, contactStatus: nextContactStatus } : row))
        .filter((row) => (queryState.contactStatus ? row.contactStatus === queryState.contactStatus : true))
    );
    router.refresh();
  };

  const handleBulkContactStatusChanged = ({
    ids,
    nextContactStatus,
  }: {
    ids: string[];
    nextContactStatus: ContactStatus;
  }) => {
    const idSet = new Set(ids);
    setRows((prev) =>
      prev
        .map((row) => (idSet.has(row.id) ? { ...row, contactStatus: nextContactStatus } : row))
        .filter((row) => (queryState.contactStatus ? row.contactStatus === queryState.contactStatus : true))
    );
    router.refresh();
  };

  const handleRowsDeleted = (deletedIds: string[]) => {
    if (deletedIds.length === 0) return;
    setRows((prev) => {
      const deletedSet = new Set(deletedIds);
      const deletedRows = prev.filter((row) => deletedSet.has(row.id));

      setStats((prevStats) => {
        const next = { ...prevStats };
        next.total = Math.max(0, next.total - deletedRows.length);
        for (const row of deletedRows) {
          next[row.holat] = Math.max(0, next[row.holat] - 1);
        }
        return next;
      });
      setVisibleCount((prevCount) => Math.max(0, prevCount - deletedRows.length));

      return prev.filter((row) => !deletedSet.has(row.id));
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Jami", value: stats.total, color: SUMMARY_CARD_COLORS.JAMI },
          { label: "Kutilmoqda", value: stats.KUTILMOQDA, color: SUMMARY_CARD_COLORS.KUTILMOQDA },
          { label: "Tasdiqlandi", value: stats.TASDIQLANDI, color: SUMMARY_CARD_COLORS.TASDIQLANDI },
          { label: "Rad etildi", value: stats.RAD_ETILDI, color: SUMMARY_CARD_COLORS.RAD_ETILDI },
        ].map(({ label, value, color }) => (
          <div key={label} className="ui-surface p-4">
            <p className="mb-1 text-xs text-muted-foreground">{label}</p>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="ui-surface p-4">
          <p className="mb-3 text-xs text-muted-foreground">Yosh toifasi bo&apos;yicha</p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(YOSH_GURUH_LABELS) as [string, string][]).map(([key, label]) => (
              <div key={key} className="rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-semibold ${YOSH_SUMMARY_COLORS[key] ?? "text-foreground"}`}>
                  {yoshCounts[key] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="ui-surface p-4">
          <p className="mb-3 text-xs text-muted-foreground">Yo&apos;nalish bo&apos;yicha</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(YONALISH_LABELS) as [string, string][]).map(([key, label]) => (
              <div key={key} className="rounded-lg border border-border/70 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-semibold ${YONALISH_SUMMARY_COLORS[key] ?? "text-foreground"}`}>
                  {yonalishCounts[key] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-xl font-bold">
          Ro&apos;yxatdan o&apos;tganlar
          <span className="ml-2 text-base font-normal text-muted-foreground">({visibleCount})</span>
        </h1>

        <RegistrationsTable
          rows={rows}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          queryState={queryState}
          onStatusChanged={handleStatusChanged}
          onContactStatusChanged={handleContactStatusChanged}
          onBulkContactStatusChanged={handleBulkContactStatusChanged}
          onRowPatched={patchRow}
          onRowsDeleted={handleRowsDeleted}
        />
      </div>
    </div>
  );
}


