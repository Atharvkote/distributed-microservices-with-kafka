import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["CREATED", "PENDING", "SUCCESS", "FAILED"],
      default: "CREATED",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);

