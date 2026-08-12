import logger from "../../utils/logger.js";
import { Order } from "../../models/order.model.js";
import { publishOrderEvent } from "../order-lifecycle.producer.js";

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:3003";

export const handlePaymentSuccess = async (payload, event, prefix) => {
  const { orderId, paymentId } = payload;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.error(`${prefix} Order not found for payment success: ${orderId}`);
      return;
    }

    if (order.payment.status === "PAID") {
      logger.info(`${prefix} Order ${orderId} already paid`);
      return;
    }

    // Update order status atomically
    order.payment.status = "PAID";
    order.payment.transactionId = paymentId;
    order.payment.paidAt = new Date();
    order.status = "CONFIRMED";
    await order.save();

    logger.info(`${prefix} Order ${orderId} marked as PAID/CONFIRMED`);

    // Publish ORDER_STATUS_UPDATED event to notify other services & user
    const vendorIds = order.items.map(item => item.vendorId?.toString()).filter(Boolean);
    await publishOrderEvent("ORDER_STATUS_UPDATED", {
      orderId: order._id.toString(),
      customerId: order.customerId?.toString(),
      customerEmail: order.customerEmail,
      status: order.status,
      fromStatus: "PENDING",
      vendorIds,
      total: order.total,
      transactionId: paymentId,
    });

    // Confirm inventory in catalog-service
    const items = order.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }));

    const response = await fetch(`${CATALOG_SERVICE_URL}/inventory/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error(`${prefix} Failed to confirm inventory for order ${orderId}:`, err);
    } else {
      logger.info(`${prefix} Inventory confirmed for order ${orderId}`);
    }
  } catch (err) {
    logger.error(`${prefix} Error handling PAYMENT_SUCCESS for order ${orderId}:`, err);
  }
};

export const handlePaymentFailed = async (payload, event, prefix) => {
  const { orderId, paymentId } = payload;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.error(`${prefix} Order not found for payment failure: ${orderId}`);
      return;
    }

    if (order.payment.status === "FAILED") {
      logger.info(`${prefix} Order ${orderId} already marked failed`);
      return;
    }

    order.payment.status = "FAILED";
    order.payment.transactionId = paymentId;
    order.status = "CANCELLED";
    await order.save();

    logger.info(`${prefix} Order ${orderId} marked as FAILED/CANCELLED`);

    // Publish ORDER_STATUS_UPDATED event to notify other services & user
    const vendorIds = order.items.map(item => item.vendorId?.toString()).filter(Boolean);
    await publishOrderEvent("ORDER_STATUS_UPDATED", {
      orderId: order._id.toString(),
      customerId: order.customerId?.toString(),
      customerEmail: order.customerEmail,
      status: order.status,
      fromStatus: "PENDING",
      vendorIds,
      total: order.total,
      transactionId: paymentId,
    });

    // Release inventory in catalog-service
    const items = order.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }));

    const response = await fetch(`${CATALOG_SERVICE_URL}/inventory/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error(`${prefix} Failed to release inventory for order ${orderId}:`, err);
    } else {
      logger.info(`${prefix} Inventory released for order ${orderId}`);
    }
  } catch (err) {
    logger.error(`${prefix} Error handling PAYMENT_FAILED for order ${orderId}:`, err);
  }
};
