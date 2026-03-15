import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProfile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: String,
      default: "",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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

    tags: {
      type: [String],
      index: true,
    },

    seo: {
      slug: { type: String, unique: true },
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema, "products");
