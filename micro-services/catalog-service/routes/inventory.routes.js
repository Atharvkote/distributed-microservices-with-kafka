import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getProductStocks,
  updateProductStock,
} from "../controllers/inventory.controller.js";

const router = Router();

// Vendor routes (protected)
router.get("/", authMiddleware, getProductStocks);
router.put("/:variantId", authMiddleware, updateProductStock);

export default router;
