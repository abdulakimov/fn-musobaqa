ALTER TABLE "Royxat"
ADD COLUMN "participantId" VARCHAR(5),
ADD COLUMN "resultStatus" VARCHAR(80),
ADD COLUMN "resultScore" INTEGER,
ADD COLUMN "resultNote" VARCHAR(500),
ADD COLUMN "resultUpdatedAt" TIMESTAMP(3);

CREATE TABLE "IdSequence" (
  "key" VARCHAR(16) NOT NULL DEFAULT 'main',
  "nextMathLetterIndex" INTEGER NOT NULL DEFAULT 0,
  "nextMathNumberIndex" INTEGER NOT NULL DEFAULT 0,
  "nextTypingNumberIndex" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IdSequence_pkey" PRIMARY KEY ("key")
);

INSERT INTO "IdSequence" ("key", "nextMathLetterIndex", "nextMathNumberIndex", "nextTypingNumberIndex", "updatedAt")
VALUES ('main', 0, 0, 0, NOW())
ON CONFLICT ("key") DO NOTHING;

CREATE UNIQUE INDEX "Royxat_participantId_key" ON "Royxat"("participantId");
CREATE INDEX "Royxat_participantId_idx" ON "Royxat"("participantId");