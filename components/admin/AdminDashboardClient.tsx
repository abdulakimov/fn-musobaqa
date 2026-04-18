"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  RegistrationsTable,
  type AdminRow,
  type Holat,
} from "@/components/admin/RegistrationsTable";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";
import { AdminRegistrationDrawer } from "@/components/admin/AdminRegistrationDrawer";

function TableToolbar({
  pageSize,
  duplicates,
}: {
  pageSize: number;
  duplicates: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        value={String(pageSize)}
        onValueChange={(v) => update("pageSize", !v || v === "15" ? undefined : v)}
      >
        <SelectTrigger className="h-8 w-[86px] rounded-lg text-xs">
          <SelectValue>{pageSize} ta</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="15">15 ta</SelectItem>
          <SelectItem value="30">30 ta</SelectItem>
          <SelectItem value="50">50 ta</SelectItem>
        </SelectContent>
      </Select>

      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={duplicates}
          onCheckedChange={(checked) => update("duplicates", checked ? "1" : undefined)}
          aria-label="Faqat duplikatlar"
        />
        Faqat duplikatlar
      </label>
    </div>
  );
}

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
  kelishCounts: Record<string, number>;
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
  kelishCounts,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [stats, setStats] = useState(statusCounts);
  const [visibleCount, setVisibleCount] = useState(filteredCount);
  const [registrationDrawerOpen, setRegistrationDrawerOpen] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    setStats(statusCounts);
  }, [statusCounts]);

  useEffect(() => {
    setVisibleCount(filteredCount);
  }, [filteredCount]);

  useEffect(() => {
    if (!highlightedRowId) return;
    const timer = window.setTimeout(() => setHighlightedRowId(null), 9000);
    return () => window.clearTimeout(timer);
  }, [highlightedRowId]);

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

  const handleManualRegistrationSuccess = ({ id }: { id: string; participantId: string }) => {
    setHighlightedRowId(id);
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

        {/* Kelish card */}
        <div className="ui-surface p-4">
          <p className="mb-3 text-xs text-muted-foreground">Kelish holati</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/40 p-3">
              <p className="text-xs text-emerald-700/70">Keldi</p>
              <p className="text-xl font-semibold text-emerald-600">
                {kelishCounts["KELGAN"] ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-rose-200/70 bg-rose-50/40 p-3">
              <p className="text-xs text-rose-700/70">Kelmadi</p>
              <p className="text-xl font-semibold text-rose-500">
                {kelishCounts["KELMADI"] ?? 0}
              </p>
            </div>
          </div>
          {(() => {
            const kelgan = kelishCounts["KELGAN"] ?? 0;
            const total = (kelishCounts["KELGAN"] ?? 0) + (kelishCounts["KELMADI"] ?? 0);
            const pct = total > 0 ? Math.round((kelgan / total) * 100) : 0;
            return (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Kelish darajasi</span>
                  <span className="font-medium text-emerald-600">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-xl font-bold">
            Ro&apos;yxatdan o&apos;tganlar
            <span className="ml-2 text-base font-normal text-muted-foreground">({visibleCount})</span>
          </h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-electric-blue/40 bg-electric-blue/5 text-electric-blue hover:bg-electric-blue/10"
              onClick={() => setRegistrationDrawerOpen(true)}
            >
              <UserPlusIcon className="mr-1.5 h-3.5 w-3.5" />
              Ishtirokchi qo&apos;shish
            </Button>
            <TableToolbar
              pageSize={pageSize}
              duplicates={Boolean(queryState.duplicates)}
            />
          </div>
        </div>

        <RegistrationsTable
          rows={rows}
          highlightedRowId={highlightedRowId}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          queryState={queryState}
          onStatusChanged={handleStatusChanged}
          onRowPatched={patchRow}
        />
      </div>
      <AdminRegistrationDrawer
        open={registrationDrawerOpen}
        onOpenChange={setRegistrationDrawerOpen}
        onSuccess={handleManualRegistrationSuccess}
      />
    </div>
  );
}
