ALTER TABLE "Royxat"
ADD COLUMN IF NOT EXISTS "nameKey" VARCHAR(260);

UPDATE "Royxat"
SET "nameKey" =
  LOWER(REGEXP_REPLACE(TRIM("familiya"), '\\s+', ' ', 'g')) || '|' ||
  LOWER(REGEXP_REPLACE(TRIM("ism"), '\\s+', ' ', 'g')) || '|' ||
  LOWER(REGEXP_REPLACE(TRIM("otasiningIsmi"), '\\s+', ' ', 'g'))
WHERE "nameKey" IS NULL;

ALTER TABLE "Royxat"
ALTER COLUMN "nameKey" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Royxat_nameKey_idx" ON "Royxat"("nameKey");
