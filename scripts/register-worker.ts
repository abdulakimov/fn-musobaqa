import { config as loadEnv } from "dotenv";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { db } from "../lib/db";
import {
  createRegistrationWithId,
  DuplicatePhoneError,
  RegistrationClosedError,
  LimitReachedError,
} from "../lib/participant-id";
import { QUEUE_NAME, type RegisterJobResult, type RegisterQueueData } from "../lib/register-queue";
import { SMS_QUEUE_NAME, type SmsQueueData, enqueueRegistrationSms } from "../lib/sms-queue";
import { buildRegistrationSmsText } from "../lib/sms/registration-sms";
import { isSmsEnabled, sendRegistrationSms } from "../lib/sms/playmobile";

loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });

const redis = new IORedis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

const concurrency = Number.parseInt(process.env.REGISTER_QUEUE_CONCURRENCY ?? "30", 10);
const smsConcurrency = Number.parseInt(process.env.SMS_QUEUE_CONCURRENCY ?? "20", 10);

function formatSmsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown SMS error");
  return message.slice(0, 300);
}

const worker = new Worker<RegisterQueueData, RegisterJobResult>(
  QUEUE_NAME,
  async (job) => {
    try {
      const created = await createRegistrationWithId(db, job.data);
      try {
        await enqueueRegistrationSms({
          registrationId: created.id,
          phone: job.data.telefon,
          participantId: created.participantId ?? "",
          ism: job.data.ism,
          familiya: job.data.familiya,
          otasiningIsmi: job.data.otasiningIsmi,
        });
      } catch (smsQueueError) {
        await db.royxat.update({
          where: { id: created.id },
          data: {
            smsStatus: "FAILED",
            smsError: formatSmsError(smsQueueError),
          },
        });
      }
      return { ok: true, data: { id: created.id, participantId: created.participantId ?? null } };
    } catch (error) {
      if (error instanceof DuplicatePhoneError) {
        return { ok: false, code: "DUPLICATE_PHONE", message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
      }
      if (error instanceof RegistrationClosedError) {
        return { ok: false, code: "REGISTRATION_CLOSED", message: "Ro'yxatdan o'tish yopilgan" };
      }
      if (error instanceof LimitReachedError) {
        return { ok: false, code: error.code, message: "Ro'yxatdan o'tish yakunlangan" };
      }
      return { ok: false, code: "UNKNOWN", message: "Server xatosi yuz berdi" };
    }
  },
  {
    connection: redis,
    concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 30,
  },
);

const smsWorker = new Worker<SmsQueueData, void>(
  SMS_QUEUE_NAME,
  async (job) => {
    const registrationId = job.data.registrationId;
    try {
      if (!isSmsEnabled()) {
        await db.royxat.update({
          where: { id: registrationId },
          data: { smsStatus: "FAILED", smsError: "SMS sending disabled" },
        });
        return;
      }

      const text = buildRegistrationSmsText({
        participantId: job.data.participantId,
      });

      const sent = await sendRegistrationSms({
        registrationId,
        phone: job.data.phone,
        text,
      });

      await db.royxat.update({
        where: { id: registrationId },
        data: {
          smsStatus: "SENT",
          smsSentAt: new Date(),
          smsError: null,
          smsMessageId: sent.messageId,
        },
      });
    } catch (error) {
      await db.royxat.update({
        where: { id: registrationId },
        data: {
          smsStatus: "FAILED",
          smsError: formatSmsError(error),
        },
      });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: Number.isFinite(smsConcurrency) && smsConcurrency > 0 ? smsConcurrency : 20,
  },
);

worker.on("ready", () => {
  console.log(`[worker] register queue ready (concurrency=${concurrency})`);
});

worker.on("failed", (job, error) => {
  console.error("[worker] job failed", { id: job?.id, error: error.message });
});

smsWorker.on("ready", () => {
  console.log(`[worker] sms queue ready (concurrency=${smsConcurrency})`);
});

smsWorker.on("failed", (job, error) => {
  console.error("[worker] sms job failed", { id: job?.id, error: error.message });
});

const shutdown = async () => {
  await worker.close();
  await smsWorker.close();
  await redis.quit();
  await db.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
