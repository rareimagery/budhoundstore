import { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * Add-to-cart button using the JSON:API cart endpoint.
 *
 * @param {string}  variationUuid - Drupal variation UUID (for JSON:API)
 * @param {string}  variationType - JSON:API type, e.g. "commerce_product_variation--flower"
 * @param {number}  [quantity]    - When provided, use this quantity and hide the built-in input
 * @param {string}  [label]       - Button label
 */
export default function AddToCartButton({
  variationUuid,
  variationType = "commerce_product_variation--default",
  quantity,
  label = "Add to Cart",
}) {
  const { addToCart, adding, success, error } = useAddToCart();
  const [internalQty, setInternalQty] = useState(1);

  // Use externally-controlled quantity when provided
  const controlled = quantity !== undefined;
  const qty = controlled ? quantity : internalQty;

  if (!variationUuid) {
    return <span className="atc-unavailable">Unavailable</span>;
  }

  return (
    <div className="atc-wrap">
      {!controlled && (
        <input
          className="atc-qty"
          type="number"
          min="1"
          value={internalQty}
          onChange={(e) => setInternalQty(Math.max(1, parseInt(e.target.value) || 1))}
          aria-label="Quantity"
        />
      )}
      <button
        className={`atc-btn${success ? " atc-btn--success" : ""}`}
        onClick={() => addToCart(variationUuid, qty, variationType)}
        disabled={adding}
        title={error || undefined}
      >
        {adding ? "Adding…" : success ? "Added!" : label}
      </button>
    </div>
  );
}
