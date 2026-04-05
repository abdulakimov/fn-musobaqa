"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2Icon, PencilLineIcon } from "lucide-react";
import { YONALISH_LABELS, YOSH_GURUH_LABELS } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type Holat = "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";

export interface AdminRow {
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
  resultUpdatedAt: string | null;
  holat: Holat;
  createdAt: string;
}

const HOLAT_LABELS: Record<Holat, string> = {
  KUTILMOQDA: "Kutilmoqda",
  TASDIQLANDI: "Tasdiqlandi",
  RAD_ETILDI: "Rad etildi",
};

const HOLAT_TRIGGER_STYLES: Record<Holat, string> = {
  KUTILMOQDA: "border-amber-300/70 bg-amber-50/40 text-amber-800",
  TASDIQLANDI: "border-emerald-300/70 bg-emerald-50/40 text-emerald-800",
  RAD_ETILDI: "border-rose-300/70 bg-rose-50/40 text-rose-800",
};

const YONALISH_BADGE_STYLES: Record<string, string> = {
  MATEMATIKA: "border-violet-300/80 bg-violet-50/40 text-violet-800",
  TYPING: "border-sky-300/80 bg-sky-50/40 text-sky-800",
};

const YOSH_BADGE_STYLES: Record<string, string> = {
  YOSH_9_11: "border-indigo-300/80 bg-indigo-50/40 text-indigo-800",
  YOSH_12_14: "border-fuchsia-300/80 bg-fuchsia-50/40 text-fuchsia-800",
  YOSH_9_14: "border-teal-300/80 bg-teal-50/40 text-teal-800",
};

function formatAdminDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

function getResultSummary(row: AdminRow) {
  const status = row.resultStatus?.trim();
  const score = row.resultScore;
  if (!status && score === null) return "E'lon qilinmagan";
  if (status && score !== null) return `${status} (${score})`;
  if (status) return status;
  return `Ball: ${score}`;
}

