import React, { useMemo, useState } from 'react';
import ProductTable from '@/components/product/ProductTable';
import { useProductsQuery } from '@/hooks/useCatalog';
import { mapCatalogListItem } from '@/lib/catalog-mappers';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const ProductModeration: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useProductsQuery({ page, limit: 20 });
  const products = useMemo(() => (data?.data ?? []).map(mapCatalogListItem), [data]);

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Product Moderation</h1>
      <p className="text-sm text-muted-foreground">Live catalog products (GET /catalog/products).</p>
      {products.length === 0 ? (
        <EmptyState type="products" />
      ) : (
        <>
          <ProductTable products={products} showActions={false} />
          {data && data.pagination.totalPages > 1 && (
            <div className="flex gap-4 justify-center text-sm">
              <button
                type="button"
                className="text-primary disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                {page} / {data.pagination.totalPages}
              </span>
              <button
                type="button"
                className="text-primary disabled:opacity-40"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductModeration;
