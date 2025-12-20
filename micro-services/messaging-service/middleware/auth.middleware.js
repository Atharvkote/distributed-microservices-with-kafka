import jwt from "jsonwebtoken";
import fs from "fs";
import logger from "../utils/logger.js";

const PUBLIC_KEY = fs.readFileSync("keys/jwt_public.pem", "utf8");

export const authMiddleware = (req, res, next) => {
  let token = null;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "identity-service",
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      vendorId: decoded.vendorId ?? null,
    };

    next();
  } catch (err) {
    logger.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
