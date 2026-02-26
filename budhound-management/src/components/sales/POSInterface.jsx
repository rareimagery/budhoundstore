import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCreateSale } from '../../hooks/useSales';
import { calculateTaxes } from '../../utils/cannabis';
import { formatCurrency } from '../../utils/formatters';
import { MagnifyingGlassIcon, PlusIcon, MinusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function POSInterface() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{ variationId, title, price, quantity }]
  const [customerName, setCustomerName] = useState('');
  const [receipt, setReceipt] = useState(null); // holds completed sale data
  const { data: productsData } = useProducts({ search, pageSize: 100 });
  const createSale = useCreateSale();

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const taxes = useMemo(() => calculateTaxes(subtotal), [subtotal]);

  function addToCart(product, variation) {
    const varAttrs = variation.attributes;
    const price = parseFloat(varAttrs.price?.number || 0);

    setCart((prev) => {
      const existing = prev.find((item) => item.variationId === variation.id);
      if (existing) {
        return prev.map((item) =>
          item.variationId === variation.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          variationId: variation.id,
          title: `${product.attributes.title} — ${varAttrs.title}`,
          price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(variationId, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.variationId === variationId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(variationId) {
    setCart((prev) => prev.filter((item) => item.variationId !== variationId));
  }

  function startNewSale() {
    setReceipt(null);
    setCart([]);
    setCustomerName('');
    setSearch('');
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const result = await createSale.mutateAsync({
        customer_name: customerName || 'Walk-in',
        items: cart.map((item) => ({
          variation_id: item.variationId,
          quantity: item.quantity,
        })),
      });
      setReceipt(result.data);
    } catch {
      toast.error('Sale failed');
    }
  }

  // Flatten products to get variations for display.
  const productList = productsData?.products || [];
  const variations = productsData?.included?.filter(
    (inc) => inc.type.startsWith('commerce_product_variation')
  ) || [];

  // Receipt view — shown after successful sale.
  if (receipt) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white border rounded-xl p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sale Complete</h2>
          <p className="text-gray-500 text-sm mb-6">
            Order #{receipt.order_number || receipt.order_id}
          </p>

          <div className="text-left border-t pt-4 space-y-2">
            {(receipt.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.title} <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-medium">{item.total}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{receipt.subtotal}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{receipt.total}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Customer: {receipt.customer_name}</p>
            <p>Payment: Cash</p>
          </div>

          <button
            onClick={startNewSale}
            className="w-full mt-6 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Product catalog */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
          {productList.map((product) => {
            const prodVariations = (product.relationships?.variations?.data || [])
              .map((ref) => variations.find((v) => v.id === ref.id))
              .filter(Boolean);

            return prodVariations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => addToCart(product, variation)}
                className="bg-white border rounded-xl p-4 text-left hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <p className="font-medium text-sm text-gray-900 truncate">
                  {product.attributes.title}
                </p>
                <p className="text-xs text-gray-400 truncate">{variation.attributes.title}</p>
                <p className="text-sm font-bold text-brand-600 mt-2">
                  {formatCurrency(parseFloat(variation.attributes.price?.number || 0))}
                </p>
              </button>
            ));
          })}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white border rounded-xl flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Current Sale</h2>
          <input
            type="text"
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Add products to start a sale
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.variationId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.variationId, -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variationId, 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold w-16 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeFromCart(item.variationId)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals & checkout */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(taxes.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Excise Tax (15%)</span>
            <span>{formatCurrency(taxes.excise_tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Sales Tax (9.25%)</span>
            <span>{formatCurrency(taxes.sales_tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(taxes.total)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSale.isLoading}
            className="w-full mt-3 py-4 text-base font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {createSale.isLoading ? 'Processing...' : `Create Order — ${formatCurrency(taxes.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
