// ── Product Type Bundles ─────────────────────────────────────────────────────
// Maps our category keys to Drupal Commerce product bundle names and their
// JSON:API include paths for variations + attributes.

export const PRODUCT_TYPE_BUNDLES = {
  flower: {
    bundle: "flower",
    label: "Flower",
    icon: "leaf",
    includes: [
      "variations",
      "variations.attribute_strain_type",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_weight_quantity",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_strain_type",
      "attribute_potency_range",
      "attribute_weight",
      "attribute_weight_quantity",
      "attribute_brand",
    ],
  },
  concentrate: {
    bundle: "concentrate",
    label: "Concentrates",
    icon: "fire",
    includes: [
      "variations",
      "variations.attribute_strain_type",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_form_factor",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_strain_type",
      "attribute_potency_range",
      "attribute_weight",
      "attribute_form_factor",
      "attribute_brand",
    ],
  },
  edible: {
    bundle: "edible",
    label: "Edibles",
    icon: "candy",
    includes: [
      "variations",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_form_factor",
      "variations.attribute_flavor_profile",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_potency_range",
      "attribute_weight",
      "attribute_form_factor",
      "attribute_flavor_profile",
      "attribute_brand",
    ],
  },
  vape: {
    bundle: "vape_cartridge",
    label: "Vapes",
    icon: "cloud",
    includes: [
      "variations",
      "variations.attribute_strain_type",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_cartridge_type",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_strain_type",
      "attribute_potency_range",
      "attribute_weight",
      "attribute_cartridge_type",
      "attribute_brand",
    ],
  },
  pre_roll: {
    bundle: "pre_roll",
    label: "Pre-Rolls",
    icon: "cigarette",
    includes: [
      "variations",
      "variations.attribute_strain_type",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_weight_quantity",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_strain_type",
      "attribute_potency_range",
      "attribute_weight",
      "attribute_weight_quantity",
      "attribute_brand",
    ],
  },
  tincture: {
    bundle: "tincture",
    label: "Tinctures",
    icon: "droplet",
    includes: [
      "variations",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_consumption_method",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_potency_range",
      "attribute_weight",
      "attribute_consumption_method",
      "attribute_brand",
    ],
  },
  topical: {
    bundle: "topical",
    label: "Topicals",
    icon: "hand",
    includes: [
      "variations",
      "variations.attribute_potency_range",
      "variations.attribute_weight",
      "variations.attribute_form_factor",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_potency_range",
      "attribute_weight",
      "attribute_form_factor",
      "attribute_brand",
    ],
  },
  clone_seed: {
    bundle: "cannabis_clone_seed",
    label: "Clones & Seeds",
    icon: "sprout",
    includes: [
      "variations",
      "variations.attribute_strain_type",
      "variations.attribute_brand",
    ],
    imageField: "field_product_image",
    variationAttributes: [
      "attribute_strain_type",
      "attribute_brand",
    ],
  },
  accessory: {
    bundle: "default",
    label: "Accessories",
    icon: "package",
    includes: ["variations"],
    imageField: "field_product_image",
    variationAttributes: [],
  },
};

// ── Product Categories (for UI tabs) ────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "flower", label: "Flower" },
  { key: "concentrate", label: "Concentrates" },
  { key: "edible", label: "Edibles" },
  { key: "vape", label: "Vapes" },
  { key: "pre_roll", label: "Pre-Rolls" },
  { key: "tincture", label: "Tinctures" },
  { key: "topical", label: "Topicals" },
  { key: "clone_seed", label: "Seeds" },
  { key: "accessory", label: "Accessories" },
];

