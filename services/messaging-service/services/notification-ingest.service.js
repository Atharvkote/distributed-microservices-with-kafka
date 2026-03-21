import { z } from "zod";
import { Notification } from "../models/notification.model.js";
import { notifyUser } from "../socket-handlers/notification-handler.js";
import logger from "../utils/logger.js";

const notificationEventSchema = z.object({
  eventId: z.string().min(1).max(128),
  type: z.enum(["INFO", "ALERT", "WARNING"]),
  title: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(2000),
  userId: z.string().min(1).max(128),
  createdAt: z.string().datetime(),
});

const emissionRateMap = new Map();

const canEmitNotification = (userId) => {
  const limit = Number(process.env.NOTIFICATION_EMIT_RATE_LIMIT || 0);
  if (!limit || limit <= 0) return true;

  const now = Date.now();
  const key = `${userId}:${Math.floor(now / 1000)}`;
  const count = (emissionRateMap.get(key) || 0) + 1;
  emissionRateMap.set(key, count);

  if (count > limit) return false;
  return true;
};

export const ingestNotificationEvent = async (rawMessage) => {
  const parsed = notificationEventSchema.safeParse(rawMessage);
  if (!parsed.success) {
    logger.warn("Malformed notification event received", {
      errors: parsed.error.flatten(),
    });
    return { ignored: true, reason: "MALFORMED" };
  }

  const event = parsed.data;
  logger.info("Notification event received", {
    eventId: event.eventId,
    userId: event.userId,
  });

  let doc = await Notification.findOne({ sourceEventId: event.eventId });
  if (!doc) {
    doc = await Notification.create({
      type: event.type,
      title: event.title,
      message: event.message,
      userId: event.userId,
      scope: "USER",
      isRead: false,
      sourceEventId: event.eventId,
      createdAt: event.createdAt,
    });
    logger.info("Notification persisted", {
      eventId: event.eventId,
      notificationId: doc._id.toString(),
    });
  } else {
    logger.info("Duplicate notification ignored", {
      eventId: event.eventId,
      notificationId: doc._id.toString(),
    });
  }

  if (!canEmitNotification(event.userId)) {
    logger.warn("Notification emit rate-limited", {
      userId: event.userId,
      eventId: event.eventId,
    });
    return { ignored: false, emitted: false };
  }

  try {
    const notificationPayload = {
      _id: doc._id.toString(),
      type: doc.type,
      title: doc.title || "",
      message: doc.message,
      scope: doc.scope,
      userId: doc.userId,
      isRead: doc.isRead,
      createdAt: doc.createdAt.toISOString(),
    };
    notifyUser(event.userId, notificationPayload);
    logger.info("Notification emitted", {
      userId: event.userId,
      eventId: event.eventId,
      notificationId: doc._id.toString(),
    });
  } catch (err) {
    logger.error("Notification emit failed", {
      userId: event.userId,
      eventId: event.eventId,
      error: err.message,
    });
  }

  return { ignored: false, emitted: true };
};

