type SameSite = "lax" | "strict" | "none";

const PARTICIPANT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 8;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as SameSite,
    secure: isProduction(),
    path: "/",
  };
}

export function participantSessionCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: PARTICIPANT_MAX_AGE_SECONDS,
  };
}

export function adminSessionCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: ADMIN_MAX_AGE_SECONDS,
  };
}

export function clearedSessionCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  };
}

export { PARTICIPANT_MAX_AGE_SECONDS, ADMIN_MAX_AGE_SECONDS };
