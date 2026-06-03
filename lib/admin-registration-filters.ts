import type { Prisma } from "@prisma/client";

export const HOLAT_VALUES = ["KUTILMOQDA", "TASDIQLANDI", "RAD_ETILDI"] as const;
export const YOSH_VALUES = ["YOSH_9_11", "YOSH_12_14", "YOSH_9_14"] as const;
export const YONALISH_VALUES = ["MATEMATIKA", "TYPING"] as const;
export const UTM_TYPE_VALUES = ["MAKTAB", "BANNER", "ORGANIK"] as const;
export const SMS_STATUS_VALUES = ["PENDING", "SENT", "FAILED"] as const;
export const CONTACT_STATUS_VALUES = ["BOGLANILMAGAN", "BOGLANIB_BOLMADI", "QAYTA_ALOQA", "BOGLANILGAN"] as const;
export const KELISH_STATUS_VALUES = ["KELGAN", "KELMADI"] as const;
export const SORT_BY_VALUES = ["createdAt", "resultScore", "resultUpdatedAt", "resultStatus"] as const;
export const SORT_DIR_VALUES = ["asc", "desc"] as const;
export const PAGE_SIZE_VALUES = [15, 30, 50] as const;
export const DEFAULT_PAGE_SIZE = 15;

type SearchParamRecord = Record<string, string | string[] | undefined>;

interface SearchParamsLike {
  get(name: string): string | null;
}

export type AdminRegistrationsFilters = {
  holat?: (typeof HOLAT_VALUES)[number];
  contactStatus?: (typeof CONTACT_STATUS_VALUES)[number];
  yoshGuruhi?: (typeof YOSH_VALUES)[number];
  yonalish?: (typeof YONALISH_VALUES)[number];
  utmType?: (typeof UTM_TYPE_VALUES)[number];
  smsStatus?: (typeof SMS_STATUS_VALUES)[number];
  kelishStatus?: (typeof KELISH_STATUS_VALUES)[number];
  q: string;
  page: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy: (typeof SORT_BY_VALUES)[number];
  sortDir: (typeof SORT_DIR_VALUES)[number];
  duplicatesOnly: boolean;
};

