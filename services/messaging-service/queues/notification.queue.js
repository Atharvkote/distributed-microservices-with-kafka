import { Queue } from "bullmq";
import { redisClient } from "../server.js";
import { queueLogger } from "../utils/logger.js";

let notificationQueue = null;

if (!redisClient) {
  queueLogger.warn(
    "Redis client not available - notificationQueue will be disabled"
  );
} else {
  notificationQueue = new Queue("notificationQueue", {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
}

export { notificationQueue };

