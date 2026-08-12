import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireProfileCompleteProps {
  children: React.ReactNode;
}

const AuthSkeleton: React.FC = () => (
  <div className="p-8 space-y-4 max-w-xl mx-auto">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

/** Requires auth + completed profile (admins bypass). */
export const RequireProfileComplete: React.FC<RequireProfileCompleteProps> = React.memo(
  ({ children }) => {
    const authReady = useAuthStore((s) => s.authReady);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const profileCompleted = useAuthStore((s) => s.profileCompleted);
    const role = useAuthStore((s) => s.user?.role);

    if (!authReady) return <AuthSkeleton />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role !== 'admin' && !profileCompleted) {
      return <Navigate to="/complete-profile" replace />;
    }

    return <>{children}</>;
  }
);

RequireProfileComplete.displayName = 'RequireProfileComplete';
