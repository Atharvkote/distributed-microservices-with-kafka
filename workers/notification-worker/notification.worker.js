import "dotenv/config";
import { Worker } from "bullmq";
import { z } from "zod";
import logger from "./utils/logger.js";
import {
  disconnectRedisClient,
  getRedisClient,
} from "./config/redis.config.js";
import { publishNotificationEvent } from "./queue/notification.publisher.js";

const jobSchema = z.object({
  type: z.enum(["INFO", "ALERT", "WARNING"]),
  title: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(2000),
  userId: z.string().min(1).max(128),
});

const redisClient = getRedisClient();

const worker = new Worker(
  "notificationQueue",
  async (job) => {
    if (job.name !== "send-notification") {
      logger.warn("Unknown job skipped", { jobName: job.name, jobId: job.id });
      return;
    }

    const parsed = jobSchema.parse(job.data || {});
    await publishNotificationEvent({
      eventId: `${job.id || job.attemptsStarted}-${parsed.userId}`,
      ...parsed,
      createdAt: new Date().toISOString(),
    });
  },
  {
    connection: redisClient,
    concurrency: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY || 5),
  }
);

worker.on("completed", (job) => {
  logger.info("Notification job completed", { jobId: job.id, name: job.name });
});

worker.on("failed", (job, err) => {
  logger.error("Notification job failed", {
    jobId: job?.id,
    name: job?.name,
    error: err?.message,
    stack: err?.stack,
  });
});

worker.on("error", (err) => {
  logger.error("Notification worker error", { error: err.message, stack: err.stack });
});

logger.info("Notification worker running");

const shutdown = async () => {
  logger.info("Notification worker shutdown started");
  await worker.close();
  await disconnectRedisClient();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

