import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireVendorProps {
  children: React.ReactNode;
}

const AuthSkeleton: React.FC = () => (
  <div className="p-8 space-y-4 max-w-xl mx-auto">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

export const RequireVendor: React.FC<RequireVendorProps> = React.memo(({ children }) => {
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isVendor = useAuthStore((s) => s.isVendor);

  if (!authReady) return <AuthSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isVendor) return <Navigate to="/become-vendor" replace />;

  return <>{children}</>;
});

RequireVendor.displayName = 'RequireVendor';
