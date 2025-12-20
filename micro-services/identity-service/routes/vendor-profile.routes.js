import express from "express";
import {
  createVendorProfile,
  updateVendorProfile,
  completeVendorProfile,
  getVendorProfile,
  updateLogo,
  updateBanner,
  deleteVendorProfile,
  getVendorProfileSummary,
} from "../controllers/vendor-profile.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createVendorProfile);

router.get("/", getVendorProfile);
router.get("/summary/:vendorId", getVendorProfileSummary);

router.patch("/", updateVendorProfile);
router.patch("/complete", completeVendorProfile);
router.patch("/logo", upload.single("logo"), updateLogo);
router.patch("/banner", upload.single("banner"), updateBanner);

router.delete("/", deleteVendorProfile);

export default router;
