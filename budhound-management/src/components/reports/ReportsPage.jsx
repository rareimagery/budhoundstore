import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMS } from '../../utils/permissions';
import SalesReport from './SalesReport';
import TaxReport from './TaxReport';

const TABS = [
  { key: 'sales', label: 'Sales Report', permission: PERMS.VIEW_SALES_REPORTS },
  { key: 'tax', label: 'Tax Compliance', permission: PERMS.VIEW_TAX_REPORTS },
  { key: 'inventory', label: 'Inventory Report', permission: PERMS.VIEW_INVENTORY_REPORTS },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const { hasPermission } = useAuth();

  const visibleTabs = TABS.filter((t) => hasPermission(t.permission));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'sales' && <SalesReport />}
      {activeTab === 'tax' && <TaxReport />}
      {activeTab === 'inventory' && (
        <p className="text-gray-500">Inventory report coming soon.</p>
      )}
    </div>
  );
}
