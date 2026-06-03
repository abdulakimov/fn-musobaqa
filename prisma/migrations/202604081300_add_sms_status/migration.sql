-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Royxat"
ADD COLUMN "smsStatus" "SmsStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "smsSentAt" TIMESTAMP(3),
ADD COLUMN "smsError" VARCHAR(300),
ADD COLUMN "smsMessageId" VARCHAR(20);

-- CreateIndex
CREATE INDEX "Royxat_smsStatus_createdAt_idx" ON "Royxat"("smsStatus", "createdAt");
