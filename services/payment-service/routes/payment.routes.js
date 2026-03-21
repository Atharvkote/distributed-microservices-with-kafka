import { Router } from "express";
import { createPayment, verifyPayment } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create", createPayment);
router.post("/verify", verifyPayment);

export default router;

