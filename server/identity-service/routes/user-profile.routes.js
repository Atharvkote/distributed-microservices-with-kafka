import { Router } from "express";
import {
  updateProfileController,
  deleteProfileController,
  completeProfileController,
  profilePicController,
  getUserProfile,
} from "../controllers/user-profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const userProfileRouter = Router();

// User Auth Routes

// POST
userProfileRouter.post("/update-profile/:id", authMiddleware,updateProfileController);
userProfileRouter.post("/update-profile/edit-profile-picture",authMiddleware, profilePicController);
userProfileRouter.post("/delete-profile/:id",authMiddleware, deleteProfileController);
userProfileRouter.post("/complete-profile/:id",authMiddleware, completeProfileController);

// GET
userProfileRouter.get("/fetch-summary",authMiddleware, getUserProfile);




export default userProfileRouter;