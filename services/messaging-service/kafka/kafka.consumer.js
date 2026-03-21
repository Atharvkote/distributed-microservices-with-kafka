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


// import { getKafkaConsumer, getKafkaProducer } from "../configs/kafka.config.js";
// import { kafkaLogger } from "../utils/logger.js";
// import { eventRegistry } from "./event-registry.js";
// import Redis from "ioredis";

// const redis = new Redis();
// const MAX_RETRIES = 3;

// export const startConsumption = async () => {
//   const consumer = getKafkaConsumer();
//   const producer = getKafkaProducer();

//   await consumer.subscribe({
//     topics: ["auth", "order", "payment"],
//     fromBeginning: false,
//   });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       const prefix = `${topic}[${partition} | ${message.offset}]`;

//       let event;

//       try {
//         event = JSON.parse(message.value.toString());
//       } catch (err) {
//         kafkaLogger.error(`${prefix} Invalid JSON`, err);
//         return;
//       }

//       const { eventId, eventType, payload } = event;

//       if (!eventId || !eventType || !payload) {
//         kafkaLogger.warn(`${prefix} Invalid event structure`);
//         return;
//       }

//       const retryKey = `retry:${eventId}`;
//       const processedKey = `processed:${eventId}`;

//       try {
//         // ✅ IDEMPOTENCY CHECK
//         const alreadyProcessed = await redis.get(processedKey);
//         if (alreadyProcessed) {
//           kafkaLogger.info(`${prefix} Skipping duplicate event ${eventId}`);
//           return;
//         }

//         const topicHandlers = eventRegistry[topic];
//         if (!topicHandlers) {
//           throw new Error(`No handlers registered for topic ${topic}`);
//         }

//         const handler = topicHandlers[eventType];
//         if (!handler) {
//           throw new Error(`No handler for eventType ${eventType}`);
//         }

//         // 🚀 PROCESS EVENT
//         await handler(payload, event, prefix);

//         // ✅ MARK SUCCESS
//         await redis.set(processedKey, "1", "EX", 86400); // expire in 1 day
//         await redis.del(retryKey);

//       } catch (err) {
//         kafkaLogger.error(`${prefix} Processing failed`, err);

//         const retries = await redis.incr(retryKey);

//         if (retries <= MAX_RETRIES) {
//           kafkaLogger.warn(`${prefix} Retrying ${eventType} (${retries})`);

//           // ⏳ simple retry delay (can replace with retry topic later)
//           setTimeout(async () => {
//             await producer.send({
//               topic,
//               messages: [
//                 {
//                   key: eventId,
//                   value: JSON.stringify(event),
//                 },
//               ],
//             });
//           }, retries * 2000);

//         } else {
//           kafkaLogger.error(`${prefix} भेजा DLQ में ${eventType}`);

//           await producer.send({
//             topic: `${topic}.DLQ`,
//             messages: [
//               {
//                 key: eventId,
//                 value: JSON.stringify({
//                   ...event,
//                   failedAt: new Date().toISOString(),
//                   error: err.message,
//                   retries,
//                 }),
//               },
//             ],
//           });

//           await redis.del(retryKey);
//         }
//       }
//     },
//   });
// };