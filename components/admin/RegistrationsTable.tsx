"use client";

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

type Holat = "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";

interface Royxat {
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

function formatAdminDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

function getResultSummary(row: Royxat) {
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
  onUpdated: (next: Holat) => void;
}) {
  const [current, setCurrent] = useState<Holat>(holat);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newHolat: Holat) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holat: newHolat }),
      });
      if (res.ok) {
        setCurrent(newHolat);
        onUpdated(newHolat);
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
      <Select value={current} onValueChange={(v) => updateStatus(v as Holat)} disabled={loading}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
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
  row: Royxat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (id: string, patch: Partial<Royxat>) => void;
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
  data: Royxat[];
}

export function RegistrationsTable({ data }: RegistrationsTableProps) {
  const [rows, setRows] = useState(data);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const editingRow = rows.find((r) => r.id === editingRowId) ?? null;

  const patchRow = (id: string, patch: Partial<Royxat>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

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
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">{YONALISH_LABELS[r.yonalish] ?? r.yonalish}</Badge>
              <Badge variant="outline" className="text-xs">{YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}</Badge>
            </div>
            <StatusCell id={r.id} holat={r.holat} onUpdated={(next) => patchRow(r.id, { holat: next })} />
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                "ID",
                "Ishtirokchi",
                "Aloqa",
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
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                    {r.participantId ?? "-"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.familiya} {r.ism} {r.otasiningIsmi}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground">{r.telefon}</p>
                  <p className="text-xs text-muted-foreground">{YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusCell id={r.id} holat={r.holat} onUpdated={(next) => patchRow(r.id, { holat: next })} />
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

      <ResultDialog
        row={editingRow}
        open={Boolean(editingRow)}
        onOpenChange={(open) => {
          if (!open) setEditingRowId(null);
        }}
        onSaved={patchRow}
      />
    </>
  );
}
