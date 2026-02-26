import { useCart } from "../hooks/useCart";
import { useNavigate, Link } from "react-router-dom";

export default function CartPage() {
  const { items, totalPrice, loading, updateItemQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <div className="page center"><p>Loading cart…</p></div>;
  }

  if (!items.length) {
    return (
      <div className="page cart-empty">
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn-primary">Browse Stores</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Continue Shopping</Link>
      <h1>Your Cart</h1>

      <div className="cart-wrap">
        <div className="product-table-wrap">
          <table className="product-table cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="price-col">Unit Price</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th className="price-col">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const qty = Number(item.attributes?.quantity || 1);
                return (
                  <tr key={item.id}>
                    <td className="product-name">{item.attributes?.title}</td>
                    <td className="price-col">{item.attributes?.unit_price?.formatted}</td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        className="cart-qty-input"
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          updateItemQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                      />
                    </td>
                    <td className="price-col">{item.attributes?.total_price?.formatted}</td>
                    <td>
                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cart-summary-box">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{totalPrice}</strong>
          </div>
          <p className="cart-summary-note">Taxes and fees calculated at checkout.</p>
          <button className="btn-primary btn-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
