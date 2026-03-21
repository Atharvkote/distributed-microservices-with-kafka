import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  logger.info("MongoDB connected", { host: conn.connection.host });
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info("MongoDB disconnected");
};