// ── Category Icons (SVG path data keyed by category key) ─────────────────────
// Each entry can have one or two paths; some icons need both stroke and fill parts.
export const CATEGORY_ICONS = {
  flower: {
    // Cannabis leaf (7-pointed)
    paths: [
      "M12 2C12 2 9.5 6 9.5 9c0 1.5.7 2.8 1.8 3.7L12 22l.7-9.3C13.8 11.8 14.5 10.5 14.5 9c0-3-2.5-7-2.5-7z",
      "M12 9c-3-2.5-7-2-8 0s1 5 3.5 5.5M12 9c3-2.5 7-2 8 0s-1 5-3.5 5.5M12 9c-1.5-3.5-.5-7 1.5-7.5M12 9c1.5-3.5.5-7-1.5-7.5",
    ],
    fill: false,
  },
  concentrate: {
    // Flame / fire
    paths: [
      "M12 2c.5 3.5 4 6 4 9a4 4 0 01-8 0c0-3 3.5-5.5 4-9z",
      "M12 18a2 2 0 002-2c0-1.5-2-3-2-3s-2 1.5-2 3a2 2 0 002 2z",
    ],
    fill: false,
  },
  edible: {
    // Cookie with bite taken out
    paths: [
      "M12 2a10 10 0 100 20 10 10 0 000-20zm-2 5a1 1 0 110 2 1 1 0 010-2zm4 2a1 1 0 110 2 1 1 0 010-2zm-5 4a1 1 0 110 2 1 1 0 010-2zm6 1a1 1 0 110 2 1 1 0 010-2z",
    ],
    fill: false,
  },
  vape: {
    // Vape pen / e-cigarette
    paths: [
      "M8 2h8v4H8zM9 6h6v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z",
      "M10 6v10M14 6v10M12 2v-0M11 22v1M13 22v1",
    ],
    fill: false,
  },
  pre_roll: {
    // Joint / cigarette with smoke
    paths: [
      "M4 20l12-12M4 20l2 1 12-12-2-1zM16 8l2-2M12 3c0 1.5-1 2.5-1 4s1 2.5 1 4",
      "M15 2c0 1.2-.8 2-1 3s.8 2 1 3",
    ],
    fill: false,
  },
  tincture: {
    // Dropper bottle with drop
    paths: [
      "M10 3h4l1 3v2l-1 1v9a2 2 0 01-2 2h-0a2 2 0 01-2-2V9L9 8V6l1-3z",
      "M12 20v2M12 14v-2",
    ],
    fill: false,
  },
  topical: {
    // Lotion bottle / tube
    paths: [
      "M9 3h6v3H9zM8 6h8v2l-1 1v9a2 2 0 01-2 2h-2a2 2 0 01-2-2V9L8 8V6z",
      "M7 12h10",
    ],
    fill: false,
  },
  clone_seed: {
    // Seedling / sprout
    paths: [
      "M12 22V12M12 12c-3-1-5-4-5-7 0 0 3 1 5 4M12 12c3-1 5-4 5-7 0 0-3 1-5 4",
      "M9 22h6",
    ],
    fill: false,
  },
  accessory: {
    // Shopping bag
    paths: [
      "M6 6h12l1 14H5L6 6zM9 6V4a3 3 0 016 0v2",
    ],
    fill: false,
  },
};

// ── Strain Types ────────────────────────────────────────────────────────────

export const STRAIN_TYPES = {
  Indica: { color: "#8b5cf6", bg: "bg-purple-500/20", text: "text-purple-400" },
  Sativa: { color: "#f97316", bg: "bg-orange-500/20", text: "text-orange-400" },
  Hybrid: { color: "#22c55e", bg: "bg-green-500/20", text: "text-green-400" },
  "Indica Dominant": { color: "#8b5cf6", bg: "bg-purple-500/20", text: "text-purple-400" },
  "Sativa Dominant": { color: "#f97316", bg: "bg-orange-500/20", text: "text-orange-400" },
  CBD: { color: "#06b6d4", bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

export function getStrainStyle(strainName) {
  if (!strainName) return STRAIN_TYPES.Hybrid;
  for (const [key, value] of Object.entries(STRAIN_TYPES)) {
    if (strainName.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return STRAIN_TYPES.Hybrid;
}

// ── Potency Ranges ──────────────────────────────────────────────────────────

export const POTENCY_LEVELS = {
  "Low (0-10%)": { level: 1, label: "Low", percent: 10 },
  "Medium (10-20%)": { level: 2, label: "Medium", percent: 20 },
  "High (20-30%)": { level: 3, label: "High", percent: 30 },
  "Very High (30%+)": { level: 4, label: "Very High", percent: 40 },
  "High (25-35%)": { level: 3, label: "High", percent: 35 },
  "Medium (5-15mg)": { level: 2, label: "Medium", percent: 15 },
  "High (15-50mg)": { level: 3, label: "High", percent: 50 },
  "Very High (50mg+)": { level: 4, label: "Very High", percent: 60 },
};

export function getPotencyInfo(potencyRange) {
  if (!potencyRange) return { level: 0, label: "Unknown", percent: 0 };
  return POTENCY_LEVELS[potencyRange] || { level: 2, label: potencyRange, percent: 20 };
}

// ── Store Coordinates (geocoded from real Lompoc addresses) ─────────────────
// Keyed by Drupal internal store_id

export const STORE_COORDINATES = {
  1: { lat: 34.6387, lng: -120.4581, name: "Elevate Lompoc", address: "118 S H St" },
  2: { lat: 34.6397, lng: -120.4490, name: "One Plant Lompoc", address: "119 N A St" },
  3: { lat: 34.6612, lng: -120.4656, name: "Royal Healing Emporium", address: "721 W Central Ave, Ste D" },
  4: { lat: 34.6440, lng: -120.4670, name: "The Roots Dispensary", address: "805 W Laurel Ave" },
  5: { lat: 34.6468, lng: -120.4581, name: "Bleu Diamond Delivery", address: "1129 N H St" },
  6: { lat: 34.6391, lng: -120.4496, name: "MJ Direct", address: "715 E Ocean Ave" },
  7: { lat: 34.6390, lng: -120.4668, name: "Leaf Dispensary", address: "423 W Ocean Ave" },
};

// Default center of Lompoc
export const LOMPOC_CENTER = { lat: 34.6392, lng: -120.4579 };

// ── Store Logos (keyed by Drupal internal store_id) ──────────────────────────
// Stores with custom logos get their own image; others fall back to the default.
export const STORE_LOGOS = {
  1: "/stores/elevate-lompoc.png", // Elevate Lompoc
  3: "/stores/royal-healing.webp", // Royal Healing Emporium
};

// ── Utility Functions ───────────────────────────────────────────────────────

export function formatPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getCategoryLabel(key) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.key === key);
  return cat?.label || key;
}
