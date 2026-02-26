import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAssignDriver } from '../../hooks/useOrders';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

export default function AssignDriverPanel({ orderId, currentStatus }) {
  const [selectedDriver, setSelectedDriver] = useState('');
  const assignMutation = useAssignDriver();

  // Only show for orders that are ready or processing.
  const showAssign = ['processing', 'ready'].includes(currentStatus);

  // All hooks must be called before any early return.
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () =>
      apiClient.get('/api/budhound/staff?role=driver').then((r) => r.data),
    enabled: showAssign,
  });

  if (!showAssign) return null;

  async function handleAssign() {
    if (!selectedDriver) return;
    try {
      await assignMutation.mutateAsync({ orderId, driverId: selectedDriver });
      toast.success('Driver assigned');
      setSelectedDriver('');
    } catch {
      toast.error('Failed to assign driver');
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Assign Delivery Driver
      </h2>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Select a driver...</option>
            {(drivers?.staff || []).map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} {driver.active_deliveries > 0 ? `(${driver.active_deliveries} active)` : ''}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAssign}
          disabled={!selectedDriver || assignMutation.isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 whitespace-nowrap"
        >
          {assignMutation.isLoading ? 'Assigning...' : 'Assign Driver'}
        </button>
      </div>
    </div>
  );
}
