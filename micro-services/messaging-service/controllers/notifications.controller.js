import { Notification } from "../models/notification.model.js";
import {
  notifyAll,
  notifyUser,
} from "../socket-handlers/notification-handler.js";
import logger from "../utils/logger.js";

export const getNotifications = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ scope: "GLOBAL" }, { scope: "USER", id }],
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(query),
    ]);

    res.status(200).json({
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    logger.error("Error at Notification Controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const systemNotification = async (data) => {
  notifyAll(data);

  try {
    await Notification.create({
      ...data,
      scope: "GLOBAL",
    });
  } catch (err) {
    console.error("Notification persistence failed:", err.message);
  }
};

export const userNotification = async (data) => {
  notifyUser(data.userId, data);

  try {
    await Notification.create({
      ...data,
      scope: "USER",
    });
  } catch (err) {
    console.error("Notification persistence failed:", err.message);
  }
};
