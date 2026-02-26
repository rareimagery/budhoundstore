import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import DataTable from '../common/DataTable';
import { formatDate } from '../../utils/formatters';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { page, search }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page[limit]', '25');
      params.set('page[offset]', String((page - 1) * 25));
      if (search) {
        params.set('filter[name][operator]', 'CONTAINS');
        params.set('filter[name][value]', search);
      }
      return apiClient.get(`/jsonapi/profile/customer?${params}`).then((r) => ({
        customers: r.data.data || [],
        total: r.data.meta?.count || 0,
      }));
    },
    keepPreviousData: true,
  });

  const columns = [
    {
      header: 'Name',
      accessorFn: (row) => `${row.attributes?.field_first_name || ''} ${row.attributes?.field_last_name || ''}`,
      cell: ({ row, getValue }) => (
        <Link to={`/customers/${row.original.id}`} className="text-brand-600 hover:underline font-medium">
          {getValue()}
        </Link>
      ),
    },
    { header: 'Email', accessorFn: (row) => row.attributes?.field_email || '\u2014' },
    { header: 'Phone', accessorFn: (row) => row.attributes?.field_phone || '\u2014' },
    {
      header: 'ID Verified',
      accessorFn: (row) => row.attributes?.field_id_verified,
      cell: ({ getValue }) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          getValue() ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {getValue() ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessorFn: (row) => row.attributes?.created,
      cell: ({ getValue }) => formatDate(getValue(), { hour: undefined, minute: undefined }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search customers..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
          />
        </div>
      </div>
      <DataTable data={data?.customers || []} columns={columns} isLoading={isLoading}
        page={page} totalPages={Math.ceil((data?.total || 0) / 25)} onPageChange={setPage} />
    </div>
  );
}
