import { Router } from "express";
import { razorpayWebhook } from "../controllers/payment.controller.js";

const router = Router();

router.post("/razorpay", razorpayWebhook);

export default router;

