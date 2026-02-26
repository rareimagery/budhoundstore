# BudHound Store Management — React Frontend Implementation

## Overview

This document covers the React application implementation including project setup, authentication flow, role-based routing, state management, and the core module implementations (Dashboard, Orders, Inventory, Products, Sales, Reports).

---

## Step 1: Project Setup

### Initialize with Vite

```bash
npm create vite@latest budhound-management -- --template react
cd budhound-management
```

### Install Dependencies

```bash
# Core
npm install react-router-dom@6 axios

# Data fetching & state
npm install @tanstack/react-query

# UI
npm install tailwindcss @headlessui/react @heroicons/react
npm install recharts                    # Charts
npm install @tanstack/react-table       # Data tables
npm install date-fns                    # Date formatting
npm install react-hot-toast             # Notifications
npm install clsx                        # Conditional classnames

# Development
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### Environment Configuration

**.env.development**
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OAUTH_CLIENT_ID=budhound_management
VITE_WS_URL=ws://localhost:3001
```

**.env.production**
```env
VITE_API_BASE_URL=https://api.budhound.app
VITE_OAUTH_CLIENT_ID=budhound_management
VITE_WS_URL=wss://ws.budhound.app
```

---

## Step 2: API Client

### `src/api/client.js`

```jsx
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send cookies for refresh token
});

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Request interceptor — attach Bearer token.
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — handle 401 with token refresh.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Deduplicate concurrent refresh attempts.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }

      try {
        const newToken = await refreshPromise;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout.
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

async function refreshAccessToken() {
  const response = await axios.post(
    `${API_BASE}/oauth/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
    }),
    { withCredentials: true }
  );
  return response.data.access_token;
}

export default apiClient;
```

---

## Step 3: Authentication Context

### `src/contexts/AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // { id, email, name, roles, store, permissions }
  const [loading, setLoading] = useState(true);    // Initial auth check
  const [error, setError] = useState(null);

  // Attempt to restore session on mount (via refresh token cookie).
  useEffect(() => {
    async function restoreSession() {
      try {
        const tokenRes = await apiClient.post('/oauth/token', new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
        }));
        setAccessToken(tokenRes.data.access_token);

        const meRes = await apiClient.get('/api/budhound/me');
        setUser(meRes.data);
      } catch {
        // No valid session — user needs to log in.
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // Listen for forced logout from API interceptor.
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const tokenRes = await apiClient.post('/oauth/token', new URLSearchParams({
        grant_type: 'password',
        client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
        username: email,
        password: password,
      }));

      setAccessToken(tokenRes.data.access_token);

      const meRes = await apiClient.get('/api/budhound/me');
      setUser(meRes.data);

      return meRes.data;
    } catch (err) {
      const message = err.response?.status === 401
        ? 'Invalid email or password'
        : 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/oauth/revoke');
    } catch {
      // Best-effort revocation.
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  // Permission check helpers.
  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission) ?? false,
    [user]
  );

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => roles.some((role) => user?.roles?.includes(role)),
    [user]
  );

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Step 4: Permission-Based Components

### `src/components/auth/RoleGuard.jsx`

Wraps routes — redirects unauthorized users:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protects a route based on role or permission.
 *
 * Usage:
 *   <RoleGuard roles={['store_owner', 'store_manager']}>
 *     <StaffPage />
 *   </RoleGuard>
 *
 *   <RoleGuard permission="view tax reports">
 *     <TaxReport />
 *   </RoleGuard>
 */
