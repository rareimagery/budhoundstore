import { useState } from 'react';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import PermissionGate from '../auth/PermissionGate';
import StatCard from '../common/StatCard';
import { PERMS } from '../../utils/permissions';
import { formatCurrency } from '../../utils/formatters';
import RevenueChart from './RevenueChart';
import OrdersSummary from './OrdersSummary';
import TopProducts from './TopProducts';
import StockAlerts from './StockAlerts';
import RecentOrders from './RecentOrders';
import {
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function DashboardPage() {
  const [range, setRange] = useState('today');
  const { user } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats(range);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-brand-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.store?.name}</p>
        </div>

        {/* Date range selector — owner/manager only */}
        <PermissionGate permission={PERMS.VIEW_ANALYTICS}>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  range === opt.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </PermissionGate>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PermissionGate permission={PERMS.VIEW_ANALYTICS}>
          <StatCard
            label="Revenue"
            value={isLoading ? '...' : formatCurrency(stats?.total_revenue || 0)}
            trend={stats?.revenue_trend}
            icon={CurrencyDollarIcon}
          />
          <StatCard
            label="Avg Order Value"
            value={isLoading ? '...' : formatCurrency(stats?.average_order_value || 0)}
            icon={CurrencyDollarIcon}
          />
        </PermissionGate>

        <StatCard
          label="Orders"
          value={isLoading ? '...' : stats?.order_count || 0}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          label="Pending Deliveries"
          value={isLoading ? '...' : stats?.pending_deliveries || 0}
          alert={(stats?.pending_deliveries || 0) > 5}
          icon={TruckIcon}
        />
      </div>

      {/* Revenue chart — owner/manager */}
      <PermissionGate permission={PERMS.VIEW_ANALYTICS}>
        <RevenueChart data={stats?.hourly_sales} isLoading={isLoading} />
      </PermissionGate>

      {/* Orders by status — all roles */}
      <OrdersSummary statuses={stats?.orders_by_status} isLoading={isLoading} />

      {/* Two-column bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={stats?.top_products} isLoading={isLoading} />

        <PermissionGate permission={PERMS.VIEW_INVENTORY}>
          <StockAlerts count={stats?.low_stock_alerts} isLoading={isLoading} />
        </PermissionGate>
      </div>

      {/* Recent orders feed */}
      <RecentOrders orders={stats?.recent_orders} isLoading={isLoading} />
    </div>
  );
}
