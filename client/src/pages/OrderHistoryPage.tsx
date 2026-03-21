import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Order } from '@/services/api';
import OrderTable from '@/components/order/OrderTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, ShoppingBag } from 'lucide-react';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const fetchOrders = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = await api.orders.getAll();
      setOrders(data);
      setLoadState('success');
    } catch {
      setLoadState('error');
      toast.error('Failed to load orders', {
        description: 'Please check your connection and try again.',
      });
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
  }, []);

  // ─── Loading state ───────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>

        {/* Table skeleton */}
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────
  if (loadState === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <ErrorState
          variant="network"
          onRetry={fetchOrders}
          className="glass rounded-2xl border border-border/50"
        />
      </div>
    );
  }

  // ─── Success state ────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            Order History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
          </p>
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px] bg-accent/30 border-border/50 rounded-lg">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', count: orders.length, color: 'bg-primary/10 border-primary/20 text-primary' },
          { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' },
          { label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' },
          { label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' },
          { label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
        ].map(({ label, count, color }) => (
          <button
            key={label}
            onClick={() => handleStatusChange(label === 'Total' ? 'all' : label.toLowerCase())}
            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              (statusFilter === label.toLowerCase() || (label === 'Total' && statusFilter === 'all'))
                ? `${color} font-semibold`
                : 'bg-accent/20 border-border/40 text-muted-foreground hover:border-border'
            }`}
          >
            <span className="text-xl font-bold">{count}</span>
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          type={statusFilter === 'all' ? 'orders' : 'results'}
          description={
            statusFilter === 'all'
              ? 'Your order history will appear here once you place an order.'
              : `No orders with status "${statusFilter}". Try a different filter.`
          }
          actionLabel={statusFilter !== 'all' ? 'Clear filter' : undefined}
          onAction={statusFilter !== 'all' ? () => setStatusFilter('all') : undefined}
          className="glass rounded-2xl border border-border/50"
        />
      ) : (
        <div className="space-y-2">
          <OrderTable orders={filtered} />
          <p className="text-xs text-muted-foreground text-right px-1">
            Showing {filtered.length} of {orders.length} orders
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
