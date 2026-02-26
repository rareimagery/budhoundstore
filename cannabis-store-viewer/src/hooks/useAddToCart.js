import { useState, useCallback } from "react";
import drupalClient from "../api/drupalClient";
import { useCartContext } from "../context/CartContext";

/**
 * Hook for adding a product variation to the cart.
 *
 * Uses the variation UUID (not internal ID) via the commerce_api cart endpoint.
 *
 * @example
 *   const { addToCart, adding, success, error } = useAddToCart();
 *   addToCart(variationUuid, 1, "commerce_product_variation--flower");
 */
export function useAddToCart() {
  const { refreshCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addToCart = useCallback(
    async (variationUuid, quantity = 1, variationType = "commerce_product_variation--default") => {
      if (!variationUuid) {
        setError("No variation available for this product.");
        return;
      }

      setAdding(true);
      setError(null);
      setSuccess(false);

      try {
        await drupalClient.post("/jsonapi/cart/add", {
          data: [
            {
              type: variationType,
              id: variationUuid,
              meta: { quantity },
            },
          ],
        });

        setSuccess(true);
        await refreshCart();
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        const msg =
          err.response?.data?.errors?.[0]?.detail ||
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
