import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, Calendar } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { api, type AnalyticsData } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const payouts = [
  { id: 'PAY-001', date: '2026-03-01', amount: 4580, status: 'completed' },
  { id: 'PAY-002', date: '2026-02-01', amount: 3920, status: 'completed' },
  { id: 'PAY-003', date: '2026-01-01', amount: 5100, status: 'completed' },
  { id: 'PAY-004', date: '2025-12-01', amount: 6200, status: 'completed' },
];

const EarningsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    api.analytics.getOverview().then(setAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <DollarSign className="h-7 w-7 text-primary" />
          Earnings & Payouts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track your revenue and payout history</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Earnings" value="$98,420" change={18.5} icon={DollarSign} />
        <MetricCard title="This Month" value="$4,580" change={12.3} icon={TrendingUp} />
        <MetricCard title="Pending Payout" value="$2,340" change={-3.2} icon={CreditCard} />
        <MetricCard title="Avg. Order Value" value="$64.50" change={5.1} icon={ArrowUpRight} />
      </div>

      {/* Revenue chart */}
      <AnalyticsChart
        title="Revenue Trend"
        data={analytics}
        type="area"
        dataKeys={[
          { key: 'revenue', color: '#8809fe', name: 'Revenue ($)' },
          { key: 'orders', color: '#22c55e', name: 'Orders' },
        ]}
        height={350}
      />

      {/* Payout history */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Payout History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Payout ID</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id} className="border-border/30 hover:bg-accent/30 transition-colors">
                    <TableCell className="font-mono text-xs text-primary">{payout.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{payout.date}</TableCell>
                    <TableCell className="font-semibold text-sm">${payout.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {payout.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsPage;
