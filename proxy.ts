import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminDomain, getRequestHost } from "@/lib/admin-domain";

export function proxy(request: NextRequest) {
  const host = getRequestHost(request.headers);
  const appDomain = process.env.DOMAIN?.trim().toLowerCase();
  const adminDomain = getAdminDomain();
  const pathWithQuery = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isAdminPath =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/") ||
    request.nextUrl.pathname === "/api/admin" ||
    request.nextUrl.pathname.startsWith("/api/admin/");

  if (host && adminDomain && appDomain && host === appDomain && isAdminPath) {
    return NextResponse.redirect(`https://${adminDomain}${pathWithQuery}`, 308);
  }

  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const isDev = process.env.NODE_ENV === "development";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data: https:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
