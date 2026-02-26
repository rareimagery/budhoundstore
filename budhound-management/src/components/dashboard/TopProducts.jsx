import { formatCurrency } from '../../utils/formatters';

export default function TopProducts({ products, isLoading }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !products?.length ? (
        <p className="text-sm text-gray-400 py-4">No sales data yet</p>
      ) : (
        <div className="space-y-3">
          {products.map((product, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.quantity_sold} sold</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {formatCurrency(product.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
