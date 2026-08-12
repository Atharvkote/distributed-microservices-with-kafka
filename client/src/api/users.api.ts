import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';
import type { UserAddressDto, UserProfileSummary } from '@/lib/profile-utils';

const usersBase = `${GATEWAY.auth}/user-profile`;

export interface CompleteProfileBody {
  full_name: string;
  phone: string;
  address: UserAddressDto & {
    residential_address: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
  };
}

export interface CompleteProfileResponse {
  message: string;
  user: UserProfileSummary;
  token?: string;
  accessToken?: string;
}

export const usersApi = {
  fetchSummary: () => apiClient.get<UserProfileSummary>(`${usersBase}/fetch-summary`),

  completeProfile: (userId: string, body: CompleteProfileBody) =>
    apiClient.post<CompleteProfileResponse>(`${usersBase}/complete-profile/${userId}`, body),
};
