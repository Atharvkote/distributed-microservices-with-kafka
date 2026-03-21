import { getKafkaConsumer } from "../configs/kafka.config.js";
import { onOrderCreated } from "../controllers/razorpay.controller.js";
import { withRetry } from "../utils/retry.util.js";
import logger from "../utils/logger.js";

const orderTopic = process.env.ORDER_TOPIC || "order";

const extractOrderCreatedPayload = (raw) => {
  const eventType = raw?.eventType;
  const payload = raw?.payload;

  if (eventType === "ORDER_CREATED" && payload) return payload;
  if (raw?.orderId && Number.isFinite(raw?.amount)) return raw;
  return null;
};

export const startOrderConsumer = async () => {
  const consumer = getKafkaConsumer();
  if (!consumer) throw new Error("Kafka consumer not initialized");

  await consumer.subscribe({ topic: orderTopic, fromBeginning: false });
  logger.info("Subscribed to order topic", { topic: orderTopic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value?.toString("utf8");
      if (!rawValue) return;

      const prefix = `${topic}[${partition}|${message.offset}]`;
      try {
        const parsed = JSON.parse(rawValue);
        const payload = extractOrderCreatedPayload(parsed);
        if (!payload) {
          logger.debug("Ignoring non ORDER_CREATED event", { prefix });
          return;
        }

        await withRetry(() => onOrderCreated(payload), {
          retries: 3,
          initialDelayMs: 500,
          factor: 2,
          onRetry: (err, attempt) => {
            logger.warn("Order event processing retry", {
              prefix,
              attempt,
              error: err.message,
            });
          },
        });

        logger.info("ORDER_CREATED processed", { prefix, orderId: payload.orderId });
      } catch (err) {
        logger.error("Failed to process Kafka message", {
          prefix,
          error: err.message,
          rawValue,
        });
      }
    },
  });
};

