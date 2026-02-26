import drupalClient from "./drupalClient";
import { API_BASE_URL } from "./config";
import { getStyleCategory, STYLE_NAME_TO_MACHINE } from "../lib/constants";

let _cache = null;

/**
 * Fetch all clothing products from Drupal JSON:API.
 * Includes variations with size/color/style attributes and product images.
 */
export async function fetchProducts() {
  if (_cache) return _cache;

  const res = await drupalClient.get(
    "/jsonapi/commerce_product/clothing" +
      "?include=variations,field_clothing_image," +
      "variations.attribute_clothing_size," +
      "variations.attribute_clothing_color," +
      "variations.attribute_clothing_style" +
      "&page[limit]=100"
  );

  const { data, included = [] } = res.data;

  // Build lookup maps from included entities
  const includedMap = {};
  for (const entity of included) {
    includedMap[`${entity.type}:${entity.id}`] = entity;
  }

  const products = (data || []).map((product) =>
    parseProduct(product, includedMap)
  );

  _cache = products;
  return products;
}

/**
 * Fetch a single product by UUID.
 */
export async function fetchProductByUuid(uuid) {
  // Check cache first
  if (_cache) {
    const cached = _cache.find((p) => p.id === uuid);
    if (cached) return cached;
  }

  const res = await drupalClient.get(
    `/jsonapi/commerce_product/clothing/${uuid}` +
      "?include=variations,field_clothing_image," +
      "variations.attribute_clothing_size," +
      "variations.attribute_clothing_color," +
      "variations.attribute_clothing_style"
  );

  const { data, included = [] } = res.data;
  const includedMap = {};
  for (const entity of included) {
    includedMap[`${entity.type}:${entity.id}`] = entity;
  }

  return parseProduct(data, includedMap);
}

/** Clear the product cache. */
export function clearProductCache() {
  _cache = null;
}

// Internal helpers

function parseProduct(product, includedMap) {
  const images = resolveImages(product, includedMap);
  const variations = resolveVariations(product, includedMap);

  const prices = variations.map((v) => v.price).filter(Boolean);
  const priceRange = {
    min: Math.min(...(prices.length ? prices : [0])),
    max: Math.max(...(prices.length ? prices : [0])),
  };

  const availableSizes = [...new Set(variations.map((v) => v.size).filter(Boolean))];
  const availableColors = [...new Set(variations.map((v) => v.color).filter(Boolean))];

  const firstStyle = variations[0]?.styleMachine || null;
  const styleCategory = firstStyle ? getStyleCategory(firstStyle) : null;

  return {
    id: product.id,
    internalId: product.attributes?.drupal_internal__product_id,
    title: product.attributes?.title || "Untitled",
    description: product.attributes?.body?.processed || product.attributes?.body?.value || "",
    images,
    variations,
    priceRange,
    availableSizes,
    availableColors,
    styleCategory,
    styleName: variations[0]?.style || null,
    styleMachine: firstStyle,
  };
}

function resolveImages(product, includedMap) {
  const refs = product.relationships?.field_clothing_image?.data;
  if (!refs) return [];

  const imageRefs = Array.isArray(refs) ? refs : [refs];
  return imageRefs
    .map((ref) => {
      const file = includedMap[`${ref.type}:${ref.id}`];
      if (!file) return null;
      const url = file.attributes?.uri?.url;
      if (!url) return null;
      return {
        url: url.startsWith("http") ? url : `${API_BASE_URL}${url}`,
        alt: ref.meta?.alt || "",
      };
    })
    .filter(Boolean);
}

function resolveVariations(product, includedMap) {
  const refs = product.relationships?.variations?.data;
  if (!refs) return [];

  return refs
    .map((ref) => {
      const variation = includedMap[`${ref.type}:${ref.id}`];
      if (!variation) return null;

      const size = resolveAttribute(variation, "attribute_clothing_size", includedMap);
      const color = resolveAttribute(variation, "attribute_clothing_color", includedMap);
      const style = resolveAttribute(variation, "attribute_clothing_style", includedMap);

      const priceObj = variation.attributes?.price;
      const price = priceObj ? parseFloat(priceObj.number) : null;

      return {
        uuid: variation.id,
        internalId: variation.attributes?.drupal_internal__variation_id,
        type: variation.type,
        sku: variation.attributes?.sku || "",
        price,
        currency: priceObj?.currency_code || "USD",
        size: size?.name || null,
        color: color?.name || null,
        style: style?.name || null,
        styleMachine: style?.machine || null,
      };
    })
    .filter(Boolean);
}

function resolveAttribute(variation, relationshipName, includedMap) {
  const ref = variation.relationships?.[relationshipName]?.data;
  if (!ref) return null;

  const entity = includedMap[`${ref.type}:${ref.id}`];
  if (!entity) return null;

  const name = entity.attributes?.name || null;
  return {
    name,
    machine: STYLE_NAME_TO_MACHINE[name] || entity.attributes?.drupal_internal__id || entity.id,
  };
}
