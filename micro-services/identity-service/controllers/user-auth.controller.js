import "dotenv/config";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import logger from "../utils/logger.js";
import { schemas } from "../validators/schemas.js";
import {
  publishUserCreated,
  publishUserLogin,
  publishUserLogout,
} from "../kafka/kafka.producer.js";

/**
 * @function SignUpController
 * @description Handles user registration by validating request data using Zod schema,
 * checks for existing users in the database, securely hashes the password using Mongoose pre-save hook,
 * saves the new user, and returns a JWT token upon successful registration.
 *
 * @route POST /api/auth/signup
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 *
 * @returns {Promise<void>}
 */

export const SignUpController = async (req, res) => {
  try {
    const parsedData = schemas.signUpSchema.safeParse(req.body);
    if (!parsedData.success) {
      logger.error(`Validation error in SignUpController`, parsedData.error);
      return res.status(400).json({
        message: "Please fill all the required fields correctly",
        errors: parsedData.error.flatten().fieldErrors,
      });
    }

    const { email, password, full_name, phone } = parsedData.data;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User account already exists with this email",
      });
    }

    const newUser = new UserModel({
      email,
      password,
      full_name,
      phone,
      isAuthProviderConfiged: false,
    });

    const savedUser = await newUser.save();
    const token = await savedUser.generateToken();

    logger.info(
      `User account created successfully for ${savedUser.email} [Environment: ${process.env.NODE_ENV}]`
    );

    // Kafka Event Streaming
    const payload = {
      _id: savedUser._id,
      email: savedUser.email,
      full_name: savedUser.full_name,
      createdAt: savedUser.createdAt,
    };

    publishUserCreated(payload);

    return res.status(201).json({
      message: "User account created successfully",
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        phone: savedUser.phone,
      },
      token,
    });
  } catch (error) {
    logger.error(`Error in SignUpController`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function LoginController
 * @description Handles user login by validating input with Zod, verifying the user’s credentials,
 * comparing the password using bcrypt, and generating a JWT token upon successful authentication.
 *
 * @route POST /api/auth/login
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 *
 * @returns {Promise<void>}
 */

export const LoginController = async (req, res) => {
  try {
    const parsedData = schemas.loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsedData.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsedData.data;

    const user = await UserModel.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: No user found for email ${email}`);
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Incorrect password for email ${email}`);
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = await user.generateToken();
    logger.info(
      `User ${user.email} logged in successfully [Environment: ${process.env.NODE_ENV}]`
    );

    // Kafka Event Streaming
    const payload = {
      userId: user._id,
      ip: req.ip,
    };
    publishUserLogin(payload);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        profile_picture: user.profile_picture,
      },
      token,
    });
  } catch (error) {
    logger.error(`Error in LoginController`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function LogOutController
 * @description Handles user logout by clearing the authentication token cookie.
 *
 * @route POST /api/auth/logout
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 *
 * @returns {Promise<void>}
 */

export const LogOutController = async (req, res) => {
  try {
    res.clearCookie("token");

    // Kafka Event Streaming
    const payload = {
      userId: req.user._id,
    };
    publishUserLogout(payload);

    logger.info(
      `User logged out successfully [Environment: ${process.env.NODE_ENV}]`
    );
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    logger.error(`Error in LogOutController`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function CheckAuthorization
 * @description Verifies and returns the authenticated user's information.
 * Assumes that authentication middleware has already validated the token and attached the user to the request object.
 *
 * @route GET /api/auth/authenticated
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 *
 * @returns {Promise<void>}
 */

export const CheckAuthorization = async (req, res) => {
  try {
    return res.status(200).json({
      message: "User is authenticated",
      user: req.user,
    });
  } catch (error) {
    logger.error(`Error in CheckAuthorization`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @function OauthController
 * @description Placeholder for future OAuth implementation.
 *
 * @route POST /api/auth/oauth
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 *
 * @returns {Promise<void>}
 */

export const OauthController = (req, res) => {
  return res.status(501).json({ message: "OAuth not implemented yet" });
};
