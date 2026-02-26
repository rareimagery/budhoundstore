import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import "./CartDrawer.css";

/**
 * Slide-out cart drawer that overlays the right side of the screen.
 *
 * @param {boolean} isOpen   - Whether the drawer is visible
 * @param {function} onClose - Callback to close the drawer
 */
export default function CartDrawer({ isOpen, onClose }) {
  const {
    items,
    itemCount,
    totalPrice,
    updateItemQuantity,
    removeItem,
    clearCart,
    loading,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${isOpen ? " drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`cart-drawer${isOpen ? " cart-drawer--open" : ""}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="cart-drawer-header">
          <h3>Cart {itemCount > 0 && <span className="drawer-count">({itemCount})</span>}</h3>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {loading && <p className="drawer-message">Loading cart…</p>}

          {!loading && items.length === 0 && (
            <div className="drawer-empty">
              <div className="drawer-empty__icon">🛒</div>
              <p className="drawer-empty__title">Your cart is empty</p>
              <p className="drawer-empty__sub">Browse a store and add some products</p>
            </div>
          )}

          {items.map((item) => {
            const qty = Number(item.attributes?.quantity || 1);
            const title = item.attributes?.title || "Product";
            const sku = item.attributes?.sku || "";
            const unitPrice = item.attributes?.unit_price?.formatted;
            const lineTotal = item.attributes?.total_price?.formatted;

            return (
              <div key={item.id} className="drawer-item">
                {/* Letter-avatar thumbnail */}
                <div className="drawer-item-img">
                  <div className="drawer-item-avatar" aria-hidden="true">
                    {title[0] || "?"}
                  </div>
                </div>

                {/* Product name and SKU */}
                <div className="drawer-item-info">
                  <span className="drawer-item-title">{title}</span>
                  <span className="drawer-item-sku">{sku}</span>
                </div>

                {/* Quantity controls */}
                <div className="drawer-item-controls">
                  <button
                    className="drawer-qty-btn"
                    onClick={() => updateItemQuantity(item.id, qty - 1)}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="drawer-qty">{qty}</span>
                  <button
                    className="drawer-qty-btn"
                    onClick={() => updateItemQuantity(item.id, qty + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    className="drawer-remove-btn"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    🗑
                  </button>
                </div>

                {/* Line total */}
                <div className="drawer-item-price">
                  {lineTotal || unitPrice || ""}
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Item count + total label */}
            <div className="drawer-footer-meta">
              <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              <span className="drawer-footer-total-label">Total</span>
            </div>

            {/* Formatted total amount */}
            <div className="drawer-footer-amount">{totalPrice}</div>

            {/* Checkout button */}
            <button className="btn-primary btn-full" onClick={handleCheckout}>
              🔒 Checkout — Cash on Delivery
            </button>

            {/* Payment note */}
            <p className="drawer-cod-note">Pay with cash at delivery</p>

            {/* Clear cart */}
            <button className="drawer-clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
