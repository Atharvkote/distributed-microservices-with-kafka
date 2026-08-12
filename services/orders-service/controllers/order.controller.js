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
import logger from "../utils/logger.js";
import { publishOrderEvent } from "../kafka/order-lifecycle.producer.js";

/** Strict fulfillment transitions for PATCH /status */
const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

function uniqueVendorIdsFromOrder(order) {
  const ids = new Set();
  for (const it of order.items || []) {
    if (it.vendorId) ids.add(it.vendorId.toString());
  }
  return [...ids];
}

function orderTouchesVendor(order, vendorIdStr) {
  if (!vendorIdStr) return false;
  return (order.items || []).some(
    (it) => it.vendorId && it.vendorId.toString() === vendorIdStr
  );
}

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
  const reservationItems = [];
  const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:3003";

  try {
    const parsed = createOrderZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { customerName, customerEmail, customerPhone, shippingAddress, items, notes } =
      parsed.data.body;

    const customerId = req.user.id;

    // Validate all items against read model (CQRS: Query from read model)
    const validatedItems = [];

    for (const item of items) {
      const variant = await getVariantFromReadModel(item.variantId);
      if (!variant) {
        return res.status(404).json({
          message: `Variant not found: ${item.variantId}`,
        });
      }

      const product = await getProductFromReadModel(variant.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found for variant: ${item.variantId}`,
        });
      }

      // Enrich item with product/variant data from read model
      const enrichedItem = {
        productId: product.productId,
        productTitle: product.title,
        productBrand: product.brand,
        productCategory: product.category,
        vendorId: product.vendor,
        quantity: item.quantity,
        variantId: variant.variantId,
        variantSku: variant.sku,
        price: variant.price.sellingPrice,
        priceDetails: variant.price,
      };

      validatedItems.push(enrichedItem);
      reservationItems.push({
        variantId: variant.variantId.toString(),
        quantity: item.quantity
      });
    }

    const total = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Call inventory reserve endpoint in catalog-service
    try {
      const reserveResponse = await fetch(`${CATALOG_SERVICE_URL}/inventory/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reservationItems })
      });

      if (!reserveResponse.ok) {
        const errData = await reserveResponse.json().catch(() => ({}));
        return res.status(reserveResponse.status).json({
          message: errData.message || "Failed to reserve inventory"
        });
      }
    } catch (fetchErr) {
      logger.error("Failed to connect to catalog service for inventory reservation:", fetchErr);
      return res.status(503).json({
        message: "Catalog service is currently unavailable. Please try again later."
      });
    }

    let order;
    try {
      order = await Order.create({
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
    } catch (createErr) {
      // Rollback reservation since order insertion failed
      logger.error("Order creation in DB failed, rolling back inventory reservation:", createErr);
      await fetch(`${CATALOG_SERVICE_URL}/inventory/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reservationItems })
      }).catch(releaseErr => {
        logger.error("Failed to release inventory during rollback:", releaseErr);
      });
      throw createErr;
    }

    logger.info(
      `Order created: ${order._id} for customer ${customerId} with total ${total}`
    );

    const vendorIds = uniqueVendorIdsFromOrder(order);
    try {
      await publishOrderEvent("ORDER_CREATED", {
        orderId: order._id.toString(),
        customerId: customerId.toString(),
        customerEmail: order.customerEmail,
        status: order.status,
        total: order.total,
        vendorIds,
      });
    } catch (eventErr) {
      logger.error("Failed to publish ORDER_CREATED event:", eventErr);
      // Even if event publishing fails, the order has been created.
    }

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    logger.error("Failed to create order:", err);
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

    // Access control check to prevent IDOR
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const vendorId = req.user?.vendorId;
    const isVendor = req.user?.isVendor;

    const isAdmin = userRole === "ADMIN";
    const isOwner = order.customerId && order.customerId.toString() === userId;
    const isAssociatedVendor = isVendor && vendorId && orderTouchesVendor(order, vendorId.toString());

    if (!isAdmin && !isOwner && !isAssociatedVendor) {
      return res.status(403).json({ message: "Access denied to this order" });
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

export const listOrdersForVendor = async (req, res) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!req.user?.isVendor || !vendorId) {
      return res.status(403).json({ message: "Vendor access required" });
    }

    const parsed = listOrdersZod.safeParse({ query: req.query });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { status } = parsed.data.query;
    let { page = 1, limit = 20 } = parsed.data.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = { "items.vendorId": vendorId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
      message: "Failed to list vendor orders",
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
    if (req.user?.role === "ADMIN") {
      if (customerId) filter.customerId = customerId;
    } else {
      filter.customerId = req.user?.id;
    }
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

    const vendorId = req.user?.vendorId;
    if (!req.user?.isVendor || !vendorId) {
      return res.status(403).json({ message: "Vendor access required" });
    }
    if (!orderTouchesVendor(order, vendorId.toString())) {
      return res.status(403).json({ message: "Not part of this order" });
    }

    const prev = order.status;
    const allowed = ALLOWED_STATUS_TRANSITIONS[prev] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status transition",
        from: prev,
        to: status,
        allowed,
      });
    }

    order.status = status;
    await order.save();

    const vendorIds = uniqueVendorIdsFromOrder(order);
    await publishOrderEvent("ORDER_STATUS_UPDATED", {
      orderId: order._id.toString(),
      customerId: order.customerId.toString(),
      fromStatus: prev,
      status,
      vendorIds,
    });

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
