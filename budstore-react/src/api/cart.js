import drupalClient from "./drupalClient";

/**
 * Fetch the active cart for the current session/user.
 * Returns a normalized cart object or null.
 */
export async function fetchCart() {
  const response = await drupalClient.get(
    "/jsonapi/carts?include=order_items,order_items.purchased_entity"
  );
  const { data = [], included = [] } = response.data;
  if (data.length === 0) return null;
  return normalizeCart(data[0], included);
}

/**
 * Add a product variation to the cart.
 * @param {string} variationUuid - Variation UUID
 * @param {string} variationType - JSON:API resource type (e.g. "commerce_product_variation--flower_variation")
 * @param {number} quantity
 */
export async function addToCart(variationUuid, variationType, quantity = 1) {
  const response = await drupalClient.post("/jsonapi/cart/add", {
    data: [
      {
        type: variationType,
        id: variationUuid,
        meta: { quantity },
      },
    ],
  });
  return response.data;
}

/**
 * Update the quantity of a specific order item.
 * @param {number} orderId - Cart entity ID (internal)
 * @param {number} orderItemId - Order item entity ID (internal)
 * @param {string} orderItemUuid - Order item UUID
 * @param {number} quantity
 */
export async function updateCartItem(orderId, orderItemId, orderItemUuid, quantity) {
  const response = await drupalClient.patch(
    `/jsonapi/carts/${orderId}/items/${orderItemId}`,
    {
      data: {
        type: "commerce_order_item--default",
        id: orderItemUuid,
        attributes: { quantity: String(quantity) },
      },
    }
  );
  return response.data;
}

/**
 * Remove a specific item from the cart.
 * @param {number} orderId - Cart entity ID (internal)
 * @param {string} orderItemUuid - Order item UUID
 * @param {string} orderItemType - Order item JSON:API type
 */
export async function removeCartItem(orderId, orderItemUuid, orderItemType = "commerce_order_item--default") {
  const response = await drupalClient.delete(
    `/jsonapi/carts/${orderId}/items`,
    {
      data: {
        data: [{ type: orderItemType, id: orderItemUuid }],
      },
    }
  );
  return response.data;
}

/**
 * Remove all items from the cart.
 * @param {number} orderId - Cart entity ID (internal)
 */
export async function clearCart(orderId) {
  await drupalClient.delete(`/jsonapi/carts/${orderId}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Normalize a JSON:API cart response into a flat object
 * compatible with the rest of the app.
 */
function normalizeCart(cartData, included = []) {
  const attrs = cartData.attributes || {};

  // Build a map of included entities by type:id
  const includedMap = {};
  for (const entity of included) {
    includedMap[`${entity.type}:${entity.id}`] = entity;
  }

  // Resolve order items from relationships
  const orderItemRefs = cartData.relationships?.order_items?.data || [];
  const orderItems = orderItemRefs
    .map((ref) => {
      const item = includedMap[`${ref.type}:${ref.id}`];
      if (!item) return null;
      const itemAttrs = item.attributes || {};
      return {
        order_item_id: itemAttrs.drupal_internal__order_item_id,
        uuid: item.id,
        type: item.type,
        title: itemAttrs.title || "",
        quantity: itemAttrs.quantity || "0",
        unit_price: itemAttrs.unit_price || {},
        total_price: itemAttrs.total_price || {},
      };
    })
    .filter(Boolean);

  return {
    order_id: attrs.drupal_internal__order_id,
    uuid: cartData.id,
    type: cartData.type,
    state: attrs.state,
    order_items: orderItems,
    total_price: attrs.total_price || {},
    order_number: attrs.order_number,
    mail: attrs.mail,
  };
}
