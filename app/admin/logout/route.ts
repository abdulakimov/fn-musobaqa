import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { clearedSessionCookieOptions } from "@/lib/session-cookie";

export async function POST() {
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/admin/login",
      "Cache-Control": "no-store",
    },
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearedSessionCookieOptions());
  return response;
}
