"use client";

import { useState } from "react";
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
  DialogTrigger,
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

function StatusCell({ id, holat }: { id: string; holat: Holat }) {
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

function ResultEditor({
  id,
  initialStatus,
  initialScore,
  initialNote,
  initialUpdatedAt,
}: {
  id: string;
  initialStatus: string | null;
  initialScore: number | null;
  initialNote: string | null;
  initialUpdatedAt: string | null;
}) {
  const [status, setStatus] = useState(initialStatus ?? "");
  const [score, setScore] = useState(initialScore === null ? "" : String(initialScore));
  const [note, setNote] = useState(initialNote ?? "");
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const numericScore = score.trim() === "" ? null : Number(score);
      const payload = {
        resultStatus: status.trim() || null,
        resultScore: Number.isFinite(numericScore) ? numericScore : null,
        resultNote: note.trim() || null,
      };

      const res = await fetch(`/api/admin/${id}/result`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Natijani saqlashda xatolik yuz berdi");
        return;
      }

      const json = await res.json();
      setStatus(json.data.resultStatus ?? "");
      setScore(json.data.resultScore === null ? "" : String(json.data.resultScore));
      setNote(json.data.resultNote ?? "");
      setUpdatedAt(json.data.resultUpdatedAt ?? null);
      setOpen(false);
      toast.success("Natija saqlandi");
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = status.trim() !== "" || score.trim() !== "" || note.trim() !== "";

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {hasResult ? `${status || "Status"} / ${score || "-"}` : "Hali e'lon qilinmagan"}
      </p>
      <p className="text-[11px] text-muted-foreground">{formatAdminDate(updatedAt)}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex items-center gap-1 text-xs font-medium text-electric-blue hover:underline">
          <PencilLineIcon className="h-3 w-3" /> Natijani tahrirlash
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Natijani yangilash</DialogTitle>
            <DialogDescription>Status, ball va izohni kiriting.</DialogDescription>
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
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Bekor qilish
            </Button>
            <Button onClick={save} disabled={loading} className="bg-electric-blue text-background hover:bg-electric-blue/90">
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RegistrationsTableProps {
  data: Royxat[];
}

export function RegistrationsTable({ data }: RegistrationsTableProps) {
  if (data.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">Hozircha ro&apos;yxatdan o&apos;tgan ishtirokchilar yo&apos;q.</div>;
  }

  return (
    <div className="ui-surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["ID", "F.I.Sh", "Telefon", "Yo'nalish", "Yosh guruhi", "Holat", "Natija", "Sana"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-muted/20">
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                  {r.participantId ?? "-"}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium">
                {r.familiya} {r.ism} {r.otasiningIsmi}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.telefon}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-xs">
                  {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-xs">
                  {YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <StatusCell id={r.id} holat={r.holat} />
              </td>
              <td className="px-4 py-3">
                <ResultEditor
                  id={r.id}
                  initialStatus={r.resultStatus}
                  initialScore={r.resultScore}
                  initialNote={r.resultNote}
                  initialUpdatedAt={r.resultUpdatedAt}
                />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                {formatAdminDate(r.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
