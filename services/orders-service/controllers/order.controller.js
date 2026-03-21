import { Order } from "../models/order.model.js";
import { ProductReadModel } from "../models/product-read.model.js";
import { VariantReadModel } from "../models/variant-read.model.js";
import {
  createOrderZod,
  getOrderByIdZod,
  listOrdersZod,
  updateOrderStatusZod,
  updatePaymentStatusZod,
} from "../validators/schema.js";
import logger  from "../utils/logger.js";

export const getProductFromReadModel = async (productId) => {
  try {
    return await ProductReadModel.findOne({
      productId,
      isActive: true,
    }).lean();
  } catch (err) {
    console.error("Error fetching product from read model:", err);
    return null;
  }
};


export const getVariantFromReadModel = async (variantId) => {
  try {
    return await VariantReadModel.findOne({
      variantId,
      isActive: true,
    }).lean();
  } catch (err) {
    console.error("Error fetching variant from read model:", err);
    return null;
  }
};

/**
 * Get all variants for a product from read model
 */
export const getProductVariantsFromReadModel = async (productId) => {
  try {
    return await VariantReadModel.find({
      productId,
      isActive: true,
    }).lean();
  } catch (err) {
    console.error("Error fetching product variants from read model:", err);
    return [];
  }
};

/**
 * Create order with validation against read model
 */
export const createOrder = async (req, res) => {
  try {
    const parsed = createOrderZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { customerId, customerName, customerEmail, customerPhone, shippingAddress, items, notes } =
      parsed.data.body;

    // Validate all items against read model (CQRS: Query from read model)
    const validatedItems = [];

    for (const item of items) {
      let product = null;
      let variant = null;

      // If variantId is provided, fetch variant and its product
      if (item.variantId) {
        variant = await getVariantFromReadModel(item.variantId);
        if (!variant) {
          return res.status(404).json({
            message: `Variant not found: ${item.variantId}`,
          });
        }
        product = await getProductFromReadModel(variant.productId);
      } else if (item.productId) {
        // If only productId is provided, fetch product
        product = await getProductFromReadModel(item.productId);
      }

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId || item.variantId}`,
        });
      }

      // Enrich item with product/variant data from read model
      const enrichedItem = {
        productId: product.productId,
        productTitle: product.title,
        productBrand: product.brand,
        productCategory: product.category,
        quantity: item.quantity,
      };

      if (variant) {
        enrichedItem.variantId = variant.variantId;
        enrichedItem.variantSku = variant.sku;
        enrichedItem.price = variant.price.sellingPrice;
        enrichedItem.priceDetails = variant.price;
      } else {
        // Use product level pricing if no variant
        enrichedItem.price = item.price || 0;
      }

      validatedItems.push(enrichedItem);
    }

    const total = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      customerId,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      shippingAddress,
      items: validatedItems,
      total,
      status: "PENDING",
      notes: notes || "",
      syncedFromReadModel: true,
      lastSyncedAt: new Date(),
    });

    logger.info(
      `Order created: ${order._id} for customer ${customerId} with total ${total}`
    );

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    logger.error("Failed to create order", err);
    return res.status(500).json({
      message: "Failed to create order",
      error: err.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const parsed = getOrderByIdZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const order = await Order.findById(parsed.data.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Enrich order with additional product details from read model
    const enrichedOrder = {
      ...order,
      itemsWithDetails: await Promise.all(
        order.items.map(async (item) => {
          const variant = item.variantId
            ? await getVariantFromReadModel(item.variantId)
            : null;
          return {
            ...item,
            ...(variant && { variantDetails: variant }),
          };
        })
      ),
    };

    return res.status(200).json({ order: enrichedOrder });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: err.message,
    });
  }
};

export const listOrders = async (req, res) => {
  try {
    const parsed = listOrdersZod.safeParse({ query: req.query });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { customerId, status } = parsed.data.query;
    let { page = 1, limit = 20 } = parsed.data.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to list orders",
      error: err.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const parsed = updateOrderStatusZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { id } = parsed.data.params;
    const { status } = parsed.data.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};

/**
 * Get product details from read model (via API endpoint)
 */
export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await getProductFromReadModel(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get variants for this product
    const variants = await getProductVariantsFromReadModel(product.productId);

    return res.status(200).json({
      product,
      variants,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch product details",
      error: err.message,
    });
  }
};

/**
 * Get variant details from read model (via API endpoint)
 */
export const getVariantDetails = async (req, res) => {
  try {
    const { variantId } = req.params;

    const variant = await getVariantFromReadModel(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Get product for this variant
    const product = await getProductFromReadModel(variant.productId);

    return res.status(200).json({
      variant,
      product,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch variant details",
      error: err.message,
    });
  }
};

/**
 * Search products from read model (via API endpoint)
 */
export const searchProducts = async (req, res) => {
  try {
    const { query, category, brand } = req.query;
    let { page = 1, limit = 20 } = req.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = { isActive: true };

    if (query) {
      filter.$text = { $search: query };
    }
    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = brand;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductReadModel.find(filter)
        .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductReadModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    logger.error("Failed to search products", err);
    return res.status(500).json({
      message: "Failed to search products",
      error: err.message,
    });
  }
};

/**
 * Update payment status for order
 * Prepares order for payment gateway integration
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const parsed = updatePaymentStatusZod.safeParse({
      params: req.params,
      body: req.body,
    });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { id } = parsed.data.params;
    const { paymentStatus, transactionId, paymentMethod } = parsed.data.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment info
    order.payment = {
      ...order.payment,
      status: paymentStatus,
      ...(transactionId && { transactionId }),
      ...(paymentMethod && { method: paymentMethod }),
      ...(paymentStatus === "PAID" && { paidAt: new Date() }),
    };

    // Update order status if payment is successful
    if (paymentStatus === "PAID" && order.status === "PENDING") {
      order.status = "CONFIRMED";
    }

    await order.save();

    logger.info(
      `Order payment updated: ${id} - Status: ${paymentStatus}`
    );

    return res.status(200).json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (err) {
    logger.error("Failed to update payment status", err);
    return res.status(500).json({
      message: "Failed to update payment status",
      error: err.message,
    });
  }
};

/**
 * Generate payment intent (for payment gateway integration)
 * This prepares the order for payment and returns order details
 */
export const generatePaymentIntent = async (req, res) => {
  try {
    const parsed = getOrderByIdZod.safeParse({ params: req.params });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const order = await Order.findById(parsed.data.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.payment.status !== "PENDING") {
      return res.status(400).json({
        message: "Order payment is not in pending status",
      });
    }

    // Prepare payment intent data
    const paymentIntent = {
      orderId: order._id,
      orderNumber: order._id.toString().substring(0, 12).toUpperCase(),
      amount: order.total,
      currency: "USD",
      description: `Order for ${order.customerName}`,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      items: order.items.map((item) => ({
        productId: item.productId,
        title: item.productTitle,
        quantity: item.quantity,
        price: item.price,
        amount: item.price * item.quantity,
      })),
      shipping: {
        address: order.shippingAddress,
      },
    };

    logger.info(`Payment intent generated for order: ${order._id}`);

    return res.status(200).json({
      message: "Payment intent generated successfully",
      paymentIntent,
    });
  } catch (err) {
    logger.error("Failed to generate payment intent", err);
    return res.status(500).json({
      message: "Failed to generate payment intent",
      error: err.message,
    });
  }
};
