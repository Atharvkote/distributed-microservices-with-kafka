import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import {
  connectNotificationsSocket,
  disconnectNotificationsSocket,
  getNotificationsSocket,
} from '@/lib/notifications-socket';
import { queryKeys } from '@/hooks/queryKeys';

/**
 * Socket.IO: notification:user | notification:global (per API documentation).
 */
export function RealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const vendorId = useAuthStore((s) => s.vendorId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authReady = useAuthStore((s) => s.authReady);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authReady || !isAuthenticated || !user?.id) {
      disconnectNotificationsSocket();
      return;
    }

    const s = connectNotificationsSocket(user.id, vendorId);

    const onUser = (payload: { title?: string; message?: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
      toast.info(payload.title || 'Notification', {
        description: payload.message,
      });
    };

    const onGlobal = (payload: { title?: string; message?: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
      toast.message(payload.title || 'Announcement', {
        description: payload.message,
      });
    };

    const onOrderSocket = (payload: { orderId?: string; type?: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (payload.orderId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.order(payload.orderId) });
      }
    };

    s.on('notification:user', onUser);
    s.on('notification:global', onGlobal);
    s.on('order:new', onOrderSocket);
    s.on('order:update', onOrderSocket);

    return () => {
      const sock = getNotificationsSocket();
      sock?.off('notification:user', onUser);
      sock?.off('notification:global', onGlobal);
      sock?.off('order:new', onOrderSocket);
      sock?.off('order:update', onOrderSocket);
      disconnectNotificationsSocket();
    };
  }, [authReady, isAuthenticated, queryClient, user?.id, vendorId]);

  return null;
}
