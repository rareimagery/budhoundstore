import { useState } from 'react';
import { useUpdateOrderStatus, useReceivePayment } from '../../hooks/useOrders';
import { ORDER_STATUS_FLOW } from '../../utils/cannabis';
import { CheckIcon, BanknotesIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Valid next statuses for each state (mirrors backend STATUS_TRANSITIONS).
const STATUS_TRANSITIONS = {
  draft: ['placed'],
  placed: ['processing', 'canceled'],
  processing: ['ready', 'canceled'],
  ready: ['out_for_delivery', 'pickup_ready', 'canceled'],
  pickup_ready: ['completed', 'canceled'],
  out_for_delivery: ['delivered', 'canceled'],
  delivered: ['completed', 'cod_pending', 'canceled'],
  cod_pending: ['completed', 'canceled'],
  completed: [],
  canceled: [],
};

const TERMINAL_STATES = ['completed', 'canceled'];

function labelFor(key) {
  return ORDER_STATUS_FLOW.find((s) => s.key === key)?.label ?? key;
}

export default function OrderStatusFlow({ orderId, currentStatus }) {
  const [confirming, setConfirming] = useState(null);
  const statusMutation = useUpdateOrderStatus();
  const receivePaymentMutation = useReceivePayment();

  const currentIndex = ORDER_STATUS_FLOW.findIndex((s) => s.key === currentStatus);
  const isTerminal = TERMINAL_STATES.includes(currentStatus);
  const isCodPending = currentStatus === 'cod_pending';

  // Get valid forward transitions (exclude 'canceled' — that's a separate button).
  const forwardTransitions = (STATUS_TRANSITIONS[currentStatus] || [])
    .filter((s) => s !== 'canceled');

  const isLoading = statusMutation.isLoading || receivePaymentMutation.isLoading;

  async function handleTransition(newStatus) {
    try {
      await statusMutation.mutateAsync({ orderId, status: newStatus });
      toast.success(`Order moved to ${labelFor(newStatus)}`);
      setConfirming(null);
    } catch {
      toast.error('Failed to update order status');
    }
  }

  async function handleReceivePayment() {
    try {
      await receivePaymentMutation.mutateAsync({ orderId });
      toast.success('Payment received — order completed!');
      setConfirming(null);
    } catch {
      toast.error('Failed to receive payment');
    }
  }

  async function handleCancel() {
    try {
      await statusMutation.mutateAsync({ orderId, status: 'canceled' });
      toast.success('Order canceled');
      setConfirming(null);
    } catch {
      toast.error('Failed to cancel order');
    }
  }

  // Build the visual pipeline — show the "main path" through the workflow,
  // filtering out branches not taken for this order.
  const mainPath = ORDER_STATUS_FLOW.filter((s) => s.key !== 'canceled');

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Visual pipeline */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {mainPath.map((step, i) => {
          const stepIndex = ORDER_STATUS_FLOW.findIndex((s) => s.key === step.key);
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = step.key === currentStatus;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    isCompleted && 'bg-green-600 text-white',
                    isCurrent && step.key === 'cod_pending' && 'bg-orange-500 text-white ring-4 ring-orange-100',
                    isCurrent && step.key !== 'cod_pending' && 'bg-brand-600 text-white ring-4 ring-brand-100',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-400'
                  )}
                >
                  {isCompleted ? <CheckIcon className="h-4 w-4" /> : i + 1}
                </div>
                <span className={clsx(
                  'text-xs mt-1.5 text-center whitespace-nowrap',
                  isCurrent ? 'font-semibold text-brand-700' : 'text-gray-400'
                )}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < mainPath.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-2',
                    stepIndex < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      {!isTerminal && (
        <div className="flex flex-wrap items-center gap-3">
          {/* COD Receive Payment — special prominent button */}
          {isCodPending && (
            confirming === 'receive_payment' ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-orange-700">
                  Confirm payment received for this order?
                </span>
                <button
                  onClick={handleReceivePayment}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Yes, Payment Received'}
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming('receive_payment')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm"
              >
                <BanknotesIcon className="h-4 w-4" />
                Receive Payment
              </button>
            )
          )}

          {/* Forward transition buttons (non-COD states) */}
          {!isCodPending && forwardTransitions.map((nextKey) => (
            confirming === nextKey ? (
              <div key={nextKey} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Move to <strong>{labelFor(nextKey)}</strong>?
                </span>
                <button
                  onClick={() => handleTransition(nextKey)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                key={nextKey}
                onClick={() => setConfirming(nextKey)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-lg',
                  nextKey === 'cod_pending'
                    ? 'text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100'
                    : 'text-white bg-brand-600 hover:bg-brand-700'
                )}
              >
                {nextKey === 'cod_pending' ? 'Mark Awaiting COD' : `Move to ${labelFor(nextKey)}`}
              </button>
            )
          ))}

          {/* Cancel order button */}
          {(STATUS_TRANSITIONS[currentStatus] || []).includes('canceled') && (
            confirming === 'cancel_order' ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Cancel this order?</span>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Yes, Cancel Order
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming('cancel_order')}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Cancel Order
              </button>
            )
          )}
        </div>
      )}

      {isTerminal && (
        <p className="text-sm text-gray-500">
          This order is <strong>{labelFor(currentStatus)}</strong> — no further status changes available.
        </p>
      )}
    </div>
  );
}
