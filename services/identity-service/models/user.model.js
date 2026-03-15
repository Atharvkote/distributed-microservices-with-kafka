import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import VendorProfile from "./vendor.model.js";
import fs from "fs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.isAuthProviderConfiged;
      },
    },

    full_name: {
      type: String,
      required: function () {
        return !this.isAuthProviderConfiged;
      },
    },
    phone: { type: String, default: "" },
    profile_picture: { type: String, default: "" },
    isAuthProviderConfiged: { type: Boolean, default: false },

    address: {
      residential_address: { type: String }, // A/p Address.....
      country: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: {
        type: String,
        match: /^[0-9]{6}$/,
      },
    },
  },
  { timestamps: true }
);

/**
 * @pre save
 * @description Hashes the user's password before saving if it was modified.
 */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const genSalt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, genSalt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * @method comparePassword
 * @async
 * @param {string} password - Plain text password to compare.
 * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise.
 */

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

/**
 * @method generateToken
 * @returns {string} - Signed JWT token valid for 7 days.
 *
 * @description Generates a JWT token containing the user's ID and email.
 * Signed with secret key in process.env.JWT_SECRET.
 */

const PRIVATE_KEY = fs.readFileSync("keys/jwt_private.pem", "utf8");

userSchema.methods.generateToken = async function () {
  const vendorProfile = await VendorProfile.findOne({ user: this._id });

  return jwt.sign(
    {
      sub: this._id.toString(),
      email: this.email,
      full_name: this.full_name,

      // vendor capability
      isVendor: !!vendorProfile,
      vendorId: vendorProfile?._id || null,
    },
    PRIVATE_KEY,
    {
      algorithm: "RS256",
      expiresIn: "15m",
      issuer: "identity-service",
    }
  );
};

const User = mongoose.model("Users", userSchema);
export default User;
