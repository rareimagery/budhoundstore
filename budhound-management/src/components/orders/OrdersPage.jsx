import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { ORDER_STATUS_FLOW } from '../../utils/cannabis';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Read initial status filter from URL (e.g., from dashboard link).
  const statusFilter = searchParams.get('status') || '';

  const { data, isLoading } = useOrders({
    page,
    status: statusFilter,
    search: search || undefined,
  });

  function handleStatusChange(status) {
    setSearchParams(status ? { status } : {});
    setPage(1);
  }

  const columns = [
    {
      header: 'Order #',
      accessorFn: (row) => row.attributes?.order_number,
      cell: ({ row }) => (
        <Link
          to={`/orders/${row.original.id}`}
          className="text-brand-600 hover:underline font-semibold"
        >
          #{row.original.attributes?.order_number}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessorFn: (row) => {
        const b = row.attributes?.billing_information;
        return b ? `${b.given_name || ''} ${b.family_name || ''}`.trim() : '—';
      },
    },
    {
      header: 'Items',
      accessorFn: (row) => row.relationships?.order_items?.data?.length || 0,
      cell: ({ getValue }) => (
        <span className="text-gray-500">{getValue()} items</span>
      ),
    },
    {
      header: 'Total',
      accessorFn: (row) => parseFloat(row.attributes?.total_price?.number || 0),
      cell: ({ getValue }) => (
        <span className="font-medium">{formatCurrency(getValue())}</span>
      ),
    },
    {
      header: 'Status',
      accessorFn: (row) => row.attributes?.state,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      header: 'Date',
      accessorFn: (row) => row.attributes?.created,
      cell: ({ getValue }) => (
        <span className="text-gray-500">{formatRelativeTime(getValue())}</span>
      ),
    },
  ];

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search order #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-44 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUS_FLOW.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          {/* New Order */}
          <Link
            to="/orders/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Order
          </Link>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data?.orders || []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No orders found."
      />
    </div>
  );
}
