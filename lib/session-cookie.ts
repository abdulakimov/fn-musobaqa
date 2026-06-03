type SameSite = "lax" | "strict" | "none";

const PARTICIPANT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 8;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function shouldUseSecureCookie(request?: Request) {
  if (!isProduction()) return false;
  if (!request) return true;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.toLowerCase().includes("https");
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return true;
  }
}

function baseCookieOptions(request?: Request) {
  return {
    httpOnly: true,
    sameSite: "lax" as SameSite,
    secure: shouldUseSecureCookie(request),
    path: "/",
  };
}

export function participantSessionCookieOptions(request?: Request) {
  return {
    ...baseCookieOptions(request),
    maxAge: PARTICIPANT_MAX_AGE_SECONDS,
  };
}

export function adminSessionCookieOptions(request?: Request) {
  return {
    ...baseCookieOptions(request),
    maxAge: ADMIN_MAX_AGE_SECONDS,
  };
}

export function clearedSessionCookieOptions(request?: Request) {
  return {
    ...baseCookieOptions(request),
    maxAge: 0,
    expires: new Date(0),
  };
}

export { PARTICIPANT_MAX_AGE_SECONDS, ADMIN_MAX_AGE_SECONDS };
