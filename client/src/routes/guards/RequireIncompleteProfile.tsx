import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getPostAuthRedirectPath } from '@/lib/profile-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireIncompleteProfileProps {
  children: React.ReactNode;
}

const AuthSkeleton: React.FC = () => (
  <div className="p-8 space-y-4 max-w-xl mx-auto">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

/** Profile completion wizard — only when profile is still incomplete (admins redirected out). */
export const RequireIncompleteProfile: React.FC<RequireIncompleteProfileProps> = React.memo(
  ({ children }) => {
    const authReady = useAuthStore((s) => s.authReady);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const profileCompleted = useAuthStore((s) => s.profileCompleted);
    const user = useAuthStore((s) => s.user);

    if (!authReady) return <AuthSkeleton />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (profileCompleted && user) {
      const next = getPostAuthRedirectPath({ profileCompleted: true, role: user.role });
      return <Navigate to={next} replace />;
    }

    return <>{children}</>;
  }
);

RequireIncompleteProfile.displayName = 'RequireIncompleteProfile';
