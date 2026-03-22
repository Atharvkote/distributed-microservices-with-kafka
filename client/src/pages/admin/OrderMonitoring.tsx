import React, { useMemo, useState } from 'react';
import OrderTable from '@/components/order/OrderTable';
import { useOrdersQuery } from '@/hooks/useOrders';
import { mapOrderRecord } from '@/types/commerce';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const OrderMonitoring: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrdersQuery({ page, limit: 50 });
  const rows = useMemo(() => (data?.orders ?? []).map(mapOrderRecord), [data]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <TableSkeleton rows={8} cols={7} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Monitoring</h1>
      {rows.length === 0 ? (
        <EmptyState type="orders" />
      ) : (
        <OrderTable orders={rows} showCustomer />
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

export default OrderMonitoring;
