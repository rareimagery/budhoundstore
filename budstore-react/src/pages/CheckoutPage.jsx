import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    updateOrderNotes,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  } = useCheckout();

  // Completed state
  if (checkout.step === "complete" && completedOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-green/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-zinc-400 mb-6">
            Order #{completedOrder.orderId} — {completedOrder.paymentMethod}
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-green text-black px-8 py-3 rounded-xl font-bold text-sm uppercase hover:bg-green-400 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && checkout.step !== "complete") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-2">Nothing to checkout</h1>
          <p className="text-zinc-500 mb-6">Your cart is empty.</p>
          <Link to="/" className="text-brand-green hover:underline">Browse Products</Link>
        </div>
      </div>
    );
  }

  const { customerInfo } = checkout;
  const { address } = customerInfo;

  const inputClasses =
    "w-full bg-brand-surface border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-brand-green focus:outline-none transition-colors";

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-10">
        {["information", "review"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                checkout.step === step
                  ? "bg-brand-green text-black"
                  : i < ["information", "review"].indexOf(checkout.step)
                    ? "bg-brand-green/20 text-brand-green"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm font-medium capitalize ${
                checkout.step === step ? "text-white" : "text-zinc-500"
              }`}
            >
              {step}
            </span>
            {i < 1 && <div className="w-16 h-px bg-zinc-800 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {checkout.step === "information" && (
            <div className="space-y-6">
              <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6 space-y-4">
                <h2 className="font-display font-bold text-white mb-2">Contact</h2>
                <input
                  type="email"
                  placeholder="Email address"
                  value={customerInfo.email}
                  onChange={(e) => updateCustomerInfo("email", e.target.value)}
                  className={inputClasses}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    value={customerInfo.firstName}
                    onChange={(e) => updateCustomerInfo("firstName", e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={customerInfo.lastName}
                    onChange={(e) => updateCustomerInfo("lastName", e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerInfo("phone", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6 space-y-4">
                <h2 className="font-display font-bold text-white mb-2">Address</h2>
                <input
                  type="text"
                  placeholder="Street address"
                  value={address.line1}
                  onChange={(e) => updateAddress("line1", e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="Apt, suite, etc. (optional)"
                  value={address.line2}
                  onChange={(e) => updateAddress("line2", e.target.value)}
                  className={inputClasses}
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={address.zip}
                    onChange={(e) => updateAddress("zip", e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6">
                <h2 className="font-display font-bold text-white mb-2">Order Notes</h2>
                <textarea
                  placeholder="Any special instructions?"
                  value={checkout.orderNotes}
                  onChange={(e) => updateOrderNotes(e.target.value)}
                  rows={3}
                  className={inputClasses}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={saveCustomerInfo}
                className="w-full bg-brand-green text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer hover:bg-green-400 transition-colors"
              >
                Continue to Review
              </button>
            </div>
          )}

          {checkout.step === "review" && (
            <div className="space-y-6">
              <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-white">Review Order</h2>
                  <button
                    onClick={() => goToStep("information")}
                    className="text-sm text-brand-green hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                  <p>{customerInfo.email}</p>
                  <p>{address.line1}{address.line2 && `, ${address.line2}`}</p>
                  <p>{address.city}, {address.state} {address.zip}</p>
                </div>
              </div>

              <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6">
                <h2 className="font-display font-bold text-white mb-4">Items</h2>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.order_item_id} className="flex justify-between text-sm">
                      <span className="text-zinc-300">
                        {item.title} x{Math.round(Number(item.quantity))}
                      </span>
                      <span className="text-brand-gold">{item.total_price?.formatted}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6 text-center">
                <p className="text-sm text-brand-gold font-medium mb-1">Payment Method</p>
                <p className="text-white font-bold">Cash on Delivery</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={placeOrder}
                disabled={processing}
                className="w-full bg-brand-green text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer hover:bg-green-400 transition-colors disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {processing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6 sticky top-24">
            <h3 className="font-display font-bold text-white mb-4">Summary</h3>
            <ul className="space-y-3 mb-6">
              {items.map((item) => (
                <li key={item.order_item_id} className="flex justify-between text-sm">
                  <span className="text-zinc-400 truncate mr-4">{item.title}</span>
                  <span className="text-zinc-300 whitespace-nowrap">{item.total_price?.formatted}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-medium text-zinc-300">Total</span>
              <span className="font-display font-bold text-xl text-white">{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
