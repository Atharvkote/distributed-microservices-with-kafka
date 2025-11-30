/**
 * @file server.js
 * @description Main server entry point.
 * Initializes Express application, sets up middleware, connects to MongoDB, Redis, Kafka,
 * and configures Socket.IO for real-time communication. Also handles graceful shutdown.
 *
 * Key features:
 * - Express with security (helmet, cors), rate limiting (rate-limiter-flexible + rate-limit-redis)
 * - MongoDB connection via Mongoose
 * - Redis for rate limiting and Socket.IO scaling
 * - Routes for auth and messaging APIs
 * - Graceful shutdown on SIGINT / SIGTERM
 *
 * @usage
 * Start with `npm run dev` or `npx nodemon server.js` (after environment variables are configured).
 */

// Server Enivronment
import "dotenv/config";

// Dependencies
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import helmet from "helmet";
import Redis from "ioredis";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import client from "prom-client";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { fileURLToPath } from "url";

// Connections & Configurations
import { connectDB, disconnectDB } from "./configs/mongodb.config.js";
import logger, { redisLogger } from "./utils/logger.js";

// Configs
await connectDB();

// Definitions
const app = express();
const SERVER_PORT = process.env.SERVER_PORT;
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Whitelist
const allowedOrigins = ["http://localhost:5173", "http://localhost:9090"];

// Create Redis client if REDIS_URL provided
let redisClient = null;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
} catch (err) {
  redisLogger.error(
    `Redis client connection failed on ${process.env.REDIS_URL} , [ Enviroment : Docker ] - ${err.message}`
  );
}

if (!redisClient) {
  redisLogger.warn(
    `Redis client not available. Rate limiters that depend on Redis will be disabled.`
  );
} else {
  redisLogger.info(
    `Redis client connected successfully on ${process.env.REDIS_URL} , [ Enviroment : Docker ]`
  );
}

/**
 * @middleware Parsing & Security
 *
 * - express.json() + bodyParser.json(): Parses JSON request bodies.
 * - express.urlencoded(): Parses URL-encoded form data (supports extended syntax).
 * - cookieParser(): Reads cookies from incoming requests.
 * - helmet(): Secures HTTP headers and enables cross-origin resource policy.
 */

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/**
 * @middleware CORS
 * Configures Cross-Origin Resource Sharing for the API.
 *
 * - Allows requests only from whitelisted origins (defined in `allowedOrigins`).
 * - Supports credentials (cookies, auth headers) for cross-origin requests.
 * - Restricts allowed HTTP methods to GET, POST, PUT, PATCH, DELETE, OPTIONS.
 *
 * Rejects any origin not explicitly listed, returning a CORS error.
 */

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/**
 * @ratelimiter Global Rate Limiter
 * Uses `RateLimiterRedis` to apply a general rate limit of:
 * - 100 requests per IP within 30 seconds
 * - If exceeded, blocks IP for 15 minutes.
 *
 * Protects the API from excessive requests across all routes.
 */

// Rate limiters (only if Redis is available)
let rateLimiter = null;
if (redisClient) {
  try {
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "middleware",
      points: 100, // 100 requests
      duration: 30, // 30 seconds
      blockDuration: 15 * 60, // Block for 15 min if limit is exceeded
    });
  } catch (error) {
    logger.warn("Failed to create rate limiter:", error.message);
  }
}

app.use((req, res, next) => {
  if (!rateLimiter) return next();

  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

/**
 * @ratelimiter Auth Rate Limiter
 * Intended to protect sensitive auth routes (login/signup) by limiting to:
 * - 10 requests per 15 minutes
 * - If exceeded, blocks IP for another 15 minutes.
 *
 */

let authLimiter = null;

if (redisClient) {
  try {
    authLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "auth_fail_limiter",
      points: 10, // 10 requests
      duration: 60 * 15, // Per 15 minutes
      blockDuration: 60 * 15, // Block for 15 min if limit is exceeded
    });
  } catch (error) {
    logger.warn("Failed to create auth limiter:", error.message);
  }
}

app.use("/api/v1/auth", async (req, res, next) => {
  try {
    if (noAuthLimiterRoutes.includes(req.path)) {
      return next();
    }
    if (authLimiter) {
      await authLimiter.consume(req.ip);
    }
    next();
  } catch (rejRes) {
    res.status(429).json({
      message:
        "Too many login/signup attempts. Please try again after 15 minutes.",
    });
  }
});

/**
 * @ratelimiter Sensitive Endpoint Limiter
 * Uses express-rate-limit with RedisStore to specifically throttle high-risk endpoints
 * to max 10 requests per 30 seconds. Designed for future application on endpoints
 * like password reset or account deletion.
 */

let sensitiveEndpointsLimiter = null;
if (redisClient) {
  try {
    sensitiveEndpointsLimiter = rateLimit({
      windowMs: 30 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip,
      handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        skipFailedRequests: true,
      }),
    });
  } catch (error) {
    logger.warn("Failed to create sensitive endpoints limiter:", error.message);
  }
}

/**
 * @logger Request Logging
 * Logs each incoming request's method, URL, body, and IP address
 * using Winston logger for structured analysis and debugging.
 */

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(
    `Request body : ${req.body ? JSON.stringify(req.body, null, 2) : "N/A"}`
  );
  logger.info(`Request IP, ${req.ip}`);
  next();
});

/**
 * @router Routes
 *
 * - GET `/` : Root endpoint to verify server is running, returns a simple welcome message.
 *
 * - Mounts `/api/v1/auth` to handle authentication-related operations
 *   (login, signup, profile, etc) via `authRouter`.
 *
 * - Mounts `/api/messages` to handle chat messaging routes via `messageRouter`,
 *   including sending messages, fetching conversations, and listing online users.
 */

app.get("/", (req, res) => {
  res.send("Welcome to the Messaging Service API Server!");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * @mainserver Server Startup & Graceful Shutdown
 *
 * - Starts HTTP server on configured `SERVER_PORT`, logging environment details for clarity.
 *
 * - Sets up graceful shutdown hooks on `SIGINT` (Ctrl+C) and `SIGTERM` (container stop),
 *   ensuring:
 *     - HTTP server closes first
 *     - Active MongoDB connections are disconnected via `disconnectDB()`
 *     - Process exits cleanly
 *
 * - Includes a hard timeout to force exit after 10 seconds if cleanup stalls.
 */

server.listen(SERVER_PORT, () => {
  logger.info(
    `Server is running on http://localhost:${SERVER_PORT} [ Enviroment : ${process.env.NODE_ENV}]`
  );
});

const shutdown = async () => {
  logger.info(
    `Server shutting down on http://localhost:${SERVER_PORT} [ Enviroment : ${process.env.NODE_ENV}]`
  );
  server.close(async () => {
    console.log("HTTP server closed.");
    await disconnectDB();
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);