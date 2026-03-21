import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type Order } from '@/services/api';
import OrderTable from '@/components/order/OrderTable';
import MetricCard from '@/components/dashboard/MetricCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, ClipboardList, ShoppingCart, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

const OrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.orders.getAll();
      setOrders(data);
    } catch {
      setError(true);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSearch =
        !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, debouncedSearch]);

  if (error) {
    return <ErrorState onRetry={fetchOrders} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          Order Monitoring
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor all platform orders</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <MetricCard title="Total Orders" value={orders.length.toString()} icon={ShoppingCart} />
            <MetricCard
              title="Pending"
              value={orders.filter((o) => o.status === 'pending').length.toString()}
              icon={Clock}
            />
            <MetricCard
              title="In Transit"
              value={orders.filter((o) => o.status === 'shipped').length.toString()}
              icon={Truck}
            />
            <MetricCard
              title="Delivered"
              value={orders.filter((o) => o.status === 'delivered').length.toString()}
              icon={CheckCircle2}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-accent/30 border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-accent/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-strong">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table or states */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          type={debouncedSearch || statusFilter !== 'all' ? 'results' : 'orders'}
          description={
            debouncedSearch
              ? `No orders matching "${debouncedSearch}"`
              : statusFilter !== 'all'
              ? `No "${statusFilter}" orders found.`
              : 'No orders have been placed yet.'
          }
          actionLabel={debouncedSearch || statusFilter !== 'all' ? 'Clear filters' : undefined}
          onAction={
            debouncedSearch || statusFilter !== 'all'
              ? () => { setSearch(''); setStatusFilter('all'); }
              : undefined
          }
          className="glass rounded-2xl border border-border/50"
        />
      ) : (
        <OrderTable orders={filtered} showCustomer />
      )}
    </div>
  );
};

export default OrderMonitoring;
