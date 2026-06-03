import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fullRegistrationSchema } from "@/lib/validations";
import { ZodError } from "zod";
import {
  submitRegistrationAndWait,
  type RegisterQueueData,
} from "@/lib/register-queue";
import {
  createRegistrationWithId,
  DuplicatePhoneError,
  type LimitReachedCode,
  RegistrationClosedError,
  LimitReachedError,
} from "@/lib/participant-id";
import { getRequestIdFromHeaders, logApiError } from "@/lib/api-log";
import { getVisitScheduleForParticipantId } from "@/lib/visit-schedule";
import { getCompetitionRules, getRegistrationDeadlineForDirection, type RegistrationDirection } from "@/lib/competition";
import { parseUtmCookie, toUtmMeta, UTM_COOKIE_NAME } from "@/lib/utm";
import { enqueueRegistrationSms } from "@/lib/sms-queue";

type SuggestionTarget = {
  yonalish: "MATEMATIKA" | "TYPING";
  yoshGuruhi: "YOSH_9_11" | "YOSH_12_14" | "YOSH_9_14";
};

type LimitSuggestion = SuggestionTarget & {
  label: string;
  remainingSlots: number;
};

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

function formatTashkentDeadlineLabel(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "2026");
  const hour = String(parts.find((part) => part.type === "hour")?.value ?? "00").padStart(2, "0");
  const minute = String(parts.find((part) => part.type === "minute")?.value ?? "00").padStart(2, "0");

  return `${year}-yil ${day}-${UZ_MONTHS[Math.max(0, Math.min(UZ_MONTHS.length - 1, month - 1))]}, ${hour}:${minute}`;
}

function getClosedPayload(direction: RegistrationDirection) {
  const deadline = getRegistrationDeadlineForDirection(direction);
  return {
    error: `Ro'yxatdan o'tish ${formatTashkentDeadlineLabel(deadline)} (Asia/Tashkent) da yopilgan`,
    code: "REGISTRATION_CLOSED",
    direction,
    registrationDeadline: deadline.toISOString(),
  };
}

function getLimitReachedMessage(code: LimitReachedCode) {
  if (code === "LIMIT_REACHED_TYPING") {
    return "Typing yo'nalishi uchun ro'yxatdan o'tish yakunlandi. Barcha o'rinlar to'ldi.";
  }
  if (code === "LIMIT_REACHED_MATH_9_11") {
    return "Matematika 9-11 yosh toifasi uchun ro'yxatdan o'tish yakunlandi. Barcha o'rinlar to'ldi.";
  }
  return "Matematika 12-14 yosh toifasi uchun ro'yxatdan o'tish yakunlandi. Barcha o'rinlar to'ldi.";
}

