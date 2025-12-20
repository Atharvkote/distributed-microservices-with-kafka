import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  });

// Product Validation Schemas
export const createProductZod = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    category: objectIdSchema,
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }).optional(),
  }),
});

export const updateProductZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    category: objectIdSchema.optional(),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }).optional(),
  }).strict(),
});

export const getProductZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteProductZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Variant Validation Schemas
export const createVariantZod = z.object({
  body: z.object({
    product: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid product ObjectId",
    }),
    sku: z.string().min(1).max(100),
    attributes: z.record(z.string(), z.string()).optional(),
    price: z.object({
      mrp: z.number().positive(),
      sellingPrice: z.number().positive(),
      discountPercent: z.number().min(0).max(100).optional(),
    }),
    weight: z.object({
      value: z.number().positive().optional(),
      unit: z.enum(["g", "kg"]).optional(),
    }).optional(),
  }),
});

export const updateVariantZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    attributes: z.record(z.string(), z.string()).optional(),
    price: z.object({
      mrp: z.number().positive().optional(),
      sellingPrice: z.number().positive().optional(),
      discountPercent: z.number().min(0).max(100).optional(),
    }).optional(),
    weight: z.object({
      value: z.number().positive().optional(),
      unit: z.enum(["g", "kg"]).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  }).strict(),
});

export const getVariantZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getVariantsByProductZod = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export const deleteVariantZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Category Validation Schemas
export const createCategoryZod = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    parentId: objectIdSchema.optional(),
    sortOrder: z.number().int().optional(),
    attributes: z.array(z.object({
      name: z.string(),
      values: z.array(z.string()),
    })).optional(),
  }),
});

export const updateCategoryZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    sortOrder: z.number().int().optional(),
    attributes: z.array(z.object({
      name: z.string(),
      values: z.array(z.string()),
    })).optional(),
    isActive: z.boolean().optional(),
  }).strict(),
});

export const getCategoryZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteCategoryZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Inventory Validation Schemas
export const updateStockZod = z.object({
  params: z.object({
    variantId: objectIdSchema,
  }),
  body: z.object({
    delta: z.number().int(),
  }),
});

// Review Validation Schemas
export const addReviewZod = z.object({
  body: z.object({
    product: objectIdSchema,
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const updateReviewZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
  }).strict(),
});

export const getReviewsZod = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export const deleteReviewZod = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const pinReviewZod = z.object({
  params: z.object({
    reviewId: objectIdSchema,
  }),
});
