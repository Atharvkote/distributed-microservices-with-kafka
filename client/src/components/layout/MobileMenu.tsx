import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, DollarSign,
  Store, ClipboardList, Eye, TrendingUp, Shield, X, Home, ShoppingBag,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { vendorPaths } from '@/lib/vendor-paths';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const vendorNav: NavItem[] = [
  { label: 'Shopping', href: '/dashboard', icon: ShoppingBag },
  { label: 'Vendor home', href: vendorPaths.home, icon: LayoutDashboard },
  { label: 'Products', href: vendorPaths.products, icon: Package },
  { label: 'Orders', href: vendorPaths.orders, icon: ShoppingCart },
  { label: 'Inventory', href: vendorPaths.inventory, icon: Warehouse },
  { label: 'Earnings', href: vendorPaths.earnings, icon: DollarSign },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'Products', href: '/admin/products', icon: Eye },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
];

const customerNav: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
];

interface MobileMenuProps {
  variant?: 'customer' | 'vendor' | 'admin';
}

const MobileMenu: React.FC<MobileMenuProps> = ({ variant = 'customer' }) => {
  const location = useLocation();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const navItems = variant === 'vendor' ? vendorNav : variant === 'admin' ? adminNav : customerNav;
  const title = variant === 'vendor' ? 'Vendor Portal' : variant === 'admin' ? 'Admin Panel' : 'VenDeX';
  const TitleIcon = variant === 'vendor' ? Store : variant === 'admin' ? Shield : Package;

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-[280px] glass-strong p-0">
        <SheetHeader className="px-4 h-16 flex flex-row items-center gap-3 border-b border-border/50">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <TitleIcon className="h-4 w-4 text-white" />
          </div>
          <SheetTitle className="neon-text text-sm">{title}</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map((item) => {
            const isActive =
              item.href === vendorPaths.home
                ? location.pathname === vendorPaths.home
                : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary neon-glow border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(MobileMenu);
