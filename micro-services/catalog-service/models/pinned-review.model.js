import mongoose from "mongoose";

const pinnedReviewSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },

    given_to_vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProfile",
      required: true,
      index: true,
    },

    given_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

pinnedReviewSchema.index(
  { review: 4, given_to_vendor: 1 },
  { unique: true }
);

export const PinnedReview = mongoose.model(
  "PinnedReview",
  pinnedReviewSchema,
  "pinned_reviews"
);
