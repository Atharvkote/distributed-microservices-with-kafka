import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const vendorsBase = `${GATEWAY.auth}/vendor-profile`;

export interface CreateVendorBody {
  store_id: string;
  store_name: string;
}

export interface VendorRecord {
  _id: string;
  store_id: string;
  store_name: string;
  user: string;
  store_logo?: string;
  ratings?: number;
  description?: string;
  bg_banner?: string;
}

export interface CreateVendorResponse {
  vendor: VendorRecord;
  token?: string;
  accessToken?: string;
}

export const vendorsApi = {
  createVendor: (body: CreateVendorBody) =>
    apiClient.post<CreateVendorResponse>(`${vendorsBase}/`, body),

  getMyVendor: () => apiClient.get<VendorRecord | Record<string, unknown>>(`${vendorsBase}/`),
  getVendorSummary: (vendorId: string) =>
    apiClient.get<VendorRecord | Record<string, unknown>>(`${vendorsBase}/summary/${vendorId}`, {
      skipAuth: true,
    }),
};
