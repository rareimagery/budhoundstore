import { useState, useCallback } from "react";
import { addToCart as apiAddToCart } from "../api/cart";
import { useCartContext } from "../context/CartContext";

/**
 * Hook for adding a product variation to the cart via the REST Cart API.
 */
export function useAddToCart() {
  const { refreshCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addToCart = useCallback(
    async (variationId, quantity = 1) => {
      if (!variationId) {
        setError("No variation selected.");
        return;
      }

      setAdding(true);
      setError(null);
      setSuccess(false);

      try {
        await apiAddToCart(variationId, quantity);
        setSuccess(true);
        await refreshCart();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Failed to add item to cart.";
        setError(msg);
      } finally {
        setAdding(false);
      }
    },
    [refreshCart]
  );

  return { addToCart, adding, error, success };
}
