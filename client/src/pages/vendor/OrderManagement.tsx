import React, { useState } from 'react';
import { useOrdersQuery, useUpdateOrderStatusMutation } from '@/hooks/useOrders';
import { mapOrderRecord } from '@/types/commerce';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const transitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const OrderManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrdersQuery({ page, limit: 50 });
  const { mutate, isPending } = useUpdateOrderStatusMutation();

  const handleStatus = (mongoId: string, backendStatus: string, next: string) => {
    const allowed = transitions[backendStatus] ?? [];
    if (!allowed.includes(next)) return;
    mutate({ id: mongoId, status: next });
  };

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update order status via PATCH /orders/api/orders/:id/status (requires backend authorization).
        </p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : orders.length === 0 ? (
        <EmptyState type="orders" />
      ) : (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base">All platform orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.map((raw) => {
              const ui = mapOrderRecord(raw);
              const nextOptions = transitions[raw.status] ?? [];
              return (
                <div
                  key={raw._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border/40 bg-accent/5"
                >
                  <div className="flex-1 font-mono text-sm text-primary">{ui.id}</div>
                  <div className="text-sm">{raw.customerName}</div>
                  <div className="text-xs uppercase text-muted-foreground">{raw.status}</div>
                  <Select
                    disabled={isPending || nextOptions.length === 0}
                    onValueChange={(v) => handleStatus(raw._id, raw.status, v)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Set next status" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex gap-4 justify-center text-sm">
          <button
            type="button"
            className="text-primary disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            {page} / {data.pagination.totalPages}
          </span>
          <button
            type="button"
            className="text-primary disabled:opacity-40"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
