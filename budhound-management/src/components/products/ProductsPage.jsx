import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import PermissionGate from '../auth/PermissionGate';
import DataTable from '../common/DataTable';
import { PERMS } from '../../utils/permissions';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_MAP } from '../../utils/cannabis';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { hasPermission } = useAuth();
  const { data, isLoading } = useProducts({ page, search, category });
  const deleteMutation = useDeleteProduct();

  const columns = [
    {
      header: 'Product',
      accessorFn: (row) => row.attributes?.title,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.attributes?.title}</p>
          <p className="text-xs text-gray-400">
            {PRODUCT_CATEGORY_MAP[row.original.type?.replace('commerce_product--', '')] || 'Uncategorized'}
          </p>
        </div>
      ),
    },
    {
      header: 'Variations',
      accessorFn: (row) => row.relationships?.variations?.data?.length || 0,
    },
    {
      header: 'Status',
      accessorFn: (row) => row.attributes?.status,
      cell: ({ getValue }) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          getValue() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Edit/Delete columns for authorized users.
  if (hasPermission(PERMS.MANAGE_PRODUCTS)) {
    columns.push({
      header: '',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-3 justify-end">
          <Link
            to={`/products/${row.original.id}/edit`}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={async () => {
              if (confirm('Delete this product?')) {
                try {
                  await deleteMutation.mutateAsync({
                    productId: row.original.id,
                    bundle: row.original.type?.replace('commerce_product--', '') || 'default',
                  });
                  toast.success('Product deleted');
                } catch {
                  toast.error('Failed to delete');
                }
              }
            }}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    });
  }

  const PAGE_SIZE = 25;
  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-44"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <PermissionGate permission={PERMS.MANAGE_PRODUCTS}>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Product
            </Link>
          </PermissionGate>
        </div>
      </div>

      <DataTable
        data={data?.products || []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
