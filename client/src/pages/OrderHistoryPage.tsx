import React, { useMemo, useState } from 'react';
import OrderTable from '@/components/order/OrderTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/authStore';
import { useOrdersQuery } from '@/hooks/useOrders';
import { mapOrderRecord, type UiOrder } from '@/types/commerce';

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const OrderHistoryPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useOrdersQuery({
    page,
    limit: 20,
    customerId: user?.id,
    status: status === 'all' ? undefined : status,
  });

  const rows: UiOrder[] = useMemo(
    () => (data?.orders ?? []).map(mapOrderRecord),
    [data]
  );

  const filtered = useMemo(() => {
    if (!debounced.trim()) return rows;
    const q = debounced.toLowerCase();
    return rows.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  }, [rows, debounced]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground text-sm mt-1">Your orders from the orders service</p>
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] bg-accent/30 border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-strong">
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-accent/30 border-border/50"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState type="orders" description="You have no orders yet." className="glass rounded-xl border border-border/50" />
      ) : (
        <OrderTable orders={filtered} />
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            className="text-sm text-primary disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {data.pagination.totalPages}
          </span>
          <button
            type="button"
            className="text-sm text-primary disabled:opacity-40"
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

export default OrderHistoryPage;
