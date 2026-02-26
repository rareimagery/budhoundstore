import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import PermissionGate from '../auth/PermissionGate';
import StatusBadge from '../common/StatusBadge';
import OrderStatusFlow from './OrderStatusFlow';
import AssignDriverPanel from './AssignDriverPanel';
import RefundPanel from './RefundPanel';
import { PERMS } from '../../utils/permissions';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateTaxes } from '../../utils/cannabis';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.order) {
    return <p className="text-gray-500">Order not found.</p>;
  }

  const order = data.order;
  const attrs = order.attributes;
  const billing = attrs.billing_information || {};
  const subtotal = parseFloat(attrs.total_price?.number || 0);
  const taxes = calculateTaxes(subtotal * 0.8); // Approximate pre-tax from total
  // In production, use actual tax fields from the order entity.

  // The BudHound API endpoints expect the Drupal internal numeric order ID,
  // not the JSON:API UUID. Extract it from the attributes.
  const internalOrderId = attrs.drupal_internal__order_id;

  // Resolve order items from included data.
  const orderItemIds = order.relationships?.order_items?.data?.map((r) => r.id) || [];
  const orderItems = orderItemIds
    .map((id) => data.included?.find((inc) => inc.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Order #{attrs.order_number}</h1>
            <StatusBadge status={attrs.state} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed {formatDate(attrs.created)}
          </p>
        </div>
      </div>

      {/* Status flow + actions */}
      <PermissionGate permission={PERMS.MANAGE_ORDER_STATUS}>
        <OrderStatusFlow orderId={internalOrderId} currentStatus={attrs.state} />
      </PermissionGate>

      {/* Customer info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Customer
        </h2>
        <p className="font-medium">
          {billing.given_name} {billing.family_name}
        </p>
        {billing.address_line1 && (
          <p className="text-sm text-gray-500 mt-1">
            {billing.address_line1}, {billing.locality}, {billing.administrative_area} {billing.postal_code}
          </p>
        )}
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Items ({orderItems.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {orderItems.map((item) => {
            const itemAttrs = item.attributes;
            return (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{itemAttrs.title}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {itemAttrs.quantity} × {formatCurrency(parseFloat(itemAttrs.unit_price?.number || 0))}
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrency(parseFloat(itemAttrs.total_price?.number || 0))}
                </p>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="bg-gray-50 px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(taxes.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Excise Tax (15%)</span>
            <span>{formatCurrency(taxes.excise_tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sales Tax (9.25%)</span>
            <span>{formatCurrency(taxes.sales_tax)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Driver assignment */}
      <PermissionGate permission={PERMS.ASSIGN_DRIVER}>
        <AssignDriverPanel orderId={internalOrderId} currentStatus={attrs.state} />
      </PermissionGate>

      {/* Refund panel */}
      <PermissionGate permission={PERMS.PROCESS_REFUNDS}>
        <RefundPanel orderId={internalOrderId} orderTotal={subtotal} currentStatus={attrs.state} />
      </PermissionGate>
    </div>
  );
}
