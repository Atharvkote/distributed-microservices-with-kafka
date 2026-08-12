import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  'vendor-dashboard': 'Vendor',
  vendor: 'Vendor',
  admin: 'Admin',
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  inventory: 'Inventory',
  earnings: 'Earnings',
  vendors: 'Vendors',
  analytics: 'Analytics',
  new: 'New Product',
  profile: 'Profile',
  cart: 'Cart',
  checkout: 'Checkout',
  settings: 'Settings',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/');
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
          const isLast = i === segments.length - 1;

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-foreground font-medium">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href} className="text-muted-foreground hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default React.memo(Breadcrumbs);
