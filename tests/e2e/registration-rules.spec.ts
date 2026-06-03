import { test, expect } from "@playwright/test";
import { getCompetitionRules, isRegistrationClosed } from "@/lib/competition";
import { getVisitScheduleForParticipantId } from "@/lib/visit-schedule";
import { deriveUtmType } from "@/lib/utm";

function withEnv<T>(updates: Partial<Record<string, string | undefined>>, run: () => T): T {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(updates)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }

  try {
    return run();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
        continue;
      }
      process.env[key] = value;
    }
  }
}

test("visit schedule maps prefixes to expected times", async () => {
  expect(getVisitScheduleForParticipantId("A1234")?.scheduledAt).toBe("2026-04-19T09:00:00+05:00");
  expect(getVisitScheduleForParticipantId("B1234")?.scheduledAt).toBe("2026-04-19T10:00:00+05:00");
  expect(getVisitScheduleForParticipantId("C1234")?.scheduledAt).toBe("2026-04-19T11:00:00+05:00");
  expect(getVisitScheduleForParticipantId("D1234")?.scheduledAt).toBe("2026-04-19T12:00:00+05:00");
  expect(getVisitScheduleForParticipantId("K1234")?.scheduledAt).toBe("2026-04-18T09:00:00+05:00");
  expect(getVisitScheduleForParticipantId("T1234")?.scheduledAt).toBe("2026-04-18T11:00:00+05:00");
  expect(getVisitScheduleForParticipantId("Z1234")).toBeNull();
});

test("registration deadline comparator is strict after cutoff", async () => {
  withEnv({ REGISTRATION_DEADLINE_TASHKENT: "2026-04-16T23:59:59+05:00" }, () => {
    const before = new Date("2026-04-16T18:59:59Z"); // 23:59:59 +05:00
    const after = new Date("2026-04-16T19:00:00Z"); // 00:00:00 +05:00 (17-aprel)

    expect(isRegistrationClosed(before)).toBeFalsy();
    expect(isRegistrationClosed(after)).toBeTruthy();
  });
});

test("typing deadline uses extended cutoff", async () => {
  withEnv(
    {
      REGISTRATION_DEADLINE_TASHKENT: "2026-04-16T23:59:59+05:00",
      TYPING_REGISTRATION_DEADLINE_TASHKENT: "2026-04-17T18:00:00+05:00",
    },
    () => {
      const beforeTypingCutoff = new Date("2026-04-17T12:59:59Z"); // 17:59:59 +05:00
      const afterTypingCutoff = new Date("2026-04-17T13:00:01Z"); // 18:00:01 +05:00

      expect(isRegistrationClosed(beforeTypingCutoff, "TYPING")).toBeFalsy();
      expect(isRegistrationClosed(afterTypingCutoff, "TYPING")).toBeTruthy();
      expect(isRegistrationClosed(afterTypingCutoff, "MATEMATIKA")).toBeTruthy();
    },
  );
});

test("utm source maps to expected type", async () => {
  expect(deriveUtmType("maktab")).toBe("MAKTAB");
  expect(deriveUtmType("kocha-banner")).toBe("BANNER");
  expect(deriveUtmType("unknown")).toBe("ORGANIK");
});

test("registration limits use defaults and accept env overrides", async () => {
  const oldTyping = process.env.LIMIT_TYPING;
  const oldMath9_11 = process.env.LIMIT_MATH_9_11;
  const oldMath12_14 = process.env.LIMIT_MATH_12_14;
  const oldTypingDeadline = process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT;

  try {
    delete process.env.LIMIT_TYPING;
    delete process.env.LIMIT_MATH_9_11;
    delete process.env.LIMIT_MATH_12_14;
    delete process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT;
    let rules = getCompetitionRules();
    expect(rules.limits.typing).toBe(512);
    expect(rules.limits.math9_11).toBe(450);
    expect(rules.limits.math12_14).toBe(450);
    expect(rules.typingRegistrationDeadline.toISOString()).toBe("2026-04-17T13:00:00.000Z");

    process.env.LIMIT_TYPING = "2";
    process.env.LIMIT_MATH_9_11 = "3";
    process.env.LIMIT_MATH_12_14 = "4";
    process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT = "2026-04-18T10:30:00+05:00";
    rules = getCompetitionRules();
    expect(rules.limits.typing).toBe(2);
    expect(rules.limits.math9_11).toBe(3);
    expect(rules.limits.math12_14).toBe(4);
    expect(rules.typingRegistrationDeadline.toISOString()).toBe("2026-04-18T05:30:00.000Z");
  } finally {
    if (oldTyping === undefined) delete process.env.LIMIT_TYPING;
    else process.env.LIMIT_TYPING = oldTyping;

    if (oldMath9_11 === undefined) delete process.env.LIMIT_MATH_9_11;
    else process.env.LIMIT_MATH_9_11 = oldMath9_11;

    if (oldMath12_14 === undefined) delete process.env.LIMIT_MATH_12_14;
    else process.env.LIMIT_MATH_12_14 = oldMath12_14;

    if (oldTypingDeadline === undefined) delete process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT;
    else process.env.TYPING_REGISTRATION_DEADLINE_TASHKENT = oldTypingDeadline;
  }
});