export default function RoleGuard({ children, roles, permission }) {
  const { isAuthenticated, hasAnyRole, hasPermission, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
```

### `src/components/auth/PermissionGate.jsx`

Conditionally renders UI elements (buttons, tabs, columns):

```jsx
import { useAuth } from '../../contexts/AuthContext';

/**
 * Conditionally renders children based on permission.
 *
 * Usage:
 *   <PermissionGate permission="manage product pricing">
 *     <PriceEditButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permission="process refunds" fallback={<span>Contact manager</span>}>
 *     <RefundButton />
 *   </PermissionGate>
 */
export default function PermissionGate({ children, permission, roles, fallback = null }) {
  const { hasPermission, hasAnyRole } = useAuth();

  if (permission && !hasPermission(permission)) return fallback;
  if (roles && !hasAnyRole(roles)) return fallback;

  return children;
}
```

---

## Step 5: Route Definitions

### `src/routes.jsx`

```jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RoleGuard from './components/auth/RoleGuard';
import AppShell from './components/layout/AppShell';
import LoginPage from './components/auth/LoginPage';

// Lazy-loaded page components for code splitting.
import { lazy, Suspense } from 'react';
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('./components/orders/OrdersPage'));
const OrderDetail = lazy(() => import('./components/orders/OrderDetail'));
const InventoryPage = lazy(() => import('./components/inventory/InventoryPage'));
const ProductsPage = lazy(() => import('./components/products/ProductsPage'));
const ProductForm = lazy(() => import('./components/products/ProductForm'));
const SalesPage = lazy(() => import('./components/sales/SalesPage'));
const POSInterface = lazy(() => import('./components/sales/POSInterface'));
const CustomersPage = lazy(() => import('./components/customers/CustomersPage'));
const CustomerDetail = lazy(() => import('./components/customers/CustomerDetail'));
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
const StaffPage = lazy(() => import('./components/staff/StaffPage'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RoleGuard roles={['store_owner', 'store_manager', 'budtender']}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // ── Dashboard (all roles) ──
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },

      // ── Orders ──
      {
        path: 'orders',
        element: (
          <SuspenseWrapper>
            <OrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders/:orderId',
        element: (
          <SuspenseWrapper>
            <OrderDetail />
          </SuspenseWrapper>
        ),
      },

      // ── Inventory ──
      {
        path: 'inventory',
        element: (
          <RoleGuard permission="view store inventory">
            <SuspenseWrapper>
              <InventoryPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },

      // ── Products ──
      {
        path: 'products',
        element: (
          <RoleGuard permission="view store products">
            <SuspenseWrapper>
              <ProductsPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'products/new',
        element: (
          <RoleGuard permission="manage store products">
            <SuspenseWrapper>
              <ProductForm />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'products/:productId/edit',
        element: (
          <RoleGuard permission="manage store products">
            <SuspenseWrapper>
              <ProductForm />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },

      // ── Sales / POS ──
      {
        path: 'sales',
        element: (
          <RoleGuard permission="create sales transactions">
            <SuspenseWrapper>
              <SalesPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },
      {
        path: 'pos',
        element: (
          <RoleGuard permission="create sales transactions">
            <SuspenseWrapper>
              <POSInterface />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },

      // ── Customers ──
      {
        path: 'customers',
        element: (
          <SuspenseWrapper>
            <CustomersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'customers/:customerId',
        element: (
          <SuspenseWrapper>
            <CustomerDetail />
          </SuspenseWrapper>
        ),
      },

      // ── Reports (Owner & Manager only) ──
      {
        path: 'reports',
        element: (
          <RoleGuard permission="view sales reports">
            <SuspenseWrapper>
              <ReportsPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },

      // ── Staff (Owner manages, Manager views) ──
      {
        path: 'staff',
        element: (
          <RoleGuard permission="view store staff">
            <SuspenseWrapper>
              <StaffPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },

      // ── Settings (Owner only) ──
      {
        path: 'settings',
        element: (
          <RoleGuard permission="manage store settings">
            <SuspenseWrapper>
              <SettingsPage />
            </SuspenseWrapper>
          </RoleGuard>
        ),
      },
    ],
  },
]);
```

---

## Step 6: App Shell & Navigation

### `src/components/layout/Sidebar.jsx`

The sidebar dynamically renders only the nav items the current user has permission to see:

```jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon, ClipboardDocumentListIcon, CubeIcon,
  TagIcon, CurrencyDollarIcon, UsersIcon,
  ChartBarIcon, UserGroupIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    permission: 'view store dashboard',
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ClipboardDocumentListIcon,
    // All roles see orders (filtered by their access level).
    permission: null,
  },
  {
    label: 'POS / New Sale',
    path: '/pos',
    icon: CurrencyDollarIcon,
    permission: 'create sales transactions',
  },
  {
    label: 'Sales History',
    path: '/sales',
    icon: CurrencyDollarIcon,
    permission: 'create sales transactions',
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: CubeIcon,
    permission: 'view store inventory',
  },
  {
    label: 'Products',
    path: '/products',
    icon: TagIcon,
    permission: 'view store products',
  },
  {
    label: 'Customers',
    path: '/customers',
    // Shown for all, but content differs by role.
    permission: null,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ChartBarIcon,
    permission: 'view sales reports',
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: UserGroupIcon,
    permission: 'view store staff',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Cog6ToothIcon,
    permission: 'manage store settings',
  },
];

export default function Sidebar() {
  const { hasPermission, user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Store Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-bold text-green-400">BudHound</h1>
        <p className="text-sm text-gray-400 truncate">{user?.store?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize">
          {user?.roles?.[0]?.replace('_', ' ')}
        </p>
      </div>
    </aside>
  );
}
```

---

## Step 7: Custom Hooks for Data Fetching

### `src/hooks/useOrders.js`

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// Fetch orders with filters and pagination.
export function useOrders({ page = 1, status, dateRange } = {}) {
  const { hasPermission } = useAuth();

  // Build JSON:API query params.
  const params = new URLSearchParams();
  params.set('page[limit]', '25');
  params.set('page[offset]', String((page - 1) * 25));
  params.set('include', 'order_items,order_items.purchased_entity');
  params.set('sort', '-created');

  if (status) {
    params.set('filter[state]', status);
  }

  // Budtenders only see assigned orders (handled server-side,
  // but we add the filter for clarity).
  const endpoint = hasPermission('view own store orders')
    ? `/jsonapi/commerce_order/default?${params}`
    : `/jsonapi/commerce_order/default?${params}`; // Server filters by user

  return useQuery({
    queryKey: ['orders', { page, status, dateRange }],
    queryFn: () => apiClient.get(endpoint).then((res) => res.data),
    keepPreviousData: true,
  });
}

// Fetch single order with full details.
export function useOrder(orderId) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () =>
      apiClient
        .get(`/jsonapi/commerce_order/default/${orderId}?include=order_items,order_items.purchased_entity`)
        .then((res) => res.data),
    enabled: !!orderId,
  });
}

// Update order status.
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) =>
      apiClient.patch(`/api/budhound/orders/${orderId}/status`, { status }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['orders', orderId]);
    },
  });
}

// Assign driver to order.
export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, driverId }) =>
      apiClient.patch(`/api/budhound/orders/${orderId}/assign-driver`, {
        driver_id: driverId,
      }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries(['orders', orderId]);
    },
  });
}
```

### `src/hooks/useInventory.js`

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useInventory({ page = 1, search, lowStockOnly } = {}) {
  const params = new URLSearchParams();
  params.set('page[limit]', '50');
  params.set('page[offset]', String((page - 1) * 50));
  params.set('include', 'field_product_image');
  params.set('fields[commerce_product_variation--default]',
    'title,sku,price,field_stock_quantity,field_low_stock_threshold');

  if (search) {
    params.set('filter[title][operator]', 'CONTAINS');
    params.set('filter[title][value]', search);
  }

  return useQuery({
    queryKey: ['inventory', { page, search, lowStockOnly }],
    queryFn: () =>
      apiClient.get(`/jsonapi/commerce_product_variation/default?${params}`)
        .then((res) => {
          let items = res.data.data;
          // Client-side low stock filter (or implement server-side).
          if (lowStockOnly) {
            items = items.filter(
              (item) =>
                item.attributes.field_stock_quantity <=
                (item.attributes.field_low_stock_threshold || 10)
            );
          }
          return { ...res.data, data: items };
        }),
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variationId, adjustment, reason, type }) =>
      apiClient.post(`/api/budhound/inventory/${variationId}/adjust`, {
        quantity_change: adjustment,
        reason,
        adjustment_type: type, // received, damaged, correction, etc.
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });
}

export function useInventoryAuditLog({ variationId, page = 1 } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  if (variationId) params.set('variation_id', variationId);

  return useQuery({
    queryKey: ['inventory-log', { variationId, page }],
    queryFn: () =>
      apiClient.get(`/api/budhound/inventory/log?${params}`)
        .then((res) => res.data),
  });
}
```

---

## Step 8: Core Page Implementations

### Dashboard Page (Role-Adaptive)

```jsx
// src/components/dashboard/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import PermissionGate from '../auth/PermissionGate';
import RevenueChart from './RevenueChart';
import OrdersSummary from './OrdersSummary';
import TopProducts from './TopProducts';
import StockAlerts from './StockAlerts';

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn: () => apiClient.get('/api/budhound/dashboard?range=today').then(r => r.data),
    refetchInterval: 60000, // Refresh every minute.
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {getGreeting()}, {user.name}
      </h1>

      {/* Summary Cards — visible to all, content varies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PermissionGate permission="view store analytics">
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(stats.total_revenue)}
            trend={stats.revenue_trend}
          />
          <StatCard
            label="Avg Order Value"
            value={formatCurrency(stats.average_order_value)}
          />
        </PermissionGate>

        <StatCard label="Orders Today" value={stats.order_count} />
        <StatCard
          label="Pending Deliveries"
          value={stats.pending_deliveries}
          alert={stats.pending_deliveries > 5}
        />
      </div>

      {/* Revenue Chart — Owner & Manager only */}
      <PermissionGate permission="view store analytics">
        <RevenueChart />
      </PermissionGate>

      {/* Orders by Status — all roles */}
      <OrdersSummary statuses={stats.orders_by_status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <TopProducts products={stats.top_products} />

        {/* Low Stock Alerts */}
        <PermissionGate permission="view store inventory">
          <StockAlerts count={stats.low_stock_alerts} />
        </PermissionGate>
      </div>
    </div>
  );
}
```

### Orders Page (with role-based filtering)

```jsx
// src/components/orders/OrdersPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import PermissionGate from '../auth/PermissionGate';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready for Delivery' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { hasPermission } = useAuth();

  const { data, isLoading } = useOrders({ page, status: statusFilter });

  const columns = [
    {
      header: 'Order #',
      accessorKey: 'attributes.order_number',
      cell: ({ row }) => (
        <Link
          to={`/orders/${row.original.id}`}
          className="text-green-600 hover:underline font-medium"
        >
          #{row.original.attributes.order_number}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'attributes.billing_information.given_name',
      cell: ({ row }) => {
        const billing = row.original.attributes.billing_information;
        return `${billing?.given_name || ''} ${billing?.family_name || ''}`.trim();
      },
    },
    {
      header: 'Status',
      accessorKey: 'attributes.state',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      header: 'Total',
      accessorKey: 'attributes.total_price.formatted',
    },
    {
      header: 'Date',
      accessorKey: 'attributes.created',
      cell: ({ getValue }) => formatDate(getValue()),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        totalPages={Math.ceil((data?.meta?.count || 0) / 25)}
      />
    </div>
  );
}
```

### Inventory Page (with stock adjustment modal)

```jsx
// src/components/inventory/InventoryPage.jsx (structural outline)
import { useState } from 'react';
import { useInventory, useAdjustInventory } from '../../hooks/useInventory';
import { useAuth } from '../../contexts/AuthContext';
import PermissionGate from '../auth/PermissionGate';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const { hasPermission } = useAuth();
  const { data, isLoading } = useInventory({ search, lowStockOnly });
  const adjustMutation = useAdjustInventory();

  const columns = [
    { header: 'SKU', accessorKey: 'attributes.sku' },
    { header: 'Product', accessorKey: 'attributes.title' },
    {
      header: 'Stock',
      accessorKey: 'attributes.field_stock_quantity',
      cell: ({ row }) => {
        const qty = row.original.attributes.field_stock_quantity;
        const threshold = row.original.attributes.field_low_stock_threshold || 10;
        const isLow = qty <= threshold;
        return (
          <span className={isLow ? 'text-red-600 font-bold' : ''}>
            {qty} {isLow && '⚠️'}
          </span>
        );
      },
    },
    { header: 'Price', accessorKey: 'attributes.price.formatted' },
  ];

  // Add "Adjust" action column if user has permission.
  if (hasPermission('manage store inventory')) {
    columns.push({
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setAdjustingItem(row.original)}
          className="text-sm text-green-600 hover:underline"
        >
          Adjust Stock
        </button>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
          </label>
        </div>
      </div>

      <DataTable data={data?.data || []} columns={columns} isLoading={isLoading} />

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <StockAdjustmentModal
          item={adjustingItem}
          onClose={() => setAdjustingItem(null)}
          onSubmit={async (adjustment) => {
            await adjustMutation.mutateAsync({
              variationId: adjustingItem.id,
              ...adjustment,
            });
            setAdjustingItem(null);
          }}
        />
      )}
    </div>
  );
}
```

---

## Step 9: Cannabis-Specific Utilities

### `src/utils/cannabis.js`

```jsx
// California cannabis tax rates (as of 2024).
const EXCISE_TAX_RATE = 0.15;     // 15% excise tax
const SALES_TAX_RATE = 0.0925;    // 9.25% sales tax (Lompoc)

/**
 * Calculate cannabis taxes for a given subtotal.
 */
export function calculateTaxes(subtotal) {
  const exciseTax = subtotal * EXCISE_TAX_RATE;
  const salesTax = (subtotal + exciseTax) * SALES_TAX_RATE;
  const total = subtotal + exciseTax + salesTax;

  return {
    subtotal: roundCurrency(subtotal),
    excise_tax: roundCurrency(exciseTax),
    sales_tax: roundCurrency(salesTax),
    total: roundCurrency(total),
  };
}

/**
 * Format weight in grams with appropriate unit.
 */
export function formatWeight(grams) {
  if (grams >= 28) {
    const ounces = grams / 28;
    return `${ounces.toFixed(1)} oz`;
  }
  return `${grams}g`;
}

/**
 * Cannabis product categories per California regulations.
 */
export const PRODUCT_CATEGORIES = [
  'Flower',
  'Pre-Rolls',
  'Vaporizers',
  'Concentrates',
  'Edibles',
  'Tinctures',
  'Topicals',
  'Capsules',
  'Accessories',
];

/**
 * Order status flow for delivery operations.
 */
export const ORDER_STATUS_FLOW = [
  { key: 'pending', label: 'Pending', color: 'yellow' },
  { key: 'processing', label: 'Processing', color: 'blue' },
  { key: 'ready', label: 'Ready for Pickup', color: 'indigo' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: 'purple' },
  { key: 'delivered', label: 'Delivered', color: 'green' },
  { key: 'cancelled', label: 'Cancelled', color: 'red' },
];

function roundCurrency(amount) {
  return Math.round(amount * 100) / 100;
}
```

### `src/utils/formatters.js`

```jsx
/**
 * Format currency for display.
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display.
 */
export function formatDate(dateString, options = {}) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(date);
}

/**
 * Format relative time (e.g., "5 min ago").
 */
export function formatRelativeTime(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return formatDate(dateString, { hour: undefined, minute: undefined });
}
```

---

## Step 10: Real-Time Order Notifications

### `src/hooks/useWebSocket.js`

```jsx
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.store?.id) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?store=${user.store.id}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'order:new':
          queryClient.invalidateQueries(['orders']);
          queryClient.invalidateQueries(['dashboard']);
          // Show toast notification.
          toast.success(`New order #${message.data.order_number}`);
          break;

        case 'order:status_changed':
          queryClient.invalidateQueries(['orders', message.data.order_id]);
          queryClient.invalidateQueries(['orders']);
          break;

        case 'inventory:low_stock':
          queryClient.invalidateQueries(['inventory']);
          toast.warning(`Low stock: ${message.data.product_name}`);
          break;
      }
    };

    ws.onclose = () => {
      // Reconnect after 3 seconds.
      setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, [isAuthenticated, user, queryClient]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);
}
```

---

## Step 11: Build & Deployment

### Vite Build Configuration

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          table: ['@tanstack/react-table'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/jsonapi': 'http://localhost:8080',
      '/oauth': 'http://localhost:8080',
      '/api/budhound': 'http://localhost:8080',
    },
  },
});
```

