import { Queue, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import type { FullRegistrationData } from "./validations";
import type { UtmType } from "./utm";

const QUEUE_NAME = "register-queue";
const WAIT_TIMEOUT_MS = Number.parseInt(process.env.REGISTER_QUEUE_WAIT_TIMEOUT_MS ?? "20000", 10);

export type RegisterQueueData = FullRegistrationData & {
  utmType: UtmType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type RegisterJobResult =
  | { ok: true; data: { id: string; participantId: string | null } }
  | {
      ok: false;
      code:
        | "DUPLICATE_PHONE"
        | "REGISTRATION_CLOSED"
        | "LIMIT_REACHED_TYPING"
        | "LIMIT_REACHED_MATH_9_11"
        | "LIMIT_REACHED_MATH_12_14"
        | "UNKNOWN";
      message: string;
    };

const globalForQueue = globalThis as unknown as {
  registerQueue?: Queue<RegisterQueueData, RegisterJobResult>;
  registerQueueEvents?: QueueEvents;
  registerRedis?: IORedis;
};

function getRedisUrl() {
  return process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
}

function getRedisConnection() {
  if (!globalForQueue.registerRedis) {
    globalForQueue.registerRedis = new IORedis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    globalForQueue.registerRedis.setMaxListeners(0);
  }
  return globalForQueue.registerRedis;
}

function getQueue() {
  if (!globalForQueue.registerQueue) {
    globalForQueue.registerQueue = new Queue<RegisterQueueData, RegisterJobResult>(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 250 },
        removeOnComplete: 500,
        removeOnFail: 500,
      } satisfies JobsOptions,
    });
  }
  return globalForQueue.registerQueue;
}

function getQueueEvents() {
  if (!globalForQueue.registerQueueEvents) {
    globalForQueue.registerQueueEvents = new QueueEvents(QUEUE_NAME, {
      connection: getRedisConnection(),
    });
    // Multiple in-flight waitUntilFinished listeners are expected under load.
    globalForQueue.registerQueueEvents.setMaxListeners(0);
  }
  return globalForQueue.registerQueueEvents;
}

export async function submitRegistrationAndWait(data: RegisterQueueData) {
  const queue = getQueue();
  const queueEvents = getQueueEvents();

  const job = await queue.add("register", data, {
    jobId: `${data.telefon.replace(/\D/g, "")}-${Date.now()}`,
  });

  const result = await job.waitUntilFinished(queueEvents, WAIT_TIMEOUT_MS);
  return result;
}

export { QUEUE_NAME };
