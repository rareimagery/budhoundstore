import { useState } from 'react';
import { useProcessRefund } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function RefundPanel({ orderId, orderTotal, currentStatus }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const refundMutation = useProcessRefund();

  // Only allow refunds on delivered/completed orders.
  if (!['delivered', 'completed'].includes(currentStatus)) return null;

  async function handleRefund(e) {
    e.preventDefault();
    const refundAmount = parseFloat(amount);
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > orderTotal) {
      toast.error('Invalid refund amount');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await refundMutation.mutateAsync({ orderId, amount: refundAmount, reason });
      toast.success(`Refund of ${formatCurrency(refundAmount)} processed`);
      setShowForm(false);
      setAmount('');
      setReason('');
    } catch {
      toast.error('Refund failed');
    }
  }

  if (!showForm) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Process Refund
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Process Refund
      </h2>
      <form onSubmit={handleRefund} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Refund Amount (max {formatCurrency(orderTotal)})
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={orderTotal}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Refund
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Describe the reason for this refund..."
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={refundMutation.isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {refundMutation.isLoading ? 'Processing...' : 'Process Refund'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
