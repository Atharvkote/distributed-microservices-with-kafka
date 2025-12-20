import { z } from "zod";

/* ---------------- SIGN UP ---------------- */
const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  full_name: z.string().min(1, { message: "Full name is required" }),
  profile_picture: z.string().url().optional(),
  phone: z.string().optional(),
});

/* ---------------- LOGIN ---------------- */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

/* ---------------- ADDRESS OBJECT ---------------- */
export const addressSchema = z.object({
  residential_address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/)
    .optional(),
});

/* ---------------- BANK INFO ---------------- */
export const bankInfoSchema = z.object({
  account_number: z.string().optional(),
  ifsc: z.string().optional(),
  bank_name: z.string().optional(),
});

/* ---------------- CREATE ---------------- */
export const createVendorSchema = z.object({
  store_id: z.string().min(3),
  store_name: z.string().min(2),
});

/* ---------------- UPDATE (PARTIAL) ---------------- */
export const updateVendorSchema = z.object({
  store_name: z.string().min(2).optional(),
  store_description: z.string().optional(),
  gst_number: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  outlet_address: addressSchema.optional(),
  bank_account_info: bankInfoSchema.optional(),
});

/* ---------------- MEDIA ---------------- */
export const logoSchema = z.object({
  store_logo: z.string().url(),
});

/* ---------------- BANNER ---------------- */
export const bannerSchema = z.object({
  bg_banner: z.string().url(),
});

/* ---------------- UPDATE USER PROFILE ---------------- */
export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),

  address: z
    .object({
      residential_address: z.string().optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      pincode: z
        .string()
        .regex(/^[0-9]{6}$/)
        .optional(),
    })
    .optional(),
});

/* ---------------- COMPELTE USER PROFILE ---------------- */
export const completeProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone is required"),

  address: z.object({
    residential_address: z.string().min(1),
    country: z.string().min(1),
    state: z.string().min(1),
    city: z.string().min(1),
    pincode: z.string().regex(/^[0-9]{6}$/),
  }),
});

export const schemas = {
  signUpSchema,
  loginSchema,
};
