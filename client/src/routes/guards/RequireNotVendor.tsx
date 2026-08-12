import React from 'react';
import { Navigate } from 'react-router-dom';
import { vendorPaths } from '@/lib/vendor-paths';
import { useAuthStore } from '@/store/authStore';

interface RequireNotVendorProps {
  children: React.ReactNode;
}

/** Blocks users who already have a vendor profile (JWT isVendor). */
export const RequireNotVendor: React.FC<RequireNotVendorProps> = React.memo(({ children }) => {
  const isVendor = useAuthStore((s) => s.isVendor);

  if (isVendor) return <Navigate to={vendorPaths.home} replace />;

  return <>{children}</>;
});

RequireNotVendor.displayName = 'RequireNotVendor';
