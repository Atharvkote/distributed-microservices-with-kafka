import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import OrderTable from '@/components/order/OrderTable';
import { api, type Order, type AnalyticsData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';

const VendorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [orderData, analyticsData] = await Promise.all([
        api.orders.getAll(),
        api.analytics.getOverview(),
      ]);
      setOrders(orderData.slice(0, 5));
      setAnalytics(analyticsData);
    } catch {
      setError(true);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <ErrorState onRetry={fetchData} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Sarah! Here's your store overview.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          : (
            <>
              <MetricCard title="Revenue" value="$24,580" change={12.5} icon={DollarSign} />
              <MetricCard title="Orders" value="156" change={8.3} icon={ShoppingCart} />
              <MetricCard title="Products" value="24" change={3.1} icon={Package} />
              <MetricCard title="Customers" value="1,284" change={15.2} icon={Users} />
            </>
          )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </>
        ) : (
          <>
            <AnalyticsChart
              title="Revenue Overview"
              data={analytics}
              type="area"
              dataKeys={[{ key: 'revenue', color: '#f59e0b', name: 'Revenue ($)' }]}
            />
            <AnalyticsChart
              title="Orders"
              data={analytics}
              type="bar"
              dataKeys={[{ key: 'orders', color: '#fbbf24', name: 'Orders' }]}
            />
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary cursor-pointer">
                View All
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-32 rounded" />
                        <Skeleton className="h-2.5 w-20 rounded" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <EmptyState type="orders" className="py-10" />
              ) : (
                <OrderTable orders={orders} showCustomer />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top products */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-3 w-14 rounded ml-auto" />
                      <Skeleton className="h-2.5 w-8 rounded ml-auto" />
                    </div>
                  </div>
                ))
              : [
                  { name: 'Wireless Pro Headphones', sales: 89, revenue: '$26,671' },
                  { name: 'Mechanical Keyboard RGB', sales: 67, revenue: '$10,719' },
                  { name: 'Smart Fitness Watch', sales: 54, revenue: '$10,799' },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{p.revenue}</p>
                      <p className="text-[10px] text-emerald-500 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="h-3 w-3" />+12%
                      </p>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
