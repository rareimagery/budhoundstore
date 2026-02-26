import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RoleGuard from './components/auth/RoleGuard';
import LoginPage from './components/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import { PERMS, ROLES } from './utils/permissions';

// ── Lazy-loaded page components ──
const DashboardPage   = lazy(() => import('./components/dashboard/DashboardPage'));
const OrdersPage      = lazy(() => import('./components/orders/OrdersPage'));
const OrderDetail     = lazy(() => import('./components/orders/OrderDetail'));
const InventoryPage   = lazy(() => import('./components/inventory/InventoryPage'));
const ProductsPage    = lazy(() => import('./components/products/ProductsPage'));
const ProductForm     = lazy(() => import('./components/products/ProductForm'));
const OrderCreateForm = lazy(() => import('./components/orders/OrderCreateForm'));
const SalesPage       = lazy(() => import('./components/sales/SalesPage'));
const POSInterface    = lazy(() => import('./components/sales/POSInterface'));
const CustomersPage   = lazy(() => import('./components/customers/CustomersPage'));
const CustomerDetail  = lazy(() => import('./components/customers/CustomerDetail'));
const ReportsPage     = lazy(() => import('./components/reports/ReportsPage'));
const StaffPage       = lazy(() => import('./components/staff/StaffPage'));
const SettingsPage    = lazy(() => import('./components/settings/SettingsPage'));

function PageLoader({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// Helper: wrap a page in both Suspense and RoleGuard.
function guarded(Component, { roles, permission } = {}) {
  const element = (
    <PageLoader>
      <Component />
    </PageLoader>
  );

  if (roles || permission) {
    return <RoleGuard roles={roles} permission={permission}>{element}</RoleGuard>;
  }
  return element;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RoleGuard roles={[ROLES.OWNER, ROLES.MANAGER, ROLES.BUDTENDER]}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Dashboard — all roles
      { path: 'dashboard', element: guarded(DashboardPage) },

      // Orders
      { path: 'orders',           element: guarded(OrdersPage) },
      { path: 'orders/new',      element: guarded(OrderCreateForm, { permission: PERMS.CREATE_SALES }) },
      { path: 'orders/:orderId',  element: guarded(OrderDetail) },

      // Inventory
      { path: 'inventory', element: guarded(InventoryPage, { permission: PERMS.VIEW_INVENTORY }) },

      // Products
      { path: 'products',               element: guarded(ProductsPage, { permission: PERMS.VIEW_PRODUCTS }) },
      { path: 'products/new',           element: guarded(ProductForm, { permission: PERMS.MANAGE_PRODUCTS }) },
      { path: 'products/:productId/edit', element: guarded(ProductForm, { permission: PERMS.MANAGE_PRODUCTS }) },

      // Sales / POS
      { path: 'sales', element: guarded(SalesPage, { permission: PERMS.CREATE_SALES }) },
      { path: 'pos',   element: guarded(POSInterface, { permission: PERMS.CREATE_SALES }) },

      // Customers
      { path: 'customers',              element: guarded(CustomersPage) },
      { path: 'customers/:customerId',  element: guarded(CustomerDetail) },

      // Reports
      { path: 'reports', element: guarded(ReportsPage, { permission: PERMS.VIEW_SALES_REPORTS }) },

      // Staff
      { path: 'staff', element: guarded(StaffPage, { permission: PERMS.VIEW_STAFF }) },

      // Settings
      { path: 'settings', element: guarded(SettingsPage, { permission: PERMS.MANAGE_SETTINGS }) },
    ],
  },
]);
