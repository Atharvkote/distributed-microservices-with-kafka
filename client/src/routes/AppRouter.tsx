import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

// Layouts
const MainLayout = React.lazy(() => import('@/components/layout/MainLayout'));
const DashboardLayout = React.lazy(() => import('@/components/layout/DashboardLayout'));
const AuthLayout = React.lazy(() => import('@/components/layout/AuthLayout'));

// Customer pages
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const ProductListingPage = React.lazy(() => import('@/pages/ProductListingPage'));
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = React.lazy(() => import('@/pages/CartPage'));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));
const OrderHistoryPage = React.lazy(() => import('@/pages/OrderHistoryPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));

// Vendor pages
const VendorDashboard = React.lazy(() => import('@/pages/vendor/VendorDashboard'));
const ProductManagement = React.lazy(() => import('@/pages/vendor/ProductManagement'));
const AddProductPage = React.lazy(() => import('@/pages/vendor/AddProductPage'));
const OrderManagement = React.lazy(() => import('@/pages/vendor/OrderManagement'));
const InventoryPage = React.lazy(() => import('@/pages/vendor/InventoryPage'));
const EarningsPage = React.lazy(() => import('@/pages/vendor/EarningsPage'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const VendorManagement = React.lazy(() => import('@/pages/admin/VendorManagement'));
const ProductModeration = React.lazy(() => import('@/pages/admin/ProductModeration'));
const OrderMonitoring = React.lazy(() => import('@/pages/admin/OrderMonitoring'));
const RevenueAnalytics = React.lazy(() => import('@/pages/admin/RevenueAnalytics'));

// Auth pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl mt-4" />
    </div>
  );
}

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Public customer routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={['customer']}><OrderHistoryPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Route>

        {/* Vendor routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <DashboardLayout variant="vendor" />
          </ProtectedRoute>
        }>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<ProductManagement />} />
          <Route path="/vendor/products/new" element={<AddProductPage />} />
          <Route path="/vendor/orders" element={<OrderManagement />} />
          <Route path="/vendor/inventory" element={<InventoryPage />} />
          <Route path="/vendor/earnings" element={<EarningsPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout variant="admin" />
          </ProtectedRoute>
        }>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vendors" element={<VendorManagement />} />
          <Route path="/admin/products" element={<ProductModeration />} />
          <Route path="/admin/orders" element={<OrderMonitoring />} />
          <Route path="/admin/analytics" element={<RevenueAnalytics />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
