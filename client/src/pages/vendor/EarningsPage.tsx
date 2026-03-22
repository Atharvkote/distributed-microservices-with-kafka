import React, { useMemo } from 'react';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useOrdersQuery } from '@/hooks/useOrders';
import { ordersToTrendData } from '@/lib/orders-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';

const EarningsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useOrdersQuery({ page: 1, limit: 500 });
  const chart = useMemo(() => ordersToTrendData(data?.orders ?? []), [data]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton className="h-96 rounded-xl w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="text-sm text-muted-foreground">Same order feed as dashboard (vendor-scoped filtering requires backend support).</p>
      {chart.length === 0 ? (
        <p className="text-muted-foreground">No data yet.</p>
      ) : (
        <AnalyticsChart
          title="Earnings trend"
          data={chart}
          type="bar"
          dataKeys={[{ key: 'revenue', color: '#22c55e', name: 'Revenue' }]}
        />
      )}
    </div>
  );
};

export default EarningsPage;
