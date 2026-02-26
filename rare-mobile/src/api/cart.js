import client from "./commerceClient";

/**
 * Fetch all carts for the current session/user.
 * Returns the first (active) cart or null.
 */
export async function fetchCart() {
  const response = await client.get("/cart?_format=json");
  const carts = response.data;
  return Array.isArray(carts) && carts.length > 0 ? carts[0] : null;
}

/**
 * Add a product variation to the cart.
 * @param {number} variationId - Drupal internal variation ID
 * @param {number} quantity
 */
export async function addToCart(variationId, quantity = 1) {
  const response = await client.post("/cart/add?_format=json", [
    {
      purchased_entity_type: "commerce_product_variation",
      purchased_entity_id: variationId,
      quantity,
    },
  ]);
  return response.data;
}

/**
 * Update the quantity of a specific order item.
 * @param {number} orderId - Cart order ID
 * @param {number} orderItemId - Order item ID
 * @param {number} quantity
 */
export async function updateCartItem(orderId, orderItemId, quantity) {
  const response = await client.patch(
    `/cart/${orderId}/items/${orderItemId}?_format=json`,
    { quantity }
  );
  return response.data;
}

/**
 * Remove a specific item from the cart.
 * @param {number} orderId
 * @param {number} orderItemId
 */
export async function removeCartItem(orderId, orderItemId) {
  await client.delete(`/cart/${orderId}/items/${orderItemId}?_format=json`);
}

/**
 * Remove all items from the cart.
 * @param {number} orderId
 */
export async function clearCart(orderId) {
  await client.delete(`/cart/${orderId}/items?_format=json`);
}