### Deployment Checklist

- [ ] Build: `npm run build`
- [ ] Set production environment variables
- [ ] Deploy `dist/` to CDN or static hosting
- [ ] Configure nginx/Apache to serve SPA (all routes → `index.html`)
- [ ] Verify CORS settings on Drupal backend
- [ ] Test OAuth flow end-to-end
- [ ] Verify role-based access on staging
- [ ] Test mobile responsiveness
- [ ] Enable error tracking (Sentry)
- [ ] Configure CSP headers

### Nginx Config for SPA

```nginx
server {
    listen 443 ssl;
    server_name manage.budhound.app;

    root /var/www/budhound-management/dist;
    index index.html;

    # SPA routing — all paths serve index.html.
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Implementation Priority Order

For each module, follow this pattern:
1. **Drupal**: Create permissions, routes, controllers
2. **React**: Create hook → page component → wire up
3. **Test**: Verify role-based access works end-to-end

### Recommended build order:
1. Auth flow (login, /me endpoint, AuthContext)
2. App shell (sidebar, header, routing)
3. Dashboard (proves data flow works)
4. Orders (most frequently used)
5. Inventory (critical for operations)
6. Products (depends on inventory)
7. Sales / POS (depends on products + orders)
8. Reports (aggregates existing data)
9. Staff management
10. Settings

---

## Related Documents

- **[01-STORE-MANAGEMENT-ARCHITECTURE.md](./01-STORE-MANAGEMENT-ARCHITECTURE.md)** — Overall architecture and planning
- **[02-DRUPAL-BACKEND-IMPLEMENTATION.md](./02-DRUPAL-BACKEND-IMPLEMENTATION.md)** — Drupal roles, permissions, and API
