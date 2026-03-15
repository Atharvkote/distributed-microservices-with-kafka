import { Router } from "express";
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", createOrder);
router.get("/", listOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;

