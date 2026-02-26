import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function CartDrawer({ open, onClose }) {
  const { items, itemCount, totalPrice, updateItemQuantity, removeItem } =
    useCart();

  useEffect(() => {
    if (open) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-surface z-50 flex flex-col shadow-2xl border-l border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="font-display font-bold text-lg text-white">
            Your Cart <span className="text-brand-green">({itemCount})</span>
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-zinc-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-zinc-500 mb-4">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="text-sm font-medium text-brand-green hover:underline cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => {
                const qty = Math.round(Number(item.quantity || 1));
                const price = item.total_price?.formatted || "";
                const title = item.title || "Item";

                return (
                  <li key={item.order_item_id} className="flex gap-4 pb-6 border-b border-zinc-800/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">{price}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateItemQuantity(item.order_item_id, qty - 1)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-mono font-medium text-white w-6 text-center">{qty}</span>
                        <button
                          onClick={() => updateItemQuantity(item.order_item_id, qty + 1)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-brand-gold">{price}</div>
                      <button
                        onClick={() => removeItem(item.order_item_id)}
                        className="text-red-400 text-xs mt-4 cursor-pointer hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Total</span>
              <span className="font-display font-bold text-white text-lg">{totalPrice}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-brand-green text-black text-center py-4 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-green-400 transition-colors"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center py-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
