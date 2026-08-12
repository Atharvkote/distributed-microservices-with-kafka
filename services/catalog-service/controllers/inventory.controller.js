import { Inventory } from "../models/inventory.model.js";
import { ProductVariant } from "../models/variant.model.js";
import { Product } from "../models/product.model.js";
import { updateStockZod, bulkUpdateStockZod } from "../validators/schema.js";

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

    // Get and update inventory atomically
    let inventory;
    if (delta < 0) {
      inventory = await Inventory.findOneAndUpdate(
        {
          variant: variantId,
          $expr: {
            $gte: [{ $subtract: ["$stock", "$reserved"] }, Math.abs(delta)]
          }
        },
        { $inc: { stock: delta } },
        { new: true }
      );
      if (!inventory) {
        const exists = await Inventory.findOne({ variant: variantId });
        if (!exists) {
          return res.status(404).json({ message: "Inventory not found" });
        }
        return res.status(400).json({
          message: "Insufficient available stock",
          available: exists.stock - exists.reserved,
          requested: Math.abs(delta),
        });
      }
    } else {
      inventory = await Inventory.findOneAndUpdate(
        { variant: variantId },
        { $inc: { stock: delta } },
        { new: true }
      );
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
    }

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

export const getLowStockAlerts = async (req, res) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const threshold = Math.max(Number(req.query.threshold) || 0, 0);

    const rows = await Inventory.aggregate([
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
      { $match: { "product.vendor": vendorId, "variant.isActive": true } },
      {
        $addFields: {
          available: { $subtract: ["$stock", "$reserved"] },
          effectiveThreshold: {
            $cond: [{ $gt: [threshold, 0] }, threshold, "$lowStockThreshold"],
          },
        },
      },
      {
        $match: {
          $expr: { $lte: ["$available", "$effectiveThreshold"] },
        },
      },
      {
        $project: {
          stock: 1,
          reserved: 1,
          lowStockThreshold: 1,
          available: 1,
          "variant._id": 1,
          "variant.sku": 1,
          "product.title": 1,
        },
      },
    ]);

    res.status(200).json({ alerts: rows });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch low-stock alerts",
      error: err.message,
    });
  }
};

export const bulkUpdateProductStock = async (req, res) => {
  try {
    const parsed = bulkUpdateStockZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const results = [];

    for (const { variantId, delta } of parsed.data.body.updates) {
      const variant = await ProductVariant.findById(variantId).populate({
        path: "product",
        select: "vendor",
      });

      if (!variant) {
        results.push({ variantId, ok: false, message: "Variant not found" });
        continue;
      }
      if (variant.product.vendor.toString() !== vendorId) {
        results.push({ variantId, ok: false, message: "Unauthorized" });
        continue;
      }

      let inventory;
      if (delta < 0) {
        inventory = await Inventory.findOneAndUpdate(
          {
            variant: variantId,
            $expr: {
              $gte: [{ $subtract: ["$stock", "$reserved"] }, Math.abs(delta)]
            }
          },
          { $inc: { stock: delta } },
          { new: true }
        );
        if (!inventory) {
          const exists = await Inventory.findOne({ variant: variantId });
          if (!exists) {
            results.push({ variantId, ok: false, message: "Inventory not found" });
          } else {
            results.push({
              variantId,
              ok: false,
              message: "Insufficient available stock",
              available: exists.stock - exists.reserved,
            });
          }
          continue;
        }
      } else {
        inventory = await Inventory.findOneAndUpdate(
          { variant: variantId },
          { $inc: { stock: delta } },
          { new: true }
        );
        if (!inventory) {
          results.push({ variantId, ok: false, message: "Inventory not found" });
          continue;
        }
      }

      results.push({ variantId, ok: true, inventory });
    }

    res.status(200).json({ message: "Bulk stock update completed", results });
  } catch (err) {
    res.status(500).json({
      message: "Failed bulk stock update",
      error: err.message,
    });
  }
};

export const reserveInventory = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const reserved = [];
    for (const item of items) {
      const { variantId, quantity } = item;
      if (!variantId || !quantity || quantity <= 0) {
        // Rollback already reserved items
        for (const r of reserved) {
          await Inventory.findOneAndUpdate(
            { variant: r.variantId },
            { $inc: { reserved: -r.quantity } }
          );
        }
        return res.status(400).json({ message: "Invalid variantId or quantity" });
      }

      const updated = await Inventory.findOneAndUpdate(
        {
          variant: variantId,
          $expr: {
            $gte: [{ $subtract: ["$stock", "$reserved"] }, quantity]
          }
        },
        { $inc: { reserved: quantity } },
        { new: true }
      );

      if (!updated) {
        // Rollback already reserved items
        for (const r of reserved) {
          await Inventory.findOneAndUpdate(
            { variant: r.variantId },
            { $inc: { reserved: -r.quantity } }
          );
        }
        return res.status(400).json({
          message: `Insufficient stock or variant not found for variantId: ${variantId}`,
        });
      }

      reserved.push({ variantId, quantity });
    }

    return res.status(200).json({ message: "Inventory reserved successfully", reserved });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reserve inventory", error: err.message });
  }
};

export const releaseInventory = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    for (const item of items) {
      const { variantId, quantity } = item;
      await Inventory.findOneAndUpdate(
        { variant: variantId },
        { $inc: { reserved: -quantity } }
      );
    }

    return res.status(200).json({ message: "Inventory released successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to release inventory", error: err.message });
  }
};

export const confirmInventory = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    for (const item of items) {
      const { variantId, quantity } = item;
      // Decrement stock and reserved atomically
      await Inventory.findOneAndUpdate(
        { variant: variantId },
        {
          $inc: {
            stock: -quantity,
            reserved: -quantity
          }
        }
      );
    }

    return res.status(200).json({ message: "Inventory confirmed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to confirm inventory", error: err.message });
  }
};
