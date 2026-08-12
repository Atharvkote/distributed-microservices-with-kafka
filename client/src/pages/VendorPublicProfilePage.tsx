import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { vendorsApi } from '@/api/vendors.api';
import { useProductsQuery } from '@/hooks/useCatalog';
import { mapCatalogListItem } from '@/lib/catalog-mappers';
import ProductCard from '@/components/product/ProductCard';

const VendorPublicProfilePage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();

  const vendorQ = useQuery({
    queryKey: ['vendor-public', vendorId],
    queryFn: async () => {
      const { data } = await vendorsApi.getVendorSummary(vendorId!);
      return data;
    },
    enabled: Boolean(vendorId),
  });

  const productsQ = useProductsQuery({
    page: 1,
    limit: 24,
    vendor: vendorId,
  });

  if (vendorQ.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  const vendor = (vendorQ.data ?? {}) as {
    store_name?: string;
    store_logo?: string;
    ratings?: number;
    description?: string;
  };
  const products = (productsQ.data?.data ?? []).map(mapCatalogListItem);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <Card className="glass border-border/50">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-primary/30">
            <AvatarImage src={vendor.store_logo || undefined} alt={vendor.store_name || 'Vendor'} />
            <AvatarFallback>{vendor.store_name?.[0]?.toUpperCase() ?? 'V'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{vendor.store_name || 'Vendor Store'}</h1>
            <p className="text-sm text-muted-foreground mt-1">{vendor.description || 'Public seller profile'}</p>
            {typeof vendor.ratings === 'number' && vendor.ratings > 0 && (
              <p className="text-sm mt-2 inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {vendor.ratings.toFixed(1)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products by this seller</h2>
        <Link to="/products" className="text-sm text-primary hover:underline">
          Back to all products
        </Link>
      </div>

      {productsQ.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorPublicProfilePage;
