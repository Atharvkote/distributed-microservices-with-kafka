import { getIO } from "./index.js";

export const notifyAll = (payload) => {
  const io = getIO();
  io.emit("notification:global", payload);
  io.emit("notification", payload);
};

export const notifyUser = (userId, payload) => {
  if (!userId) return;
  const io = getIO();
  io.to(`user:${userId}`).emit("notification:user", payload);
  io.to(`user:${userId}`).emit("notification", payload);
};
