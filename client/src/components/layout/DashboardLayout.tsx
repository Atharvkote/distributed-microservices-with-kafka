import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Breadcrumbs from './Breadcrumbs';
import MobileMenu from './MobileMenu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardLayoutProps {
  variant: 'vendor' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ variant }) => {
  return (
    <div className="min-h-screen flex gradient-dark">
      <Sidebar variant={variant} />
      <MobileMenu variant={variant} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar showSearch={true} showCart={false} />

        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
