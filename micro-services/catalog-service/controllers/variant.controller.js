import mongoose from "mongoose";
import { ProductVariant } from "../models/variant.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Product } from "../models/product.model.js";
import { cloudinaryUpload } from "../utils/cloundnary.upload.js";
import {
  createVariantZod,
  updateVariantZod,
  getVariantZod,
  getVariantsByProductZod,
  deleteVariantZod,
} from "../validators/schema.js";

export const createProductVariant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Basic validation check
    if (!req.body) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Request body is required",
      });
    }

    // Convert product to string if it's an ObjectId
    const bodyToValidate = {
      ...req.body,
      product: req.body.product?.toString() || req.body.product,
    };

    // Validate request with Zod
    const parsed = createVariantZod.safeParse({ body: bodyToValidate });
    if (!parsed.success) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { product, sku, attributes, price, weight } = parsed.data.body;

    // Verify product exists and belongs to vendor
    if (req.user?.vendorId) {
      const productDoc = await Product.findById(product).session(session);
      if (!productDoc) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Product not found" });
      }
      if (productDoc.vendor.toString() !== req.user.vendorId) {
        await session.abortTransaction();
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    // Calculate discount percent if not provided
    const discountPercent =
      price.discountPercent !== undefined
        ? price.discountPercent
        : Math.round(((price.mrp - price.sellingPrice) / price.mrp) * 100);

    // Handle image uploads
    let images = [];
    if (req.files?.length) {
      images = await Promise.all(
        req.files.map(async (file, index) => {
          const result = await cloudinaryUpload(file.buffer, {
            folder: `products/${product}/variants`,
            publicId: `${sku}-${Date.now()}-${index}`,
          });
          return {
            url: result.secure_url,
            alt: sku,
          };
        })
      );
    }

    // Create variant
    const [variant] = await ProductVariant.create(
      [
        {
          product,
          sku,
          attributes: attributes ? new Map(Object.entries(attributes)) : undefined,
          price: {
            ...price,
            discountPercent,
          },
          weight,
          images,
        },
      ],
      { session }
    );

    // Create inventory entry
    await Inventory.create(
      [
        {
          variant: variant._id,
          stock: 0,
          lowStockThreshold: 5,
          reserved: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      message: "Variant created successfully",
      variant,
    });
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Variant with this SKU already exists",
      });
    }
    res.status(400).json({
      message: "Failed to create variant",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};

export const updateProductVariant = async (req, res) => {
  try {

    const parsed = updateVariantZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const variantId = parsed.data.params.id;

    // Verify variant belongs to vendor
    if (req.user?.vendorId) {
      const variant = await ProductVariant.findById(variantId).populate({
        path: "product",
        select: "vendor",
      });
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      if (variant.product.vendor.toString() !== req.user.vendorId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    const updates = { ...parsed.data.body };

    // Calculate discount percent if price is updated
    if (updates.price) {
      const { mrp, sellingPrice } = updates.price;
      if (mrp && sellingPrice) {
        updates.price.discountPercent = Math.round(
          ((mrp - sellingPrice) / mrp) * 100
        );
      }
    }

    // Handle new images - replace existing images
    if (req.files?.length) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file, index) => {
          const result = await cloudinaryUpload(file.buffer, {
            folder: `variants/${variantId}`,
            publicId: `${variantId}-${Date.now()}-${index}`,
          });
          return {
            url: result.secure_url,
            alt: variantId,
          };
        })
      );
      updates.images = uploadedImages;
    }

    // Get variant and update (needed for Map type handling)
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Update fields
    if (updates.attributes !== undefined) {
      // Handle Map type - clear and set new values
      variant.attributes = new Map(Object.entries(updates.attributes));
    }
    if (updates.price) {
      variant.price = { ...variant.price, ...updates.price };
    }
    if (updates.weight !== undefined) {
      variant.weight = updates.weight;
    }
    if (updates.isActive !== undefined) {
      variant.isActive = updates.isActive;
    }
    if (updates.images) {
      variant.images = updates.images;
    }

    await variant.save();

    res.status(200).json({
      message: "Variant updated successfully",
      variant,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update variant",
      error: err.message,
    });
  }
};

// Get single variant
export const getProductVariant = async (req, res) => {
  try {
    const parsed = getVariantZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const variant = await ProductVariant.findById(parsed.data.params.id)
      .populate("product", "title category")
      .lean();

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Get inventory
    const inventory = await Inventory.findOne({
      variant: variant._id,
    }).lean();

    res.status(200).json({
      variant: {
        ...variant,
        inventory,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch variant",
      error: err.message,
    });
  }
};

// Get all variants for a product
export const getProductAllVariant = async (req, res) => {
  try {
    const parsed = getVariantsByProductZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const variants = await ProductVariant.find({
      product: parsed.data.params.productId,
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .lean();

    const variantIds = variants.map((v) => v._id);
    const inventories = await Inventory.find({
      variant: { $in: variantIds },
    }).lean();

    const inventoryMap = Object.fromEntries(
      inventories.map((inv) => [inv.variant.toString(), inv])
    );

    const result = variants.map((variant) => ({
      ...variant,
      inventory: inventoryMap[variant._id.toString()] || null,
    }));

    res.status(200).json({
      variants: result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch variants",
      error: err.message,
    });
  }
};

// Soft delete variant
export const deleteProductVariant = async (req, res) => {
  try {
    const parsed = deleteVariantZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const variantId = parsed.data.params.id;

    // Verify variant belongs to vendor
    if (req.user?.vendorId) {
      const variant = await ProductVariant.findById(variantId).populate({
        path: "product",
        select: "vendor",
      });
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      if (variant.product.vendor.toString() !== req.user.vendorId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const variant = await ProductVariant.findByIdAndUpdate(
        variantId,
        { isActive: false },
        { new: true, session }
      );

      if (!variant) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Variant not found" });
      }

      // Note: We don't delete inventory, just mark variant as inactive
      await session.commitTransaction();
      res.status(200).json({
        message: "Variant disabled successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete variant",
      error: err.message,
    });
  }
};
