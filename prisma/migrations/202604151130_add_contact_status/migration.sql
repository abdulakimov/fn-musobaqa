-- CreateEnum
CREATE TYPE "AloqaStatus" AS ENUM ('BOGLANILMAGAN', 'BOGLANIB_BOLMADI', 'QAYTA_ALOQA', 'BOGLANILGAN');

-- AlterTable
ALTER TABLE "Royxat"
ADD COLUMN "aloqaStatus" "AloqaStatus" NOT NULL DEFAULT 'BOGLANILMAGAN';

-- CreateIndex
CREATE INDEX "Royxat_aloqaStatus_createdAt_idx" ON "Royxat"("aloqaStatus", "createdAt");
