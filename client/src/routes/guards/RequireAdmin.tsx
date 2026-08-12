import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAdminProps {
  children: React.ReactNode;
}

const AuthSkeleton: React.FC = () => (
  <div className="p-8 space-y-4 max-w-xl mx-auto">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

export const RequireAdmin: React.FC<RequireAdminProps> = React.memo(({ children }) => {
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  if (!authReady) return <AuthSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
});

RequireAdmin.displayName = 'RequireAdmin';
