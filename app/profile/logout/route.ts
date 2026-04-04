import { NextResponse } from "next/server";
import { PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/profile/login", request.url));
  response.cookies.delete(PARTICIPANT_SESSION_COOKIE);
  return response;
}