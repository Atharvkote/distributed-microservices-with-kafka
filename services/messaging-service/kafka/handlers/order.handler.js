import { getIO } from "../../socket-handlers/index.js";
import { userNotification } from "../../controllers/notifications.controller.js";
import { emailQueue, notificationQueue } from "../../server.js";
import { queueLogger } from "../../utils/logger.js";

function emitOrderSocket(eventName, roomKey, roomId, payload) {
  const io = getIO();
  if (!io || !roomId) return;
  io.to(`${roomKey}:${roomId}`).emit(eventName, payload);
}

/**
 * Fan-out new order to customer + all vendors on the order.
 */
export const handleOrderCreated = async (payload, _event, prefix) => {
  try {
    const { orderId, customerId, customerEmail, status, total, vendorIds } = payload;
    const body = {
      orderId,
      status,
      total,
      type: "ORDER_CREATED",
    };

    if (customerId) {
      // 1. Create a persisted database notification + Socket.IO broadcast
      await userNotification(customerId, {
        title: "Order Placed",
        message: `Your order ${orderId} has been successfully received.`,
        type: "INFO",
        ...body,
      });

      // 2. Queue Email Job
      if (emailQueue && customerEmail) {
        await emailQueue.add(
          "ORDER_CREATED",
          {
            to: customerEmail,
            orderId,
            total,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
          }
        );
        queueLogger?.info(`${prefix} ORDER_CREATED email job queued for ${customerEmail}`);
      }

      // 3. Queue Push Notification job
      if (notificationQueue) {
        await notificationQueue.add("send-notification", {
          type: "INFO",
          title: "Order Placed",
          message: `Your order ${orderId} has been successfully received.`,
          userId: customerId,
        });
      }
    }

    for (const vid of vendorIds || []) {
      if (!vid) continue;
      emitOrderSocket("order:new", "vendor", String(vid), {
        ...body,
        customerId,
      });
    }

  } catch (err) {
    console.error("ORDER_CREATED handler failed", err);
  }
};

export const handleOrderStatusUpdated = async (payload, _event, prefix) => {
  try {
    const { orderId, customerId, customerEmail, status, fromStatus, vendorIds, total, transactionId } = payload;
    const body = {
      orderId,
      status,
      fromStatus,
      type: "ORDER_STATUS_UPDATED",
    };

    if (customerId) {
      // 1. Create a persisted database notification + Socket.IO broadcast
      let message = `Order ${orderId} status is now ${status}.`;
      if (status === "CONFIRMED") {
        message = `Payment successful! Your order ${orderId} has been confirmed.`;
      } else if (status === "CANCELLED") {
        message = `Payment failed! Your order ${orderId} has been cancelled.`;
      }

      await userNotification(customerId, {
        title: `Order ${status}`,
        message,
        type: status === "CANCELLED" ? "ALERT" : "INFO",
        ...body,
      });

      // 2. Queue Email Job if status changed due to payment
      if (emailQueue && customerEmail && (status === "CONFIRMED" || status === "CANCELLED")) {
        const jobName = status === "CONFIRMED" ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED";
        await emailQueue.add(
          jobName,
          {
            to: customerEmail,
            orderId,
            total,
            transactionId,
          },
          {
            attempts: 5,
            backoff: { type: "exponential", delay: 3000 },
            removeOnComplete: true,
          }
        );
        queueLogger?.info(`${prefix} ${jobName} email job queued for ${customerEmail}`);
      }

      // 3. Queue Push Notification job
      if (notificationQueue) {
        await notificationQueue.add("send-notification", {
          type: status === "CANCELLED" ? "WARNING" : "INFO",
          title: `Order ${status}`,
          message,
          userId: customerId,
        });
      }
    }

    for (const vid of vendorIds || []) {
      if (!vid) continue;
      emitOrderSocket("order:update", "vendor", String(vid), body);
    }

  } catch (err) {
    console.error("ORDER_STATUS_UPDATED handler failed", err);
  }
};

/** Catalog-service publishes product/variant sync on topic "order" — ignore here. */
export const noopCatalogOrderTopic = async (_payload, _event, _prefix) => {
  /* catalog sync on shared topic — no messaging action */
};
