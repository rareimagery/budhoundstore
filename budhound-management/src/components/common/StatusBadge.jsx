import clsx from 'clsx';

const STATUS_STYLES = {
  pending:          'bg-yellow-100 text-yellow-800',
  processing:       'bg-blue-100 text-blue-800',
  ready:            'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered:        'bg-green-100 text-green-800',
  completed:        'bg-green-100 text-green-800',
  cancelled:        'bg-red-100 text-red-800',
  refunded:         'bg-gray-100 text-gray-800',
  low:              'bg-red-100 text-red-800',
  in_stock:         'bg-green-100 text-green-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  low: 'Low Stock',
  in_stock: 'In Stock',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