function getSuggestionCandidates(code: LimitReachedCode): SuggestionTarget[] {
  if (code === "LIMIT_REACHED_MATH_9_11") {
    return [
      { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_12_14" },
      { yonalish: "TYPING", yoshGuruhi: "YOSH_9_14" },
    ];
  }
  if (code === "LIMIT_REACHED_MATH_12_14") {
    return [
      { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_9_11" },
      { yonalish: "TYPING", yoshGuruhi: "YOSH_9_14" },
    ];
  }
  return [
    { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_9_11" },
    { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_12_14" },
  ];
}

function getSuggestionLabel(target: SuggestionTarget) {
  const yonalishLabel = target.yonalish === "MATEMATIKA" ? "Matematika" : "Typing";
  const yoshLabel =
    target.yoshGuruhi === "YOSH_9_11"
      ? "9-11 yosh"
      : target.yoshGuruhi === "YOSH_12_14"
        ? "12-14 yosh"
        : "9-14 yosh";
  return `${yonalishLabel} (${yoshLabel})`;
}

async function buildLimitSuggestions(code: LimitReachedCode): Promise<LimitSuggestion[]> {
  const rules = getCompetitionRules();
  const [typingCount, mathKidsCount, mathTeensCount] = await Promise.all([
    db.royxat.count({ where: { yonalish: "TYPING" } }),
    db.royxat.count({ where: { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_9_11" } }),
    db.royxat.count({ where: { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_12_14" } }),
  ]);

  const remainingByTarget: Record<string, number> = {
    "TYPING:YOSH_9_14": Math.max(0, rules.limits.typing - typingCount),
    "MATEMATIKA:YOSH_9_11": Math.max(0, rules.limits.math9_11 - mathKidsCount),
    "MATEMATIKA:YOSH_12_14": Math.max(0, rules.limits.math12_14 - mathTeensCount),
  };

  return getSuggestionCandidates(code)
    .map((target) => {
      const key = `${target.yonalish}:${target.yoshGuruhi}`;
      const remainingSlots = remainingByTarget[key] ?? 0;
      return {
        ...target,
        label: getSuggestionLabel(target),
        remainingSlots,
      };
    })
    .filter((item) => item.remainingSlots > 0);
}

async function getLimitReachedError(code: string | undefined) {
  if (
    code !== "LIMIT_REACHED_TYPING" &&
    code !== "LIMIT_REACHED_MATH_9_11" &&
    code !== "LIMIT_REACHED_MATH_12_14"
  ) {
    return null;
  }

  return {
    error: getLimitReachedMessage(code),
    code,
    suggestions: await buildLimitSuggestions(code),
  };
}

export async function POST(req: NextRequest) {
  const requestId = getRequestIdFromHeaders(req.headers);
  let submittedDirection: RegistrationDirection = "MATEMATIKA";
  try {
    const body = await req.json();
    const data = fullRegistrationSchema.parse(body);
    submittedDirection = data.yonalish;
    const queueEnabled = Boolean(process.env.REDIS_URL) && process.env.REGISTER_QUEUE_ENABLED !== "0";
    const utmFromCookie = parseUtmCookie(req.cookies.get(UTM_COOKIE_NAME)?.value);
    const utmMeta = toUtmMeta(utmFromCookie);
    const registerData: RegisterQueueData = {
      ...data,
      ...utmMeta,
    };

    const result = queueEnabled
      ? await submitRegistrationAndWait(registerData)
      : {
          ok: true as const,
          data: await createRegistrationWithId(db, registerData),
        };
    if (!result.ok) {
      if (result.code === "DUPLICATE_PHONE") {
        return NextResponse.json(
          { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
          { status: 409, headers: { "x-request-id": requestId } }
        );
      }
      if (result.code === "REGISTRATION_CLOSED") {
        return NextResponse.json(
          getClosedPayload(registerData.yonalish),
          { status: 403, headers: { "x-request-id": requestId } }
        );
      }
      const limitReachedError = await getLimitReachedError(result.code);
      if (limitReachedError) {
        return NextResponse.json(limitReachedError, {
          status: 403,
          headers: { "x-request-id": requestId },
        });
      }
      return NextResponse.json(
        { error: result.message ?? "Server xatosi yuz berdi" },
        { status: 500, headers: { "x-request-id": requestId } }
      );
    }

    if (!queueEnabled) {
      try {
        await enqueueRegistrationSms({
          registrationId: result.data.id,
          phone: registerData.telefon,
          participantId: result.data.participantId ?? "",
          ism: registerData.ism,
          familiya: registerData.familiya,
          otasiningIsmi: registerData.otasiningIsmi,
        });
      } catch (smsQueueError) {
        await db.royxat.update({
          where: { id: result.data.id },
          data: {
            smsStatus: "FAILED",
            smsError: (smsQueueError instanceof Error ? smsQueueError.message : "SMS queue error").slice(0, 300),
          },
        });
      }
    }

    const visit = getVisitScheduleForParticipantId(result.data.participantId ?? "");
    const rules = getCompetitionRules();
    return NextResponse.json(
      {
        success: true,
        id: result.data.id,
        participantId: result.data.participantId,
        visit,
        warning: "Belgilangan vaqtda kelmasangiz, qayta qo'shish imkoni bo'lmaydi.",
        registrationDeadline: rules.registrationDeadlineIso,
      },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  } catch (error) {
    if (error instanceof DuplicatePhoneError) {
      return NextResponse.json(
        { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
        { status: 409, headers: { "x-request-id": requestId } }
      );
    }
    if (error instanceof RegistrationClosedError) {
      return NextResponse.json(
        getClosedPayload(submittedDirection),
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }
    if (error instanceof LimitReachedError) {
      const payload = await getLimitReachedError(error.code);
      return NextResponse.json(
        payload ?? { error: "Ro'yxatdan o'tish yakunlangan", code: error.code },
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.flatten() }, { status: 422, headers: { "x-request-id": requestId } });
    }
    logApiError("register", requestId, error);
    return NextResponse.json({ error: "Server xatosi yuz berdi" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
