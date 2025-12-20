import { getKafkaProducer } from "../configs/kafka.config.js";
import { kafkaLogger } from "../utils/logger.js";
import { randomUUID } from "crypto";

export const publishUserCreated = async (user) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "auth",
      messages: [
        {
          key: user._id.toString(),
          value: JSON.stringify({
            eventId: randomUUID(), // DLQ design
            eventType: "USER_CREATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              userId: user._id,
              email: user.email,
              name: user.full_name,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: USER_CREATED", err);
  }
};

export const publishUserLogin = async ({ userId, ip }) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "auth",
      messages: [
        {
          key: userId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),  // DLQ design
            eventType: "USER_LOGIN_RECORDED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              userId,
              ip,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: USER_LOGIN_RECORDED", err);
  }
};

export const publishUserLogout = async ({ userId }) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "auth",
      messages: [
        {
          key: userId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),  // DLQ design
            eventType: "USER_LOGOUT_RECORDED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              userId,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: USER_LOGOUT_RECORDED", err);
  }
};

export const publishVendorProfileCreated = async ({
  vendorId,
  userId,
  storeName,
  createdAt,
  email,
}) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "auth",
      messages: [
        {
          key: vendorId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),  // DLQ design
            eventType: "VP_CREATED",
            version: 1,
            occurredAt: createdAt || new Date().toISOString(),
            payload: {
              email,
              vendorId,
              ownerId: userId,
              storeName,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: VP_CREATED", err);
  }
};

export const publishVendorProfileUpdated = async ({ vendorId, changes ,email }) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "auth",
      messages: [
        {
          key: vendorId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),  // DLQ design
            eventType: "VP_UPDATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              vendorId,
              email,
              changes,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: VP_UPDATED", err);
  }
};
