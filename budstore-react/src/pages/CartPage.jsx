import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function CartPage() {
  const { items, itemCount, totalPrice, loading, updateItemQuantity, removeItem, clearCart } =
    useCart();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Your Cart is Empty</h1>
          <p className="text-zinc-500 mb-6">Browse our menu to find something you'll love.</p>
          <Link
            to="/"
            className="inline-block bg-brand-green text-black px-8 py-3 rounded-xl font-bold text-sm uppercase hover:bg-green-400 transition-colors"
          >
            Browse Dispensaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Cart <span className="text-brand-green">({itemCount})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const qty = Math.round(Number(item.quantity || 1));
          const price = item.total_price?.formatted || "";
          const unitPrice = item.unit_price?.formatted || "";
          const title = item.title || "Item";

          return (
            <div
              key={item.order_item_id}
              className="flex items-center gap-6 p-6 bg-brand-surface rounded-2xl border border-zinc-800"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{unitPrice} each</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateItemQuantity(item.order_item_id, qty - 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-mono font-medium text-white w-8 text-center">{qty}</span>
                <button
                  onClick={() => updateItemQuantity(item.order_item_id, qty + 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              {/* Price + remove */}
              <div className="text-right min-w-[80px]">
                <div className="font-semibold text-brand-gold">{price}</div>
                <button
                  onClick={() => removeItem(item.order_item_id)}
                  className="text-xs text-red-400/60 hover:text-red-400 mt-1 cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-medium text-zinc-300">Total</span>
          <span className="font-display text-2xl font-bold text-white">{totalPrice}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full bg-brand-green text-black text-center py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-green-400 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
