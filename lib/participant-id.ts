import { Prisma, Yonalish, type PrismaClient } from "@prisma/client";
import type { FullRegistrationData } from "@/lib/validations";

const MAIN_SEQUENCE_KEY = "main";
const MATH_LETTERS = ["A", "B", "C", "D"] as const;
const MAX_NUMBER_INDEX = 6560; // 9^4 - 1
const MAX_ATTEMPTS = 24;
type SequenceState = {
  nextMathLetterIndex: number;
  nextMathNumberIndex: number;
  nextTypingNumberIndex: number;
};

export class DuplicatePhoneError extends Error {
  constructor() {
    super("DUPLICATE_PHONE");
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

function getMathCursorAtOffset(seq: { nextMathLetterIndex: number; nextMathNumberIndex: number }, offset: number) {
  const letterIndexRaw = seq.nextMathLetterIndex + offset;
  const letterIndex = letterIndexRaw % MATH_LETTERS.length;
  const numberIndex = seq.nextMathNumberIndex + Math.floor(letterIndexRaw / MATH_LETTERS.length);

  if (numberIndex > MAX_NUMBER_INDEX) {
    throw new Error("Matematika ID range exhausted");
  }

  return { letterIndex, numberIndex };
}

function getTypingNumberIndexAtOffset(seq: { nextTypingNumberIndex: number }, offset: number) {
  const numberIndex = seq.nextTypingNumberIndex + offset;
  if (numberIndex > MAX_NUMBER_INDEX) {
    throw new Error("Typing ID range exhausted");
  }
  return numberIndex;
}

function buildCandidateId(
  seq: { nextMathLetterIndex: number; nextMathNumberIndex: number; nextTypingNumberIndex: number },
  yonalish: Yonalish,
  offset: number
) {
  if (yonalish === "TYPING") {
    const numberIndex = getTypingNumberIndexAtOffset(seq, offset);
    return `T${numberFromIndex(numberIndex)}`;
  }

  const { letterIndex, numberIndex } = getMathCursorAtOffset(seq, offset);
  return `${MATH_LETTERS[letterIndex]}${numberFromIndex(numberIndex)}`;
}

function buildSequenceUpdate(
  seq: { nextMathLetterIndex: number; nextMathNumberIndex: number; nextTypingNumberIndex: number },
  yonalish: Yonalish,
  consumedSteps: number
) {
  if (yonalish === "TYPING") {
    return {
      nextMathLetterIndex: seq.nextMathLetterIndex,
      nextMathNumberIndex: seq.nextMathNumberIndex,
      nextTypingNumberIndex: seq.nextTypingNumberIndex + consumedSteps,
    };
  }

  const { letterIndex, numberIndex } = getMathCursorAtOffset(seq, consumedSteps);
  return {
    nextMathLetterIndex: letterIndex,
    nextMathNumberIndex: numberIndex,
    nextTypingNumberIndex: seq.nextTypingNumberIndex,
  };
}

async function createWithGeneratedId(tx: Prisma.TransactionClient, data: FullRegistrationData) {
  await tx.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IdSequence" (
      "key" VARCHAR(16) NOT NULL PRIMARY KEY,
      "nextMathLetterIndex" INTEGER NOT NULL DEFAULT 0,
      "nextMathNumberIndex" INTEGER NOT NULL DEFAULT 0,
      "nextTypingNumberIndex" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);

  const existingPhone = await tx.royxat.findUnique({
    where: { telefon: data.telefon },
    select: { id: true },
  });

  if (existingPhone) {
    throw new DuplicatePhoneError();
  }

  await tx.$executeRaw`
    INSERT INTO "IdSequence" ("key", "nextMathLetterIndex", "nextMathNumberIndex", "nextTypingNumberIndex", "updatedAt")
    VALUES (${MAIN_SEQUENCE_KEY}, 0, 0, 0, NOW())
    ON CONFLICT ("key") DO NOTHING
  `;

  const sequenceRows = await tx.$queryRaw<SequenceState[]>`
    SELECT "nextMathLetterIndex", "nextMathNumberIndex", "nextTypingNumberIndex"
    FROM "IdSequence"
    WHERE "key" = ${MAIN_SEQUENCE_KEY}
    FOR UPDATE
  `;

  const sequence = sequenceRows[0];
  if (!sequence) {
    throw new Error("Failed to load ID sequence state");
  }

  for (let offset = 0; offset < MAX_ATTEMPTS; offset += 1) {
    const participantId = buildCandidateId(sequence, data.yonalish, offset);
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
        participantId,
      },
    });

    const nextSequence = buildSequenceUpdate(sequence, data.yonalish, offset + 1);

    await tx.$executeRaw`
      UPDATE "IdSequence"
      SET
        "nextMathLetterIndex" = ${nextSequence.nextMathLetterIndex},
        "nextMathNumberIndex" = ${nextSequence.nextMathNumberIndex},
        "nextTypingNumberIndex" = ${nextSequence.nextTypingNumberIndex},
        "updatedAt" = NOW()
      WHERE "key" = ${MAIN_SEQUENCE_KEY}
    `;

    return created;
  }

  throw new Error("Participant ID generation failed: candidate window exhausted");
}

function isRetryableTransactionError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code === "P2034") return true;

  if (error.code === "P2010") {
    const meta = JSON.stringify(error.meta ?? {});
    return meta.includes("40001") || meta.includes("TransactionWriteConflict");
  }

  return false;
}

function isDuplicatePhoneConstraint(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const meta = JSON.stringify(error.meta ?? {});
  return meta.includes("telefon");
}

export async function createRegistrationWithId(db: PrismaClient, data: FullRegistrationData) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await db.$transaction(
        async (tx) => createWithGeneratedId(tx, data),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error) {
      if (error instanceof DuplicatePhoneError) {
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
