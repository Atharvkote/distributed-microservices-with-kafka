import mongoose from "mongoose";

const productReadSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      index: true,
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      index: "text",
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    brand: {
      type: String,
      default: "",
      index: true,
    },

    tags: {
      type: [String],
      index: true,
    },

    avgRating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

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

export const ProductReadModel = mongoose.model(
  "ProductReadModel",
  productReadSchema,
  "product_read_model"
);