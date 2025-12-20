import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      unique: true,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    reserved: {
      type: Number,
      default: 0, // for cart reservations
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model(
  "Inventory",
  inventorySchema,
  "inventory"
);
