import { Inventory } from "../models/inventory.model.js";
import { ProductVariant } from "../models/variant.model.js";
import { Product } from "../models/product.model.js";
import { updateStockZod } from "../validators/schema.js";

export const getProductStocks = async (req, res) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const inventory = await Inventory.aggregate([
      {
        $lookup: {
          from: "product_variants",
          localField: "variant",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      {
        $lookup: {
          from: "products",
          localField: "variant.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      {
        $match: {
          "product.vendor": vendorId,
        },
      },

      {
        $project: {
          stock: 1,
          reserved: 1,
          lowStockThreshold: 1,
          "variant._id": 1,
          "variant.sku": 1,
          "product.title": 1,
        },
      },
    ]);

    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch inventory",
      error: err.message,
    });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const parsed = updateStockZod.safeParse({
      params: req.params,
      body: req.body,
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { variantId } = parsed.data.params;
    const { delta } = parsed.data.body;
    const vendorId = req.user?.vendorId;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    // Verify variant belongs to vendor
    const variant = await ProductVariant.findById(variantId).populate({
      path: "product",
      select: "vendor",
    });

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (variant.product.vendor.toString() !== vendorId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get current inventory
    const inventory = await Inventory.findOne({ variant: variantId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    // Check if we have enough available stock for negative delta
    const availableStock = inventory.stock - inventory.reserved;
    if (delta < 0 && availableStock < Math.abs(delta)) {
      return res.status(400).json({
        message: "Insufficient available stock",
        available: availableStock,
        requested: Math.abs(delta),
      });
    }

    // Update stock
    inventory.stock += delta;
    if (inventory.stock < 0) {
      inventory.stock = 0;
    }
    await inventory.save();

    res.status(200).json({
      message: "Stock updated successfully",
      inventory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update stock",
      error: err.message,
    });
  }
};
