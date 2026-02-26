export const ENDPOINTS = {
  // OAuth
  TOKEN: '/oauth/token',
  REVOKE: '/oauth/revoke',

  // Custom BudHound API
  ME: '/api/budhound/me',
  DASHBOARD: '/api/budhound/dashboard',
  INVENTORY_ADJUST: (variationId) => `/api/budhound/inventory/${variationId}/adjust`,
  INVENTORY_LOG: '/api/budhound/inventory/log',
  ORDER_STATUS: (orderId) => `/api/budhound/orders/${orderId}/status`,
  ORDER_ASSIGN_DRIVER: (orderId) => `/api/budhound/orders/${orderId}/assign-driver`,
  ORDER_REFUND: (orderId) => `/api/budhound/orders/${orderId}/refund`,
  ORDER_RECEIVE_PAYMENT: (orderId) => `/api/budhound/orders/${orderId}/receive-payment`,
  REPORT_SALES: '/api/budhound/reports/sales',
  REPORT_TAX: '/api/budhound/reports/tax',
  STAFF_LIST: '/api/budhound/staff',
  STAFF_INVITE: '/api/budhound/staff/invite',
  SALES_CREATE: '/api/budhound/sales/create',
  ORDERS_CREATE: '/api/budhound/orders/create',

  // JSON:API
  ORDERS: '/jsonapi/commerce_order/default',
  PRODUCTS: '/jsonapi/commerce_product/default',
  PRODUCT_VARIATIONS: '/jsonapi/commerce_product_variation/default',
};

// Product bundles on the BudHound site (bundle name → JSON:API resource type)
export const PRODUCT_BUNDLES = [
  'flower',
  'concentrate',
  'edible',
  'pre_roll',
  'tincture',
  'topical',
  'vape_cartridge',
  'cannabis_clone_seed',
  'accessory',
];

// Variation bundles matching the product bundles above
export const VARIATION_BUNDLES = [
  'flower_variation',
  'concentrate_variation',
  'edible_variation',
  'pre_roll_variation',
  'tincture_variation',
  'topical_variation',
  'vape_variation',
  'clone_seed_variation',
  'accessory_variation',
];
