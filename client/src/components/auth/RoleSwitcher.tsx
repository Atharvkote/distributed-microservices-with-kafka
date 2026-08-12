import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';
import { vendorPaths } from '@/lib/vendor-paths';

/**
 * Toggle-style navigation for vendors who use both shopping and seller areas.
 */
export const RoleSwitcher: React.FC<{ className?: string }> = React.memo(({ className }) => {
  const location = useLocation();
  const isVendor = useAuthStore((s) => s.isVendor);

  if (!isVendor) return null;

  const onVendor =
    location.pathname.startsWith('/vendor-dashboard') || location.pathname.startsWith('/vendor');

  return (
    <div
      className={cn(
        'flex rounded-xl border-2 border-primary bg-accent/20 gap-1',
        className
      )}
    >
      <Link
        to="/dashboard"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          !onVendor && !location.pathname.startsWith('/admin')
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-primary/70 hover:text-primary hover:bg-accent/50'
        )}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Shopping
      </Link>
      <Link
        to={vendorPaths.home}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          onVendor
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Vendor
      </Link>
    </div>
  );
});

RoleSwitcher.displayName = 'RoleSwitcher';
