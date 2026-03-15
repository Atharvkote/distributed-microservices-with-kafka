import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

export const createOrderZod = z.object({
  body: z.object({
    customerId: objectIdSchema,
    customerName: z.string().min(1).max(200),
    shippingAddress: z.string().min(1).max(500),
    items: z
      .array(
        z.object({
          productId: objectIdSchema,
          name: z.string().min(1).max(300),
          quantity: z.number().int().min(1),
          price: z.number().nonnegative(),
        })
      )
      .min(1),
  }),
});

export const updateOrderStatusZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),
});

export const getOrderByIdZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listOrdersZod = z.object({
  query: z.object({
    customerId: objectIdSchema.optional(),
    status: z
      .enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
      .optional(),
    page: z
      .string()
      .transform((v) => parseInt(v, 10))
      .or(z.number())
      .optional(),
    limit: z
      .string()
      .transform((v) => parseInt(v, 10))
      .or(z.number())
      .optional(),
  }),
});

