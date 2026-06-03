export type UtmType = "MAKTAB" | "BANNER" | "ORGANIK";

export interface UtmRaw {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface UtmMeta extends Partial<UtmRaw> {
  utmType: UtmType;
}

export const UTM_COOKIE_NAME = "utm_touch";
const ALLOWED_SOURCE = new Set(["maktab", "kocha-banner"]);
const ALLOWED_MEDIUM = "flayer";
const ALLOWED_CAMPAIGN = "musobaqa";

function normalize(raw: string | null | undefined) {
  return (raw ?? "").trim().toLowerCase();
}

export function deriveUtmType(source: string | null | undefined): UtmType {
  const normalized = normalize(source);
  if (normalized === "maktab") return "MAKTAB";
  if (normalized === "kocha-banner") return "BANNER";
  return "ORGANIK";
}

export function getValidUtmFromQuery(params: URLSearchParams): UtmRaw | null {
  const utmSource = normalize(params.get("utm_source"));
  const utmMedium = normalize(params.get("utm_medium"));
  const utmCampaign = normalize(params.get("utm_campaign"));

  if (!ALLOWED_SOURCE.has(utmSource)) return null;
  if (utmMedium !== ALLOWED_MEDIUM) return null;
  if (utmCampaign !== ALLOWED_CAMPAIGN) return null;

  return { utmSource, utmMedium, utmCampaign };
}

export function serializeUtmCookie(raw: UtmRaw) {
  const params = new URLSearchParams();
  params.set("utm_source", raw.utmSource);
  params.set("utm_medium", raw.utmMedium);
  params.set("utm_campaign", raw.utmCampaign);
  return params.toString();
}

export function parseUtmCookie(value: string | undefined): UtmRaw | null {
  if (!value) return null;
  const params = new URLSearchParams(value);
  const utmSource = normalize(params.get("utm_source"));
  const utmMedium = normalize(params.get("utm_medium"));
  const utmCampaign = normalize(params.get("utm_campaign"));

  if (!utmSource || !utmMedium || !utmCampaign) return null;
  return { utmSource, utmMedium, utmCampaign };
}

export function toUtmMeta(raw: UtmRaw | null): UtmMeta {
  if (!raw) {
    return { utmType: "ORGANIK" };
  }
  return {
    utmType: deriveUtmType(raw.utmSource),
    utmSource: raw.utmSource,
    utmMedium: raw.utmMedium,
    utmCampaign: raw.utmCampaign,
  };
}
