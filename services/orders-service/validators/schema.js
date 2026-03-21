import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

// Order Item Schema
const orderItemSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema.optional(),
  quantity: z.number().min(1).max(1000),
  price: z.number().positive().optional(),
});

// Shipping Address Schema
const shippingAddressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
});

// Create Order Validation
export const createOrderZod = z.object({
  body: z.object({
    customerId: objectIdSchema,
    customerName: z.string().min(1).max(100),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().optional(),
    shippingAddress: shippingAddressSchema,
    items: z.array(orderItemSchema).min(1),
    notes: z.string().max(500).optional(),
  }),
});

// Get Order By ID Validation
export const getOrderByIdZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// List Orders Validation
export const listOrdersZod = z.object({
  query: z.object({
    customerId: objectIdSchema.optional(),
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ]).optional(),
    page: z.string().or(z.number()).optional(),
    limit: z.string().or(z.number()).optional(),
  }),
});

// Update Order Status Validation
export const updateOrderStatusZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ]),
  }),
});

// Update Payment Status Validation
export const updatePaymentStatusZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    paymentStatus: z.enum([
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ]),
    transactionId: z.string().optional(),
    paymentMethod: z.string().optional(),
  }),
});
