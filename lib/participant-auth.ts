import { createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const PARTICIPANT_SESSION_COOKIE = "participant_session";

function getParticipantSessionSecret() {
  const secret = process.env.PARTICIPANT_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error("PARTICIPANT_SESSION_SECRET (or ADMIN secret) is not set");
  }
  return secret;
}

function signParticipantKey(participantRecordId: string) {
  return createHmac("sha256", getParticipantSessionSecret()).update(participantRecordId).digest("hex");
}

export function createParticipantSessionValue(participantRecordId: string) {
  return `${participantRecordId}.${signParticipantKey(participantRecordId)}`;
}

export function getParticipantRecordIdFromSession(value?: string | null) {
  if (!value) return null;
  const [participantRecordId, signature] = value.split(".");
  if (!participantRecordId || !signature) return null;

  const expectedSignature = signParticipantKey(participantRecordId);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);

  if (left.length !== right.length) return null;
  if (!timingSafeEqual(left, right)) return null;

  return participantRecordId;
}

export function hasParticipantSession(cookiesStore: ReadonlyRequestCookies) {
  return !!getParticipantRecordIdFromSession(cookiesStore.get(PARTICIPANT_SESSION_COOKIE)?.value);
}