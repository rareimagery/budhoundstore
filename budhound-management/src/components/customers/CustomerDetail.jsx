import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import PermissionGate from '../auth/PermissionGate';
import { PERMS } from '../../utils/permissions';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () =>
      apiClient.get(`/jsonapi/profile/customer/${customerId}`).then((r) => r.data.data),
    enabled: !!customerId,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('filter[uid.id]', customerId);
      params.set('sort', '-created');
      params.set('page[limit]', '10');
      return apiClient.get(`/jsonapi/commerce_order/default?${params}`).then((r) => r.data.data || []);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!customerData) {
    return <p className="text-gray-500">Customer not found.</p>;
  }

  const attrs = customerData.attributes || {};

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {attrs.field_first_name} {attrs.field_last_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Customer since {formatDate(attrs.created, { hour: undefined, minute: undefined })}
          </p>
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium">{attrs.field_email || '\u2014'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Phone</p>
            <p className="text-sm font-medium">{attrs.field_phone || '\u2014'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">ID Verification</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              attrs.field_id_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {attrs.field_id_verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Purchase history */}
      <PermissionGate permission={PERMS.VIEW_PURCHASE_HISTORY}>
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Purchase History
            </h2>
          </div>
          {!ordersData?.length ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {ordersData.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium">Order #{order.attributes?.order_number}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.attributes?.created)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.attributes?.state} />
                    <p className="text-sm font-semibold">
                      {formatCurrency(parseFloat(order.attributes?.total_price?.number || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PermissionGate>
    </div>
  );
}
