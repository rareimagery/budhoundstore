import { useState } from 'react';
import { useTaxReport } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/formatters';
import { format, subDays } from 'date-fns';
import PermissionGate from '../auth/PermissionGate';
import { PERMS } from '../../utils/permissions';

export default function TaxReport() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data, isLoading } = useTaxReport({ dateFrom, dateTo });

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 bg-white rounded-xl border p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <PermissionGate permission={PERMS.EXPORT_REPORTS}>
          <button className="px-4 py-2 text-sm font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50">
            Export CSV
          </button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : data ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tax Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Taxable Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tax Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 text-sm font-medium">California Excise Tax</td>
                <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.excise_taxable)}</td>
                <td className="px-6 py-4 text-sm text-right">15.00%</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(data.excise_collected)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium">Sales Tax (Lompoc)</td>
                <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.sales_taxable)}</td>
                <td className="px-6 py-4 text-sm text-right">9.25%</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(data.sales_tax_collected)}</td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 text-sm">Total Tax Liability</td>
                <td className="px-6 py-4" />
                <td className="px-6 py-4" />
                <td className="px-6 py-4 text-sm text-right">{formatCurrency(data.total_tax)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
