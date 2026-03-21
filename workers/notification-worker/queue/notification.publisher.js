import { z } from "zod";
import { getRedisClient } from "../config/redis.config.js";
import logger from "../utils/logger.js";

const EVENT_CHANNEL = process.env.NOTIFICATION_EVENT_CHANNEL || "notification-events";

const notificationEventSchema = z.object({
  type: z.enum(["INFO", "ALERT", "WARNING"]),
  title: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(2000),
  userId: z.string().min(1).max(128),
  createdAt: z.string().datetime(),
  eventId: z.string().min(1).max(128),
});

export const publishNotificationEvent = async (payload) => {
  const event = notificationEventSchema.parse(payload);
  const redisClient = getRedisClient();

  const receivers = await redisClient.publish(EVENT_CHANNEL, JSON.stringify(event));
  logger.info("Notification event published", {
    channel: EVENT_CHANNEL,
    eventId: event.eventId,
    userId: event.userId,
    receivers,
  });
};

