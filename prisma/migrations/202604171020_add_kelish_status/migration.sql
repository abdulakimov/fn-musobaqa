-- CreateEnum
CREATE TYPE "KelishStatus" AS ENUM ('KUTILMOQDA', 'KELGAN', 'KELMADI');

-- AlterTable
ALTER TABLE "Royxat"
ADD COLUMN "kelishStatus" "KelishStatus" NOT NULL DEFAULT 'KUTILMOQDA';

-- CreateIndex
CREATE INDEX "Royxat_kelishStatus_createdAt_idx" ON "Royxat"("kelishStatus", "createdAt");
