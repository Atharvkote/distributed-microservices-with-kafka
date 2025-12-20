import mongoose from "mongoose";
import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { ProductVariant } from "../models/variant.model.js";
import { Category } from "../models/category.model.js";
import { createProductZod, updateProductZod, getProductZod, deleteProductZod } from "../validators/schema.js";

export const createProduct = async (req, res) => {
  try {
    // Validate request body
    const parsed = createProductZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }
// console.log("Whats worng", req.user);

    if (!req.user?.vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const { title, description, category, brand, tags, seo } = parsed.data.body;

    // Validate category exists and is active
    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid or inactive category" });
    }

    // Generate SEO slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${Date.now()}`;

    const product = await Product.create({
      vendor: req.user.vendorId,
      title,
      description,
      category,
      brand: brand || "",
      tags: tags || [],
      seo: {
        slug,
        metaTitle: seo?.metaTitle || title,
        metaDescription: seo?.metaDescription || description.substring(0, 160),
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Product with this slug already exists",
      });
    }
    return res.status(500).json({
      message: "Failed to create product",
      error: err.message,
    });
  }
};

export const getVendorProduct = async (req, res) => {
  try {
    const parsed = getProductZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    const productId = parsed.data.params.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const product = await Product.findOne({
      _id: productId,
      vendor: vendorId,
    })
      .populate("category", "name slug path")
      // .populate("vendor", "store_name store_logo")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await ProductVariant.find({
      product: productId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      product: {
        ...product,
        variants,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const parsed = updateProductZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    const productId = parsed.data.params.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    // Validate category if being updated
    if (parsed.data.body.category) {
      const categoryExists = await Category.findOne({
        _id: parsed.data.body.category,
        isActive: true,
      });
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid or inactive category" });
      }
    }

    // Note: Products don't have images directly, only variants do
    const updates = { ...parsed.data.body };

    // Update slug if title is being updated
    if (updates.title) {
      const baseSlug = slugify(updates.title, { lower: true, strict: true });
      updates["seo.slug"] = `${baseSlug}-${Date.now()}`;
      delete updates.title; // Remove from updates, we'll set it separately
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        vendor: vendorId,
      },
      { $set: updates },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update title separately if needed
    if (parsed.data.body.title) {
      product.title = parsed.data.body.title;
      await product.save();
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update product",
      error: err.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const parsed = deleteProductZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const vendorId = req.user?.vendorId;
    const productId = parsed.data.params.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          vendor: vendorId,
        },
        { isActive: false },
        { new: true, session }
      );

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Product not found" });
      }

      // Soft delete all variants
      await ProductVariant.updateMany(
        { product: productId },
        { isActive: false },
        { session }
      );

      await session.commitTransaction();
      res.status(200).json({
        message: "Product and its variants disabled successfully",
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
  }
};

export const getPublicProductById = async (req, res) => {
  try {
    const parsed = getProductZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const productId = parsed.data.params.id;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    })
      .populate("category", "name slug path")
      // .populate("vendor", "store_name store_logo")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await ProductVariant.find({
      product: productId,
      isActive: true,
    })
      .sort({ "price.sellingPrice": 1 })
      .lean();

    res.status(200).json({
      product: {
        ...product,
        variants,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};

export const getPublicProducts = async (req, res) => {
  try {
    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      // .populate("vendor", "store_name store_logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const productIds = products.map((p) => p._id);

    // Get price ranges for products
    const prices = await ProductVariant.aggregate([
      {
        $match: {
          product: { $in: productIds },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$product",
          minPrice: { $min: "$price.sellingPrice" },
          maxPrice: { $max: "$price.sellingPrice" },
        },
      },
    ]);

    const priceMap = Object.fromEntries(
      prices.map((p) => [p._id.toString(), p])
    );

    const result = products.map((p) => ({
      ...p,
      priceRange: priceMap[p._id.toString()] || null,
    }));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};
