const DEFAULT_REGISTRATION_DEADLINE = "2026-04-16T23:59:59+05:00";
const DEFAULT_TYPING_REGISTRATION_DEADLINE = "2026-04-17T18:00:00+05:00";
const DEFAULT_TYPING_LIMIT = 512;
const DEFAULT_MATH_9_11_LIMIT = 450;
const DEFAULT_MATH_12_14_LIMIT = 450;
export type RegistrationDirection = "MATEMATIKA" | "TYPING";

function parseDeadline(raw: string | undefined) {
  const resolved = (raw ?? DEFAULT_REGISTRATION_DEADLINE).trim();
  const date = new Date(resolved);
  if (Number.isNaN(date.getTime())) {
    return new Date(DEFAULT_REGISTRATION_DEADLINE);
  }
  return date;
}

function parseLimit(raw: string | undefined, fallback: number) {
  const parsed = Number.parseInt((raw ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export function getCompetitionRules() {
  const registrationDeadline = parseDeadline(process.env.REGISTRATION_DEADLINE_TASHKENT);
  const typingRegistrationDeadline = parseDeadline(
    process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT ?? DEFAULT_TYPING_REGISTRATION_DEADLINE,
  );
  const limits = {
    typing: parseLimit(process.env.LIMIT_TYPING, DEFAULT_TYPING_LIMIT),
    math9_11: parseLimit(process.env.LIMIT_MATH_9_11, DEFAULT_MATH_9_11_LIMIT),
    math12_14: parseLimit(process.env.LIMIT_MATH_12_14, DEFAULT_MATH_12_14_LIMIT),
  };
  return {
    registrationDeadline,
    typingRegistrationDeadline,
    registrationDeadlineIso: registrationDeadline.toISOString(),
    typingRegistrationDeadlineIso: typingRegistrationDeadline.toISOString(),
    limits,
  };
}

export function getRegistrationDeadlineForDirection(direction: RegistrationDirection) {
  const rules = getCompetitionRules();
  if (direction === "TYPING") {
    return rules.typingRegistrationDeadline;
  }
  return rules.registrationDeadline;
}

export function isRegistrationClosed(now = new Date(), direction: RegistrationDirection = "MATEMATIKA") {
  const deadline = getRegistrationDeadlineForDirection(direction);
  return now.getTime() > deadline.getTime();
}
