import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useOrderCreate } from '../../hooks/useOrderCreate';
import { calculateTaxes } from '../../utils/cannabis';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function OrderCreateForm() {
  const navigate = useNavigate();
  const createOrder = useOrderCreate();

  // Customer fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Address fields
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('Lompoc');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('93436');

  // Order fields
  const [notes, setNotes] = useState('');
  const [paymentMethod] = useState('cod');

  // Cart
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');

  const { data: productsData } = useProducts({ search, pageSize: 100 });

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Add at least one item to the order');
      return;
    }

    try {
      const res = await createOrder.mutateAsync({
        customer: {
          email: email || undefined,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          phone: phone || undefined,
        },
        address: {
          line1,
          line2,
          city,
          state,
          zip,
          country: 'US',
        },
        items: cart.map((item) => ({
          variation_id: item.variationId,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        notes,
      });

      const orderId = res.data?.uuid || res.data?.order_id;
      toast.success(`Order #${res.data?.order_number || orderId} created!`);
      navigate(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create order';
      const details = err.response?.data?.details;
      toast.error(details ? `${msg}: ${details.join(', ')}` : msg);
    }
  }

  const productList = productsData?.products || [];
  const variations =
    productsData?.included?.filter((inc) =>
      inc.type.startsWith('commerce_product_variation')
    ) || [];

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column — Customer info + address */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">
                Customer Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="805-555-1234"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Delivery Address</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className={inputCls}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Apt / Suite
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className={inputCls}
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputCls}
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Payment & Notes */}
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Payment & Notes</h2>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="text-brand-600"
                />
                <span>Cash on Delivery</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Order Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="Special instructions, delivery notes..."
                />
              </div>
            </div>
          </div>

          {/* Right column — Product search + cart */}
          <div className="space-y-6">
            {/* Product search */}
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
                {productList.map((product) => {
                  const prodVariations = (
                    product.relationships?.variations?.data || []
                  )
                    .map((ref) => variations.find((v) => v.id === ref.id))
                    .filter(Boolean);

                  return prodVariations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      onClick={() => addToCart(product, variation)}
                      className="bg-gray-50 border rounded-lg p-3 text-left hover:border-brand-400 hover:bg-brand-50 transition-all"
                    >
                      <p className="font-medium text-xs text-gray-900 truncate">
                        {product.attributes.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {variation.attributes.title}
                      </p>
                      <p className="text-sm font-bold text-brand-600 mt-1">
                        {formatCurrency(
                          parseFloat(variation.attributes.price?.number || 0)
                        )}
                      </p>
                    </button>
                  ));
                })}
                {productList.length === 0 && (
                  <p className="col-span-2 text-center text-sm text-gray-400 py-6">
                    {search ? 'No products found' : 'Search for products above'}
                  </p>
                )}
              </div>
            </div>

            {/* Cart summary */}
            <div className="bg-white border rounded-xl flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Cart</h2>
              </div>

              <div className="flex-1 p-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No items added yet
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.variationId}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variationId, -1)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variationId, 1)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold w-16 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variationId)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="p-4 border-t bg-gray-50 space-y-2 rounded-b-xl">
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
                  type="submit"
                  disabled={cart.length === 0 || createOrder.isPending}
                  className="w-full mt-3 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {createOrder.isPending
                    ? 'Creating Order...'
                    : `Create Order — ${formatCurrency(taxes.total)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
