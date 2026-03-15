import slugify from "slugify";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import {
  createCategoryZod,
  updateCategoryZod,
  getCategoryZod,
  deleteCategoryZod,
} from "../validators/schema.js";

export const createCategory = async (req, res) => {
  try {
    const parsed = createCategoryZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { name, parentId, sortOrder = 0, attributes = [] } = parsed.data.body;

    const slug = slugify(name, { lower: true, strict: true });
    let level = 0;
    let path = slug;
    let parent = null;

    if (parentId) {
      parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent category not found" });
      }
      if (!parent.isActive) {
        return res.status(400).json({
          message: "Cannot create subcategory under inactive parent",
        });
      }
      level = parent.level + 1;
      path = `${parent.path}/${slug}`;
    }

    const exists = await Category.findOne({ path });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      parent: parent ? parent._id : null,
      level,
      path,
      sortOrder,
      attributes,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Category with this slug already exists",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {


    const categories = await Category.find({ isActive: true })
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      categories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
};


export const getCategoryById = async (req, res) => {
  try {
    const parsed = getCategoryZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const category = await Category.findById(parsed.data.params.id)
      .populate("parent", "name slug path")
      .lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.status(200).json({
      category: {
        ...category,
        productCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch category",
      error: err.message,
    });
  }
};


export const getSubCategories = async (req, res) => {
  try {
    const parsed = getCategoryZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const parent = await Category.findById(parsed.data.params.id);
    if (!parent) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subs = await Category.find({
      path: { $regex: `^${parent.path}/` },
      isActive: true,
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      subCategories: subs,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch subcategories",
      error: err.message,
    });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const parsed = updateCategoryZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const category = await Category.findById(parsed.data.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (parsed.data.body.name) {
      const newSlug = slugify(parsed.data.body.name, {
        lower: true,
        strict: true,
      });
      const oldPath = category.path;
      const parent = category.parent
        ? await Category.findById(category.parent)
        : null;
      const newPath = parent ? `${parent.path}/${newSlug}` : newSlug;

      // Update path for this category and all subcategories
      await Category.updateMany(
        { path: { $regex: `^${oldPath}` } },
        [
          {
            $set: {
              path: {
                $replaceOne: {
                  input: "$path",
                  find: oldPath,
                  replacement: newPath,
                },
              },
            },
          },
        ]
      );

      category.name = parsed.data.body.name;
      category.slug = newSlug;
      category.path = newPath;
    }

    if (parsed.data.body.sortOrder !== undefined) {
      category.sortOrder = parsed.data.body.sortOrder;
    }

    if (parsed.data.body.attributes) {
      category.attributes = parsed.data.body.attributes;
    }

    if (parsed.data.body.isActive !== undefined) {
      category.isActive = parsed.data.body.isActive;
      // If deactivating, also deactivate all subcategories
      if (!parsed.data.body.isActive) {
        await Category.updateMany(
          { path: { $regex: `^${category.path}/` } },
          { isActive: false }
        );
      }
    }

    await category.save();
    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update category",
      error: err.message,
    });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const parsed = deleteCategoryZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const category = await Category.findById(parsed.data.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${productCount} active products`,
      });
    }

    // Check if category has subcategories
    const subCategoryCount = await Category.countDocuments({
      path: { $regex: `^${category.path}/` },
      isActive: true,
    });

    if (subCategoryCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${subCategoryCount} active subcategories`,
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.status(200).json({
      message: "Category disabled successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete category",
      error: err.message,
    });
  }
};


export const getCategoryBreadcrumbs = async (req, res) => {
  try {
    const parsed = getCategoryZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const category = await Category.findById(parsed.data.params.id).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const slugs = category.path.split("/");
    const breadcrumbs = [];
    let currentPath = "";

    for (const slug of slugs) {
      currentPath = currentPath ? `${currentPath}/${slug}` : slug;
      const cat = await Category.findOne({ path: currentPath }).lean();
      if (cat) breadcrumbs.push(cat);
    }

    res.status(200).json({
      breadcrumbs,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch breadcrumbs",
      error: err.message,
    });
  }
};
