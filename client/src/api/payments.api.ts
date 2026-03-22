import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const base = `${GATEWAY.payments}/api/payment`;

export interface CreatePaymentBody {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface VerifyPaymentBody {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    orderId: string;
    paymentId: string;
    status: string;
  };
}

export const paymentsApi = {
  create: (body: CreatePaymentBody) =>
    apiClient.post<CreatePaymentResponse>(`${base}/create`, body),

  verify: (body: VerifyPaymentBody) =>
    apiClient.post<VerifyPaymentResponse>(`${base}/verify`, body),
};
