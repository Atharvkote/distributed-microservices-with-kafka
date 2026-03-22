import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import OrderTable from '@/components/order/OrderTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useOrdersQuery } from '@/hooks/useOrders';
import { mapOrderRecord } from '@/types/commerce';
import { ordersToTrendData } from '@/lib/orders-analytics';
import { useAuthStore } from '@/store/authStore';
import { formatMoney } from '@/lib/money';

const VendorDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useOrdersQuery({ page: 1, limit: 100 });

  const orders = data?.orders ?? [];
  const chartData = useMemo(() => ordersToTrendData(orders), [orders]);
  const revenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const customers = useMemo(() => new Set(orders.map((o) => String(o.customerId))).size, [orders]);

  const recent = useMemo(
    () => orders.slice(0, 5).map(mapOrderRecord),
    [orders]
  );

  if (isError) {
    return <ErrorState onRetry={() => refetch()} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}. Live order data from the gateway.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <MetricCard title="Revenue (sample)" value={formatMoney(revenue)} icon={DollarSign} />
            <MetricCard title="Orders" value={String(orders.length)} icon={ShoppingCart} />
            <MetricCard title="Active products" value="—" icon={Package} />
            <MetricCard title="Customers (unique)" value={String(customers)} icon={Users} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </>
        ) : chartData.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState type="results" description="Not enough orders yet for a trend chart." />
          </div>
        ) : (
          <>
            <AnalyticsChart
              title="Revenue by month"
              data={chartData}
              type="area"
              dataKeys={[{ key: 'revenue', color: '#f59e0b', name: 'Revenue' }]}
            />
            <AnalyticsChart
              title="Orders by month"
              data={chartData}
              type="bar"
              dataKeys={[{ key: 'orders', color: '#fbbf24', name: 'Orders' }]}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                Latest 5
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full rounded-lg" />
              ) : recent.length === 0 ? (
                <EmptyState type="orders" description="No orders yet." />
              ) : (
                <OrderTable orders={recent} showCustomer />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
