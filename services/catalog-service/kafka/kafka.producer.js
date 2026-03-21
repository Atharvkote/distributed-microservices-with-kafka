import { getKafkaProducer } from "../configs/kafka.config.js";
import { kafkaLogger } from "../utils/logger.js";
import { randomUUID } from "crypto";

export const publishProductCreated = async (product) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: product._id.toString(),
          value: JSON.stringify({
            eventId: randomUUID(), // DLQ design
            eventType: "PRODUCT_CREATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              productId: product._id,
              vendor: product.vendor,
              title: product.title,
              description: product.description,
              isActive: product.isActive,
              brand: product.brand,
              category: product.category,
              tags: product.tags,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: PRODUCT_CREATED", err);
  }
};

/**
 * Publish product updated event
 */
export const publishProductUpdated = async (product) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: product._id.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),
            eventType: "PRODUCT_UPDATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              productId: product._id,
              vendor: product.vendor,
              title: product.title,
              description: product.description,
              isActive: product.isActive,
              brand: product.brand,
              category: product.category,
              tags: product.tags,
              avgRating: product.avgRating,
              ratingCount: product.ratingCount,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: PRODUCT_UPDATED", err);
  }
};

/**
 * Publish product deleted event
 */
export const publishProductDeleted = async (productId) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: productId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),
            eventType: "PRODUCT_DELETED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              productId: productId,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: PRODUCT_DELETED", err);
  }
};

/**
 * Publish variant created event
 */
export const publishVariantCreated = async (variant) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: variant._id.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),
            eventType: "VARIANT_CREATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              variantId: variant._id,
              productId: variant.product,
              sku: variant.sku,
              attributes: Object.fromEntries(variant.attributes || []),
              price: variant.price,
              weight: variant.weight,
              isActive: variant.isActive,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: VARIANT_CREATED", err);
  }
};

/**
 * Publish variant updated event
 */
export const publishVariantUpdated = async (variant) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: variant._id.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),
            eventType: "VARIANT_UPDATED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              variantId: variant._id,
              productId: variant.product,
              sku: variant.sku,
              attributes: Object.fromEntries(variant.attributes || []),
              price: variant.price,
              weight: variant.weight,
              images: variant.images,
              isActive: variant.isActive,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: VARIANT_UPDATED", err);
  }
};

/**
 * Publish variant deleted event
 */
export const publishVariantDeleted = async (variantId, productId) => {
  try {
    const producer = getKafkaProducer();

    await producer.send({
      topic: "order",
      messages: [
        {
          key: variantId.toString(),
          value: JSON.stringify({
            eventId: randomUUID(),
            eventType: "VARIANT_DELETED",
            version: 1,
            occurredAt: new Date().toISOString(),
            payload: {
              variantId: variantId,
              productId: productId,
            },
          }),
        },
      ],
    });
  } catch (err) {
    kafkaLogger.error("Kafka publish failed: VARIANT_DELETED", err);
  }
};
