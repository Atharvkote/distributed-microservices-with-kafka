import { Router } from "express";
import {
  updateProfile,
  deleteProfile,
  completeProfile,
  updateProfilePicture,
  getUserProfile,
} from "../controllers/user-profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// POST
router.post("/update-profile/:id", updateProfile);
router.post("/delete-profile/:id", deleteProfile);

// PATCH
router.patch("/update-profile-picture", updateProfilePicture);

// GET
router.get("/fetch-summary", getUserProfile);

router.post("/complete-profile/:id", completeProfile);

// DELETE — legacy 
// router.delete("/complete-profile/:id", );

export default router;
