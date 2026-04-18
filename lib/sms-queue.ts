import { Queue, JobsOptions } from "bullmq";
import IORedis from "ioredis";

export const SMS_QUEUE_NAME = "sms-queue";

export interface SmsQueueData {
  registrationId: string;
  phone: string;
  participantId: string;
  ism: string;
  familiya: string;
  otasiningIsmi: string;
}

const globalForSmsQueue = globalThis as unknown as {
  smsQueue?: Queue<SmsQueueData>;
  smsQueueRedis?: IORedis;
};

function getRedisUrl() {
  return process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
}

function getRedisConnection() {
  if (!globalForSmsQueue.smsQueueRedis) {
    globalForSmsQueue.smsQueueRedis = new IORedis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 1500,
      commandTimeout: 1500,
      retryStrategy(times) {
        if (times >= 2) return null;
        return 200;
      },
    });
    globalForSmsQueue.smsQueueRedis.setMaxListeners(0);
  }
  return globalForSmsQueue.smsQueueRedis;
}

function getSmsQueue() {
  if (!globalForSmsQueue.smsQueue) {
    globalForSmsQueue.smsQueue = new Queue<SmsQueueData>(SMS_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      } satisfies JobsOptions,
    });
  }
  return globalForSmsQueue.smsQueue;
}

export async function enqueueRegistrationSms(data: SmsQueueData) {
  const redis = getRedisConnection();
  if (redis.status === "wait") {
    await redis.connect();
  }

  const queue = getSmsQueue();
  const addJobPromise = queue.add("send-registration-sms", data, {
    jobId: `sms-${data.registrationId}`,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      reject(new Error("SMS queue timeout"));
    }, 2000);
    addJobPromise.finally(() => clearTimeout(id)).catch(() => clearTimeout(id));
  });

  await Promise.race([addJobPromise, timeoutPromise]);
}
