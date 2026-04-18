import type { PrismaClient } from "@prisma/client";
import type { FullRegistrationData } from "@/lib/validations";
import { getCompetitionRules, getRegistrationDeadlineForDirection } from "@/lib/competition";
import { buildNameKey } from "@/lib/name-key";

const MAIN_SEQUENCE_KEY = "main";
const TYPING_LETTERS = ["A", "B", "C", "D"] as const;
const MAX_NUMBER_INDEX = 6560; // 9^4 - 1
const MAX_ID_ATTEMPTS = 24;
const MAX_TRANSACTION_RETRIES = 80;
type SequenceState = {
  nextTypingLetterIndex: number;
  nextTypingNumberIndex: number;
  nextMathKidsNumberIndex: number;
  nextMathTeensNumberIndex: number;
};

type RegistrationCreateData = FullRegistrationData & {
  utmType?: UtmType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

type RegistrationCreateOptions = {
  skipDeadlineCheck?: boolean;
  skipLimitCheck?: boolean;
};
type UtmType = "MAKTAB" | "BANNER" | "ORGANIK";
type TransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export class DuplicatePhoneError extends Error {
  constructor() {
    super("DUPLICATE_PHONE");
  }
}

export class RegistrationClosedError extends Error {
  constructor() {
    super("REGISTRATION_CLOSED");
  }
}

export type LimitReachedCode =
  | "LIMIT_REACHED_TYPING"
  | "LIMIT_REACHED_MATH_9_11"
  | "LIMIT_REACHED_MATH_12_14";

export class LimitReachedError extends Error {
  code: LimitReachedCode;

  constructor(code: LimitReachedCode) {
    super(code);
    this.code = code;
  }
}

function numberFromIndex(index: number) {
  if (index < 0 || index > MAX_NUMBER_INDEX) {
    throw new Error("ID range exhausted");
  }

  let value = index;
  const digits = [0, 0, 0, 0];

  for (let i = 3; i >= 0; i -= 1) {
    digits[i] = (value % 9) + 1;
    value = Math.floor(value / 9);
  }

  return digits.join("");
}

function getTypingCursorAtOffset(seq: { nextTypingLetterIndex: number; nextTypingNumberIndex: number }, offset: number) {
  const letterIndexRaw = seq.nextTypingLetterIndex + offset;
  const letterIndex = letterIndexRaw % TYPING_LETTERS.length;
  const numberIndex = seq.nextTypingNumberIndex + Math.floor(letterIndexRaw / TYPING_LETTERS.length);

  if (numberIndex > MAX_NUMBER_INDEX) {
    throw new Error("Typing ID range exhausted");
  }

  return { letterIndex, numberIndex };
}

function getMathNumberIndexAtOffset(
  seq: { nextMathKidsNumberIndex: number; nextMathTeensNumberIndex: number },
  data: Pick<FullRegistrationData, "yoshGuruhi">,
  offset: number,
) {
  const start = data.yoshGuruhi === "YOSH_9_11" ? seq.nextMathKidsNumberIndex : seq.nextMathTeensNumberIndex;
  const numberIndex = start + offset;
  if (numberIndex > MAX_NUMBER_INDEX) {
    throw new Error("Matematika ID range exhausted");
  }
  return numberIndex;
}

function buildCandidateId(
  seq: SequenceState,
  data: Pick<FullRegistrationData, "yonalish" | "yoshGuruhi">,
  offset: number,
) {
  if (data.yonalish === "TYPING") {
    const { letterIndex, numberIndex } = getTypingCursorAtOffset(seq, offset);
    return `${TYPING_LETTERS[letterIndex]}${numberFromIndex(numberIndex)}`;
  }

  const numberIndex = getMathNumberIndexAtOffset(seq, data, offset);
  const prefix = data.yoshGuruhi === "YOSH_9_11" ? "K" : "T";
  return `${prefix}${numberFromIndex(numberIndex)}`;
}

function buildSequenceUpdate(
  seq: SequenceState,
  data: Pick<FullRegistrationData, "yonalish" | "yoshGuruhi">,
  consumedSteps: number,
) {
  if (data.yonalish === "TYPING") {
    const { letterIndex, numberIndex } = getTypingCursorAtOffset(seq, consumedSteps);
    return {
      nextTypingLetterIndex: letterIndex,
      nextTypingNumberIndex: numberIndex,
      nextMathKidsNumberIndex: seq.nextMathKidsNumberIndex,
      nextMathTeensNumberIndex: seq.nextMathTeensNumberIndex,
    };
  }

  const advanced = getMathNumberIndexAtOffset(seq, data, consumedSteps);
  return {
    nextTypingLetterIndex: seq.nextTypingLetterIndex,
    nextTypingNumberIndex: seq.nextTypingNumberIndex,
    nextMathKidsNumberIndex: data.yoshGuruhi === "YOSH_9_11" ? advanced : seq.nextMathKidsNumberIndex,
    nextMathTeensNumberIndex: data.yoshGuruhi === "YOSH_12_14" ? advanced : seq.nextMathTeensNumberIndex,
  };
}

async function createWithGeneratedId(
  tx: TransactionClient,
  data: RegistrationCreateData,
  options: RegistrationCreateOptions = {},
) {
  const rules = getCompetitionRules();
  const deadline = getRegistrationDeadlineForDirection(data.yonalish);
  if (!options.skipDeadlineCheck && Date.now() > deadline.getTime()) {
    throw new RegistrationClosedError();
  }

  await tx.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IdSequence" (
      "key" VARCHAR(16) NOT NULL PRIMARY KEY,
      "nextTypingLetterIndex" INTEGER NOT NULL DEFAULT 0,
      "nextTypingNumberIndex" INTEGER NOT NULL DEFAULT 0,
      "nextMathKidsNumberIndex" INTEGER NOT NULL DEFAULT 0,
      "nextMathTeensNumberIndex" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);

  await tx.$executeRawUnsafe(`ALTER TABLE "IdSequence" ADD COLUMN IF NOT EXISTS "nextTypingLetterIndex" INTEGER NOT NULL DEFAULT 0`);
  await tx.$executeRawUnsafe(`ALTER TABLE "IdSequence" ADD COLUMN IF NOT EXISTS "nextTypingNumberIndex" INTEGER NOT NULL DEFAULT 0`);
  await tx.$executeRawUnsafe(`ALTER TABLE "IdSequence" ADD COLUMN IF NOT EXISTS "nextMathKidsNumberIndex" INTEGER NOT NULL DEFAULT 0`);
  await tx.$executeRawUnsafe(`ALTER TABLE "IdSequence" ADD COLUMN IF NOT EXISTS "nextMathTeensNumberIndex" INTEGER NOT NULL DEFAULT 0`);

  const existingPhone = await tx.royxat.findFirst({
    where: { telefon: data.telefon, deletedAt: null },
    select: { id: true },
  });

  if (existingPhone) {
    throw new DuplicatePhoneError();
  }

  await tx.$executeRaw`
    INSERT INTO "IdSequence" ("key", "nextTypingLetterIndex", "nextTypingNumberIndex", "nextMathKidsNumberIndex", "nextMathTeensNumberIndex", "updatedAt")
    VALUES (${MAIN_SEQUENCE_KEY}, 0, 0, 0, 0, NOW())
    ON CONFLICT ("key") DO NOTHING
  `;

  const sequenceRows = await tx.$queryRaw<SequenceState[]>`
    SELECT "nextTypingLetterIndex", "nextTypingNumberIndex", "nextMathKidsNumberIndex", "nextMathTeensNumberIndex"
    FROM "IdSequence"
    WHERE "key" = ${MAIN_SEQUENCE_KEY}
    FOR UPDATE
  `;

  const sequence = sequenceRows[0];
  if (!sequence) {
    throw new Error("Failed to load ID sequence state");
  }

  if (!options.skipLimitCheck && data.yonalish === "TYPING") {
    const typingCount = await tx.royxat.count({
      where: { yonalish: "TYPING" },
    });
    if (typingCount >= rules.limits.typing) {
      throw new LimitReachedError("LIMIT_REACHED_TYPING");
    }
  } else if (!options.skipLimitCheck && data.yoshGuruhi === "YOSH_9_11") {
    const mathKidsCount = await tx.royxat.count({
      where: { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_9_11" },
    });
    if (mathKidsCount >= rules.limits.math9_11) {
      throw new LimitReachedError("LIMIT_REACHED_MATH_9_11");
    }
  } else if (!options.skipLimitCheck && data.yoshGuruhi === "YOSH_12_14") {
    const mathTeensCount = await tx.royxat.count({
      where: { yonalish: "MATEMATIKA", yoshGuruhi: "YOSH_12_14" },
    });
    if (mathTeensCount >= rules.limits.math12_14) {
      throw new LimitReachedError("LIMIT_REACHED_MATH_12_14");
    }
  }

  for (let offset = 0; offset < MAX_ID_ATTEMPTS; offset += 1) {
    const participantId = buildCandidateId(sequence, data, offset);
    const exists = await tx.royxat.findFirst({
      where: { participantId },
      select: { id: true },
    });

    if (exists) {
      continue;
    }

    const created = await tx.royxat.create({
      data: {
        ...data,
        nameKey: buildNameKey(data),
        utmType: data.utmType ?? "ORGANIK",
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        participantId,
      },
    });

    const nextSequence = buildSequenceUpdate(sequence, data, offset + 1);

    await tx.$executeRaw`
      UPDATE "IdSequence"
      SET
        "nextTypingLetterIndex" = ${nextSequence.nextTypingLetterIndex},
        "nextTypingNumberIndex" = ${nextSequence.nextTypingNumberIndex},
        "nextMathKidsNumberIndex" = ${nextSequence.nextMathKidsNumberIndex},
        "nextMathTeensNumberIndex" = ${nextSequence.nextMathTeensNumberIndex},
        "updatedAt" = NOW()
      WHERE "key" = ${MAIN_SEQUENCE_KEY}
    `;

    return created;
  }

  throw new Error("Participant ID generation failed: candidate window exhausted");
}

function isRetryableTransactionError(error: unknown) {
  const code = getPrismaErrorCode(error);
  if (!code) return false;
  if (code === "P2034") return true;
  if (code === "P2010") {
    const meta = JSON.stringify(getPrismaErrorMeta(error));
    return meta.includes("40001") || meta.includes("TransactionWriteConflict");
  }

  return false;
}

function isDuplicatePhoneConstraint(error: unknown) {
  if (getPrismaErrorCode(error) !== "P2002") return false;
  const meta = JSON.stringify(getPrismaErrorMeta(error));
  return meta.includes("telefon");
}

function getPrismaErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function getPrismaErrorMeta(error: unknown): unknown {
  if (typeof error !== "object" || error === null) return null;
  return (error as { meta?: unknown }).meta ?? null;
}

export async function createRegistrationWithId(
  db: PrismaClient,
  data: RegistrationCreateData,
  options: RegistrationCreateOptions = {},
) {
  for (let attempt = 0; attempt < MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await db.$transaction(
        async (tx) => createWithGeneratedId(tx, data, options),
        {}
      );
    } catch (error) {
      if (
        error instanceof DuplicatePhoneError ||
        error instanceof RegistrationClosedError ||
        error instanceof LimitReachedError
      ) {
        throw error;
      }
      if (isDuplicatePhoneConstraint(error)) {
        throw new DuplicatePhoneError();
      }
      if (isRetryableTransactionError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Participant ID generation failed after retries");
}
