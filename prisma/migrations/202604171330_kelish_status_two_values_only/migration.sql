-- Convert legacy KUTILMOQDA values to KELMADI and shrink enum to two states
UPDATE "Royxat"
SET "kelishStatus" = 'KELMADI'
WHERE "kelishStatus" = 'KUTILMOQDA';

ALTER TABLE "Royxat"
ALTER COLUMN "kelishStatus" DROP DEFAULT;

CREATE TYPE "KelishStatus_new" AS ENUM ('KELGAN', 'KELMADI');

ALTER TABLE "Royxat"
ALTER COLUMN "kelishStatus" TYPE "KelishStatus_new"
USING ("kelishStatus"::text::"KelishStatus_new");

DROP TYPE "KelishStatus";
ALTER TYPE "KelishStatus_new" RENAME TO "KelishStatus";

ALTER TABLE "Royxat"
ALTER COLUMN "kelishStatus" SET DEFAULT 'KELMADI';
