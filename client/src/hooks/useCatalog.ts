import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import { queryKeys } from '@/hooks/queryKeys';

export function useProductsQuery(opts: {
  page: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.products(opts.page, opts.category, opts.search),
    queryFn: async () => {
      const { data } = await catalogApi.listProducts({
        page: opts.page,
        limit: opts.limit ?? 12,
        category: opts.category,
        search: opts.search,
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
