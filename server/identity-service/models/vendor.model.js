import mongoose from "mongoose";

/**
 * @file VendorProfile Model
 * @description Schema for vendor store details linked to a User.
 */

const vendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },
    store_id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    store_name: {
      type: String,
      required: true,
      trim: true,
    },
    store_logo: {
      type: String,
      default: "",
    },
    bg_banner: {
      type: String,
      default: "",
    },
    store_description: {
      type: String,
      default: "",
    },
    gst_number: {
      type: String,
      default: "",
    },
    bank_account_info: {
      account_number: {
        type: String,
        default: "",
      },
      ifsc: {
        type: String,
        default: "",
      },
      bank_name: {
        type: String,
        default: "",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((tag) => tag.toLowerCase().trim()),
    },
    ratings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * @method getProfileSummary
 * @returns {object} - A minimal profile summary object.
 * @description Provides a light version of the vendor profile for listings.
 */
vendorProfileSchema.methods.getProfileSummary = function () {
  return {
    store_name: this.store_name,
    store_logo: this.store_logo,
    bg_banner: this.bg_banner,
    ratings: this.ratings,
    tags: this.tags,
  };
};

const VendorProfile = mongoose.model("VendorProfiles", vendorProfileSchema);
export default VendorProfile;
