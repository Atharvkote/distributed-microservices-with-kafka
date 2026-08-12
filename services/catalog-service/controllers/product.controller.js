import mongoose from "mongoose";
import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { ProductVariant } from "../models/variant.model.js";
import { Category } from "../models/category.model.js";
import { Inventory } from "../models/inventory.model.js";
import { VendorProfile } from "../models/vendor-profile.model.js";
import {
  createProductZod,
  updateProductZod,
  getProductZod,
  deleteProductZod,
} from "../validators/schema.js";
import {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
} from "../kafka/kafka.producer.js";
import { normalizeVariantDoc } from "../lib/variant-json.js";

const VENDOR_POPULATE_SELECT = "store_name store_logo ratings";

function parseCategoryFilter(raw) {
  if (raw == null || raw === "") return null;
  const ids = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) return null;
  if (ids.length === 1) return ids[0];
  return { $in: ids };
}

function parseNum(q, key) {
  if (q[key] == null || q[key] === "") return null;
  const n = Number(q[key]);
  return Number.isFinite(n) ? n : null;
}

function parseObjectId(raw) {
  if (raw == null || raw === "") return null;
  const v = String(raw).trim();
  if (!mongoose.Types.ObjectId.isValid(v)) return null;
  return new mongoose.Types.ObjectId(v);
}

async function loadVendorMapFromProducts(products) {
  const vendorIds = Array.from(
    new Set(
      products
        .map((p) => p?.vendor)
        .filter(Boolean)
        .map((v) => v.toString()),
    ),
  );
  if (!vendorIds.length) return new Map();
  const vendorRows = await VendorProfile.find({ _id: { $in: vendorIds } })
    .select("_id store_name store_logo ratings")
    .lean();
  return new Map(vendorRows.map((v) => [v._id.toString(), v]));
}

function attachVendors(products, vendorMap) {
  return products.map((p) => {
    const vendorId = p?.vendor ? p.vendor.toString() : null;
    const vendor = vendorId ? vendorMap.get(vendorId) || { _id: vendorId } : null;
    return { ...p, vendor };
  });
}

async function variantPriceStatsForProducts(productIds) {
  if (!productIds.length) return new Map();
  const rows = await ProductVariant.aggregate([
    {
      $match: {
        product: { $in: productIds },
        isActive: true,
      },
    },
    { $sort: { "price.sellingPrice": 1 } },
    {
      $group: {
        _id: "$product",
        minPrice: { $min: "$price.sellingPrice" },
        maxPrice: { $max: "$price.sellingPrice" },
        firstImages: { $first: "$images" },
      },
    },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r]));
}

async function attachPriceRangeToProducts(products) {
  const ids = products.map((p) => p._id);
  const stats = await variantPriceStatsForProducts(ids);
  return products.map((p) => {
    const st = stats.get(p._id.toString());
    return {
      ...p,
      priceRange: st
        ? { minPrice: st.minPrice, maxPrice: st.maxPrice }
        : null,
    };
  });
}

function listingImageFieldsFromStats(st) {
  const imgs = st?.firstImages || [];
  const urls = imgs.map((i) => i?.url).filter(Boolean);
  return {
    image: urls[0] || undefined,
    images: urls.length ? urls : undefined,
  };
}

