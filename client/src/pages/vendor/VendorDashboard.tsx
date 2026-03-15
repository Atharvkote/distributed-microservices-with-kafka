import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import OrderTable from '@/components/order/OrderTable';
import { api, type Order, type AnalyticsData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VendorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    api.orders.getAll().then((o) => setOrders(o.slice(0, 5)));
    api.analytics.getOverview().then(setAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Sarah! Here's your store overview.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Revenue" value="$24,580" change={12.5} icon={DollarSign} />
        <MetricCard title="Orders" value="156" change={8.3} icon={ShoppingCart} />
        <MetricCard title="Products" value="24" change={3.1} icon={Package} />
        <MetricCard title="Customers" value="1,284" change={15.2} icon={Users} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Revenue Overview"
          data={analytics}
          type="area"
          dataKeys={[{ key: 'revenue', color: '#8809fe', name: 'Revenue ($)' }]}
        />
        <AnalyticsChart
          title="Orders"
          data={analytics}
          type="bar"
          dataKeys={[{ key: 'orders', color: '#a855f7', name: 'Orders' }]}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">View All</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <OrderTable orders={orders} showCustomer />
            </CardContent>
          </Card>
        </div>

        {/* Top products */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Wireless Pro Headphones', sales: 89, revenue: '$26,671' },
              { name: 'Mechanical Keyboard RGB', sales: 67, revenue: '$10,719' },
              { name: 'Smart Fitness Watch', sales: 54, revenue: '$10,799' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors">
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold neon-text">{p.revenue}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-0.5">
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
