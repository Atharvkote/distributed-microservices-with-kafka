import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderBody, type ListOrdersParams } from '@/api/orders.api';
import { queryKeys } from '@/hooks/queryKeys';
import { toast } from 'sonner';

export function useOrdersQuery(params: ListOrdersParams & { page: number }) {
  return useQuery({
    queryKey: queryKeys.orders({
      customerId: params.customerId,
      status: params.status,
      page: params.page,
    }),
    queryFn: async () => {
      const { data } = await ordersApi.list({
        customerId: params.customerId,
        status: params.status,
        page: params.page,
        limit: params.limit ?? 20,
      });
      return data;
    },
  });
}

export function useOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: async () => {
      const { data } = await ordersApi.getById(id!);
      return data.order;
    },
    enabled: Boolean(id),
  });
}

export function useCreateOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) => ordersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message)
          : 'Failed to create order';
      toast.error(msg || 'Failed to create order');
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Could not update status'),
  });
}

export function useUpdateOrderPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
      transactionId?: string;
      paymentMethod?: string;
    }) => ordersApi.updatePayment(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
