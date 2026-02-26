import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import PermissionGate from '../auth/PermissionGate';
import { PERMS } from '../../utils/permissions';
import { PRODUCT_CATEGORIES } from '../../utils/cannabis';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!productId;
  const { data: existingData, isLoading } = useProduct(productId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    sku: '',
    price: '',
    thc_percentage: '',
    cbd_percentage: '',
    weight_grams: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    status: true,
  });

  // Populate form for edit mode.
  useEffect(() => {
    if (isEdit && existingData?.product) {
      const attrs = existingData.product.attributes;
      const variation = existingData.included?.find(
        (inc) => inc.type.startsWith('commerce_product_variation')
      );
      const varAttrs = variation?.attributes || {};

      setForm({
        title: attrs.title || '',
        category: existingData.product.type?.replace('commerce_product--', '') || '',
        description: attrs.body?.value || '',
        sku: varAttrs.sku || '',
        price: varAttrs.price?.number || '',
        thc_percentage: varAttrs.field_thc_percentage || '',
        cbd_percentage: varAttrs.field_cbd_percentage || '',
        weight_grams: varAttrs.field_weight_grams || '',
        stock_quantity: varAttrs.field_stock_quantity || '',
        low_stock_threshold: varAttrs.field_low_stock_threshold || '10',
        status: attrs.status ?? true,
      });
    }
  }, [isEdit, existingData]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const bundle = form.category || 'flower';
    const productData = {
      type: `commerce_product--${bundle}`,
      attributes: {
        title: form.title,
        body: { value: form.description, format: 'plain_text' },
        status: form.status,
      },
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ productId, bundle, productData });
        toast.success('Product updated');
      } else {
        await createMutation.mutateAsync({ bundle, productData });
        toast.success('Product created');
      }
      navigate('/products');
    } catch {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} product`);
    }
  }

  if (isEdit && isLoading) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g., Blue Dream 3.5g"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="BD-35-001"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Cannabis-specific fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">THC %</label>
            <input
              type="number"
              step="0.1"
              value={form.thc_percentage}
              onChange={(e) => handleChange('thc_percentage', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CBD %</label>
            <input
              type="number"
              step="0.1"
              value={form.cbd_percentage}
              onChange={(e) => handleChange('cbd_percentage', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
            <input
              type="number"
              step="0.1"
              value={form.weight_grams}
              onChange={(e) => handleChange('weight_grams', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Pricing — Owner only */}
        <PermissionGate permission={PERMS.MANAGE_PRICING}>
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </PermissionGate>

        {/* Stock */}
        {!isEdit && (
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Initial Stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => handleChange('stock_quantity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert At</label>
                <input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.status}
            onChange={(e) => handleChange('status', e.target.checked)}
            className="rounded border-gray-300 text-brand-600"
          />
          <span className="text-sm text-gray-700">Product is active and visible in store</span>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {(createMutation.isLoading || updateMutation.isLoading)
              ? 'Saving...'
              : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
