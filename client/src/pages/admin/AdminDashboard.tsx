import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Activity } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useOrdersQuery } from '@/hooks/useOrders';
import { ordersToTrendData } from '@/lib/orders-analytics';
import { analyticsApi } from '@/api/analytics.api';
import { queryKeys } from '@/hooks/queryKeys';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { formatMoney } from '@/lib/money';

const AdminDashboard: React.FC = () => {
  const { data: ordersData, isLoading: oLoad, isError: oErr, refetch } = useOrdersQuery({
    page: 1,
    limit: 200,
  });

  const { data: analyticsText, isLoading: hLoad, isError: hErr } = useQuery({
    queryKey: queryKeys.analyticsHealth,
    queryFn: async () => {
      const { data } = await analyticsApi.root();
      return typeof data === 'string' ? data : String(data);
    },
  });

  const orders = ordersData?.orders ?? [];
  const revenue = useMemo(() => orders.reduce((s, x) => s + x.total, 0), [orders]);
  const chart = useMemo(() => ordersToTrendData(orders), [orders]);

  if (oErr) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Analytics service root:{' '}
        {hLoad ? '…' : hErr ? 'unreachable' : <span className="text-emerald-400">{analyticsText?.slice(0, 40)}</span>}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {oLoad ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <MetricCard title="Platform revenue (orders)" value={formatMoney(revenue)} icon={DollarSign} />
            <MetricCard title="Orders loaded" value={String(orders.length)} icon={ShoppingCart} />
            <MetricCard title="Analytics" value={hErr ? 'down' : 'up'} icon={Activity} />
          </>
        )}
      </div>

      {!oLoad && chart.length > 0 && (
        <AnalyticsChart
          title="Orders trend"
          data={chart}
          type="area"
          dataKeys={[
            { key: 'revenue', color: '#a855f7', name: 'Revenue' },
            { key: 'orders', color: '#38bdf8', name: 'Orders' },
          ]}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
