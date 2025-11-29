import { Router } from "express";
import {
  updateVendorProfileController,
  deleteVendorProfileController,
  completeVendorProfileController,
} from "../controllers/vendor-profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const vendorProfileRouter = Router();

// vendor Profile Routes
vendorProfileRouter.post("/complete-profile/:id", authMiddleware, completeVendorProfileController);
vendorProfileRouter.post("/update-profile/:id", authMiddleware, updateVendorProfileController);
vendorProfileRouter.post("/delete-profile/:id", authMiddleware, deleteVendorProfileController);

export default vendorProfileRouter;