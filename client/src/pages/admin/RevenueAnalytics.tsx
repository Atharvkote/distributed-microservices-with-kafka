import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, ShoppingCart, PieChart } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { api, type AnalyticsData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categoryRevenue = [
  { label: 'Electronics', revenue: 280000, orders: 2100, visitors: 85000 },
  { label: 'Fashion', revenue: 180000, orders: 1500, visitors: 62000 },
  { label: 'Home & Decor', revenue: 120000, orders: 900, visitors: 38000 },
  { label: 'Sports', revenue: 95000, orders: 780, visitors: 28000 },
  { label: 'Food & Drink', revenue: 77000, orders: 500, visitors: 19200 },
];

const RevenueAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    api.analytics.getOverview().then(setAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-primary" />
          Revenue Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Comprehensive platform revenue insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Annual Revenue" value="$752,000" change={22.5} icon={DollarSign} />
        <MetricCard title="Monthly Revenue" value="$98,000" change={8.2} icon={TrendingUp} />
        <MetricCard title="Total Customers" value="12,450" change={19.2} icon={Users} />
        <MetricCard title="Avg. Order Value" value="$86.40" change={5.2} icon={ShoppingCart} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Revenue Over Time"
              data={analytics}
              type="area"
              dataKeys={[{ key: 'revenue', color: '#8809fe', name: 'Revenue ($)' }]}
              height={350}
            />
            <AnalyticsChart
              title="Orders Over Time"
              data={analytics}
              type="bar"
              dataKeys={[{ key: 'orders', color: '#a855f7', name: 'Orders' }]}
              height={350}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <AnalyticsChart
            title="Revenue by Category"
            data={categoryRevenue}
            type="bar"
            dataKeys={[
              { key: 'revenue', color: '#8809fe', name: 'Revenue ($)' },
              { key: 'orders', color: '#22c55e', name: 'Orders' },
            ]}
            height={400}
          />

          {/* Category breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryRevenue.map((cat) => (
              <Card key={cat.label} className="glass border-border/50 hover:neon-glow transition-all">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-3">{cat.label}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold neon-text">${cat.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orders</span>
                      <span className="font-medium">{cat.orders.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visitors</span>
                      <span className="font-medium">{cat.visitors.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <AnalyticsChart
            title="Visitors & Conversion Trends"
            data={analytics}
            type="line"
            dataKeys={[
              { key: 'visitors', color: '#22c55e', name: 'Visitors' },
              { key: 'orders', color: '#8809fe', name: 'Orders' },
            ]}
            height={400}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalytics;
