import React, { useMemo } from 'react';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useOrdersQuery } from '@/hooks/useOrders';
import { ordersToTrendData } from '@/lib/orders-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';

const RevenueAnalytics: React.FC = () => {
  const { data, isLoading, isError, refetch } = useOrdersQuery({ page: 1, limit: 500 });
  const chart = useMemo(() => ordersToTrendData(data?.orders ?? []), [data]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton className="h-96 rounded-xl w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenue Analytics</h1>
      <p className="text-sm text-muted-foreground">Derived from orders returned by GET /orders/api/orders.</p>
      {chart.length === 0 ? (
        <p className="text-muted-foreground">Not enough order data.</p>
      ) : (
        <AnalyticsChart
          title="Revenue"
          data={chart}
          type="line"
          dataKeys={[{ key: 'revenue', color: '#f59e0b', name: 'Revenue' }]}
        />
      )}
    </div>
  );
};

export default RevenueAnalytics;
