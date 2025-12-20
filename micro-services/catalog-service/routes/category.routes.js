import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getSubCategories,
  updateCategory,
  deleteCategory,
  getCategoryBreadcrumbs,
} from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubCategories);
router.get("/:id/breadcrumbs", getCategoryBreadcrumbs);

// Admin
router.use(authMiddleware);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
