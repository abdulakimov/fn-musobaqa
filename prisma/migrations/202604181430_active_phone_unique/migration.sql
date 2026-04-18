ALTER TABLE "Royxat"
DROP CONSTRAINT IF EXISTS "Royxat_telefon_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Royxat_telefon_active_unique"
ON "Royxat"("telefon")
WHERE "deletedAt" IS NULL;
