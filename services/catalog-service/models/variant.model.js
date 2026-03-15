import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
    },

    attributes: {
      // flexible attributes
      // ex: { color: "Red", size: "XL" }
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
    },
  },
  { timestamps: true }
);

export const ProductVariant = mongoose.model(
  "ProductVariant",
  productVariantSchema,
  "product_variants"
);
