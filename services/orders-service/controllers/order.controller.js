import { Order } from "../models/order.model.js";
import {
  createOrderZod,
  getOrderByIdZod,
  listOrdersZod,
  updateOrderStatusZod,
} from "../validators/schema.js";

export const createOrder = async (req, res) => {
  try {
    const parsed = createOrderZod.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }

    const { customerId, customerName, shippingAddress, items } =
      parsed.data.body;

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      customerId,
      customerName,
      shippingAddress,
      items,
      total,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
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

    return res.status(200).json({ order });
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

