import { useState, useCallback } from "react";
import { addToCart as apiAddToCart } from "../api/cart";
import { useCartContext } from "../context/CartContext";

/**
 * Hook for adding a product variation to the cart via the Commerce API.
 */
export function useAddToCart() {
  const { refreshCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addToCart = useCallback(
    async (variationUuid, variationType, quantity = 1) => {
      if (!variationUuid || !variationType) {
        setError("No variation selected.");
        return;
      }

      setAdding(true);
      setError(null);
      setSuccess(false);

      try {
        await apiAddToCart(variationUuid, variationType, quantity);
        setSuccess(true);
        await refreshCart();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        const msg =
          err.response?.data?.errors?.[0]?.detail ||
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
