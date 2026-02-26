import drupalClient from "./drupalClient";

let _cache = null;

/**
 * Fetch all dispensary stores from Drupal Commerce.
 */
export async function fetchStores() {
  if (_cache) return _cache;

  const res = await drupalClient.get(
    "/jsonapi/commerce_store/online?page[limit]=50"
  );

  const { data = [] } = res.data;

  const stores = data.map((store) => ({
    id: store.id,
    internalId: store.attributes?.drupal_internal__store_id,
    name: store.attributes?.name || "Dispensary",
    mail: store.attributes?.mail || "",
    address: store.attributes?.address || {},
    isDefault: store.attributes?.is_default || false,
  }));

  _cache = stores;
  return stores;
}

export function clearStoreCache() {
  _cache = null;
}
