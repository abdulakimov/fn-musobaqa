-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "UtmType" AS ENUM ('MAKTAB', 'BANNER', 'ORGANIK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Royxat"
  ADD COLUMN IF NOT EXISTS "utmType" "UtmType" NOT NULL DEFAULT 'ORGANIK',
  ADD COLUMN IF NOT EXISTS "utmSource" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "utmMedium" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "utmCampaign" VARCHAR(64);

-- Backfill existing rows
UPDATE "Royxat"
SET "utmType" = 'ORGANIK'
WHERE "utmType" IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS "Royxat_utmType_createdAt_idx" ON "Royxat"("utmType", "createdAt");
CREATE INDEX IF NOT EXISTS "Royxat_utmSource_idx" ON "Royxat"("utmSource");
