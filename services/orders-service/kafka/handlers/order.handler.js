import logger from "../../utils/logger.js";
import { ProductReadModel } from "../../models/product-read.model.js";
import { VariantReadModel } from "../../models/variant-read.model.js";

/**
 * CQRS Pattern: Write Model Handler for Products
 * Consumes catalog events and updates the read model (local cache)
 */

/**
 * Handle product created events from catalog service
 * Writes product data to local read model
 */
export const handleProductCreated = async (payload, event, prefix) => {
  try {
    const {
      productId,
      vendor,
      title,
      description,
      category,
      brand,
      tags,
      isActive,
    } = payload;

    // Create product in read model
    await ProductReadModel.create({
      productId,
      vendor,
      title,
      description,
      category,
      brand,
      tags: tags || [],
      isActive,
      lastSyncedAt: new Date(),
    });

    logger.info(
      `${prefix} Product synced to read model: ${productId} - ${title}`
    );
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key - product may already exist, update it instead
      try {
        await ProductReadModel.updateOne(
          { productId: payload.productId },
          {
            $set: {
              ...payload,
              lastSyncedAt: new Date(),
            },
          }
        );
        logger.info(`${prefix} Product updated in read model: ${payload.productId}`);
      } catch (updateErr) {
        logger.error(`${prefix} Error updating product in read model`, updateErr);
      }
    } else {
      logger.error(`${prefix} Error handling PRODUCT_CREATED`, err);
    }
  }
};

/**
 * Handle product update events from catalog service
 * Updates product data in read model
 */
export const handleProductUpdated = async (payload, event, prefix) => {
  try {
    const { productId, ...updateData } = payload;

    const result = await ProductReadModel.findOneAndUpdate(
      { productId },
      {
        $set: {
          ...updateData,
          lastSyncedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      logger.warn(
        `${prefix} Product not found in read model for update: ${productId}`
      );
    } else {
      logger.info(
        `${prefix} Product updated in read model: ${productId} - ${payload.title}`
      );
    }
  } catch (err) {
    logger.error(`${prefix} Error handling PRODUCT_UPDATED`, err);
  }
};

/**
 * Handle product deletion events from catalog service
 * Soft deletes product in read model
 */
export const handleProductDeleted = async (payload, event, prefix) => {
  try {
    const { productId } = payload;

    // Soft delete by marking isActive as false
    const result = await ProductReadModel.findOneAndUpdate(
      { productId },
      {
        $set: {
          isActive: false,
          lastSyncedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      logger.warn(
        `${prefix} Product not found in read model for deletion: ${productId}`
      );
    } else {
      logger.info(`${prefix} Product marked inactive in read model: ${productId}`);
    }

    // Also mark all variants as inactive
    try {
      await VariantReadModel.updateMany(
        { productId, isActive: true },
        {
          $set: {
            isActive: false,
            lastSyncedAt: new Date(),
          },
        }
      );
      logger.info(
        `${prefix} Product variants marked inactive in read model: ${productId}`
      );
    } catch (variantErr) {
      logger.warn(
        `${prefix} Error marking variants inactive: ${variantErr.message}`
      );
    }
  } catch (err) {
    logger.error(`${prefix} Error handling PRODUCT_DELETED`, err);
  }
};

/**
 * Handle variant creation events from catalog service
 * Writes variant data to local read model
 */
export const handleVariantCreated = async (payload, event, prefix) => {
  try {
    const {
      variantId,
      productId,
      sku,
      attributes,
      price,
      weight,
      images,
      isActive,
    } = payload;

    // Create variant in read model
    await VariantReadModel.create({
      variantId,
      productId,
      sku,
      attributes:
        attributes && typeof attributes === "object"
          ? new Map(Object.entries(attributes))
          : undefined,
      price,
      weight,
      images,
      isActive,
      lastSyncedAt: new Date(),
    });

    logger.info(
      `${prefix} Variant synced to read model: ${variantId} (SKU: ${sku})`
    );
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key - variant may already exist, update it instead
      try {
        await VariantReadModel.updateOne(
          { variantId: payload.variantId },
          {
            $set: {
              ...payload,
              lastSyncedAt: new Date(),
            },
          }
        );
        logger.info(`${prefix} Variant updated in read model: ${payload.variantId}`);
      } catch (updateErr) {
        logger.error(`${prefix} Error updating variant in read model`, updateErr);
      }
    } else {
      logger.error(`${prefix} Error handling VARIANT_CREATED`, err);
    }
  }
};

/**
 * Handle variant update events from catalog service
 * Updates variant data in read model
 */
export const handleVariantUpdated = async (payload, event, prefix) => {
  try {
    const { variantId, ...updateData } = payload;

    const result = await VariantReadModel.findOneAndUpdate(
      { variantId },
      {
        $set: {
          ...updateData,
          lastSyncedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      logger.warn(
        `${prefix} Variant not found in read model for update: ${variantId}`
      );
    } else {
      logger.info(
        `${prefix} Variant updated in read model: ${variantId}`
      );
    }
  } catch (err) {
    logger.error(`${prefix} Error handling VARIANT_UPDATED`, err);
  }
};

/**
 * Handle variant deletion events from catalog service
 * Soft deletes variant in read model
 */
export const handleVariantDeleted = async (payload, event, prefix) => {
  try {
    const { variantId } = payload;

    // Soft delete by marking isActive as false
    const result = await VariantReadModel.findOneAndUpdate(
      { variantId },
      {
        $set: {
          isActive: false,
          lastSyncedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      logger.warn(
        `${prefix} Variant not found in read model for deletion: ${variantId}`
      );
    } else {
      logger.info(
        `${prefix} Variant marked inactive in read model: ${variantId}`
      );
    }
  } catch (err) {
    logger.error(`${prefix} Error handling VARIANT_DELETED`, err);
  }
};
