import { socketioLogger } from "../utils/logger.js";

let broadcaster = null;

export const initSocketIO = (io) => {
  broadcaster = io;

  io.on("connection", (socket) => {
    socketioLogger.info(`Socket connected: ${socket.id}`);

    socket.on("register-user", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      socketioLogger.info(`User ${userId} joined room user:${userId}`);
    });

    socket.on("disconnect", (reason) => {
      socketioLogger.info(`Socket disconnected: ${socket.id} | ${reason}`);
    });
  });
};

export const getIO = () => {
  if (!broadcaster) {
    socketioLogger.error("Socket.IO not initialized");
  }
  return broadcaster;
};
