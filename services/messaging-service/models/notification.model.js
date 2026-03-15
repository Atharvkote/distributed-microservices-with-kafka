import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SYSTEM", "ORDER", "PAYMENT", "INFO"],
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: function () {
        return this.scope === "USER";
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ scope: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, scope: 1, createdAt: -1 });

export const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);
