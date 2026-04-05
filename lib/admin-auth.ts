import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getRequiredAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME or ADMIN_PASSWORD is not set");
  }

  return { username, password };
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getRequiredAdminCredentials().password;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyAdminCredentials(username: string, password: string) {
  const creds = getRequiredAdminCredentials();
  const leftUser = sha256(username);
  const rightUser = sha256(creds.username);
  const leftPass = sha256(password);
  const rightPass = sha256(creds.password);

  return timingSafeEqual(leftUser, rightUser) && timingSafeEqual(leftPass, rightPass);
}

export function createAdminSessionValue() {
  const { username, password } = getRequiredAdminCredentials();
  const sessionSecret = getSessionSecret();
  return createHmac("sha256", sessionSecret).update(`${username}:${password}`).digest("hex");
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
