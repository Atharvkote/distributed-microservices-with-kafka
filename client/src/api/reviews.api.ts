import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const reviewsBase = `${GATEWAY.catalog}/reviews`;

export interface ReviewUser {
  _id: string;
  full_name?: string;
  email?: string;
}

export interface ReviewDoc {
  _id: string;
  product: string;
  user: string | ReviewUser;
  rating: number;
  comment?: string;
  isVerifiedPurchase?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  reviews: ReviewDoc[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  listByProduct: (productId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ReviewsListResponse>(`${reviewsBase}/product/${productId}`, { params }),

  add: (body: { product: string; rating: number; comment?: string }) =>
    apiClient.post<{ message: string; review: ReviewDoc }>(`${reviewsBase}/`, body),

  update: (id: string, body: { rating?: number; comment?: string }) =>
    apiClient.put<{ message: string; review: ReviewDoc }>(`${reviewsBase}/${id}`, body),

  remove: (id: string) => apiClient.delete<{ message: string }>(`${reviewsBase}/${id}`),
};
