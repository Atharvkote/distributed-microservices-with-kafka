import express from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  updatePaymentStatus,
  generatePaymentIntent,
  getProductDetails,
  getVariantDetails,
  searchProducts,
} from "../controllers/order.controller.js";

const router = express.Router();

// Product read model endpoints (CQRS queries) - Must come before /:id routes
router.get("/products/search", searchProducts);
router.get("/products/:productId", getProductDetails);

// Variant read model endpoints (CQRS queries)
router.get("/variants/:variantId", getVariantDetails);

// Order endpoints
router.post("/", createOrder);
router.get("/", listOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

// Payment endpoints
router.post("/:id/payment-intent", generatePaymentIntent);
router.patch("/:id/payment", updatePaymentStatus);

export default router;
