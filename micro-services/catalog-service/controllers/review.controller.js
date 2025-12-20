import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { PinnedReview } from "../models/pinned-review.model.js";
import mongoose from "mongoose";
import {
  addReviewZod,
  updateReviewZod,
  getReviewsZod,
  deleteReviewZod,
  pinReviewZod,
} from "../validators/schema.js";

// Helper function to recalculate product ratings
const recalculateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      ratingCount: stats[0].ratingCount,
    });
  } else {
    // No reviews, reset to defaults
    await Product.findByIdAndUpdate(productId, {
      avgRating: 0,
      ratingCount: 0,
    });
  }
};

export const addReview = async (req, res) => {
  try {
    const parsed = addReviewZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { product, rating, comment } = parsed.data.body;

    // Check if product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      rating,
      comment: comment || "",
      isVerifiedPurchase: false, // Can be updated later based on order history
    });

    // Recalculate product ratings
    await recalculateProductRatings(product);

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add review",
      error: err.message,
    });
  }
};

export const getReviews = async (req, res) => {
  try {
    const parsed = getReviewsZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      product: parsed.data.params.productId,
    })
      .populate("user", "full_name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({
      product: parsed.data.params.productId,
    });

    // Get pinned reviews for this product
    const product = await Product.findById(parsed.data.params.productId);
    const pinnedReviews = await PinnedReview.find({
      review: { $in: reviews.map((r) => r._id) },
      given_to_vendor: product?.vendor,
    })
      .populate("review")
      .lean();

    const pinnedReviewIds = new Set(
      pinnedReviews.map((pr) => pr.review._id.toString())
    );

    const result = reviews.map((review) => ({
      ...review,
      isPinned: pinnedReviewIds.has(review._id.toString()),
    }));

    res.status(200).json({
      reviews: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reviews = await Review.find({ user: req.user.id })
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      reviews,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const parsed = updateReviewZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const review = await Review.findOneAndUpdate(
      { _id: parsed.data.params.id, user: req.user.id },
      { $set: parsed.data.body },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Recalculate product ratings
    await recalculateProductRatings(review.product);

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update review",
      error: err.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const parsed = deleteReviewZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const review = await Review.findOne({
      _id: parsed.data.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const productId = review.product;

    // Delete the review
    await Review.findByIdAndDelete(parsed.data.params.id);

    // Remove from pinned reviews if exists
    await PinnedReview.deleteMany({ review: parsed.data.params.id });

    // Recalculate product ratings
    await recalculateProductRatings(productId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete review",
      error: err.message,
    });
  }
};


export const pinReview = async (req, res) => {
  try {
    const parsed = pinReviewZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    const { reviewId } = parsed.data.params;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const review = await Review.findById(reviewId).populate({
      path: "product",
      select: "vendor",
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.product.vendor.toString() !== vendorId) {
      return res.status(403).json({
        message: "You can pin reviews only from your own products",
      });
    }

    // Check maximum pinned reviews limit
    const pinnedCount = await PinnedReview.countDocuments({
      given_to_vendor: vendorId,
    });

    if (pinnedCount >= 4) {
      return res.status(400).json({
        message: "Maximum 4 pinned reviews allowed",
      });
    }

    const pinned = await PinnedReview.create({
      review: review._id,
      given_to_vendor: vendorId,
      given_by: review.user,
    });

    res.status(201).json({
      message: "Review pinned successfully",
      pinned,
    });
  } catch (err) {
    // Duplicate pin (unique index protection)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Review already pinned",
      });
    }

    res.status(500).json({
      message: "Failed to pin review",
      error: err.message,
    });
  }
};


export const deletePinReview = async (req, res) => {
  try {
    const parsed = pinReviewZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    const { reviewId } = parsed.data.params;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const deleted = await PinnedReview.findOneAndDelete({
      review: reviewId,
      given_to_vendor: vendorId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Pinned review not found",
      });
    }

    res.status(200).json({
      message: "Pinned review removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to unpin review",
      error: err.message,
    });
  }
};
