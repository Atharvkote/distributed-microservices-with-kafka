import React, { useMemo } from 'react';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { useOrdersQuery } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import { useAuthStore } from '@/store/authStore';
import { vendorOrdersToTrendData } from '@/lib/vendor-order-totals';

const EarningsPage: React.FC = () => {
  const vendorId = useAuthStore((s) => s.vendorId);
  const { data, isLoading, isError, refetch } = useOrdersQuery({
    page: 1,
    limit: 500,
    vendorScope: 'me',
  });
  const chart = useMemo(
    () => vendorOrdersToTrendData(data?.orders ?? [], vendorId),
    [data, vendorId],
  );

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton className="h-96 rounded-xl w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="text-sm text-muted-foreground">
        Monthly totals use your line items when present; otherwise the full order amount for that row.
      </p>
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
