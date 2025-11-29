import "dotenv/config";
import cloudinary from "../configs/cloudinary.config.js";
import logger from "../utils/logger.js";
import UserModel from "../models/user.model.js";

export const updateProfileController = () => { };

export const deleteProfileController = () => { };

export const completeProfileController = () => { };

export const profilePicController = async (req, res) => {
  try {
    const { profile_picture } = req.body;
    if (!profile_picture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profile_picture);
    if (!uploadResponse || !uploadResponse.secure_url) {
      logger.error("Failed to upload profile picture to Cloudinary");
      return res
        .status(500)
        .json({ message: "Failed to upload profile picture" });
    }
    const userId = req.user._id;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profile_picture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      user: updatedUser,
      message: "Profile picture updated successfully",
    });

    if (!updatedUser) {
      logger.error(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    logger.error(`Error in profileController :: `, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select("-password"); // Exclude Password
    if (!user) {
      logger.error(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    logger.error(`Error in getUserProfile :: `, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
