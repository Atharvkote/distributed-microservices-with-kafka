import { getRedisSubscriber, disconnectRedisSubscriber } from "../config/redis-subscriber.config.js";
import { ingestNotificationEvent } from "../services/notification-ingest.service.js";
import { redisLogger } from "../utils/logger.js";

const CHANNEL = process.env.NOTIFICATION_EVENT_CHANNEL || "notification-events";

export const startNotificationConsumer = async () => {
  try {
    const subscriber = getRedisSubscriber();

    subscriber.on("error", (err) => {
      redisLogger.error("Notification subscriber error", {
        error: err.message,
        stack: err.stack,
      });
    });

    await subscriber.subscribe(CHANNEL, (err, count) => {
      if (err) {
        redisLogger.error("Failed to subscribe to notification channel", {
          channel: CHANNEL,
          error: err.message,
        });
      } else {
        redisLogger.info(`Subscribed to ${CHANNEL} (${count} channel(s))`);
      }
    });

    subscriber.on("message", async (channel, message) => {
      if (channel !== CHANNEL) return;

      try {
        const parsed = JSON.parse(message);
        await ingestNotificationEvent(parsed);
      } catch (err) {
        redisLogger.error("Failed to process notification event message", {
          channel,
          error: err.message,
          message: message.substring(0, 100),
        });
      }
    });
  } catch (err) {
    redisLogger.error("Failed to start notification consumer", {
      error: err.message,
      stack: err.stack,
    });
  }
};

export const stopNotificationConsumer = async () => {
  try {
    await disconnectRedisSubscriber();
    redisLogger.info("Notification consumer stopped");
  } catch (err) {
    redisLogger.error("Error stopping notification consumer", err);
  }
};

