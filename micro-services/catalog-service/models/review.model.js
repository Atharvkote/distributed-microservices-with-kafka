import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: String,

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema, "reviews");
