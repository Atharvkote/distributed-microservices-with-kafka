import { userNotification } from "../../controllers/notifications.controller.js";
import { emailQueue } from "../../server.js";
import { queueLogger } from "../../utils/logger.js";

// User
export const handleUserCreation = async (payload, event, prefix) => {
  await emailQueue.add(
    "USER_CREATED",
    {
      to: payload.email,
      name: payload.name,
      userId: payload.userId,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  userNotification(payload.userId, {
    title: "Hey There Mate !!! Welcome To Vendex !!",
    message: "Check Your latest profile , Tweak More if Your want !",
    type: "INFO",
    userId: payload.userId,
  });

  queueLogger.info(`${prefix} USER_CREATED email job queued`);
};

export const handleUserUpdation = async (payload, event, prefix) => {
  await emailQueue.add(
    "USER_UPDATED",
    {
      to: payload.email,
      name: payload.name,
    },
    {
      attempts: 3,
      removeOnComplete: true,
    }
  );

  userNotification(payload.userId, {
    title: "Your User Proifle Been Updated",
    message: "Check Your Lastest Profile , Tweak More if Your want !",
    type: "INFO",
    userId: payload.userId,
  });

  queueLogger.info(`${prefix} USER_UPDATED email job queued`);
};

export const handleUserDeletion = async (payload, event, prefix) => {
  await emailQueue.add(
    "USER_DELETED",
    {
      to: payload.email,
      name: payload.name,
    },
    {
      attempts: 3,
      removeOnComplete: true,
    }
  );

  queueLogger.info(`${prefix} USER_DELETED email job queued`);
};

// Vendor Profile
export const handleVendorCreation = async (payload, event, prefix) => {
  await emailQueue.add(
    "VP_CREATED",
    {
      to: payload.email,
      storeName: payload.storeName,
      vendorId: payload.vendorId,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: true,
    }
  );

  userNotification(payload.userId, {
    title: "Hurraay!!!! You are a Vendor at Vendex Now!",
    message: "Check Your Vendor Profile , Deploy you shop product now!!!!",
    type: "INFO",
    userId: payload.userId,
  });

  queueLogger.info(`${prefix} VENDOR_CREATED email job queued`);
};

export const handleVendorUpdation = async (payload, event, prefix) => {
  await emailQueue.add(
    "VP_UPDATED",
    {
      to: payload.email,
      storeName: payload.storeName,
    },
    {
      attempts: 3,
      removeOnComplete: true,
    }
  );

   userNotification(payload.userId, {
    title: "Your Vendor Proifle Been Updated",
    message: "Check Your Lastest Profile , Tweak More if Your want !",
    type: "INFO",
    userId: payload.userId,
  });

  // queueLogger.info(`${prefix} VENDOR_UPDATED email job queued`);
};

export const handleVendorDeletion = async (payload, event, prefix) => {
  await emailQueue.add(
    "VP_DELETED",
    {
      to: payload.email,
      storeName: payload.storeName,
    },
    {
      attempts: 3,
      removeOnComplete: true,
    }
  );

  queueLogger.info(`${prefix} VENDOR_DELETED email job queued`);
};
