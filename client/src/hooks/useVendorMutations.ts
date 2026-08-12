import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi, type CreateVendorBody } from '@/api/vendors.api';
import { queryKeys } from '@/hooks/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();
  const applyRefreshedToken = useAuthStore((s) => s.applyRefreshedToken);

  return useMutation({
    mutationFn: (body: CreateVendorBody) => vendorsApi.createVendor(body).then((r) => r.data),
    onSuccess: (data) => {
      const token = data.accessToken ?? data.token;
      if (token) applyRefreshedToken(token);
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success('Vendor profile created');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
          : '';
      toast.error(msg || 'Could not create vendor profile');
    },
  });
}
