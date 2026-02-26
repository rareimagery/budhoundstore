import drupalClient from "./drupalClient";
import { PRODUCT_TYPE_BUNDLES } from "../lib/constants";

let _cache = {};

/**
 * Fetch products for a given cannabis product type (bundle).
 * If no type given, fetches all types.
 */
export async function fetchProducts(productType = null) {
  if (productType && _cache[productType]) return _cache[productType];
  if (!productType && _cache._all) return _cache._all;

  const types = productType
    ? [productType]
    : Object.keys(PRODUCT_TYPE_BUNDLES);

  const allProducts = [];

  for (const type of types) {
    const bundle = PRODUCT_TYPE_BUNDLES[type];
    if (!bundle) continue;

    try {
      const res = await drupalClient.get(
        `/jsonapi/commerce_product/${bundle.bundle}` +
          `?include=${bundle.includes.join(",")}` +
          "&page[limit]=50"
      );

      const { data = [], included = [] } = res.data;

      const includedMap = {};
      for (const entity of included) {
        includedMap[`${entity.type}:${entity.id}`] = entity;
      }

      const products = data.map((product) =>
        parseProduct(product, includedMap, type, bundle)
      );

      if (productType) {
        _cache[productType] = products;
        return products;
      }

      allProducts.push(...products);
    } catch (err) {
      console.warn(`Failed to fetch ${type} products:`, err.message);
    }
  }

  _cache._all = allProducts;
  return allProducts;
}

/**
 * Fetch a single product by UUID from any bundle.
 */
export async function fetchProductByUuid(uuid) {
  // Check all caches first
  for (const products of Object.values(_cache)) {
    if (Array.isArray(products)) {
      const found = products.find((p) => p.id === uuid);
      if (found) return found;
    }
  }

  // Try each bundle until we find the product
  for (const [type, bundle] of Object.entries(PRODUCT_TYPE_BUNDLES)) {
    try {
      const res = await drupalClient.get(
        `/jsonapi/commerce_product/${bundle.bundle}/${uuid}` +
          `?include=${bundle.includes.join(",")}`
      );

      const { data, included = [] } = res.data;
      if (!data) continue;

      const includedMap = {};
      for (const entity of included) {
        includedMap[`${entity.type}:${entity.id}`] = entity;
      }

      return parseProduct(data, includedMap, type, bundle);
    } catch {
      // Product not found in this bundle, try next
    }
  }

  return null;
}

export function clearProductCache() {
  _cache = {};
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function parseProduct(product, includedMap, type, bundle) {
  const images = resolveImages(product, includedMap, bundle);
  const variations = resolveVariations(product, includedMap, bundle);

  const prices = variations.map((v) => v.price).filter(Boolean);
  const priceRange = {
    min: Math.min(...(prices.length ? prices : [0])),
    max: Math.max(...(prices.length ? prices : [0])),
  };

  // Extract common attributes from first variation
  const firstVar = variations[0] || {};

  return {
    id: product.id,
    internalId: product.attributes?.drupal_internal__product_id,
    title: product.attributes?.title || "Untitled",
    description:
      product.attributes?.body?.processed ||
      product.attributes?.body?.value ||
      "",
    type,
    images,
    variations,
    priceRange,
    strainType: firstVar.strainType || null,
    potencyRange: firstVar.potencyRange || null,
    weight: firstVar.weight || null,
    brand: firstVar.brand || null,
    stores: product.relationships?.stores?.data?.map((s) => s.id) || [],
  };
}

function resolveImages(product, includedMap, bundle) {
  const imageField = bundle.imageField || "field_product_image";
  const refs = product.relationships?.[imageField]?.data;
  if (!refs) return [];

  const imageRefs = Array.isArray(refs) ? refs : [refs];
  return imageRefs
    .map((ref) => {
      const file = includedMap[`${ref.type}:${ref.id}`];
      if (!file) return null;
      const url = file.attributes?.uri?.url;
      if (!url) return null;
      return {
        url: url.startsWith("http")
          ? url
          : `${import.meta.env.VITE_DRUPAL_URL || ""}${url}`,
        alt: ref.meta?.alt || "",
      };
    })
    .filter(Boolean);
}

function resolveVariations(product, includedMap, bundle) {
  const refs = product.relationships?.variations?.data;
  if (!refs) return [];

  return refs
    .map((ref) => {
      const variation = includedMap[`${ref.type}:${ref.id}`];
      if (!variation) return null;

      const priceObj = variation.attributes?.price;
      const price = priceObj ? parseFloat(priceObj.number) : null;

      // Resolve variation attributes dynamically
      const attrs = {};
      for (const attrName of bundle.variationAttributes || []) {
        const resolved = resolveAttribute(variation, attrName, includedMap);
        if (resolved) {
          attrs[attrName] = resolved;
        }
      }

      return {
        uuid: variation.id,
        internalId: variation.attributes?.drupal_internal__variation_id,
        type: variation.type,
        sku: variation.attributes?.sku || "",
        price,
        currency: priceObj?.currency_code || "USD",
        strainType: attrs.attribute_strain_type?.name || null,
        potencyRange: attrs.attribute_potency_range?.name || null,
        weight: attrs.attribute_weight?.name || null,
        weightQuantity: attrs.attribute_weight_quantity?.name || null,
        brand: attrs.attribute_brand?.name || null,
        formFactor: attrs.attribute_form_factor?.name || null,
        flavorProfile: attrs.attribute_flavor_profile?.name || null,
        cartridgeType: attrs.attribute_cartridge_type?.name || null,
        consumptionMethod: attrs.attribute_consumption_method?.name || null,
      };
    })
    .filter(Boolean);
}

function resolveAttribute(variation, relationshipName, includedMap) {
  const ref = variation.relationships?.[relationshipName]?.data;
  if (!ref) return null;

  const entity = includedMap[`${ref.type}:${ref.id}`];
  if (!entity) return null;

  return {
    name: entity.attributes?.name || null,
    id: entity.id,
  };
}
