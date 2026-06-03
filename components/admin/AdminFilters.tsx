"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AdminDateRangePicker } from "@/components/admin/AdminDateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Holat = "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";
type UtmType = "MAKTAB" | "BANNER" | "ORGANIK";
type SmsStatus = "PENDING" | "SENT" | "FAILED";
type ContactStatus = "BOGLANILMAGAN" | "BOGLANIB_BOLMADI" | "QAYTA_ALOQA" | "BOGLANILGAN";
type KelishStatus = "KELGAN" | "KELMADI";

const ALL = "__ALL__";

const HOLAT_OPTIONS: Array<{ value: Holat; label: string }> = [
  { value: "KUTILMOQDA", label: "Kutilmoqda" },
  { value: "TASDIQLANDI", label: "Tasdiqlandi" },
  { value: "RAD_ETILDI", label: "Rad etildi" },
];

const UTM_OPTIONS: Array<{ value: UtmType; label: string }> = [
  { value: "MAKTAB", label: "Maktab" },
  { value: "BANNER", label: "Banner" },
  { value: "ORGANIK", label: "Organik" },
];

const SMS_STATUS_OPTIONS: Array<{ value: SmsStatus; label: string }> = [
  { value: "SENT", label: "Yuborildi" },
  { value: "FAILED", label: "Xato" },
  { value: "PENDING", label: "Kutilmoqda" },
];

const CONTACT_STATUS_OPTIONS: Array<{ value: ContactStatus; label: string }> = [
  { value: "BOGLANILMAGAN", label: "Bog'lanilmagan" },
  { value: "BOGLANIB_BOLMADI", label: "Bog'lanib bo'lmadi" },
  { value: "QAYTA_ALOQA", label: "Qayta aloqa" },
  { value: "BOGLANILGAN", label: "Bog'lanilgan" },
];

const KELISH_STATUS_OPTIONS: Array<{ value: KelishStatus; label: string }> = [
  { value: "KELGAN", label: "Keldi" },
  { value: "KELMADI", label: "Kelmadi" },
];

interface AdminFiltersProps {
  holat?: Holat;
  yoshGuruhi?: string;
  yonalish?: string;
  utmType?: UtmType;
  smsStatus?: SmsStatus;
  contactStatus?: ContactStatus;
  kelishStatus?: KelishStatus;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  yoshOptions: [string, string][];
  yonalishOptions: [string, string][];
}

const HOLAT_TRIGGER_STYLES: Record<string, string> = {
  KUTILMOQDA: "border-amber-300/80 bg-amber-50/40 text-amber-800",
  TASDIQLANDI: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  RAD_ETILDI: "border-rose-300/80 bg-rose-50/40 text-rose-800",
};
const YOSH_TRIGGER_STYLES: Record<string, string> = {
  YOSH_9_11: "border-indigo-300/80 bg-indigo-50/40 text-indigo-800",
  YOSH_12_14: "border-fuchsia-300/80 bg-fuchsia-50/40 text-fuchsia-800",
  YOSH_9_14: "border-teal-300/80 bg-teal-50/40 text-teal-800",
};
const YONALISH_TRIGGER_STYLES: Record<string, string> = {
  MATEMATIKA: "border-violet-300/80 bg-violet-50/40 text-violet-800",
  TYPING: "border-sky-300/80 bg-sky-50/40 text-sky-800",
};
const UTM_TRIGGER_STYLES: Record<string, string> = {
  MAKTAB: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  BANNER: "border-orange-300/80 bg-orange-50/40 text-orange-800",
  ORGANIK: "border-slate-300/80 bg-slate-50/40 text-slate-800",
};
const SMS_TRIGGER_STYLES: Record<string, string> = {
  SENT: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  FAILED: "border-rose-300/80 bg-rose-50/40 text-rose-800",
  PENDING: "border-slate-300/80 bg-slate-50/40 text-slate-800",
};
const CONTACT_TRIGGER_STYLES: Record<string, string> = {
  BOGLANILMAGAN: "border-slate-300/80 bg-slate-50/40 text-slate-800",
  BOGLANIB_BOLMADI: "border-rose-300/80 bg-rose-50/40 text-rose-800",
  QAYTA_ALOQA: "border-amber-300/80 bg-amber-50/40 text-amber-800",
  BOGLANILGAN: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
};
const KELISH_TRIGGER_STYLES: Record<string, string> = {
  KELGAN: "border-emerald-300/80 bg-emerald-50/40 text-emerald-800",
  KELMADI: "border-rose-300/80 bg-rose-50/40 text-rose-800",
};

