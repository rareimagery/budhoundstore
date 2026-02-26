import { useCallback } from "react";
import { updateCartItem, removeCartItem, clearCart as apiClearCart } from "../api/cart";
import { useCartContext } from "../context/CartContext";

/**
 * Hook for reading cart contents and modifying items via the REST Cart API.
 */
export function useCart() {
  const { cart, loading, error, refreshCart, dispatch } = useCartContext();

  const items = cart?.order_items || [];

  const itemCount = items.reduce(
    (sum, item) => sum + Math.round(Number(item.quantity || 0)),
    0
  );
  const totalPrice = cart?.total_price?.formatted || "$0.00";

  const updateItemQuantity = useCallback(
    async (orderItemId, newQuantity) => {
      if (newQuantity < 1) return removeItem(orderItemId);
      if (!cart) return;
      try {
        await updateCartItem(cart.order_id, orderItemId, newQuantity);
        await refreshCart();
      } catch (err) {
        console.error("Failed to update quantity:", err);
        throw err;
      }
    },
    [cart, refreshCart]
  );

  const removeItem = useCallback(
    async (orderItemId) => {
      if (!cart) return;
      try {
        await removeCartItem(cart.order_id, orderItemId);
        await refreshCart();
      } catch (err) {
        console.error("Failed to remove item:", err);
        throw err;
      }
    },
    [cart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    if (!cart) return;
    try {
      await apiClearCart(cart.order_id);
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
