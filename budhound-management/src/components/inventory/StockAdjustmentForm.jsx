import { useState } from 'react';
import { useAdjustInventory } from '../../hooks/useInventory';
import toast from 'react-hot-toast';

const ADJUSTMENT_TYPES = [
  { value: 'received', label: 'Received (add stock)', sign: '+' },
  { value: 'correction', label: 'Correction (set exact)', sign: '=' },
  { value: 'damaged', label: 'Damaged (remove stock)', sign: '-' },
  { value: 'returned', label: 'Customer Return (add stock)', sign: '+' },
  { value: 'waste', label: 'Waste / Expired (remove stock)', sign: '-' },
];

export default function StockAdjustmentForm({ item, onClose }) {
  const [type, setType] = useState('received');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const mutation = useAdjustInventory();

  const currentStock = item.attributes?.field_stock_quantity ?? 0;
  const selectedType = ADJUSTMENT_TYPES.find((t) => t.value === type);

  function calculateNewStock() {
    const qty = parseInt(quantity) || 0;
    if (type === 'correction') return qty;
    if (selectedType?.sign === '+') return currentStock + qty;
    return currentStock - qty;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    let quantityChange;
    if (type === 'correction') {
      quantityChange = qty - currentStock;
    } else if (selectedType?.sign === '-') {
      quantityChange = -qty;
    } else {
      quantityChange = qty;
    }

    try {
      await mutation.mutateAsync({
        variationId: item.id,
        quantity_change: quantityChange,
        reason: reason || `${selectedType.label}: ${qty}`,
        adjustment_type: type,
      });
      toast.success('Stock adjusted successfully');
      onClose();
    } catch {
      toast.error('Failed to adjust stock');
    }
  }

  const newStock = calculateNewStock();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Current stock</span>
        <span className="text-lg font-bold">{currentStock}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adjustment Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {ADJUSTMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === 'correction' ? 'Set Stock To' : 'Quantity'}
        </label>
        <input
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="e.g., Weekly shipment from distributor"
        />
      </div>

      {/* Preview */}
      {quantity && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700">New stock level</span>
          <span className={`text-lg font-bold ${newStock < 0 ? 'text-red-600' : 'text-blue-700'}`}>
            {newStock}
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {mutation.isLoading ? 'Saving...' : 'Apply Adjustment'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
