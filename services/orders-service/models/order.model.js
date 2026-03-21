import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
      index: true,
    },

    customerPhone: {
      type: String,
    },

    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        productTitle: String,
        productBrand: String,
        productCategory: mongoose.Schema.Types.ObjectId,
        variantId: mongoose.Schema.Types.ObjectId,
        variantSku: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        priceDetails: {
          mrp: Number,
          sellingPrice: Number,
          discountPercent: { type: Number, default: 0 },
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    payment: {
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      method: String,
      transactionId: {
        type: String,
        index: true,
        sparse: true,
      },
      paidAt: Date,
      amount: Number,
    },

    notes: String,

    // Track if order data was synced from read models
    syncedFromReadModel: {
      type: Boolean,
      default: false,
    },

    lastSyncedAt: Date,
  },
  { timestamps: true }
);

// Indexes for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order number based on ID
orderSchema.virtual("orderNumber").get(function () {
  return `ORD-${this._id.toString().substring(0, 12).toUpperCase()}`;
});

// Ensure virtuals are included in JSON output
orderSchema.set("toJSON", { virtuals: true });

export const Order = mongoose.model("Order", orderSchema, "orders");
