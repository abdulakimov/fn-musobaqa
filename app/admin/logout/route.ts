import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { clearedSessionCookieOptions } from "@/lib/session-cookie";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearedSessionCookieOptions());
  return response;
}
