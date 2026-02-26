import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSalesHistory } from '../../hooks/useSales';
import DataTable from '../common/DataTable';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSalesHistory({ page });

  const columns = [
    {
      header: 'Sale #',
      accessorFn: (row) => row.attributes?.order_number,
      cell: ({ row }) => (
        <Link to={`/orders/${row.original.id}`} className="text-brand-600 hover:underline font-semibold">
          #{row.original.attributes?.order_number}
        </Link>
      ),
    },
    {
      header: 'Customer',
      accessorFn: (row) => {
        const b = row.attributes?.billing_information;
        return b ? `${b.given_name || ''} ${b.family_name || ''}`.trim() : 'Walk-in';
      },
    },
    {
      header: 'Total',
      accessorFn: (row) => parseFloat(row.attributes?.total_price?.number || 0),
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue())}</span>,
    },
    {
      header: 'Date',
      accessorFn: (row) => row.attributes?.created,
      cell: ({ getValue }) => formatDate(getValue()),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sales History</h1>
      <DataTable
        data={data?.sales || []}
        columns={columns}
        isLoading={isLoading}
        page={page}
        totalPages={Math.ceil((data?.total || 0) / 25)}
        onPageChange={setPage}
      />
    </div>
  );
}
