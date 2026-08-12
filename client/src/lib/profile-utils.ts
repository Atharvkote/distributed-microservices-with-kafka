import type { UserRole } from '@/store/authStore';
import { vendorPaths } from '@/lib/vendor-paths';

export interface UserAddressDto {
  residential_address?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

/** Matches identity-service `User` document shape from fetch-summary */
export interface UserProfileSummary {
  _id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture?: string;
  address?: UserAddressDto;
}

export function computeProfileCompleted(profile: UserProfileSummary | null | undefined): boolean {
  if (!profile) return false;
  const nameOk = Boolean(profile.full_name?.trim());
  const phoneOk = (profile.phone?.length ?? 0) >= 10;
  const a = profile.address;
  const addrOk = Boolean(
    a?.residential_address?.trim() &&
      a?.country?.trim() &&
      a?.state?.trim() &&
      a?.city?.trim() &&
      /^[0-9]{6}$/.test(String(a.pincode ?? ''))
  );
  return nameOk && phoneOk && addrOk;
}

export function getPostAuthRedirectPath(params: {
  profileCompleted: boolean;
  role: UserRole;
}): string {
  if (!params.profileCompleted && params.role !== 'admin') return '/complete-profile';
  if (params.role === 'admin') return '/admin/dashboard';
  if (params.role === 'vendor') return vendorPaths.home;
  return '/dashboard';
}
