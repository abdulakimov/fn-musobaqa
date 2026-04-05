import { createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error("ADMIN_SECRET_KEY is not set");
  }
  return secret;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminSecret();
}

export function createAdminSessionValue() {
  const key = getAdminSecret();
  const sessionSecret = getSessionSecret();
  return createHmac("sha256", sessionSecret).update(key).digest("hex");
}

export function isValidAdminSession(value?: string | null) {
  if (!value) return false;
  if (!/^[a-f0-9]{64}$/i.test(value)) return false;
  const expected = createAdminSessionValue();
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hasAdminSession(cookiesStore: ReadonlyRequestCookies) {
  return isValidAdminSession(cookiesStore.get(ADMIN_SESSION_COOKIE)?.value);
}
