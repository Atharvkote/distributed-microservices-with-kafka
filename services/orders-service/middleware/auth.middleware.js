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
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
      issuer: "identity-service",
    });

    req.user = {
      id: decoded.sub,
      isVendor: Boolean(decoded.isVendor),
      email: decoded.email,
      role: decoded.role ?? "USER",
      full_name: decoded.full_name,
      vendorId: decoded.vendorId ?? null,
    };

    next();
  } catch (err) {
    logger.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRole = req.user.role || "USER";
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
