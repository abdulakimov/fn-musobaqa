"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Holat = "KUTILMOQDA" | "TASDIQLANDI" | "RAD_ETILDI";

const ALL = "__ALL__";

const HOLAT_OPTIONS: Array<{ value: Holat; label: string }> = [
  { value: "KUTILMOQDA", label: "Kutilmoqda" },
  { value: "TASDIQLANDI", label: "Tasdiqlandi" },
  { value: "RAD_ETILDI", label: "Rad etildi" },
];

interface AdminFiltersProps {
  holat?: Holat;
  yoshGuruhi?: string;
  yonalish?: string;
  query?: string;
  yoshOptions: [string, string][];
  yonalishOptions: [string, string][];
}

export function AdminFilters({
  holat,
  yoshGuruhi,
  yonalish,
  query,
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
  const normalizeSelectValue = (value: string | null) => (value && value !== ALL ? value : undefined);
  const YOSH_TRIGGER_STYLES: Record<string, string> = {
    YOSH_9_11: "border-indigo-300/80 bg-indigo-50/40 text-indigo-800",
    YOSH_12_14: "border-fuchsia-300/80 bg-fuchsia-50/40 text-fuchsia-800",
    YOSH_9_14: "border-teal-300/80 bg-teal-50/40 text-teal-800",
  };

  const replaceWith = useCallback(
    (updates: Partial<Record<"holat" | "yoshGuruhi" | "yonalish" | "q", string | undefined>>) => {
      const params = new URLSearchParams(searchParams.toString());
      const shouldResetPage = "holat" in updates || "yoshGuruhi" in updates || "yonalish" in updates || "q" in updates;
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

  const isFiltered = Boolean(holat || yoshGuruhi || yonalish || currentQuery);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Qidirish: ism, familiya, participant ID"
        className="h-9 w-full rounded-xl"
      />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <Select value={holat ?? ALL} onValueChange={(value) => replaceWith({ holat: normalizeSelectValue(value) })}>
          <SelectTrigger className="h-9 rounded-xl">
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

        <Select
          value={yoshGuruhi ?? ALL}
          onValueChange={(value) => replaceWith({ yoshGuruhi: normalizeSelectValue(value) })}
        >
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
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue placeholder="Yo&apos;nalish">{selectedYonalishLabel}</SelectValue>
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

        {isFiltered ? (
          <Link
            href="/admin"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-red-300 hover:text-red-400"
          >
            Filtrni o&apos;chirish
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
