import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createProductVariant,
  deleteProductVariant,
  getProductAllVariant,
  getProductVariant,
  getVendorProductAllVariants,
  updateProductVariant,
} from "../controllers/variant.controller.js";

const router = Router();

// Vendor routes before /:id
router.get(
  "/vendor/product/:productId",
  authMiddleware,
  getVendorProductAllVariants
);

// Public routes
router.get("/product/:productId", getProductAllVariant);
router.get("/:id", getProductVariant);

// Vendor routes (protected)
router.post(
  "/",
  authMiddleware,
  upload.array("images", 3),
  createProductVariant
);

router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 3),
  updateProductVariant
);

router.delete("/:id", authMiddleware, deleteProductVariant);

export default router;
