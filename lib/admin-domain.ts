type HeaderLike = {
  get(name: string): string | null;
};

function normalizeHost(rawHost: string | null | undefined) {
  if (!rawHost) return null;
  const first = rawHost.split(",")[0]?.trim().toLowerCase();
  if (!first) return null;
  return first.replace(/:\d+$/, "");
}

export function getAdminDomain() {
  const domain = process.env.ADMIN_DOMAIN?.trim().toLowerCase();
  return domain ? domain : null;
}

export function getRequestHost(headers: HeaderLike) {
  const forwardedHost = normalizeHost(headers.get("x-forwarded-host"));
  if (forwardedHost) return forwardedHost;
  return normalizeHost(headers.get("host"));
}

export function shouldRedirectToAdminDomain(headers: HeaderLike) {
  const adminDomain = getAdminDomain();
  if (!adminDomain) return false;
  const requestHost = getRequestHost(headers);
  if (!requestHost) return false;
  return requestHost !== adminDomain;
}

export function buildAdminAbsoluteUrl(pathnameWithQuery: string) {
  const adminDomain = getAdminDomain();
  if (!adminDomain) {
    throw new Error("ADMIN_DOMAIN is not set");
  }
  const normalizedPath = pathnameWithQuery.startsWith("/") ? pathnameWithQuery : `/${pathnameWithQuery}`;
  return `https://${adminDomain}${normalizedPath}`;
}
