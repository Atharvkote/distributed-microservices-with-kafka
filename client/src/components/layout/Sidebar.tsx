import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Settings,
  Store, ClipboardList, Warehouse, DollarSign, Shield, Eye, TrendingUp,
  ChevronLeft, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import { vendorPaths, VENDOR_BASE } from '@/lib/vendor-paths';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const vendorNav: NavItem[] = [
  { label: 'Shopping', href: '/dashboard', icon: ShoppingBag },
  { label: 'Dashboard', href: vendorPaths.home, icon: LayoutDashboard },
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

interface SidebarProps {
  variant: 'vendor' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ variant }) => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navItems = variant === 'vendor' ? vendorNav : adminNav;
  const title = variant === 'vendor' ? 'Vendor Portal' : 'Admin Panel';

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 border-r border-border/50 glass transition-all duration-300 z-30',
          sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <img src="/Logo.png" alt="VenDeX Logo" className=''/>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-md neon-text ">VenDeX <span className="text-primary carattere-regular text-2xl">Portal</span></span>
          )}
        </div>

        <div>
          {variant === 'vendor' && (
                    <div className="flex justify-end px-4 md:px-6 pt-3 ">
                      <RoleSwitcher />
                    </div>
                  )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive =
                item.href === vendorPaths.home
                  ? location.pathname === vendorPaths.home
                  : location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent/60',
                    isActive
                      ? 'bg-primary/15 text-primary neon-glow border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="glass-strong">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return linkContent;
            })}
          </nav>
        </ScrollArea>

        <Separator className="opacity-30" />

        {/* Collapse toggle */}
        {/* <div className="p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div> */}

        {/* Settings */}
        <div className="p-2 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={variant === 'vendor' ? `${VENDOR_BASE}/settings` : `/${variant}/settings`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default React.memo(Sidebar);
