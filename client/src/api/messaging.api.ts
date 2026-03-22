import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const base = `${GATEWAY.messages}/api/notifications`;

export interface NotificationDto {
  _id: string;
  type: string;
  title?: string;
  message: string;
  scope?: string;
  userId?: string;
  isRead?: boolean;
  sourceEventId?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  data: NotificationDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  sort?: 'newest' | 'oldest';
}

export const messagingApi = {
  listForUser: (userId: string, params?: ListNotificationsParams) =>
    apiClient.get<NotificationsResponse>(`${base}/${userId}`, { params }),
};
