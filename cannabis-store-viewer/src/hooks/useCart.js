import { useCallback } from "react";
import drupalClient from "../api/drupalClient";
import { useCartContext } from "../context/CartContext";

/**
 * Hook for reading cart contents and modifying items.
 *
 * Resolves full order-item entities from the JSON:API `included` array
 * so components get complete item data (title, quantity, price, etc.).
 */
export function useCart() {
  const { cart, included, loading, error, refreshCart, dispatch } =
    useCartContext();

  // Resolve order item UUIDs → full included entities
  const itemRefs = cart?.relationships?.order_items?.data || [];
  const items = itemRefs
    .map((ref) => included.find((i) => i.id === ref.id))
    .filter(Boolean);

  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.attributes?.quantity || 1),
    0
  );
  const totalPrice =
    cart?.attributes?.total_price?.formatted || "$0.00";

  /** Update quantity of an order item (by its UUID). */
  const updateItemQuantity = useCallback(
    async (orderItemId, newQuantity) => {
      if (newQuantity < 1) return removeItem(orderItemId);
      if (!cart) return;
      const itemType =
        items.find((i) => i.id === orderItemId)?.type ||
        "commerce_order_item--online";
      try {
        await drupalClient.patch(
          `/jsonapi/carts/${cart.id}/items/${orderItemId}`,
          {
            data: {
              type: itemType,
              id: orderItemId,
              attributes: { quantity: String(newQuantity) },
            },
          }
        );
        await refreshCart();
      } catch (err) {
        console.error("Failed to update quantity:", err);
        throw err;
      }
    },
    [cart, items, refreshCart] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /** Remove a single item from the cart (PATCH quantity to 0). */
  const removeItem = useCallback(
    async (orderItemId) => {
      if (!cart) return;
      const itemType =
        items.find((i) => i.id === orderItemId)?.type ||
        "commerce_order_item--online";
      try {
        await drupalClient.patch(
          `/jsonapi/carts/${cart.id}/items/${orderItemId}`,
          {
            data: {
              type: itemType,
              id: orderItemId,
              attributes: { quantity: "0" },
            },
          }
        );
        await refreshCart();
      } catch (err) {
        console.error("Failed to remove item:", err);
        throw err;
      }
    },
    [cart, items, refreshCart]
  );

  /** Remove all items from the cart. */
  const clearCart = useCallback(async () => {
    if (!cart) return;
    try {
      await drupalClient.delete(`/jsonapi/carts/${cart.id}/items`);
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  }, [cart, dispatch]);

  return {
    cart,
    items,
    itemCount,
    totalPrice,
    loading,
    error,
    updateItemQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };
}
