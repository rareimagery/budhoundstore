// ── Permission string constants (must match Drupal) ──
export const PERMS = {
  // Dashboard
  VIEW_DASHBOARD: 'view store dashboard',
  VIEW_ANALYTICS: 'view store analytics',

  // Orders
  VIEW_STORE_ORDERS: 'view own store orders',
  VIEW_ASSIGNED_ORDERS: 'view assigned orders',
  MANAGE_ORDER_STATUS: 'manage order status',
  ASSIGN_DRIVER: 'assign delivery driver',
  PROCESS_REFUNDS: 'process refunds',

  // Inventory
  VIEW_INVENTORY: 'view store inventory',
  MANAGE_INVENTORY: 'manage store inventory',
  VIEW_INVENTORY_LOG: 'view inventory audit log',

  // Products
  VIEW_PRODUCTS: 'view store products',
  MANAGE_PRODUCTS: 'manage store products',
  MANAGE_PRICING: 'manage product pricing',

  // Sales
  CREATE_SALES: 'create sales transactions',
  VIEW_OWN_SALES: 'view own sales',
  VIEW_ALL_SALES: 'view all store sales',

  // Customers
  VIEW_CUSTOMERS: 'view store customers',
  VIEW_ASSIGNED_CUSTOMERS: 'view assigned customers',
  VIEW_PURCHASE_HISTORY: 'view customer purchase history',

  // Reports
  VIEW_SALES_REPORTS: 'view sales reports',
  VIEW_TAX_REPORTS: 'view tax reports',
  VIEW_INVENTORY_REPORTS: 'view inventory reports',
  EXPORT_REPORTS: 'export reports',

  // Staff
  MANAGE_STAFF: 'manage store staff',
  VIEW_STAFF: 'view store staff',

  // Settings
  MANAGE_SETTINGS: 'manage store settings',

  // Compliance
  VIEW_COMPLIANCE: 'view compliance logs',
  VERIFY_ID: 'perform id verification',
};

// ── Role constants ──
export const ROLES = {
  OWNER: 'store_owner',
  MANAGER: 'store_manager',
  BUDTENDER: 'budtender',
};

// ── Role display labels ──
export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Store Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.BUDTENDER]: 'Budtender',
};
