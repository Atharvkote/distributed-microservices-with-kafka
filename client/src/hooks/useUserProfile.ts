import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queryKeys';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/authStore';

export function useUserProfileQuery() {
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: async () => (await usersApi.fetchSummary()).data,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });
}
