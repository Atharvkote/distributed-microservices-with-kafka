import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { userID: this._id.toString(), email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("Users", userSchema);
export default User;
