const EXCISE_TAX_RATE = 0.15;
const SALES_TAX_RATE = 0.0925; // Lompoc rate

export function calculateTaxes(subtotal) {
  const exciseTax = subtotal * EXCISE_TAX_RATE;
  const salesTax = (subtotal + exciseTax) * SALES_TAX_RATE;
  const total = subtotal + exciseTax + salesTax;
  return {
    subtotal: round(subtotal),
    excise_tax: round(exciseTax),
    sales_tax: round(salesTax),
    total: round(total),
  };
}

function round(n) { return Math.round(n * 100) / 100; }

// Maps product bundle machine names to display labels
export const PRODUCT_CATEGORY_MAP = {
  flower: 'Flower',
  pre_roll: 'Pre-Rolls',
  vape_cartridge: 'Vapes / Cartridges',
  concentrate: 'Concentrates',
  edible: 'Edibles',
  tincture: 'Tinctures',
  topical: 'Topicals',
  cannabis_clone_seed: 'Clones / Seeds',
  accessory: 'Accessories',
};

export const PRODUCT_CATEGORIES = Object.entries(PRODUCT_CATEGORY_MAP).map(
  ([value, label]) => ({ value, label })
);

export const ORDER_STATUS_FLOW = [
  { key: 'draft',            label: 'Draft',               color: 'gray' },
  { key: 'placed',           label: 'Placed',              color: 'yellow' },
  { key: 'processing',       label: 'Processing',          color: 'blue' },
  { key: 'ready',            label: 'Ready',               color: 'indigo' },
  { key: 'out_for_delivery', label: 'Out for Delivery',    color: 'purple' },
  { key: 'pickup_ready',     label: 'Pickup Ready',        color: 'indigo' },
  { key: 'delivered',        label: 'Delivered',            color: 'teal' },
  { key: 'cod_pending',      label: 'Awaiting COD Payment', color: 'orange' },
  { key: 'completed',        label: 'Completed',           color: 'green' },
  { key: 'canceled',         label: 'Canceled',            color: 'red' },
];
