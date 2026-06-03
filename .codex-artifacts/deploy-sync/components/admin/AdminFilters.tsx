"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Sana" },
] as const;

const SORT_DIR_OPTIONS = [
  { value: "desc", label: "Kamayish bo'yicha" },
  { value: "asc", label: "O'sish bo'yicha" },
] as const;

interface AdminFiltersProps {
  holat?: Holat;
  yoshGuruhi?: string;
  yonalish?: string;
  utmType?: UtmType;
  smsStatus?: SmsStatus;
  contactStatus?: ContactStatus;
  query?: string;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: string;
  duplicates?: boolean;
  yoshOptions: [string, string][];
  yonalishOptions: [string, string][];
}

export function AdminFilters({
  holat,
  yoshGuruhi,
  yonalish,
  utmType,
  smsStatus,
  contactStatus,
  query,
  pageSize,
  dateFrom,
  dateTo,
  sortBy,
  sortDir,
  duplicates,
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

  const selectedHolatLabel = HOLAT_OPTIONS.find((item) => item.value === holat)?.label ?? "Barcha statuslar";
  const selectedYoshLabel = yoshOptions.find(([value]) => value === yoshGuruhi)?.[1] ?? "Barcha yoshlar";
  const selectedYonalishLabel = yonalishOptions.find(([value]) => value === yonalish)?.[1] ?? "Barcha yo'nalishlar";
  const selectedUtmLabel = UTM_OPTIONS.find((item) => item.value === utmType)?.label ?? "Barcha UTM";
  const selectedSmsLabel = SMS_STATUS_OPTIONS.find((item) => item.value === smsStatus)?.label ?? "Barcha SMS";
  const selectedContactLabel = CONTACT_STATUS_OPTIONS.find((item) => item.value === contactStatus)?.label ?? "Barcha aloqa";
  const selectedPageSizeLabel = `${pageSize ?? 15} ta`;
  const selectedSortByLabel = SORT_BY_OPTIONS.find((item) => item.value === (sortBy ?? "createdAt"))?.label ?? "Sana";
  const selectedSortDirLabel = SORT_DIR_OPTIONS.find((item) => item.value === (sortDir ?? "desc"))?.label ?? "Kamayish bo'yicha";

  const normalizeSelectValue = (value: string | null) => (value && value !== ALL ? value : undefined);

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

  const replaceWith = useCallback(
    (
      updates: Partial<
        Record<
        "holat" | "contactStatus" | "yoshGuruhi" | "yonalish" | "utmType" | "smsStatus" | "q" | "pageSize" | "dateFrom" | "dateTo" | "sortBy" | "sortDir" | "duplicates",
        string | undefined
      >
      >,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      const shouldResetPage =
        "holat" in updates ||
        "contactStatus" in updates ||
        "yoshGuruhi" in updates ||
        "yonalish" in updates ||
        "utmType" in updates ||
        "smsStatus" in updates ||
        "q" in updates ||
        "pageSize" in updates ||
        "dateFrom" in updates ||
        "dateTo" in updates ||
        "sortBy" in updates ||
        "sortDir" in updates ||
        "duplicates" in updates;
      (Object.entries(updates) as Array<[string, string | undefined]>).forEach(([key, value]) => {
        if (!value || !value.trim()) {
          params.delete(key);
          return;
        }
        params.set(key, value);
      });
      if (shouldResetPage) {
        params.delete("page");
      }

      const nextQuery = params.toString();
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      replaceWith({ q: value });
    }, 250);
  };

  const isFiltered = Boolean(
    holat ||
      contactStatus ||
      yoshGuruhi ||
      yonalish ||
      utmType ||
      smsStatus ||
      currentQuery ||
      (dateFrom && dateFrom.trim()) ||
      (dateTo && dateTo.trim()) ||
      (pageSize && pageSize !== 15) ||
      (sortBy && sortBy !== "createdAt") ||
      (sortDir && sortDir !== "desc") ||
      duplicates,
  );

  return (
    <div className="space-y-3">
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Qidirish: ism, familiya, participant ID, telefon"
        className="h-10 w-full rounded-xl border-slate-300 bg-background ring-1 ring-slate-200/70 focus-visible:ring-2 focus-visible:ring-electric-blue/35"
      />

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
        <Select value={holat ?? ALL} onValueChange={(value) => replaceWith({ holat: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${holat ? (HOLAT_TRIGGER_STYLES[holat] ?? "") : ""}`}>
            <SelectValue placeholder="Status">{selectedHolatLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha statuslar</SelectItem>
            {HOLAT_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yoshGuruhi ?? ALL} onValueChange={(value) => replaceWith({ yoshGuruhi: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${yoshGuruhi ? (YOSH_TRIGGER_STYLES[yoshGuruhi] ?? "") : ""}`}>
            <SelectValue placeholder="Yosh toifasi">{selectedYoshLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha yoshlar</SelectItem>
            {yoshOptions.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yonalish ?? ALL} onValueChange={(value) => replaceWith({ yonalish: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${yonalish ? (YONALISH_TRIGGER_STYLES[yonalish] ?? "") : ""}`}>
            <SelectValue placeholder="Yo'nalish">{selectedYonalishLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha yo&apos;nalishlar</SelectItem>
            {yonalishOptions.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="lg:col-span-1">
          <AdminDateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={({ dateFrom: nextFrom, dateTo: nextTo }) =>
              replaceWith({ dateFrom: nextFrom, dateTo: nextTo })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-7">
        <Select value={utmType ?? ALL} onValueChange={(value) => replaceWith({ utmType: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${utmType ? (UTM_TRIGGER_STYLES[utmType] ?? "") : ""}`}>
            <SelectValue placeholder="UTM">{selectedUtmLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha UTM</SelectItem>
            {UTM_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={smsStatus ?? ALL} onValueChange={(value) => replaceWith({ smsStatus: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${smsStatus ? (SMS_TRIGGER_STYLES[smsStatus] ?? "") : ""}`}>
            <SelectValue placeholder="SMS">{selectedSmsLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha SMS</SelectItem>
            {SMS_STATUS_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={contactStatus ?? ALL} onValueChange={(value) => replaceWith({ contactStatus: normalizeSelectValue(value) })}>
          <SelectTrigger className={`h-9 rounded-xl ${contactStatus ? (CONTACT_TRIGGER_STYLES[contactStatus] ?? "") : ""}`} aria-label="Aloqa filtri">
            <SelectValue placeholder="Aloqa">{selectedContactLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barcha aloqa</SelectItem>
            {CONTACT_STATUS_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(pageSize ?? 15)} onValueChange={(value) => replaceWith({ pageSize: value || undefined })}>
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue placeholder="Sahifa hajmi">{selectedPageSizeLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 ta</SelectItem>
            <SelectItem value="30">30 ta</SelectItem>
            <SelectItem value="50">50 ta</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy ?? "createdAt"} onValueChange={(value) => replaceWith({ sortBy: value ?? undefined })}>
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue placeholder="Tartiblash turi">{selectedSortByLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_BY_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortDir ?? "desc"} onValueChange={(value) => replaceWith({ sortDir: value ?? undefined })}>
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue placeholder="Tartiblash yo'nalishi">{selectedSortDirLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_DIR_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={Boolean(duplicates)}
              onCheckedChange={(checked) => replaceWith({ duplicates: checked ? "1" : undefined })}
              aria-label="Faqat duplikatlar"
            />
            Faqat duplikatlar
          </label>
          {isFiltered ? (
            <Link
              href="/admin"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-red-400"
            >
              Tozalash
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
