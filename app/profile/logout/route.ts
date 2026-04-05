import { NextResponse } from "next/server";
import { PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-auth";
import { clearedSessionCookieOptions } from "@/lib/session-cookie";

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath) return "/";
  if (!nextPath.startsWith("/")) return "/";
  if (nextPath.startsWith("//")) return "/";
  return nextPath;
}

function clearSessionAndRedirect(nextPath: string | null) {
  const safeNext = sanitizeNextPath(nextPath);
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: safeNext,
      "Cache-Control": "no-store",
    },
  });
  response.cookies.set(PARTICIPANT_SESSION_COOKIE, "", clearedSessionCookieOptions());
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return clearSessionAndRedirect(url.searchParams.get("next"));
}

export async function POST() {
  return clearSessionAndRedirect("/");
}
