import express from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  listOrdersForVendor,
  updateOrderStatus,
  updatePaymentStatus,
  generatePaymentIntent,
  getProductDetails,
  getVariantDetails,
  searchProducts,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Product read model endpoints (CQRS queries) - Must come before /:id routes
router.get("/products/search", searchProducts);
router.get("/products/:productId", getProductDetails);

// Variant read model endpoints (CQRS queries)
router.get("/variants/:variantId", getVariantDetails);

// Order endpoints
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, listOrders);
router.get("/vendor/me", authMiddleware, listOrdersForVendor);
router.get("/:id", authMiddleware, getOrderById);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

// Payment endpoints
router.post("/:id/payment-intent", authMiddleware, generatePaymentIntent);

export default router;