function FL({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[11px] font-medium text-muted-foreground/70">{children}</p>;
}

export function AdminFilters({
  holat,
  yoshGuruhi,
  yonalish,
  utmType,
  smsStatus,
  contactStatus,
  kelishStatus,
  query,
  dateFrom,
  dateTo,
  yoshOptions,
  yonalishOptions,
}: AdminFiltersProps) {
  const [search, setSearch] = useState(query ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  const selectedHolatLabel = HOLAT_OPTIONS.find((i) => i.value === holat)?.label ?? "Barcha statuslar";
  const selectedYoshLabel = yoshOptions.find(([v]) => v === yoshGuruhi)?.[1] ?? "Barcha yoshlar";
  const selectedYonalishLabel = yonalishOptions.find(([v]) => v === yonalish)?.[1] ?? "Barcha yo'nalishlar";
  const selectedUtmLabel = UTM_OPTIONS.find((i) => i.value === utmType)?.label ?? "Barcha UTM";
  const selectedSmsLabel = SMS_STATUS_OPTIONS.find((i) => i.value === smsStatus)?.label ?? "Barcha SMS";
  const selectedContactLabel = CONTACT_STATUS_OPTIONS.find((i) => i.value === contactStatus)?.label ?? "Barcha aloqa";
  const selectedKelishLabel = KELISH_STATUS_OPTIONS.find((i) => i.value === kelishStatus)?.label ?? "Barchasi";

  const norm = (value: string | null) => (value && value !== ALL ? value : undefined);

  const replaceWith = useCallback(
    (
      updates: Partial<
        Record<
          | "holat" | "contactStatus" | "yoshGuruhi" | "yonalish"
          | "utmType" | "smsStatus" | "kelishStatus" | "q"
          | "dateFrom" | "dateTo"
          | "pageSize" | "sortBy" | "sortDir" | "duplicates",
          string | undefined
        >
      >,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      (Object.entries(updates) as Array<[string, string | undefined]>).forEach(([key, value]) => {
        if (!value || !value.trim()) params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => replaceWith({ q: value }), 250);
  };

  const isFiltered = Boolean(
    holat || contactStatus || yoshGuruhi || yonalish ||
    utmType || smsStatus || kelishStatus || currentQuery ||
    (dateFrom?.trim()) || (dateTo?.trim()),
  );

  return (
    <div className="space-y-2">
      {/* Search */}
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Qidirish: ism, familiya, participant ID, telefon"
        className="h-10 w-full rounded-xl border-slate-300 bg-background ring-1 ring-slate-200/70 focus-visible:ring-2 focus-visible:ring-electric-blue/35"
      />

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        <div>
          <FL>Status</FL>
          <Select value={holat ?? ALL} onValueChange={(v) => replaceWith({ holat: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${holat ? (HOLAT_TRIGGER_STYLES[holat] ?? "") : ""}`}>
              <SelectValue>{selectedHolatLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha statuslar</SelectItem>
              {HOLAT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>Yosh toifasi</FL>
          <Select value={yoshGuruhi ?? ALL} onValueChange={(v) => replaceWith({ yoshGuruhi: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${yoshGuruhi ? (YOSH_TRIGGER_STYLES[yoshGuruhi] ?? "") : ""}`}>
              <SelectValue>{selectedYoshLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha yoshlar</SelectItem>
              {yoshOptions.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>Yo&apos;nalish</FL>
          <Select value={yonalish ?? ALL} onValueChange={(v) => replaceWith({ yonalish: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${yonalish ? (YONALISH_TRIGGER_STYLES[yonalish] ?? "") : ""}`}>
              <SelectValue>{selectedYonalishLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha yo&apos;nalishlar</SelectItem>
              {yonalishOptions.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>Kelish</FL>
          <Select value={kelishStatus ?? ALL} onValueChange={(v) => replaceWith({ kelishStatus: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${kelishStatus ? (KELISH_TRIGGER_STYLES[kelishStatus] ?? "") : ""}`}>
              <SelectValue>{selectedKelishLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barchasi</SelectItem>
              {KELISH_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
        <div>
          <FL>Aloqa holati</FL>
          <Select value={contactStatus ?? ALL} onValueChange={(v) => replaceWith({ contactStatus: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${contactStatus ? (CONTACT_TRIGGER_STYLES[contactStatus] ?? "") : ""}`}>
              <SelectValue>{selectedContactLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha aloqa</SelectItem>
              {CONTACT_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>UTM manba</FL>
          <Select value={utmType ?? ALL} onValueChange={(v) => replaceWith({ utmType: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${utmType ? (UTM_TRIGGER_STYLES[utmType] ?? "") : ""}`}>
              <SelectValue>{selectedUtmLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha UTM</SelectItem>
              {UTM_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>SMS holati</FL>
          <Select value={smsStatus ?? ALL} onValueChange={(v) => replaceWith({ smsStatus: norm(v) })}>
            <SelectTrigger className={`h-9 rounded-xl ${smsStatus ? (SMS_TRIGGER_STYLES[smsStatus] ?? "") : ""}`}>
              <SelectValue>{selectedSmsLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha SMS</SelectItem>
              {SMS_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FL>Sana oralig&apos;i</FL>
          <AdminDateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={({ dateFrom: f, dateTo: t }) => replaceWith({ dateFrom: f, dateTo: t })}
          />
        </div>
      </div>

      {/* Clear */}
      {isFiltered && (
        <div className="flex">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
          >
            <span>×</span> Filtrlarni tozalash
          </Link>
        </div>
      )}
    </div>
  );
}