function StatusCell({
  id,
  holat,
  onUpdated,
}: {
  id: string;
  holat: Holat;
  onUpdated: (payload: { id: string; prevHolat: Holat; nextHolat: Holat }) => void;
}) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newHolat: Holat) => {
    const previousHolat = holat;
    if (newHolat === previousHolat) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holat: newHolat }),
      });
      if (res.ok) {
        onUpdated({ id, prevHolat: previousHolat, nextHolat: newHolat });
        toast.success("Holat yangilandi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2Icon className="h-3 w-3 animate-spin text-muted-foreground" />}
      <Select value={holat} onValueChange={(v) => updateStatus(v as Holat)} disabled={loading}>
        <SelectTrigger className={`h-8 w-36 text-xs ${HOLAT_TRIGGER_STYLES[holat]}`}>
          <SelectValue>{HOLAT_LABELS[holat]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(HOLAT_LABELS) as Holat[]).map((h) => (
            <SelectItem key={h} value={h} className="text-xs">
              {HOLAT_LABELS[h]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ResultDialog({
  row,
  open,
  onOpenChange,
  onSaved,
}: {
  row: AdminRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (id: string, patch: Partial<AdminRow>) => void;
}) {
  const [status, setStatus] = useState("");
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const seed = useMemo(() => {
    if (!row) {
      return { status: "", score: "", note: "" };
    }
    return {
      status: row.resultStatus ?? "",
      score: row.resultScore === null ? "" : String(row.resultScore),
      note: row.resultNote ?? "",
    };
  }, [row]);

  useMemo(() => {
    setStatus(seed.status);
    setScore(seed.score);
    setNote(seed.note);
  }, [seed]);

  const save = async () => {
    if (!row) return;
    setLoading(true);
    try {
      const numericScore = score.trim() === "" ? null : Number(score);
      const payload = {
        resultStatus: status.trim() || null,
        resultScore: Number.isFinite(numericScore) ? numericScore : null,
        resultNote: note.trim() || null,
      };

      const res = await fetch(`/api/admin/${row.id}/result`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Natijani saqlashda xatolik yuz berdi");
        return;
      }

      const json = await res.json();
      onSaved(row.id, {
        resultStatus: json.data.resultStatus ?? null,
        resultScore: json.data.resultScore ?? null,
        resultNote: json.data.resultNote ?? null,
        resultUpdatedAt: json.data.resultUpdatedAt ?? null,
      });
      onOpenChange(false);
      toast.success("Natija saqlandi");
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Natijani yangilash</DialogTitle>
          <DialogDescription>
            {row ? `${row.familiya} ${row.ism} uchun natija` : "Natija"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">
            Status
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Masalan: Finalga o'tdi"
              className="mt-1 h-10"
            />
          </label>

          <label className="block text-xs font-medium text-muted-foreground">
            Ball
            <Input
              type="number"
              value={score}
              min={0}
              max={1000}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Masalan: 87"
              className="mt-1 h-10"
            />
          </label>

          <label className="block text-xs font-medium text-muted-foreground">
            Izoh
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Qo'shimcha izoh"
              className="mt-1 min-h-24"
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={save} disabled={loading} className="bg-electric-blue text-background hover:bg-electric-blue/90">
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RegistrationsTableProps {
  rows: AdminRow[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  queryState: {
    holat?: string;
    yoshGuruhi?: string;
    yonalish?: string;
    q?: string;
  };
  onStatusChanged: (payload: { id: string; prevHolat: Holat; nextHolat: Holat }) => void;
  onRowPatched: (id: string, patch: Partial<AdminRow>) => void;
}

export function RegistrationsTable({
  rows,
  currentPage,
  pageSize,
  totalPages,
  queryState,
  onStatusChanged,
  onRowPatched,
}: RegistrationsTableProps) {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const editingRow = rows.find((r) => r.id === editingRowId) ?? null;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (queryState.holat) params.set("holat", queryState.holat);
    if (queryState.yoshGuruhi) params.set("yoshGuruhi", queryState.yoshGuruhi);
    if (queryState.yonalish) params.set("yonalish", queryState.yonalish);
    if (queryState.q) params.set("q", queryState.q);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const from = Math.max(1, currentPage - 2);
    const to = Math.min(totalPages, currentPage + 2);
    for (let page = from; page <= to; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (rows.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">Hozircha ro&apos;yxatdan o&apos;tgan ishtirokchilar yo&apos;q.</div>;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <div key={r.id} className="ui-surface space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                {r.participantId ?? "-"}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatAdminDate(r.createdAt)}</span>
            </div>
            <p className="text-sm font-semibold">{r.familiya} {r.ism} {r.otasiningIsmi}</p>
            <p className="text-xs text-muted-foreground">{r.telefon}</p>
            <Badge variant="outline" className={`w-fit text-xs ${YOSH_BADGE_STYLES[r.yoshGuruhi] ?? ""}`}>
              {YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`text-xs ${YONALISH_BADGE_STYLES[r.yonalish] ?? ""}`}>
                {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
              </Badge>
            </div>
            <StatusCell key={`${r.id}-${r.holat}`} id={r.id} holat={r.holat} onUpdated={onStatusChanged} />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{getResultSummary(r)}</p>
              <button
                type="button"
                onClick={() => setEditingRowId(r.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-electric-blue hover:underline"
              >
                <PencilLineIcon className="h-3 w-3" /> Natijani tahrirlash
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ui-surface hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1280px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                "#",
                "ID",
                "Ishtirokchi",
                "Aloqa",
                "Yosh",
                "Yo'nalish",
                "Holat",
                "Natija",
                "Sana",
                "Amal",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, idx) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/20">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                    {r.participantId ?? "-"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium whitespace-nowrap">{r.familiya} {r.ism} {r.otasiningIsmi}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground">{r.telefon}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${YOSH_BADGE_STYLES[r.yoshGuruhi] ?? ""}`}>
                    {YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${YONALISH_BADGE_STYLES[r.yonalish] ?? ""}`}>
                    {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusCell key={`${r.id}-${r.holat}`} id={r.id} holat={r.holat} onUpdated={onStatusChanged} />
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">{getResultSummary(r)}</p>
                  <p className="text-[11px] text-muted-foreground">{formatAdminDate(r.resultUpdatedAt)}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {formatAdminDate(r.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setEditingRowId(r.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-electric-blue hover:underline"
                  >
                    <PencilLineIcon className="h-3 w-3" /> Tahrirlash
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={buildPageHref(Math.max(1, currentPage - 1))}
            className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs ${
              currentPage === 1
                ? "pointer-events-none border-border text-muted-foreground/50"
                : "border-border text-muted-foreground hover:border-electric-blue/40 hover:text-foreground"
            }`}
          >
            Prev
          </Link>

          {visiblePages.map((page) => (
            <Link
              key={page}
              href={buildPageHref(page)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs ${
                page === currentPage
                  ? "border-electric-blue/50 bg-electric-blue/10 text-electric-blue"
                  : "border-border text-muted-foreground hover:border-electric-blue/40 hover:text-foreground"
              }`}
            >
              {page}
            </Link>
          ))}

          <Link
            href={buildPageHref(Math.min(totalPages, currentPage + 1))}
            className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs ${
              currentPage === totalPages
                ? "pointer-events-none border-border text-muted-foreground/50"
                : "border-border text-muted-foreground hover:border-electric-blue/40 hover:text-foreground"
            }`}
          >
            Next
          </Link>
        </div>
      )}

      <ResultDialog
        row={editingRow}
        open={Boolean(editingRow)}
        onOpenChange={(open) => {
          if (!open) setEditingRowId(null);
        }}
        onSaved={onRowPatched}
      />
    </>
  );
}
