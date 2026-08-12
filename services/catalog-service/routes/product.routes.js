import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createProduct,
  getVendorProduct,
  getPublicProductById,
  getPublicProducts,
  updateProduct,
  deleteProduct,
  listVendorProducts,
} from "../controllers/product.controller.js";

const router = Router();

// Public routes
router.get("/", getPublicProducts);

// Vendor routes — register before `/:id` so `vendor` is not captured as an id
router.post("/", authMiddleware, createProduct);
router.get("/vendor/me", authMiddleware, listVendorProducts);
router.get("/vendor/:id", authMiddleware, getVendorProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

router.get("/:id", getPublicProductById);

export default router;
