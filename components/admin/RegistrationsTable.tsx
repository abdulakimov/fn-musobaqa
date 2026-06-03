"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appToast as toast } from "@/lib/toast";
import { Loader2Icon, Trash2Icon } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

export type Holat = "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";
export type ContactStatus = "BOGLANILMAGAN" | "BOGLANIB_BOLMADI" | "QAYTA_ALOQA" | "BOGLANILGAN";
export type AttendanceStatus = "KELGAN" | "KELMADI";

export interface AdminRow {
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
  smsSentAt: string | null;
  smsError: string | null;
  smsMessageId: string | null;
  contactStatus: ContactStatus;
  kelishStatus: AttendanceStatus;
  resultStatus: string | null;
  resultScore: number | null;
  resultNote: string | null;
  resultUpdatedAt: string | null;
  holat: Holat;
  createdAt: string;
  isDuplicate: boolean;
  duplicateCount: number;
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

const UTM_BADGE_STYLES: Record<string, string> = {
  MAKTAB: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  BANNER: "border-orange-300/80 bg-orange-50/40 text-orange-800",
  ORGANIK: "border-slate-300/80 bg-slate-50/40 text-slate-800",
};

const ATTENDANCE_TRIGGER_STYLES: Record<AttendanceStatus, string> = {
  KELGAN: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  KELMADI: "border-rose-300/80 bg-rose-50/40 text-rose-800",
};

const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  BOGLANILMAGAN: "Bog'lanilmagan",
  BOGLANIB_BOLMADI: "Bog'lanib bo'lmadi",
  QAYTA_ALOQA: "Qayta aloqa",
  BOGLANILGAN: "Bog'lanilgan",
};

const CONTACT_STATUS_TRIGGER_STYLES: Record<ContactStatus, string> = {
  BOGLANILMAGAN: "border-slate-300/70 bg-slate-50/40 text-slate-800",
  BOGLANIB_BOLMADI: "border-rose-300/70 bg-rose-50/40 text-rose-800",
  QAYTA_ALOQA: "border-amber-300/70 bg-amber-50/40 text-amber-800",
  BOGLANILGAN: "border-emerald-300/70 bg-emerald-50/40 text-emerald-800",
};

function getUtmLabel(value: AdminRow["utmType"]) {
  if (value === "MAKTAB") return "Maktab";
  if (value === "BANNER") return "Banner";
  return "Organik";
}

function getAttendanceStatusLabel(value: AttendanceStatus) {
  if (value === "KELGAN") return "Kelgan";
  return "Kelmadi";
}

function formatAdminDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
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
        <SelectTrigger className={`h-8 w-36 text-xs ${HOLAT_TRIGGER_STYLES[holat]}`} aria-label="Holat">
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

