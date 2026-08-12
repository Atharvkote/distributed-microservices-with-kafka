import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { RequireAuth } from '@/routes/guards/RequireAuth';
import { RequireProfileComplete } from '@/routes/guards/RequireProfileComplete';
import { RequireIncompleteProfile } from '@/routes/guards/RequireIncompleteProfile';
import { RequireVendor } from '@/routes/guards/RequireVendor';
import { RequireNotVendor } from '@/routes/guards/RequireNotVendor';
import { RequireAdmin } from '@/routes/guards/RequireAdmin';

const MainLayout = React.lazy(() => import('@/components/layout/MainLayout'));
const DashboardLayout = React.lazy(() => import('@/components/layout/DashboardLayout'));
const AuthLayout = React.lazy(() => import('@/components/layout/AuthLayout'));

const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const ProductListingPage = React.lazy(() => import('@/pages/ProductListingPage'));
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'));
const VendorPublicProfilePage = React.lazy(() => import('@/pages/VendorPublicProfilePage'));
const CartPage = React.lazy(() => import('@/pages/CartPage'));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));
const OrderHistoryPage = React.lazy(() => import('@/pages/OrderHistoryPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const CustomerDashboardPage = React.lazy(() => import('@/pages/CustomerDashboardPage'));

const VendorDashboard = React.lazy(() => import('@/pages/vendor/VendorDashboard'));
const ProductManagement = React.lazy(() => import('@/pages/vendor/ProductManagement'));
const AddProductPage = React.lazy(() => import('@/pages/vendor/AddProductPage'));
const OrderManagement = React.lazy(() => import('@/pages/vendor/OrderManagement'));
const InventoryPage = React.lazy(() => import('@/pages/vendor/InventoryPage'));
const EarningsPage = React.lazy(() => import('@/pages/vendor/EarningsPage'));
const VendorProductDetailPage = React.lazy(() => import('@/pages/vendor/VendorProductDetailPage'));
const VendorEditProductPage = React.lazy(() => import('@/pages/vendor/VendorEditProductPage'));

function LegacyVendorRedirect() {
  const { pathname, search } = useLocation();
  const target = (() => {
    if (pathname === '/vendor' || pathname === '/vendor/') return '/vendor-dashboard';
    if (!pathname.startsWith('/vendor/')) return '/vendor-dashboard';
    const rest = pathname.slice('/vendor'.length);
    if (rest === '/dashboard') return '/vendor-dashboard';
    return `/vendor-dashboard${rest}`;
  })();
  return <Navigate to={`${target}${search}`} replace />;
}

const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const VendorManagement = React.lazy(() => import('@/pages/admin/VendorManagement'));
const ProductModeration = React.lazy(() => import('@/pages/admin/ProductModeration'));
const OrderMonitoring = React.lazy(() => import('@/pages/admin/OrderMonitoring'));
const RevenueAnalytics = React.lazy(() => import('@/pages/admin/RevenueAnalytics'));

const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const CompleteProfilePage = React.lazy(() => import('@/pages/auth/CompleteProfilePage'));
const BecomeVendorPage = React.lazy(() => import('@/pages/auth/BecomeVendorPage'));

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
        <Route path="/vendor/*" element={<LegacyVendorRedirect />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/complete-profile"
            element={
              <RequireAuth>
                <RequireIncompleteProfile>
                  <CompleteProfilePage />
                </RequireIncompleteProfile>
              </RequireAuth>
            }
          />
          <Route
            path="/become-vendor"
            element={
              <RequireAuth>
                <RequireProfileComplete>
                  <RequireNotVendor>
                    <BecomeVendorPage />
                  </RequireNotVendor>
                </RequireProfileComplete>
              </RequireAuth>
            }
          />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/vendors/:vendorId" element={<VendorPublicProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <RequireProfileComplete>
                  <CustomerDashboardPage />
                </RequireProfileComplete>
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <RequireProfileComplete>
                  <CheckoutPage />
                </RequireProfileComplete>
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <RequireProfileComplete>
                  <OrderHistoryPage />
                </RequireProfileComplete>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <RequireProfileComplete>
                  <ProfilePage />
                </RequireProfileComplete>
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="/vendor-dashboard"
          element={
            <RequireAuth>
              <RequireVendor>
                <DashboardLayout variant="vendor" />
              </RequireVendor>
            </RequireAuth>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:productId/edit" element={<VendorEditProductPage />} />
          <Route path="products/:productId" element={<VendorProductDetailPage />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="earnings" element={<EarningsPage />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <RequireAdmin>
                <DashboardLayout variant="admin" />
              </RequireAdmin>
            </RequireAuth>
          }
        >
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
