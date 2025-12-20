import "dotenv/config";
import { Kafka, logLevel } from "kafkajs";
import logger, { kafkaLogger } from "../utils/logger.js";

const brokers = process.env.KAFKA_BROKERS.split(",");

export const kafka = new Kafka({
  brokers: brokers,
  logLevel: logLevel.ERROR,
  logCreator:
    (level) =>
    ({ namespace, label, log }) => {
      const { message, ...extra } = log;
      const server_name = "KAFKA";
      if (level === logLevel.ERROR) {
        kafkaLogger.error(` [ ${namespace} ] ${message}`, extra, server_name);
      } else if (level === logLevel.WARN) {
        kafkaLogger.warn(`[ ${namespace} ] ${message}`, extra, server_name);
      } else if (level === logLevel.INFO) {
        kafkaLogger.info(`[ ${namespace} ] ${message}`, extra, server_name);
      } else {
        kafkaLogger.debug(`[ ${namespace} ] ${message}`, extra, server_name);
      }
    },
});

let producer = null;

export const initKafkaProducer = async () => {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    kafkaLogger.info("Connected to the Active Leader Kafka borker! ");
  }
  return producer;
};

export const getKafkaProducer = () => {
  if (!producer) {
    kafkaLogger.error("Kafka producer not initialized");
    return;
  }
  return producer;
};

let consumer = null;

export const initKafkaConsumer = async () => {
  if (!consumer) {
    consumer = kafka.consumer({ groupId: "MS-consumer-group" });
    await consumer.connect();
    kafkaLogger.info("Kafka consumer connected");
  }
  return consumer;
};

export const getKafkaConsumer = () => {
  if (!consumer) {
    kafkaLogger.error("Kafka consumer not initialized");
    return;
  }
  return consumer;
};

export const disconnectKafka = async () => {
  try {
    if (producer) await producer.disconnect();
    if (consumer) await consumer.disconnect();

    kafkaLogger.info("Kafka Consumer and Producers disconnected!");
  } catch (error) {
    kafkaLogger.error("Error while disconnecting Kafka!", error);
    return;
  }
};
