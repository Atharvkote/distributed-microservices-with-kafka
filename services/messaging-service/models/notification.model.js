import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SYSTEM", "ORDER", "PAYMENT", "INFO", "ALERT", "WARNING"],
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      required: true,
    },

    scope: {
      type: String,
      enum: ["GLOBAL", "USER"],
      required: true,
    },

    userId: {
      type: String,
      required: function () {
        return this.scope === "USER";
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    sourceEventId: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ scope: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, scope: 1, createdAt: -1 });
notificationSchema.index({ sourceEventId: 1 }, { unique: true, sparse: true });

export const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);