export const createProduct = async (req, res) => {
  try {
    const parsed = createProductZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    if (!req.user?.vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const { title, description, category, brand, tags, seo } = parsed.data.body;

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid or inactive category" });
    }

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

    await publishProductCreated(product);

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
      .populate("vendor", VENDOR_POPULATE_SELECT)
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variantsRaw = await ProductVariant.find({
      product: productId,
    })
      .sort({ createdAt: 1 })
      .lean();

    const variantIds = variantsRaw.map((v) => v._id);
    const inventories = await Inventory.find({
      variant: { $in: variantIds },
    }).lean();
    const inventoryMap = Object.fromEntries(
      inventories.map((inv) => [inv.variant.toString(), inv]),
    );

    const variants = variantsRaw.map((v) =>
      normalizeVariantDoc({
        ...v,
        inventory: inventoryMap[v._id.toString()] || null,
      }),
    );

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

export const listVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not authenticated" });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { vendor: vendorId };
    if (req.query.isActive === "true") filter.isActive = true;
    if (req.query.isActive === "false") filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug path")
        .populate("vendor", VENDOR_POPULATE_SELECT)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const ids = products.map((p) => p._id);
    const statsMap = await variantPriceStatsForProducts(ids);

    const withPricesAndImages = products.map((p) => {
      const st = statsMap.get(p._id.toString());
      const { image, images } = listingImageFieldsFromStats(st);
      return {
        ...p,
        priceRange: st
          ? { minPrice: st.minPrice, maxPrice: st.maxPrice }
          : null,
        ...(image ? { image } : {}),
        ...(images ? { images } : {}),
      };
    });

    res.status(200).json({
      data: withPricesAndImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to list vendor products",
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

    if (parsed.data.body.category) {
      const categoryExists = await Category.findOne({
        _id: parsed.data.body.category,
        isActive: true,
      });
      if (!categoryExists) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive category" });
      }
    }

    const updates = { ...parsed.data.body };

    if (updates.title) {
      const baseSlug = slugify(updates.title, { lower: true, strict: true });
      updates["seo.slug"] = `${baseSlug}-${Date.now()}`;
      delete updates.title;
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        vendor: vendorId,
      },
      { $set: updates },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (parsed.data.body.title) {
      product.title = parsed.data.body.title;
      await product.save();
    }

    await publishProductUpdated(product);

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
        { new: true, session },
      );

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Product not found" });
      }

      await ProductVariant.updateMany(
        { product: productId },
        { isActive: false },
        { session },
      );

      await session.commitTransaction();

      await publishProductDeleted(productId);

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
      .lean();
    const vendorMap = await loadVendorMapFromProducts([product]);
    const withVendor = attachVendors([product], vendorMap)[0];


    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variantsRaw = await ProductVariant.find({
      product: productId,
      isActive: true,
    })
      .sort({ "price.sellingPrice": 1 })
      .lean();

    const variants = variantsRaw.map((v) => normalizeVariantDoc(v));

    res.status(200).json({
      product: {
        ...withVendor,
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    const cat = parseCategoryFilter(req.query.category);
    if (cat) query.category = cat;
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    const vendorId = parseObjectId(req.query.vendor);
    if (vendorId) {
      query.vendor = vendorId;
    }

    const minRating = parseNum(req.query, "minRating");
    if (minRating != null) {
      query.avgRating = { $gte: minRating };
    }

    const minPrice = parseNum(req.query, "minPrice");
    const maxPrice = parseNum(req.query, "maxPrice");

    const candidates = await Product.find(query)
      .select("_id createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const candidateIds = candidates.map((p) => p._id);
    
    if (candidateIds.length === 0) {
      return res.status(200).json({
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }


    const statsMap = await variantPriceStatsForProducts(candidateIds);

    const filteredIds = candidateIds.filter((id) => {
      const st = statsMap.get(id.toString());
      const sellMin = st?.minPrice;
      if (sellMin == null) {
        if (minPrice != null || maxPrice != null) return false;
        return true;
      }
      if (minPrice != null && sellMin < minPrice) return false;
      if (maxPrice != null && sellMin > maxPrice) return false;
      return true;
    });

    const total = filteredIds.length;
    const pagedIds = filteredIds.slice(skip, skip + limit);

    const products = await Product.find({ _id: { $in: pagedIds } })
      .populate("category", "name slug")
      .lean();

    const byId = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    const ordered = pagedIds
      .map((id) => byId[id.toString()])
      .filter(Boolean);

    const vendorMap = await loadVendorMapFromProducts(ordered);
    const withVendors = attachVendors(ordered, vendorMap);

    const result = withVendors.map((p) => {
      const st = statsMap.get(p._id.toString());
      const { image, images } = listingImageFieldsFromStats(st);
      return {
        ...p,
        priceRange: st
          ? { minPrice: st.minPrice, maxPrice: st.maxPrice }
          : null,
        ...(image ? { image } : {}),
        ...(images ? { images } : {}),
      };
    });

    res.status(200).json({
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};
