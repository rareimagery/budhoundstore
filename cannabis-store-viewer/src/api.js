const BASE = process.env.REACT_APP_DRUPAL_URL || "http://localhost:8080";
const STORE_TYPE = process.env.REACT_APP_STORE_TYPE || "online";

const PRODUCT_TYPES = [
  "flower",
  "pre_roll",
  "edible",
  "concentrate",
  "vape_cartridge",
  "tincture",
  "topical",
  "accessory",
  "cannabis_clone_seed",
];

const PRODUCT_TYPE_LABELS = {
  flower: "Flower",
  pre_roll: "Pre-Roll",
  edible: "Edible",
  concentrate: "Concentrate",
  vape_cartridge: "Vape / Cartridge",
  tincture: "Tincture",
  topical: "Topical",
  accessory: "Accessory",
  cannabis_clone_seed: "Clone / Seed",
};

// ── In-memory cache (lives for the browser session) ──────────────
const _storesCache = { data: null };
const _productsCache = new Map(); // storeId → products[]

async function jsonApiFetch(path, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/vnd.api+json" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchStores() {
  if (_storesCache.data) return _storesCache.data;
  const json = await jsonApiFetch(`/jsonapi/commerce_store/${STORE_TYPE}`);
  _storesCache.data = json.data || [];
  return _storesCache.data;
}

export async function fetchStore(storeId) {
  const stores = await fetchStores();
  return stores.find(
    (s) => String(s.attributes.drupal_internal__store_id) === String(storeId)
  );
}

export async function fetchProductsForStore(storeInternalId) {
  if (_productsCache.has(storeInternalId)) {
    return _productsCache.get(storeInternalId);
  }
  const results = await Promise.allSettled(
    PRODUCT_TYPES.map(async (type) => {
      const filter  = `filter[stores.meta.drupal_internal__target_id]=${storeInternalId}`;
      const include = "include=variations,field_brand,field_image,field_image.thumbnail";
      const json = await jsonApiFetch(
        `/jsonapi/commerce_product/${type}?${filter}&${include}&page[limit]=50&fields[commerce_product--${type}]=title,variations,field_brand,field_image,field_leafly_data,field_on_sale`
      );

      // ── Brand map: taxonomy UUID → name ──────────────────────
      const brandMap = {};
      if (json.included) {
        json.included
          .filter((inc) => inc.type.startsWith("taxonomy_term--"))
          .forEach((term) => {
            brandMap[term.id] = term.attributes.name;
          });
      }

      // ── Variation map: UUID → { attributes, type } ───────────
      const variationMap = {};
      if (json.included) {
        json.included
          .filter((inc) => inc.type.startsWith("commerce_product_variation--"))
          .forEach((v) => {
            variationMap[v.id] = { attributes: v.attributes, variationType: v.type };
          });
      }

      // ── Image resolution: media thumbnail → absolute URL ─────
      // Chain: product → field_image (media) → thumbnail (file) → uri.url
      const fileMap = {};
      if (json.included) {
        json.included
          .filter((inc) => inc.type === "file--file")
          .forEach((f) => {
            const rawUrl = f.attributes?.uri?.url || null;
            // Drupal returns relative URIs like /sites/default/files/...
            fileMap[f.id] = rawUrl
              ? rawUrl.startsWith("http") ? rawUrl : `${BASE}${rawUrl}`
              : null;
          });
      }

      const mediaMap = {};
      if (json.included) {
        json.included
          .filter((inc) => inc.type === "media--product_image")
          .forEach((m) => {
            const thumbRef = m.relationships?.thumbnail?.data;
            mediaMap[m.id] = thumbRef ? fileMap[thumbRef.id] || null : null;
          });
      }

      // ── Map each product to a flat object ────────────────────
      return (json.data || []).map((product) => {
        const brandRef = product.relationships?.field_brand?.data;
        const brandName = brandRef ? brandMap[brandRef.id] || null : null;

        const variationRefs = product.relationships?.variations?.data || [];
        const variations = variationRefs
          .map((ref) => variationMap[ref.id]?.attributes)
          .filter(Boolean);

        const lowestPrice = variations.reduce((min, v) => {
          const p = v.price ? parseFloat(v.price.number) : null;
          return p !== null && (min === null || p < min) ? p : min;
        }, null);

        const lowestSalePrice = variations.reduce((min, v) => {
          const p = v.field_sale_price ? parseFloat(v.field_sale_price.number) : null;
          return p !== null && (min === null || p < min) ? p : min;
        }, null);

        // Build variation list with internal IDs for the Cart API
        const variationDetails = variationRefs
          .map((ref) => {
            const entry = variationMap[ref.id];
            if (!entry) return null;
            const attrs = entry.attributes;
            return {
              internalId: attrs.drupal_internal__variation_id,
              uuid: ref.id,
              variationType: entry.variationType,
              sku: attrs.sku || null,
              price: attrs.price ? parseFloat(attrs.price.number) : null,
              salePrice: attrs.field_sale_price ? parseFloat(attrs.field_sale_price.number) : null,
            };
          })
          .filter(Boolean);

        const firstVariationId   = variationDetails[0]?.internalId || null;
        const firstVariationUuid = variationDetails[0]?.uuid || null;
        const firstVariationType = variationDetails[0]?.variationType || null;

        const mediaRef = product.relationships?.field_image?.data;
        const imageUrl = mediaRef ? mediaMap[mediaRef.id] || null : null;

        const onSale = product.attributes?.field_on_sale === true || product.attributes?.field_on_sale === 1;

        // Parse Leafly JSON blob stored in field_leafly_data
        const leaflyRaw = product.attributes?.field_leafly_data || null;
        let description = null;
        let leaflyUrl   = null;
        if (leaflyRaw) {
          try {
            const leafly = JSON.parse(leaflyRaw);
            description  = leafly.description || null;
            leaflyUrl    = leafly.leafly_url   || null;
          } catch (_) {
            // malformed JSON — ignore
          }
        }

        return {
          id: product.id,
          internalId: product.attributes.drupal_internal__product_id,
          title: product.attributes.title,
          type,
          typeLabel: PRODUCT_TYPE_LABELS[type] || type,
          brand: brandName,
          price: lowestPrice,
          variationCount: variations.length,
          variationDetails,
          firstVariationId,
          firstVariationUuid,
          firstVariationType,
          imageUrl,
          description,
          leaflyUrl,
          onSale,
          salePrice: lowestSalePrice,
        };
      });
    })
  );

  const products = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  _productsCache.set(storeInternalId, products);
  return products;
}

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export { PRODUCT_TYPE_LABELS };
