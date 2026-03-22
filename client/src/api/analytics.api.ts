import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

/**
 * Analytics service (minimal server in repo — root GET only).
 */
export const analyticsApi = {
  root: () =>
    apiClient.get<string>(`${GATEWAY.analytics}/`, {
      responseType: 'text',
      transformResponse: (r) => r,
    }),
};
