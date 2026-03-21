import mongoose from "mongoose";

const variantReadSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      index: true,
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    attributes: {
      type: Map,
      of: String,
    },

    price: {
      mrp: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 },
    },

    weight: {
      value: Number,
      unit: { type: String, enum: ["g", "kg"] },
    },

    images: [
      {
        url: String,
        alt: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// useful indexes
variantReadSchema.index({ productId: 1 });
variantReadSchema.index({ isActive: 1 });
variantReadSchema.index({ productId: 1, isActive: 1 });

export const VariantReadModel = mongoose.model(
  "VariantReadModel",
  variantReadSchema,
  "variant_read_model"
);