function ContactStatusCell({
  id,
  contactStatus,
  onUpdated,
}: {
  id: string;
  contactStatus: ContactStatus;
  onUpdated: (payload: { id: string; prevContactStatus: ContactStatus; nextContactStatus: ContactStatus }) => void;
}) {
  const [loading, setLoading] = useState(false);

  const updateContactStatus = async (newContactStatus: ContactStatus) => {
    const previousContactStatus = contactStatus;
    if (newContactStatus === previousContactStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}/contact-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactStatus: newContactStatus }),
      });
      if (res.ok) {
        onUpdated({ id, prevContactStatus: previousContactStatus, nextContactStatus: newContactStatus });
        toast.success("Aloqa statusi yangilandi");
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.error ?? "Xatolik yuz berdi");
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
      <Select
        value={contactStatus}
        onValueChange={(value) => updateContactStatus(value as ContactStatus)}
        disabled={loading}
      >
        <SelectTrigger
          className={`h-8 w-40 text-xs ${CONTACT_STATUS_TRIGGER_STYLES[contactStatus]}`}
          aria-label="Aloqa statusi"
        >
          <SelectValue>{CONTACT_STATUS_LABELS[contactStatus]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(CONTACT_STATUS_LABELS) as ContactStatus[]).map((status) => (
            <SelectItem key={status} value={status} className="text-xs">
              {CONTACT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AttendanceStatusCell({
  id,
  attendanceStatus,
  onUpdated,
}: {
  id: string;
  attendanceStatus: AttendanceStatus;
  onUpdated: (payload: {
    id: string;
    prevAttendanceStatus: AttendanceStatus;
    nextAttendanceStatus: AttendanceStatus;
  }) => void;
}) {
  const [loading, setLoading] = useState(false);

  const updateAttendanceStatus = async (newAttendanceStatus: AttendanceStatus) => {
    const previousAttendanceStatus = attendanceStatus;
    if (newAttendanceStatus === previousAttendanceStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}/attendance-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceStatus: newAttendanceStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.error ?? "Kelish statusini yangilashda xatolik yuz berdi");
        return;
      }
      onUpdated({
        id,
        prevAttendanceStatus: previousAttendanceStatus,
        nextAttendanceStatus: newAttendanceStatus,
      });
      toast.success("Kelish statusi yangilandi");
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
      <Select
        value={attendanceStatus}
        onValueChange={(value) => updateAttendanceStatus(value as AttendanceStatus)}
        disabled={loading}
      >
        <SelectTrigger
          className={`h-8 w-28 text-xs ${ATTENDANCE_TRIGGER_STYLES[attendanceStatus]}`}
          aria-label="Kelish statusi"
        >
          <SelectValue>{getAttendanceStatusLabel(attendanceStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="KELGAN" className="text-xs">Kelgan</SelectItem>
          <SelectItem value="KELMADI" className="text-xs">Kelmadi</SelectItem>
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
  highlightedRowId?: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  queryState: {
    holat?: string;
    contactStatus?: string;
    yoshGuruhi?: string;
    yonalish?: string;
    utmType?: string;
    smsStatus?: string;
    kelishStatus?: string;
    q?: string;
    pageSize?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: string;
    duplicates?: string;
  };
  onStatusChanged: (payload: { id: string; prevHolat: Holat; nextHolat: Holat }) => void;
  onContactStatusChanged: (payload: {
    id: string;
    prevContactStatus: ContactStatus;
    nextContactStatus: ContactStatus;
  }) => void;
  onAttendanceStatusChanged: (payload: {
    id: string;
    prevAttendanceStatus: AttendanceStatus;
    nextAttendanceStatus: AttendanceStatus;
  }) => void;
  onBulkContactStatusChanged: (payload: { ids: string[]; nextContactStatus: ContactStatus }) => void;
  onRowPatched: (id: string, patch: Partial<AdminRow>) => void;
  onRowsDeleted: (deletedIds: string[]) => void;
}

export function RegistrationsTable({
  rows,
  highlightedRowId,
  currentPage,
  pageSize,
  totalPages,
  queryState,
  onStatusChanged,
  onContactStatusChanged,
  onAttendanceStatusChanged,
  onBulkContactStatusChanged,
  onRowPatched,
  onRowsDeleted,
}: RegistrationsTableProps) {
  const BULK_CONTACT_NONE = "__NONE__";
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkContactStatus, setBulkContactStatus] = useState<string>(BULK_CONTACT_NONE);
  const [bulkUpdatingContact, setBulkUpdatingContact] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [deletingSingle, setDeletingSingle] = useState(false);

  const editingRow = rows.find((r) => r.id === editingRowId) ?? null;
  const selectableIds = rows.map((row) => row.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const selectedCount = selectedIds.length;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (queryState.holat) params.set("holat", queryState.holat);
    if (queryState.contactStatus) params.set("contactStatus", queryState.contactStatus);
    if (queryState.yoshGuruhi) params.set("yoshGuruhi", queryState.yoshGuruhi);
    if (queryState.yonalish) params.set("yonalish", queryState.yonalish);
    if (queryState.utmType) params.set("utmType", queryState.utmType);
    if (queryState.smsStatus) params.set("smsStatus", queryState.smsStatus);
    if (queryState.kelishStatus) params.set("kelishStatus", queryState.kelishStatus);
    if (queryState.q) params.set("q", queryState.q);
    if (queryState.pageSize) params.set("pageSize", queryState.pageSize);
    if (queryState.dateFrom) params.set("dateFrom", queryState.dateFrom);
    if (queryState.dateTo) params.set("dateTo", queryState.dateTo);
    if (queryState.sortBy) params.set("sortBy", queryState.sortBy);
    if (queryState.sortDir) params.set("sortDir", queryState.sortDir);
    if (queryState.duplicates) params.set("duplicates", queryState.duplicates);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };

  const visiblePages = useMemo(() => {
    const numericPages = new Set<number>();
    [1, 2, 3, currentPage - 1, currentPage, currentPage + 1, totalPages].forEach((page) => {
      if (page >= 1 && page <= totalPages) {
        numericPages.add(page);
      }
    });

    const sorted = Array.from(numericPages).sort((a, b) => a - b);
    const pages: Array<number | "ellipsis"> = [];
    let prev: number | null = null;
    for (const page of sorted) {
      if (prev !== null && page - prev > 1) {
        pages.push("ellipsis");
      }
      pages.push(page);
      prev = page;
    }
    return pages;
  }, [currentPage, totalPages]);

  useEffect(() => {
    const available = new Set(rows.map((row) => row.id));
    setSelectedIds((prev) => prev.filter((id) => available.has(id)));
  }, [rows]);

  const toggleRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id)));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? selectableIds : []);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setBulkContactStatus(BULK_CONTACT_NONE);
  };

  const deleteSelectedRows = async () => {
    if (selectedIds.length === 0) return;
    setDeletingBulk(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? "Tanlanganlarni o'chirishda xatolik yuz berdi");
        return;
      }
      onRowsDeleted(selectedIds);
      setDeleteDialogOpen(false);
      clearSelection();
      toast.success(`Tanlanganlar arxivlandi (${json?.deletedCount ?? 0})`);
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setDeletingBulk(false);
    }
  };

  const deleteSingleRow = async () => {
    if (!singleDeleteId) return;
    setDeletingSingle(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [singleDeleteId] }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? "Ishtirokchini o'chirishda xatolik yuz berdi");
        return;
      }
      onRowsDeleted([singleDeleteId]);
      setSingleDeleteId(null);
      toast.success("Ishtirokchi arxivlandi");
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setDeletingSingle(false);
    }
  };

  const updateSelectedContactStatus = async () => {
    if (selectedIds.length === 0 || bulkContactStatus === BULK_CONTACT_NONE) return;

    const nextContactStatus = bulkContactStatus as ContactStatus;
    setBulkUpdatingContact(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, contactStatus: nextContactStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? "Aloqa statusini yangilashda xatolik yuz berdi");
        return;
      }
      onBulkContactStatusChanged({ ids: selectedIds, nextContactStatus });
      clearSelection();
      toast.success(`Aloqa statusi yangilandi (${json?.updatedCount ?? 0})`);
    } catch {
      toast.error("Tarmoq xatosi");
    } finally {
      setBulkUpdatingContact(false);
    }
  };

  if (rows.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">Hozircha ro&apos;yxatdan o&apos;tgan ishtirokchilar yo&apos;q.</div>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
        <button
          type="button"
          onClick={() => toggleSelectAll(!allSelected)}
          className="text-xs font-medium text-electric-blue hover:underline"
        >
          {allSelected ? "Joriy sahifa belgilari olib tashlansin" : "Joriy sahifadagi barchasini belgilash"}
        </button>
        <span className="text-xs text-muted-foreground">{selectedCount} ta tanlangan</span>
        <button
          type="button"
          onClick={clearSelection}
          disabled={selectedCount === 0}
          className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Belgilashni tozalash
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={bulkContactStatus}
            onValueChange={(value) => setBulkContactStatus(value ?? BULK_CONTACT_NONE)}
            disabled={bulkUpdatingContact}
          >
            <SelectTrigger className="h-8 w-44 text-xs" aria-label="Bulk aloqa statusi">
              <SelectValue placeholder="Aloqa tanlang">
                {bulkContactStatus === BULK_CONTACT_NONE
                  ? "Aloqa tanlang"
                  : CONTACT_STATUS_LABELS[bulkContactStatus as ContactStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BULK_CONTACT_NONE}>Aloqa tanlang</SelectItem>
              {(Object.keys(CONTACT_STATUS_LABELS) as ContactStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {CONTACT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedCount === 0 || bulkUpdatingContact || bulkContactStatus === BULK_CONTACT_NONE}
            onClick={updateSelectedContactStatus}
          >
            {bulkUpdatingContact ? "Qo'llanmoqda..." : "Qo'llash"}
          </Button>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={selectedCount === 0}
          className="gap-1.5"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
          Tanlanganlarni o&apos;chirish
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`ui-surface space-y-3 p-4 transition-colors ${
              highlightedRowId === r.id ? "border-electric-blue/60 bg-electric-blue/5 shadow-[0_0_0_1px_rgba(49,100,235,0.25)]" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.includes(r.id)}
                  onCheckedChange={(checked) => toggleRowSelection(r.id, Boolean(checked))}
                  aria-label={`${r.familiya} ${r.ism} ni belgilash`}
                />
                <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                  {r.participantId ?? "-"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{formatAdminDate(r.createdAt)}</span>
            </div>
            <p className="text-sm font-semibold">{r.familiya} {r.ism} {r.otasiningIsmi}</p>
            {r.isDuplicate ? (
              <Badge variant="outline" className="w-fit text-xs border-rose-300/80 bg-rose-50/40 text-rose-800">
                Duplikat ({r.duplicateCount})
              </Badge>
            ) : null}
            <p className="text-xs text-muted-foreground">{r.telefon}</p>
            <Badge variant="outline" className={`w-fit text-xs ${YOSH_BADGE_STYLES[r.yoshGuruhi] ?? ""}`}>
              {YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`text-xs ${YONALISH_BADGE_STYLES[r.yonalish] ?? ""}`}>
                {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
              </Badge>
              <Badge variant="outline" className={`text-xs ${UTM_BADGE_STYLES[r.utmType] ?? ""}`}>
                {getUtmLabel(r.utmType)}
              </Badge>
            </div>
            <AttendanceStatusCell
              key={`${r.id}-${r.kelishStatus}`}
              id={r.id}
              attendanceStatus={r.kelishStatus}
              onUpdated={onAttendanceStatusChanged}
            />
            <ContactStatusCell
              key={`${r.id}-${r.contactStatus}`}
              id={r.id}
              contactStatus={r.contactStatus}
              onUpdated={onContactStatusChanged}
            />
            <StatusCell key={`${r.id}-${r.holat}`} id={r.id} holat={r.holat} onUpdated={onStatusChanged} />
            <button
              type="button"
              onClick={() => setSingleDeleteId(r.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-500/10"
              aria-label="O'chirish"
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="ui-surface hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1160px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                "Belgi",
                "#",
                "ID",
                "Ishtirokchi",
                "Yo'nalish",
                "UTM",
                "Kelish",
                "Aloqa",
                "Holat",
                "Sana",
                "Amal",
              ].map((h) => (
                <th
                  key={h}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground ${
                    h === "Amal" ? "sticky right-0 z-20 border-l border-border bg-muted/30" : ""
                  }`}
                >
                  {h === "Belgi" ? (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                      aria-label="Joriy sahifadagi barchasini belgilash"
                    />
                  ) : (
                    h
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                className={`group transition-colors hover:bg-muted/20 ${
                  highlightedRowId === r.id ? "bg-electric-blue/5" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onCheckedChange={(checked) => toggleRowSelection(r.id, Boolean(checked))}
                    aria-label={`${r.familiya} ${r.ism} ni belgilash`}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs font-semibold text-electric-blue">
                    {r.participantId ?? "-"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium whitespace-nowrap">{r.familiya} {r.ism} {r.otasiningIsmi}</p>
                    {r.isDuplicate ? (
                      <Badge variant="outline" className="text-[11px] border-rose-300/80 bg-rose-50/40 text-rose-800">
                        Duplikat ({r.duplicateCount})
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="whitespace-nowrap">{r.telefon}</span>
                    <span className="text-border">|</span>
                    <Badge variant="outline" className={`text-xs ${YOSH_BADGE_STYLES[r.yoshGuruhi] ?? ""}`}>
                      {YOSH_GURUH_LABELS[r.yoshGuruhi] ?? r.yoshGuruhi}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${YONALISH_BADGE_STYLES[r.yonalish] ?? ""}`}>
                    {YONALISH_LABELS[r.yonalish] ?? r.yonalish}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${UTM_BADGE_STYLES[r.utmType] ?? ""}`}>
                    {getUtmLabel(r.utmType)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <AttendanceStatusCell
                    key={`${r.id}-${r.kelishStatus}`}
                    id={r.id}
                    attendanceStatus={r.kelishStatus}
                    onUpdated={onAttendanceStatusChanged}
                  />
                </td>
                <td className="px-4 py-3">
                  <ContactStatusCell
                    key={`${r.id}-${r.contactStatus}`}
                    id={r.id}
                    contactStatus={r.contactStatus}
                    onUpdated={onContactStatusChanged}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusCell key={`${r.id}-${r.holat}`} id={r.id} holat={r.holat} onUpdated={onStatusChanged} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {formatAdminDate(r.createdAt)}
                </td>
                <td className="sticky right-0 z-10 border-l border-border bg-card px-4 py-3 shadow-[-10px_0_18px_-16px_rgba(26,22,80,0.55)] group-hover:bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setSingleDeleteId(r.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-500/10"
                    aria-label="O'chirish"
                  >
                    <Trash2Icon className="h-4 w-4" />
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
            Orqaga
          </Link>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="inline-flex h-8 min-w-8 items-center justify-center text-xs text-muted-foreground">
                ...
              </span>
            ) : (
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
            )
          )}

          <Link
            href={buildPageHref(Math.min(totalPages, currentPage + 1))}
            className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs ${
              currentPage === totalPages
                ? "pointer-events-none border-border text-muted-foreground/50"
                : "border-border text-muted-foreground hover:border-electric-blue/40 hover:text-foreground"
            }`}
          >
            Oldinga
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tanlanganlarni o&apos;chirish</DialogTitle>
            <DialogDescription>
              {selectedCount} ta ishtirokchi arxivga olinadi va ro&apos;yxatdan yashiriladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deletingBulk} onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" disabled={deletingBulk} onClick={deleteSelectedRows}>
              {deletingBulk ? "Arxivlanmoqda..." : "Arxivlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(singleDeleteId)} onOpenChange={(open) => { if (!open) setSingleDeleteId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ishtirokchini o&apos;chirish</DialogTitle>
            <DialogDescription>
              Bu ishtirokchi arxivga olinadi va ro&apos;yxatdan yashiriladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deletingSingle} onClick={() => setSingleDeleteId(null)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" disabled={deletingSingle} onClick={deleteSingleRow}>
              {deletingSingle ? "Arxivlanmoqda..." : "Arxivlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}








