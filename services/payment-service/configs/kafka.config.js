import { Kafka, logLevel } from "kafkajs";
import logger from "../utils/logger.js";

const brokers = (process.env.KAFKA_BROKERS || "")
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

if (brokers.length === 0) {
  throw new Error("KAFKA_BROKERS is not configured");
}

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "payment-service",
  brokers,
  logLevel: logLevel.ERROR,
});

let producer = null;
let consumer = null;

export const initKafkaProducer = async () => {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    logger.info("Kafka producer connected");
  }
  return producer;
};

export const getKafkaProducer = () => producer;

export const initKafkaConsumer = async () => {
  if (!consumer) {
    consumer = kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP || "payment-service-group",
    });
    await consumer.connect();
    logger.info("Kafka consumer connected");
  }
  return consumer;
};

export const getKafkaConsumer = () => consumer;

export const disconnectKafka = async () => {
  if (consumer) await consumer.disconnect();
  if (producer) await producer.disconnect();
  logger.info("Kafka disconnected");
};

