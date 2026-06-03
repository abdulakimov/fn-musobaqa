ALTER TABLE "Royxat"
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Royxat_deletedAt_createdAt_idx"
ON "Royxat"("deletedAt", "createdAt");