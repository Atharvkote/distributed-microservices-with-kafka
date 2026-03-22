import { useQuery } from '@tanstack/react-query';
import { messagingApi } from '@/api/messaging.api';
import { queryKeys } from '@/hooks/queryKeys';

export function useNotificationsQuery(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.notifications(userId ?? ''), page],
    queryFn: async () => {
      const { data } = await messagingApi.listForUser(userId!, { page, limit: 20 });
      return data;
    },
    enabled: Boolean(userId),
  });
}
