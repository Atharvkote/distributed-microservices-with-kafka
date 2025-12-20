import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  addReview,
  deletePinReview,
  deleteReview,
  getReviews,
  getReviewsByUser,
  updateReview,
  pinReview,
} from "../controllers/review.controller.js";

const router = Router();

// Public routes
router.get("/product/:productId", getReviews);

// User routes (protected)
router.post("/", authMiddleware, addReview);
router.get("/user", authMiddleware, getReviewsByUser);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

// Vendor routes (protected)
router.post("/:reviewId/pin", authMiddleware, pinReview);
router.delete("/:reviewId/unpin", authMiddleware, deletePinReview);

export default router;
