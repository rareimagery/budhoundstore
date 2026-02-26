import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import StockAdjustmentForm from './StockAdjustmentForm';
import AuditLogDrawer from './AuditLogDrawer';
import { PERMS } from '../../utils/permissions';
import { formatCurrency } from '../../utils/formatters';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function InventoryPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [viewingLog, setViewingLog] = useState(null); // variationId or null
  const { hasPermission } = useAuth();

  const { data, isLoading } = useInventory({ page, search, lowStockOnly });

  const columns = [
    {
      header: 'SKU',
      accessorFn: (row) => row.attributes?.sku,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-500">{getValue()}</span>
      ),
    },
    {
      header: 'Product',
      accessorFn: (row) => row.attributes?.title,
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue()}</span>
      ),
    },
    {
      header: 'Stock',
      accessorFn: (row) => row.attributes?.field_stock_quantity ?? 0,
      cell: ({ row }) => {
        const qty = row.original.attributes?.field_stock_quantity ?? 0;
        const threshold = row.original.attributes?.field_low_stock_threshold ?? 10;
        const isLow = qty <= threshold;
        const isOut = qty === 0;
        return (
          <span className={clsx(
            'font-semibold',
            isOut && 'text-red-700',
            isLow && !isOut && 'text-orange-600',
            !isLow && 'text-gray-900',
          )}>
            {qty}
            {isOut && ' — OUT'}
            {isLow && !isOut && ' \u26a0'}
          </span>
        );
      },
    },
    {
      header: 'Threshold',
      accessorFn: (row) => row.attributes?.field_low_stock_threshold ?? 10,
    },
    {
      header: 'Price',
      accessorFn: (row) => parseFloat(row.attributes?.price?.number || 0),
      cell: ({ getValue }) => formatCurrency(getValue()),
    },
  ];

  // Action columns for users with manage permission.
  if (hasPermission(PERMS.MANAGE_INVENTORY)) {
    columns.push({
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setAdjustingItem(row.original)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Adjust
          </button>
          {hasPermission(PERMS.VIEW_INVENTORY_LOG) && (
            <button
              onClick={() => setViewingLog(row.original.id)}
              className="text-xs font-medium text-gray-500 hover:underline"
            >
              History
            </button>
          )}
        </div>
      ),
    });
  }

  const PAGE_SIZE = 50;
  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
            />
          </div>

          {/* Low stock toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Low stock only
          </label>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data?.items || []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage={lowStockOnly ? 'No low-stock items.' : 'No inventory found.'}
      />

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <Modal
          open={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          title={`Adjust Stock: ${adjustingItem.attributes?.title}`}
        >
          <StockAdjustmentForm
            item={adjustingItem}
            onClose={() => setAdjustingItem(null)}
          />
        </Modal>
      )}

      {/* Audit Log Drawer */}
      {viewingLog && (
        <AuditLogDrawer
          variationId={viewingLog}
          onClose={() => setViewingLog(null)}
        />
      )}
    </div>
  );
}
