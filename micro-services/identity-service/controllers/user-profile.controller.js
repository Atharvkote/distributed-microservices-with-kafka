import UserModel from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloundnary.upload.js";
import { z } from "zod";
import {
  updateProfileSchema,
  completeProfileSchema,
} from "../validators/schemas.js";

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message);
    throw new Error(errors.join(", "));
  }
  return result.data;
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = validate(updateProfileSchema, req.body);

    const user = await UserModel.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = validate(completeProfileSchema, req.body);

    const user = await UserModel.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile completed successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const upload = await cloudinaryUpload(req.file.buffer, {
      folder: "users/profile",
      publicId: `profile-${req.user.id}`,
    });

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { profile_picture: upload.secure_url },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile picture updated successfully",
      profile_picture: user.profile_picture,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
