// workers/email.worker.js
import "dotenv/config";
import { Worker } from "bullmq";
import { sendMail } from "./configs/email.config.js";
import logger, { redisLogger } from "./utils/logger.js";
import Redis from "ioredis";

//Templates
import { getWelcomeEmailTemplate } from "./templates/user-created.template.js";
import { getUserAccountClosedEmailTemplate } from "./templates/user.deleted.template.js";
import { getVendorWelcomeEmailTemplate } from "./templates/vendor-created.template.js";
import { getProfileUpdatedEmailTemplate } from "./templates/vendor-profile-updated.template.js";
import {
  getOrderPlacedTemplate,
  getPaymentSuccessTemplate,
  getPaymentFailedTemplate,
} from "./templates/order.template.js";

let redisClient = null;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    });
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

new Worker(
  "email-queue",
  async (job) => {
    switch (job.name) {
      case "ORDER_CREATED":
        await sendMail({
          to: job.data.to,
          subject: `Order Placed - ${job.data.orderId}`,
          html: getOrderPlacedTemplate(job.data.orderId, job.data.total),
        });
        logger.info(`Email sent to ${job.data.to} for ORDER_CREATED`);
        break;

      case "PAYMENT_SUCCESS":
        await sendMail({
          to: job.data.to,
          subject: `Payment Successful - Order ${job.data.orderId}`,
          html: getPaymentSuccessTemplate(job.data.orderId, job.data.total, job.data.transactionId),
        });
        logger.info(`Email sent to ${job.data.to} for PAYMENT_SUCCESS`);
        break;

      case "PAYMENT_FAILED":
        await sendMail({
          to: job.data.to,
          subject: `Payment Failed - Order ${job.data.orderId}`,
          html: getPaymentFailedTemplate(job.data.orderId),
        });
        logger.info(`Email sent to ${job.data.to} for PAYMENT_FAILED`);
        break;

      case "USER_CREATED":
        await sendMail({
          to: job.data.to,
          subject: "Welcome to Our Platform",
          html: getWelcomeEmailTemplate(job.data.name),
        });
        logger.info(`Email sent to ${job.data.to}`);
        break;

      case "USER_UPDATED":
        await sendMail({
          to: job.data.to,
          subject: "Profile Updated",
          html: getProfileUpdatedEmailTemplate(job.data.name),
        });
        logger.info(`Email sent to ${job.data.to}`);
        break;

      case "USER_DELETED":
        await sendMail({
          to: job.data.to,
          subject: "Vendex Account Deleted",
          html: getUserAccountClosedEmailTemplate(job.data.name),
        });
        logger.info(`Email sent to ${job.data.to}`);
        break;

      case "VP_CREATED":
        await sendMail({
          to: job.data.to,
          subject: "Vendor Profile Created",
          html: getVendorWelcomeEmailTemplate(job.data.storeName),
        });
        logger.info(`Email sent to ${job.data.to}`);

      case "VP_UPDATED":
        await sendMail({
          to: job.data.to,
          subject: "Your Vendor Profile has been successfully updated",
          html: getProfileUpdatedEmailTemplate(job.data.storeName),
        });
        logger.info(`Email sent to ${job.data.to}`);

        break;
      case "VP_DELETED":
        await sendMail({
          to: job.data.to,
          subject: "Vendor Profile DELETED",
          html: getUserAccountClosedEmailTemplate(job.data.storeName),
        });
        logger.info(`Email sent to ${job.data.to}`);
        break;

      default:
        logger.error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: redisClient,
    concurrency: 5,
  }
);

logger.info(" Email worker running");
