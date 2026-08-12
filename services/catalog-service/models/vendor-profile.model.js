import mongoose from "mongoose";

/**
 * Minimal schema so Product.vendor ref "VendorProfile" can populate against
 * the shared `vendor_profiles` collection (identity-service is the writer).
 */
const vendorProfileSchema = new mongoose.Schema(
  {
    store_name: { type: String, default: "" },
    store_logo: { type: String, default: "" },
    ratings: { type: Number, default: 0 },
  },
  { strict: false }
);

export const VendorProfile = mongoose.model(
  "VendorProfile",
  vendorProfileSchema,
  "vendor_profiles"
);
