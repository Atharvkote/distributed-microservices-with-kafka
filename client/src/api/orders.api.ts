import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const base = `${GATEWAY.orders}/api/orders`;

export interface ShippingAddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
}

export interface CreateOrderBody {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: ShippingAddressDto;
  items: OrderItemInput[];
  notes?: string;
}

export interface OrderRecord {
  _id: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: ShippingAddressDto;
  items: Array<{
    productId: string;
    productTitle?: string;
    variantId?: string;
    variantSku?: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  payment?: {
    status: string;
    method?: string | null;
    transactionId?: string | null;
    paidAt?: string | null;
  };
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ListOrdersParams {
  customerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListOrdersResponse {
  orders: OrderRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface UpdatePaymentBody {
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  paymentMethod?: string;
}

export const ordersApi = {
  create: (body: CreateOrderBody) =>
    apiClient.post<{ message: string; order: OrderRecord }>(`${base}/`, body),

  list: (params?: ListOrdersParams) =>
    apiClient.get<ListOrdersResponse>(`${base}/`, { params }),

  getById: (id: string) => apiClient.get<{ order: OrderRecord }>(`${base}/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<{ message: string; order: OrderRecord }>(`${base}/${id}/status`, {
      status,
    }),

  updatePayment: (id: string, body: UpdatePaymentBody) =>
    apiClient.patch<{ message: string; order: OrderRecord }>(
      `${base}/${id}/payment`,
      body
    ),
};
