import { io, type Socket } from 'socket.io-client';
import { messagingSocketUrl } from '@/lib/api-client';
import { getAccessToken } from '@/lib/access-token';

let socket: Socket | null = null;

export function connectNotificationsSocket(userId: string) {
  disconnectNotificationsSocket();
  const url = messagingSocketUrl();
  socket = io(url, {
    transports: ['websocket', 'polling'],
    auth: { token: getAccessToken() },
  });
  socket.on('connect', () => {
    socket?.emit('register-user', userId);
  });
  return socket;
}

export function disconnectNotificationsSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getNotificationsSocket() {
  return socket;
}
