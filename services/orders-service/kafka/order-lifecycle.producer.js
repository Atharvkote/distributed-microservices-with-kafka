import { getKafkaProducer } from "../configs/kafka.config.js";
import { kafkaLogger } from "../utils/logger.js";
import { randomUUID } from "crypto";

/**
 * Publishes order lifecycle events on Kafka topic "order" (same topic as catalog sync in this codebase).
 * Messaging service consumes ORDER_* event types for Socket.IO fan-out.
 */
export async function publishOrderEvent(eventType, payload) {
  try {
    const producer = getKafkaProducer();
    if (!producer) return;

    await producer.send({
      topic: "order",
      messages: [
        {
          key: String(payload.orderId ?? randomUUID()),
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
  } catch (err) {
    kafkaLogger.error(`Kafka publish failed: ${eventType}`, err);
  }
}
