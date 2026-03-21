import { randomUUID } from "crypto";
import { getKafkaProducer } from "../configs/kafka.config.js";
import logger from "../utils/logger.js";

const paymentTopic = process.env.PAYMENT_TOPIC || "payment";

const publish = async (eventType, payload, key) => {
  const producer = getKafkaProducer();
  if (!producer) {
    throw new Error("Kafka producer not initialized");
  }

  await producer.send({
    topic: paymentTopic,
    messages: [
      {
        key: key || payload.orderId,
        value: JSON.stringify({
          eventId: randomUUID(),
          eventType,
          version: 1,
          occurredAt: new Date().toISOString(),
          payload,
        }),
      },
    ],
  });

  logger.info("Payment event published", { eventType, orderId: payload.orderId });
};

export const publishPaymentSuccess = async (payload) =>
  publish("PAYMENT_SUCCESS", payload);

export const publishPaymentFailed = async (payload) =>
  publish("PAYMENT_FAILED", payload);

