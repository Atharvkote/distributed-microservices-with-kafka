import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  catalogApi,
  type CreateProductBody,
  type UpdateProductBody,
  type CreateVariantBody,
  type UpdateVariantBody,
} from '@/api/catalog.api';
import { queryKeys } from '@/hooks/queryKeys';
import { toast } from 'sonner';

export function useVendorProductsQuery(page: number, isActive?: 'true' | 'false') {
  return useQuery({
    queryKey: queryKeys.vendorProducts(page, isActive),
    queryFn: async () => (await catalogApi.listVendorProducts({ page, limit: 20, isActive })).data,
  });
}

export function useVendorProductQuery(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendorProduct(productId ?? ''),
    queryFn: async () => (await catalogApi.getVendorProduct(productId!)).data,
    enabled: Boolean(productId),
  });
}

export function useVendorVariantsQuery(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendorVariants(productId ?? ''),
    queryFn: async () => (await catalogApi.getVendorVariants(productId!)).data.variants,
    enabled: Boolean(productId),
  });
}

export function useVendorInventoryQuery() {
  return useQuery({
    queryKey: queryKeys.vendorInventory,
    queryFn: async () => (await catalogApi.listInventory()).data,
  });
}

export function useVendorInventoryAlertsQuery(threshold?: number) {
  return useQuery({
    queryKey: queryKeys.vendorInventoryAlerts(threshold),
    queryFn: async () => (await catalogApi.inventoryAlerts({ threshold })).data.alerts,
  });
}

export function useCatalogCategoriesQuery() {
  return useQuery({
    queryKey: ['catalog-categories'] as const,
    queryFn: async () => (await catalogApi.listCategories()).data.categories,
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductBody) => catalogApi.createProduct(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vendor-products'] });
      toast.success('Product created');
    },
    onError: () => toast.error('Could not create product'),
  });
}

export function useUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductBody }) =>
      catalogApi.updateProduct(id, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['vendor-products'] });
      void qc.invalidateQueries({ queryKey: queryKeys.vendorProduct(vars.id) });
    },
    onError: () => toast.error('Could not update product'),
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vendor-products'] });
      void qc.invalidateQueries({ queryKey: ['vendor-product'] });
      toast.success('Product archived');
    },
    onError: () => toast.error('Could not delete product'),
  });
}

export function buildVariantFormData(body: CreateVariantBody, imageFiles?: File[]) {
  const fd = new FormData();
  fd.append('product', body.product);
  fd.append('sku', body.sku);
  fd.append('price', JSON.stringify(body.price));
  if (body.weight) fd.append('weight', JSON.stringify(body.weight));
  if (body.attributes && Object.keys(body.attributes).length > 0) {
    fd.append('attributes', JSON.stringify(body.attributes));
  }
  for (const f of imageFiles ?? []) {
    fd.append('images', f);
  }
  return fd;
}

export function buildUpdateVariantFormData(body: UpdateVariantBody, imageFiles?: File[]) {
  const fd = new FormData();
  if (body.price !== undefined) fd.append('price', JSON.stringify(body.price));
  if (body.weight !== undefined) fd.append('weight', JSON.stringify(body.weight));
  if (body.attributes !== undefined) fd.append('attributes', JSON.stringify(body.attributes));
  if (body.isActive !== undefined) fd.append('isActive', String(body.isActive));
  for (const f of imageFiles ?? []) {
    fd.append('images', f);
  }
  return fd;
}

export function useUpdateVariantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      productId,
      body,
      files,
    }: {
      id: string;
      productId: string;
      body: UpdateVariantBody;
      files?: File[];
    }) => catalogApi.updateVariant(id, buildUpdateVariantFormData(body, files)).then(() => productId),
    onSuccess: (productId) => {
      void qc.invalidateQueries({ queryKey: ['vendor-product', productId] });
      void qc.invalidateQueries({ queryKey: ['vendor-variants', productId] });
      void qc.invalidateQueries({ queryKey: queryKeys.vendorInventory });
      toast.success('Variant updated');
    },
    onError: () => toast.error('Could not update variant'),
  });
}

export function useCreateVariantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, files }: { body: CreateVariantBody; files?: File[] }) =>
      catalogApi.createVariant(buildVariantFormData(body, files)),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['vendor-product', vars.body.product] });
      void qc.invalidateQueries({ queryKey: ['vendor-variants', vars.body.product] });
      void qc.invalidateQueries({ queryKey: queryKeys.vendorInventory });
      toast.success('Variant created');
    },
    onError: () => toast.error('Could not create variant'),
  });
}

export function useDeleteVariantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productId }: { id: string; productId: string }) =>
      catalogApi.deleteVariant(id).then(() => productId),
    onSuccess: (productId) => {
      void qc.invalidateQueries({ queryKey: ['vendor-product', productId] });
      void qc.invalidateQueries({ queryKey: ['vendor-variants', productId] });
      void qc.invalidateQueries({ queryKey: queryKeys.vendorInventory });
      toast.success('Variant removed');
    },
    onError: () => toast.error('Could not remove variant'),
  });
}

export function useStockDeltaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, delta }: { variantId: string; delta: number }) =>
      catalogApi.updateStock(variantId, delta),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.vendorInventory });
      void qc.invalidateQueries({ queryKey: ['vendor-variants'] });
      void qc.invalidateQueries({ queryKey: ['vendor-product'] });
    },
    onError: () => toast.error('Stock update failed'),
  });
}

export function useBulkStockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { variantId: string; delta: number }[]) =>
      catalogApi.bulkUpdateStock(updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.vendorInventory });
      void qc.invalidateQueries({ queryKey: ['vendor-variants'] });
      toast.success('Stock applied');
    },
    onError: () => toast.error('Bulk update failed'),
  });
}
