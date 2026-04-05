import { createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { PARTICIPANT_MAX_AGE_SECONDS } from "@/lib/session-cookie";

export const PARTICIPANT_SESSION_COOKIE = "participant_session";

function getParticipantSessionSecret() {
  const secret = process.env.PARTICIPANT_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error("PARTICIPANT_SESSION_SECRET (or ADMIN secret) is not set");
  }
  return secret;
}

function signParticipantPayload(payload: string) {
  return createHmac("sha256", getParticipantSessionSecret()).update(payload).digest("hex");
}

export function createParticipantSessionValue(participantRecordId: string) {
  const exp = Math.floor(Date.now() / 1000) + PARTICIPANT_MAX_AGE_SECONDS;
  const payload = `${participantRecordId}.${exp}`;
  const signature = signParticipantPayload(payload);
  return `${payload}.${signature}`;
}

export function getParticipantRecordIdFromSession(value?: string | null) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [participantRecordId, expRaw, signature] = parts;
  if (!participantRecordId || !expRaw || !signature) return null;
  if (!/^\d+$/.test(expRaw)) return null;
  if (!/^[a-f0-9]{64}$/i.test(signature)) return null;

  const exp = Number(expRaw);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(exp) || exp <= now) return null;

  const payload = `${participantRecordId}.${expRaw}`;
  const expectedSignature = signParticipantPayload(payload);

  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length) return null;
  if (!timingSafeEqual(left, right)) return null;

  return participantRecordId;
}

export function hasParticipantSession(cookiesStore: ReadonlyRequestCookies) {
  return !!getParticipantRecordIdFromSession(cookiesStore.get(PARTICIPANT_SESSION_COOKIE)?.value);
}
