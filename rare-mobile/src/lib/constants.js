export const STYLE_CATEGORIES = {
  tees: {
    label: "Tees",
    styles: ["crew_tee", "vneck_tee", "long_sleeve", "tank", "raglan"],
  },
  hoodies: {
    label: "Hoodies & Sweatshirts",
    styles: ["pullover_hoodie", "zip_hoodie", "crewneck_sweat"],
  },
  hats: {
    label: "Hats",
    styles: ["snapback", "fitted", "trucker", "dad_hat", "beanie", "bucket_hat"],
  },
  accessories: {
    label: "Accessories",
    styles: ["tote", "socks", "face_mask"],
  },
};

export const COLOR_HEX_MAP = {
  black: "#000000",
  white: "#FFFFFF",
  heather_gray: "#B0B0B0",
  charcoal: "#36454F",
  navy: "#001F3F",
  royal_blue: "#4169E1",
  red: "#DC143C",
  burgundy: "#800020",
  forest_green: "#228B22",
  olive: "#808000",
  tan: "#D2B48C",
  brown: "#8B4513",
  orange: "#FF8C00",
  yellow: "#FFD700",
  pink: "#FF69B4",
  purple: "#800080",
  tie_dye: null,
  camo: "#78866B",
  natural: "#F5F5DC",
};

export const SIZE_ORDER = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL",
  "Youth S", "Youth M", "Youth L",
  "One Size", "S/M", "L/XL",
];

/** Map a style machine name to its parent category key. */
export function getStyleCategory(styleMachine) {
  for (const [category, config] of Object.entries(STYLE_CATEGORIES)) {
    if (config.styles.includes(styleMachine)) return category;
  }
  return null;
}

/**
 * Reverse lookup: map a style display name to its machine name.
 */
export const STYLE_NAME_TO_MACHINE = {
  "Crew Neck Tee": "crew_tee",
  "V-Neck Tee": "vneck_tee",
  "Long Sleeve Tee": "long_sleeve",
  "Tank Top": "tank",
  "Raglan": "raglan",
  "Pullover Hoodie": "pullover_hoodie",
  "Zip-Up Hoodie": "zip_hoodie",
  "Crewneck Sweatshirt": "crewneck_sweat",
  "Snapback Hat": "snapback",
  "Fitted Hat": "fitted",
  "Trucker Hat": "trucker",
  "Dad Hat": "dad_hat",
  "Beanie": "beanie",
  "Bucket Hat": "bucket_hat",
  "Tote Bag": "tote",
  "Socks": "socks",
  "Face Mask": "face_mask",
};

/** Map a color name to its machine name for hex lookup. */
export function colorToMachine(colorName) {
  return colorName.toLowerCase().replace(/\s+/g, "_");
}

export function formatPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
