import clsx from 'clsx';

export default function StatCard({ label, value, trend, alert = false, icon: Icon }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border p-5',
        alert && 'border-red-200 bg-red-50'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <p className={clsx('mt-2 text-2xl font-bold', alert ? 'text-red-700' : 'text-gray-900')}>
        {value}
      </p>
      {trend !== undefined && (
        <p className={clsx('mt-1 text-sm', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
          {trend >= 0 ? '\u2191' : '\u2193'} {Math.abs(trend)}% from yesterday
        </p>
      )}
    </div>
  );
}
