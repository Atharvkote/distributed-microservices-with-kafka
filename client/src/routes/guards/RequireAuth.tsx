import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAuthProps {
  children: React.ReactNode;
}

const AuthSkeleton: React.FC = () => (
  <div className="p-8 space-y-4 max-w-xl mx-auto">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

/** Authenticated users only. */
export const RequireAuth: React.FC<RequireAuthProps> = React.memo(({ children }) => {
  const location = useLocation();
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!authReady) return <AuthSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
});

RequireAuth.displayName = 'RequireAuth';
