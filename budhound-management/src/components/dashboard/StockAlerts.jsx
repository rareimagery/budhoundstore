import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function StockAlerts({ count, isLoading }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Stock Alerts</h2>
        <Link to="/inventory?lowStock=true" className="text-sm text-brand-600 hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      ) : count > 0 ? (
        <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-red-700">{count} products</p>
            <p className="text-sm text-red-600">below minimum stock threshold</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">All products are well-stocked</p>
        </div>
      )}
    </div>
  );
}
