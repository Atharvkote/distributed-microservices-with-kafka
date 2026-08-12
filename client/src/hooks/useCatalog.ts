import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import { queryKeys } from '@/hooks/queryKeys';

export function useProductsQuery(opts: {
  page: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  vendor?: string;
}) {
  const { page, limit, category, search, minPrice, maxPrice, minRating, vendor } = opts;
  return useQuery({
    queryKey: queryKeys.products({
      page,
      limit,
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      vendor,
    }),
    queryFn: async () => {
      const { data } = await catalogApi.listProducts({
        page,
        limit: limit ?? 12,
        category,
        search,
        minPrice,
        maxPrice,
        minRating,
        vendor,
      });
      return data;
    },
  });
}

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ''),
    queryFn: async () => {
      const { data } = await catalogApi.getProduct(id!);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data } = await catalogApi.listCategories();
      return data.categories;
    },
  });
}

export function useVendorProductQuery(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.vendorProduct(id ?? ''),
    queryFn: async () => {
      const { data } = await catalogApi.getVendorProduct(id!);
      return data;
    },
    enabled: Boolean(id) && enabled,
  });
}
