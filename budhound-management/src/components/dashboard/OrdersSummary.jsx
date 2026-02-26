import { Link } from 'react-router-dom';
import { ORDER_STATUS_FLOW } from '../../utils/cannabis';

const BG_COLORS = {
  yellow: 'bg-yellow-50 border-yellow-200',
  blue: 'bg-blue-50 border-blue-200',
  indigo: 'bg-indigo-50 border-indigo-200',
  purple: 'bg-purple-50 border-purple-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
};

const TEXT_COLORS = {
  yellow: 'text-yellow-700',
  blue: 'text-blue-700',
  indigo: 'text-indigo-700',
  purple: 'text-purple-700',
  green: 'text-green-700',
  red: 'text-red-700',
};

export default function OrdersSummary({ statuses, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ORDER_STATUS_FLOW.map((s) => (
        <Link
          key={s.key}
          to={`/orders?status=${s.key}`}
          className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${BG_COLORS[s.color]}`}
        >
          <p className={`text-2xl font-bold ${TEXT_COLORS[s.color]}`}>
            {statuses?.[s.key] || 0}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-1">{s.label}</p>
        </Link>
      ))}
    </div>
  );
}
