import { getIO } from "./index.js";

export const notifyAll = (payload) => {
  getIO().emit("notification", payload);
};

export const notifyUser = (userId, payload) => {
  if (!userId) return;
  console.log(userId);
  getIO().to(`user:${userId}`).emit("notification", payload);
};
