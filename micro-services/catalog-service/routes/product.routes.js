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
} from "../controllers/product.controller.js";

const router = Router();

// Public routes
router.get("/", getPublicProducts);
router.get("/:id", getPublicProductById);

// Vendor routes (protected)
router.post(
  "/",
  authMiddleware,
  createProduct
);

router.get("/vendor/:id", authMiddleware, getVendorProduct);

router.put(
  "/:id",
  authMiddleware,
  updateProduct
);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
