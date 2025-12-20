import { getKafkaConsumer } from "../configs/kafka.config.js";
import { kafkaLogger } from "../utils/logger.js";
import { eventRegistry } from "./event-registry.js";

export const startConsumption = async () => {
  const consumer = getKafkaConsumer();
  await consumer.subscribe({
    topics: ["auth", "order", "payment"],
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}]`;

      try {
        const event = JSON.parse(message.value.toString());
        // console.log("Event : " ,event);
        const { eventType, payload } = event;
        if (!eventType || !payload) {
          kafkaLogger.warn(`${prefix} Invalid event format`);
          return;
        }

        const topicHandlers = eventRegistry[topic];
        if (!topicHandlers) {
          kafkaLogger.warn(`${prefix} No handlers registered for topic`);
          return;
        }

        const handler = topicHandlers[eventType];
        if (!handler) {
          kafkaLogger.warn(`${prefix} No handler for eventType ${eventType}`);
          return;
        }

        await handler(payload, event, prefix);
      } catch (err) {
        kafkaLogger.error(`${prefix} Processing failed`, err);
      }
    },
  });
};