function parseEnum<T extends readonly string[]>(raw: string | undefined, values: T): T[number] | undefined {
  if (!raw) return undefined;
  return (values as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
}

function getFromRecord(record: SearchParamRecord, key: string): string | undefined {
  const value = record[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function readParam(source: SearchParamRecord | SearchParamsLike, key: string): string | undefined {
  if (typeof (source as SearchParamsLike).get === "function") {
    return (source as SearchParamsLike).get(key) ?? undefined;
  }
  return getFromRecord(source as SearchParamRecord, key);
}

function parsePage(raw: string | undefined) {
  const numeric = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(numeric) || numeric < 1) return 1;
  return numeric;
}

function parsePageSize(raw: string | undefined) {
  const numeric = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(numeric)) return DEFAULT_PAGE_SIZE;
  if (!PAGE_SIZE_VALUES.includes(numeric as (typeof PAGE_SIZE_VALUES)[number])) return DEFAULT_PAGE_SIZE;
  return numeric;
}

function parseDateInput(raw: string | undefined) {
  const value = (raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function getSanitizedSearchQuery(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  return value.slice(0, 80);
}

function getDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function getSearchTokens(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .slice(0, 6);
}

function tashkentDayStart(value: string) {
  return new Date(`${value}T00:00:00+05:00`);
}

export function parseAdminRegistrationsFilters(
  source: SearchParamRecord | SearchParamsLike,
): AdminRegistrationsFilters {
  return {
    holat: parseEnum(readParam(source, "holat"), HOLAT_VALUES),
    contactStatus: parseEnum(readParam(source, "contactStatus"), CONTACT_STATUS_VALUES),
    yoshGuruhi: parseEnum(readParam(source, "yoshGuruhi"), YOSH_VALUES),
    yonalish: parseEnum(readParam(source, "yonalish"), YONALISH_VALUES),
    utmType: parseEnum(readParam(source, "utmType"), UTM_TYPE_VALUES),
    smsStatus: parseEnum(readParam(source, "smsStatus"), SMS_STATUS_VALUES),
    kelishStatus: parseEnum(readParam(source, "kelishStatus"), KELISH_STATUS_VALUES),
    q: getSanitizedSearchQuery(readParam(source, "q")),
    page: parsePage(readParam(source, "page")),
    pageSize: parsePageSize(readParam(source, "pageSize")),
    dateFrom: parseDateInput(readParam(source, "dateFrom")),
    dateTo: parseDateInput(readParam(source, "dateTo")),
    sortBy: parseEnum(readParam(source, "sortBy"), SORT_BY_VALUES) ?? "createdAt",
    sortDir: parseEnum(readParam(source, "sortDir"), SORT_DIR_VALUES) ?? "desc",
    duplicatesOnly: readParam(source, "duplicates") === "1",
  };
}

export function buildAdminRegistrationsSearchOr(searchQuery: string): Prisma.RoyxatWhereInput[] {
  const digitsQuery = getDigitsOnly(searchQuery);
  const tokens = getSearchTokens(searchQuery);

  const directConditions: Prisma.RoyxatWhereInput[] = [
    { ism: { contains: searchQuery, mode: "insensitive" } },
    { familiya: { contains: searchQuery, mode: "insensitive" } },
    { otasiningIsmi: { contains: searchQuery, mode: "insensitive" } },
    { participantId: { contains: searchQuery, mode: "insensitive" } },
    { telefon: { contains: searchQuery } },
  ];

  if (digitsQuery && digitsQuery !== searchQuery) {
    directConditions.push({ telefon: { contains: digitsQuery } });
  }

  if (tokens.length <= 1) {
    return directConditions;
  }

  return [
    ...directConditions,
    {
      AND: tokens.map((token) => ({
        OR: [
          { ism: { contains: token, mode: "insensitive" } },
          { familiya: { contains: token, mode: "insensitive" } },
          { otasiningIsmi: { contains: token, mode: "insensitive" } },
          { participantId: { contains: token, mode: "insensitive" } },
        ],
      })),
    },
  ];
}

export function buildAdminRegistrationsWhere(filters: AdminRegistrationsFilters): Prisma.RoyxatWhereInput {
  const where: Prisma.RoyxatWhereInput = { deletedAt: null };

  if (filters.holat) where.holat = filters.holat;
  if (filters.contactStatus) where.aloqaStatus = filters.contactStatus;
  if (filters.yoshGuruhi) where.yoshGuruhi = filters.yoshGuruhi;
  if (filters.yonalish) where.yonalish = filters.yonalish;
  if (filters.utmType) where.utmType = filters.utmType;
  if (filters.smsStatus) where.smsStatus = filters.smsStatus;
  if (filters.kelishStatus) where.kelishStatus = filters.kelishStatus;
  if (filters.dateFrom || filters.dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) {
      createdAt.gte = tashkentDayStart(filters.dateFrom);
    }
    if (filters.dateTo) {
      createdAt.lt = new Date(tashkentDayStart(filters.dateTo).getTime() + 24 * 60 * 60 * 1000);
    }
    where.createdAt = createdAt;
  }
  if (filters.q) {
    where.OR = buildAdminRegistrationsSearchOr(filters.q);
  }

  return where;
}

export function buildAdminRegistrationsOrderBy(
  filters: Pick<AdminRegistrationsFilters, "sortBy" | "sortDir">,
): Prisma.RoyxatOrderByWithRelationInput[] {
  if (filters.sortBy === "createdAt") {
    return [{ createdAt: filters.sortDir }];
  }
  if (filters.sortBy === "resultScore") {
    return [{ resultScore: { sort: filters.sortDir, nulls: "last" } }, { createdAt: "desc" }];
  }
  if (filters.sortBy === "resultUpdatedAt") {
    return [{ resultUpdatedAt: { sort: filters.sortDir, nulls: "last" } }, { createdAt: "desc" }];
  }
  return [{ resultStatus: { sort: filters.sortDir, nulls: "last" } }, { createdAt: "desc" }];
}

type BuildQueryOptions = {
  includePageSize?: boolean;
  includeSort?: boolean;
};

export function buildAdminRegistrationsFilterQuery(
  filters: AdminRegistrationsFilters,
  options: BuildQueryOptions = {},
) {
  const includePageSize = options.includePageSize ?? true;
  const includeSort = options.includeSort ?? true;

  return {
    ...(filters.holat ? { holat: filters.holat } : {}),
    ...(filters.contactStatus ? { contactStatus: filters.contactStatus } : {}),
    ...(filters.yoshGuruhi ? { yoshGuruhi: filters.yoshGuruhi } : {}),
    ...(filters.yonalish ? { yonalish: filters.yonalish } : {}),
    ...(filters.utmType ? { utmType: filters.utmType } : {}),
    ...(filters.smsStatus ? { smsStatus: filters.smsStatus } : {}),
    ...(filters.kelishStatus ? { kelishStatus: filters.kelishStatus } : {}),
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(includeSort ? { sortBy: filters.sortBy, sortDir: filters.sortDir } : {}),
    ...(includePageSize && filters.pageSize !== DEFAULT_PAGE_SIZE ? { pageSize: String(filters.pageSize) } : {}),
    ...(filters.duplicatesOnly ? { duplicates: "1" } : {}),
  };
}
