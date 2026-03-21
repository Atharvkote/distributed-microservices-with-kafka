import { z } from "zod";
import {
  createPaymentOrder,
  processWebhook,
  verifyFrontendSignatureAndMarkSuccess,
} from "./razorpay.controller.js";
import { AppError } from "../utils/app-error.js";

const createSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
});

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const createPayment = async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const payment = await createPaymentOrder(body);
    return res.status(201).json({
      success: true,
      data: {
        orderId: payment.orderId,
        razorpayOrderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const body = verifySchema.parse(req.body);
    const payment = await verifyFrontendSignatureAndMarkSuccess(body);
    return res.status(200).json({
      success: true,
      data: {
        orderId: payment.orderId,
        paymentId: payment.razorpayPaymentId,
        status: payment.status,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const result = await processWebhook(req.body, signature);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

