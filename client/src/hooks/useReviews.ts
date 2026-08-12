import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/api/reviews.api';
import { queryKeys } from '@/hooks/queryKeys';

export function useProductReviewsQuery(
  productId: string | undefined,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.productReviews(productId ?? '', params?.page ?? 1, params?.limit ?? 10),
    queryFn: async () => {
      const { data } = await reviewsApi.listByProduct(productId!, params);
      return data;
    },
    enabled: Boolean(productId),
  });
}

export function useAddReviewMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { rating: number; comment?: string }) => reviewsApi.add({ product: productId, ...body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
      void qc.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });
}

export function useUpdateReviewMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; rating?: number; comment?: string }) =>
      reviewsApi.update(body.id, { rating: body.rating, comment: body.comment }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
      void qc.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });
}

export function useDeleteReviewMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.product(productId) });
      void qc.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });
}
