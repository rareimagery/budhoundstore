import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export default function RecentOrders({ orders, isLoading }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <Link to="/orders" className="text-sm text-brand-600 hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !orders?.length ? (
        <p className="text-sm text-gray-400 py-4">No recent orders</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">
                  #{order.order_number}
                </span>
                <span className="text-sm text-gray-500">
                  {order.customer_name}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(order.created)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
