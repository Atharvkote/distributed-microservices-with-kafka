import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Store, Users, AlertCircle } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { api, type AnalyticsData, type Vendor } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    api.analytics.getOverview().then(setAnalytics);
    api.vendors.getAll().then(setVendors);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and key metrics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value="$752,000" change={22.5} icon={DollarSign} />
        <MetricCard title="Total Orders" value="5,780" change={15.3} icon={ShoppingCart} />
        <MetricCard title="Active Vendors" value="42" change={8.7} icon={Store} />
        <MetricCard title="Registered Users" value="12,450" change={19.2} icon={Users} />
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 p-4 glass rounded-xl border border-amber-500/30 bg-amber-500/5">
        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-400">
          <span className="font-semibold">3 vendor applications</span> and <span className="font-semibold">5 products</span> are pending review.
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Platform Revenue"
          data={analytics}
          type="area"
          dataKeys={[
            { key: 'revenue', color: '#8809fe', name: 'Revenue ($)' },
          ]}
        />
        <AnalyticsChart
          title="Orders & Visitors"
          data={analytics}
          type="line"
          dataKeys={[
            { key: 'orders', color: '#a855f7', name: 'Orders' },
            { key: 'visitors', color: '#22c55e', name: 'Visitors' },
          ]}
        />
      </div>

      {/* Vendors + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Vendors by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendors.filter((v) => v.status === 'active').slice(0, 5).map((vendor, i) => (
              <div key={vendor.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarImage src={vendor.avatar} />
                  <AvatarFallback className="gradient-primary text-white text-xs">
                    {vendor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{vendor.productCount} products</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold neon-text">${vendor.totalSales.toLocaleString()}</p>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {vendor.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Avg. Order Value', value: '$86.40', change: '+5.2%', positive: true },
              { label: 'Conversion Rate', value: '3.8%', change: '+0.4%', positive: true },
              { label: 'Return Rate', value: '2.1%', change: '-0.3%', positive: true },
              { label: 'Pending Products', value: '5', change: '+2', positive: false },
              { label: 'Active Sessions', value: '1,247', change: '+12%', positive: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold">{item.value}</span>
                  <p className={cn('text-[10px]', item.positive ? 'text-emerald-400' : 'text-amber-400')}>
                    {item.change}
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

export default AdminDashboard;
