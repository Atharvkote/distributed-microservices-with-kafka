import { cloudinaryUpload } from "../utils/cloundnary.upload.js";
import VendorProfile from "../models/vendor.model.js";
import { email, z } from "zod";
import {
  bannerSchema,
  createVendorSchema,
  logoSchema,
  updateVendorSchema,
} from "../validators/schemas.js";
import {
  publishVendorProfileCreated,
  publishVendorProfileUpdated,
} from "../kafka/kafka.producer.js";

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message);
    throw new Error(errors.join(", "));
  }
  return result.data;
};

export const createVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = validate(createVendorSchema, req.body);

    const existing = await VendorProfile.findOne({ user: userId });
    if (existing) {
      return res.status(409).json({ message: "Vendor profile already exists" });
    }

    const vendor = await VendorProfile.create({
      user: userId,
      ...data,
    });

    // Kafka Event Streaming
    const payload = {
      vendorId: vendor.store_id,
      ownerId: userId,
      email: req.user.email,
      storeName: vendor.store_name,
      createdAt: vendor.createdAt,
    };
    publishVendorProfileCreated(payload);

    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = validate(updateVendorSchema, req.body);

    const vendor = await VendorProfile.findOneAndUpdate(
      { user: userId },
      data,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Kafka Event Streaming
    const payload = {
      vendorId: vendor.store_id,
      email: req.user.email,
      storeName: vendor.store_name,

      changes: "vendor_profile_patch_update",
    };
    publishVendorProfileUpdated(payload);

    res.json({ message: "Vendor profile updated successfully", vendor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const completeVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = validate(updateVendorSchema, req.body);

    const vendor = await VendorProfile.findOneAndUpdate(
      { user: userId },
      data,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Kafka Event Streaming
    const payload = {
      vendorId: vendor.store_id,
      storeName: vendor.store_name,
      email: req.user.email,
      changes: "vendor_profile_completed",
    };
    console.log(payload);
    publishVendorProfileUpdated(payload);

    res.json({ message: "Vendor profile updated successfully", vendor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOne({ user: req.user.id }).populate(
      "user",
      "email full_name"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Logo file is required" });
    }

    const upload = await cloudinaryUpload(req.file.buffer, {
      folder: "vendors/logos",
      publicId: `logo-${req.user.id}`,
    });

    const vendor = await VendorProfile.findOneAndUpdate(
      { user: req.user.id },
      { store_logo: upload.secure_url },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Kafka Event Streaming
    const payload = {
      vendorId: vendor.store_id,
      email: req.user.email,
      storeName: vendor.store_name,
      changes: "vendor_profile_logo_updated",
    };
    publishVendorProfileUpdated(payload);

    res.json({
      message: "Logo Updated Successfully !",
      store_logo: vendor.store_logo,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Banner file is required" });
    }

    const upload = await cloudinaryUpload(req.file.buffer, {
      folder: "vendors/banners",
      publicId: `banner-${req.user.id}`,
    });

    const vendor = await VendorProfile.findOneAndUpdate(
      { user: req.user.id },
      { bg_banner: upload.secure_url },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Kafka Event Streaming
    const payload = {
      vendorId: vendor.store_id,
      email: req.user.email,
      storeName: vendor.store_name,

      changes: "vendor_profile_banner_updated",
    };
    publishVendorProfileUpdated(payload);

    res.json({
      message: "Banner Updated Successfully !",
      bg_banner: vendor.bg_banner,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteVendorProfile = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOneAndDelete({
      user: req.user.id,
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json({ message: "Vendor profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorProfileSummary = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await VendorProfile.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor.getProfileSummary());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
