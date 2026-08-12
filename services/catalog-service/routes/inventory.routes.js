import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getProductStocks,
  updateProductStock,
  getLowStockAlerts,
  bulkUpdateProductStock,
  reserveInventory,
  releaseInventory,
  confirmInventory,
} from "../controllers/inventory.controller.js";

const router = Router();

// Service-to-service inventory management
router.post("/reserve", reserveInventory);
router.post("/release", releaseInventory);
router.post("/confirm", confirmInventory);

// Vendor routes (protected)
router.get("/alerts", authMiddleware, getLowStockAlerts);
router.patch("/bulk", authMiddleware, bulkUpdateProductStock);
router.get("/", authMiddleware, getProductStocks);
router.put("/:variantId", authMiddleware, updateProductStock);

export default router;
