import { z } from "zod";
import { Payment } from "../models/payment.model.js";
import { razorpayClient } from "../configs/razorpay.provider.js";
import { AppError } from "../utils/app-error.js";
import { assertTransition } from "../utils/payment-state.util.js";
import { publishPaymentFailed, publishPaymentSuccess } from "../kafka/payment.producer.js";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../utils/signature.util.js";
import logger from "../utils/logger.js";

const createPaymentSchema = z.object({
  orderId: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).default("INR"),
});

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const allowedWebhookEvents = new Set(["payment.captured", "payment.failed"]);

const toPaise = (amount) => Math.round(Number(amount) * 100);

export const createPaymentOrder = async (input) => {
  const parsed = createPaymentSchema.parse(input);
  const { orderId, amount, currency } = parsed;

  const existing = await Payment.findOne({ orderId });
  if (existing && existing.status === "SUCCESS") {
    throw new AppError("Payment already successful for order", 409, "PAYMENT_DONE");
  }

  if (existing?.razorpayOrderId && ["PENDING", "CREATED"].includes(existing.status)) {
    return existing;
  }

  const razorpayOrder = await razorpayClient.orders.create({
    amount: toPaise(amount),
    currency,
    receipt: orderId,
    notes: { orderId },
  });

  const payment = await Payment.findOneAndUpdate(
    { orderId },
    {
      $set: {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency,
        status: "PENDING",
      },
      $setOnInsert: {
        status: "CREATED",
      },
    },
    { upsert: true, new: true }
  );

  return payment;
};

export const verifyFrontendSignatureAndMarkSuccess = async (input) => {
  const parsed = verifySchema.parse(input);
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed;

  const ok = verifyRazorpayPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    secret: process.env.RAZORPAY_KEY_SECRET,
  });

  if (!ok) {
    throw new AppError("Invalid payment signature", 401, "INVALID_SIGNATURE");
  }

  const payment = await Payment.findOne({ orderId });
  if (!payment) throw new AppError("Payment record not found", 404, "PAYMENT_NOT_FOUND");
  if (payment.status === "SUCCESS") return payment;

  assertTransition(payment.status, "SUCCESS");

  payment.razorpayOrderId = razorpayOrderId;
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.status = "SUCCESS";
  await payment.save();

  await publishPaymentSuccess({
    orderId: payment.orderId,
    paymentId: payment.razorpayPaymentId,
    status: "SUCCESS",
  });

  return payment;
};

export const processWebhook = async (rawBody, signatureHeader) => {
  if (!signatureHeader) {
    throw new AppError("Missing webhook signature", 401, "MISSING_WEBHOOK_SIGNATURE");
  }

  const valid = verifyRazorpayWebhookSignature({
    rawBody,
    signature: signatureHeader,
    secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  });

  if (!valid) {
    throw new AppError("Invalid webhook signature", 401, "INVALID_WEBHOOK_SIGNATURE");
  }

  const event = JSON.parse(rawBody.toString("utf8"));
  const eventType = event?.event;
  if (!allowedWebhookEvents.has(eventType)) {
    logger.info("Ignoring webhook event", { eventType });
    return { ignored: true, eventType };
  }

  const entity = event?.payload?.payment?.entity;
  if (!entity) throw new AppError("Invalid webhook payload", 400, "INVALID_WEBHOOK");

  const razorpayOrderId = entity.order_id;
  const razorpayPaymentId = entity.id;
  const orderId = entity.notes?.orderId || entity.notes?.order_id || null;

  const payment = await Payment.findOne({
    $or: [{ razorpayOrderId }, { orderId }],
  });
  if (!payment) throw new AppError("Payment not found for webhook", 404, "PAYMENT_NOT_FOUND");

  if (eventType === "payment.captured") {
    if (payment.status !== "SUCCESS") {
      assertTransition(payment.status, "SUCCESS");
      payment.status = "SUCCESS";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpayOrderId = razorpayOrderId || payment.razorpayOrderId;
      await payment.save();
      await publishPaymentSuccess({
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        status: "SUCCESS",
      });
    }
  } else if (eventType === "payment.failed") {
    if (payment.status !== "FAILED") {
      if (payment.status !== "SUCCESS") {
        assertTransition(payment.status, "FAILED");
        payment.status = "FAILED";
      }
      payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
      await payment.save();
      await publishPaymentFailed({
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        status: "FAILED",
      });
    }
  }

  return { ignored: false, eventType, orderId: payment.orderId };
};

export const onOrderCreated = async ({ orderId, amount }) => {
  if (!orderId || !Number.isFinite(amount)) {
    throw new AppError("Invalid ORDER_CREATED payload", 400, "INVALID_EVENT_PAYLOAD");
  }

  await createPaymentOrder({ orderId, amount, currency: "INR" });
};

