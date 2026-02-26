# BudHound Store Management — Drupal Backend Implementation

## Overview

This document covers the complete Drupal Commerce backend setup required to power the Store Management React app. It includes role definitions, granular permissions, custom module architecture, JSON\:API configuration, and OAuth2 authentication setup.

---

## Step 1: Define Drupal Roles

Create these roles in addition to Drupal's default `authenticated` and `administrator` roles.

### Role Hierarchy

```
administrator (Drupal super admin — BudHound platform team)
  └── store_owner (Dispensary owner — full store access)
       └── store_manager (Day-to-day operations)
            └── budtender (Sales and customer-facing tasks)
```

### Drush Commands to Create Roles

```bash
drush role:create store_owner "Store Owner"
drush role:create store_manager "Store Manager"
drush role:create budtender "Budtender"
```

### Role Field: Store Assignment

Every non-admin user must be assigned to a store. Add a **Store Reference** field to the user entity:

```
Field name:    field_assigned_store
Field type:    Entity Reference → Commerce Store
Cardinality:   1 (one store per user)
Required:      Yes (for store_owner, store_manager, budtender)
```

This field is the foundation of all data isolation — every query filters by the user's `field_assigned_store` value.

---

## Step 2: Custom Permissions Module

Create a custom module to define granular permissions beyond Drupal's defaults.

### Module: `budhound_permissions`

**budhound_permissions.info.yml**
```yaml
name: 'BudHound Permissions'
type: module
description: 'Granular role-based permissions for BudHound store management.'
core_version_requirement: ^10
package: BudHound
dependencies:
  - drupal:user
  - commerce:commerce_order
  - commerce:commerce_product
  - commerce:commerce_store
```

**budhound_permissions.permissions.yml**
```yaml
# ── Dashboard ──
'view store dashboard':
  title: 'View store dashboard'
  description: 'Access the management dashboard'

'view store analytics':
  title: 'View store analytics'
  description: 'View revenue charts and advanced analytics'

# ── Orders ──
'view own store orders':
  title: 'View own store orders'
  description: 'View orders belonging to assigned store'

'view assigned orders':
  title: 'View assigned orders only'
  description: 'View only orders assigned to this user'

'manage order status':
  title: 'Manage order status'
  description: 'Update order status (processing, ready, out for delivery, etc.)'

'assign delivery driver':
  title: 'Assign delivery driver'
  description: 'Assign a driver to an order'

'process refunds':
  title: 'Process refunds'
  description: 'Issue refunds on completed orders'

# ── Inventory ──
'view store inventory':
  title: 'View store inventory'
  description: 'View inventory levels for assigned store'

'manage store inventory':
  title: 'Manage store inventory'
  description: 'Adjust stock levels, receive shipments'

'view inventory audit log':
  title: 'View inventory audit log'
  description: 'View history of all inventory changes'

# ── Products ──
'view store products':
  title: 'View store products'
  description: 'View product catalog for assigned store'

'manage store products':
  title: 'Manage store products'
  description: 'Create, edit, delete products'

'manage product pricing':
  title: 'Manage product pricing'
  description: 'Edit product prices and discounts'

# ── Sales / POS ──
'create sales transactions':
  title: 'Create sales transactions'
  description: 'Process point-of-sale transactions'

'view own sales':
  title: 'View own sales'
  description: 'View sales created by this user'

'view all store sales':
  title: 'View all store sales'
  description: 'View all sales for the store'

# ── Customers ──
'view store customers':
  title: 'View store customers'
  description: 'View customer list and profiles'

'view assigned customers':
  title: 'View assigned customers'
  description: 'View only customers assigned to this user'

'view customer purchase history':
  title: 'View customer purchase history'
  description: 'Access full purchase history for customers'

# ── Reports ──
'view sales reports':
  title: 'View sales reports'
  description: 'Access sales and revenue reports'

'view tax reports':
  title: 'View tax compliance reports'
  description: 'Access excise and sales tax reports'

'view inventory reports':
  title: 'View inventory reports'
  description: 'Access inventory movement and valuation reports'

'export reports':
  title: 'Export reports'
  description: 'Download reports as CSV or PDF'

# ── Staff ──
'manage store staff':
  title: 'Manage store staff'
  description: 'Invite, edit, deactivate staff members'

'view store staff':
  title: 'View store staff'
  description: 'View team members and schedules'

# ── Settings ──
'manage store settings':
  title: 'Manage store settings'
  description: 'Edit store profile, hours, delivery zones'

# ── Compliance ──
'view compliance logs':
  title: 'View compliance audit logs'
  description: 'Access full audit trail of compliance-related actions'

'perform id verification':
  title: 'Perform ID verification'
  description: 'Verify customer identity at delivery'
```

### Permission-to-Role Mapping

Apply permissions to roles. Create an install hook or use Drush:

**budhound_permissions.install**
```php
<?php

use Drupal\user\Entity\Role;

/**
 * Implements hook_install().
 */
function budhound_permissions_install() {
  $role_permissions = [
    'store_owner' => [
      'view store dashboard',
      'view store analytics',
      'view own store orders',
      'manage order status',
      'assign delivery driver',
      'process refunds',
      'view store inventory',
      'manage store inventory',
      'view inventory audit log',
      'view store products',
      'manage store products',
      'manage product pricing',
      'create sales transactions',
      'view all store sales',
      'view store customers',
      'view customer purchase history',
      'view sales reports',
      'view tax reports',
      'view inventory reports',
      'export reports',
      'manage store staff',
      'view store staff',
      'manage store settings',
      'view compliance logs',
      'perform id verification',
    ],
    'store_manager' => [
      'view store dashboard',
      'view store analytics',
      'view own store orders',
      'manage order status',
      'assign delivery driver',
      'process refunds',
      'view store inventory',
      'manage store inventory',
      'view store products',
      'manage store products',
      // NOTE: No 'manage product pricing'
      'create sales transactions',
      'view all store sales',
      'view store customers',
      'view customer purchase history',
      'view sales reports',
      'view inventory reports',
      'export reports',
      'view store staff',
      // NOTE: No 'manage store staff', 'manage store settings', 'view tax reports'
      'perform id verification',
    ],
    'budtender' => [
      'view store dashboard',
      // NOTE: No 'view store analytics'
      'view assigned orders',
      'manage order status',
      'view store inventory',
      // NOTE: No 'manage store inventory'
      'view store products',
      // NOTE: No product management
      'create sales transactions',
      'view own sales',
      'view assigned customers',
      // NOTE: No reports, no staff, no settings
      'perform id verification',
    ],
  ];

  foreach ($role_permissions as $role_id => $permissions) {
    $role = Role::load($role_id);
    if ($role) {
      foreach ($permissions as $permission) {
        $role->grantPermission($permission);
      }
      $role->save();
    }
  }
}
```

---

## Step 3: Store-Scoped Access Control Module

This is the critical module that enforces data isolation per store.

### Module: `budhound_store_access`

**src/Access/StoreAccessHandler.php**
```php
<?php

namespace Drupal\budhound_store_access\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountInterface;

/**
 * Provides helper methods for store-scoped access checking.
 */
class StoreAccessHandler {

  /**
   * Get the store ID assigned to a user.
   */
  public static function getUserStoreId(AccountInterface $account): ?string {
    $user = \Drupal\user\Entity\User::load($account->id());
    if ($user && $user->hasField('field_assigned_store') && !$user->get('field_assigned_store')->isEmpty()) {
      return $user->get('field_assigned_store')->target_id;
    }
    return NULL;
  }

  /**
   * Check if user has access to a specific store's data.
   */
  public static function userCanAccessStore(AccountInterface $account, string $store_id): AccessResult {
    // Administrators bypass store checks.
    if ($account->hasPermission('administer commerce_store')) {
      return AccessResult::allowed()->cachePerUser();
    }

    $user_store_id = self::getUserStoreId($account);

    if ($user_store_id && $user_store_id === $store_id) {
      return AccessResult::allowed()->cachePerUser();
    }

    return AccessResult::forbidden('User does not belong to this store.')
      ->cachePerUser();
  }
}
```

**src/EventSubscriber/JsonApiStoreFilterSubscriber.php**

This subscriber automatically injects the store filter into all JSON\:API requests so the React app can never accidentally (or maliciously) access another store's data:

```php
<?php

namespace Drupal\budhound_store_access\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Drupal\budhound_store_access\Access\StoreAccessHandler;

/**
 * Injects store_id filter into JSON:API requests.
 */
class JsonApiStoreFilterSubscriber implements EventSubscriberInterface {

  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => ['onRequest', 100],
    ];
  }

  public function onRequest(RequestEvent $event) {
    $request = $event->getRequest();
    $path = $request->getPathInfo();

    // Only apply to JSON:API routes.
    if (strpos($path, '/jsonapi/') !== 0) {
      return;
    }

    $current_user = \Drupal::currentUser();
    if ($current_user->isAnonymous()) {
      return;
    }

    // Skip for platform administrators.
    if ($current_user->hasPermission('administer commerce_store')) {
      return;
    }

    $store_id = StoreAccessHandler::getUserStoreId($current_user);
    if (!$store_id) {
      return;
    }

    // Auto-inject store filter for commerce entities.
    $store_filtered_types = [
      'commerce_order',
      'commerce_product',
      'commerce_product_variation',
    ];

    foreach ($store_filtered_types as $type) {
      if (strpos($path, "/jsonapi/{$type}/") !== false ||
          str_ends_with($path, "/jsonapi/{$type}")) {
        $request->query->set('filter[store_id][value]', $store_id);
        break;
      }
    }
  }
}
```

Register the subscriber in `budhound_store_access.services.yml`:
```yaml
services:
  budhound_store_access.jsonapi_store_filter:
    class: Drupal\budhound_store_access\EventSubscriber\JsonApiStoreFilterSubscriber
    tags:
      - { name: event_subscriber }
```

---

## Step 4: OAuth2 Authentication Setup

### Install Simple OAuth

```bash
composer require drupal/simple_oauth
drush en simple_oauth -y
```

### Generate Keys

```bash
# Generate RSA keys for JWT signing
openssl genrsa -out /var/www/html/keys/private.key 2048
openssl rsa -in /var/www/html/keys/private.key -pubout -o /var/www/html/keys/public.key
chmod 600 /var/www/html/keys/private.key
chmod 644 /var/www/html/keys/public.key
```

### Configure Simple OAuth

1. Navigate to: `/admin/config/people/simple_oauth`
2. Set private key path: `/var/www/html/keys/private.key`
3. Set public key path: `/var/www/html/keys/public.key`
4. Access token expiration: `3600` (1 hour)
5. Refresh token expiration: `1209600` (14 days)

### Create OAuth Client (Consumer)

Navigate to `/admin/config/services/consumer/add`:

```
Label:                BudHound Management App
Client ID:            budhound_management
Is Confidential:      No (public client — SPA)
Redirect URI:         https://manage.budhound.app/callback
Default Scopes:       store_owner store_manager budtender
```

### Token Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/oauth/token` | POST | Get access + refresh token |
| `/oauth/token` | POST | Refresh expired access token |
| `/oauth/revoke` | POST | Logout / revoke tokens |

**Login Request:**
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=budhound_management
&username=owner@dispensary.com
&password=securepassword
```

**Refresh Request:**
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=budhound_management
&refresh_token={refresh_token}
```

---

## Step 5: Custom API Endpoints

JSON\:API handles standard CRUD for entities. These custom REST endpoints handle business logic that JSON\:API can't.

### Module: `budhound_api`

**budhound_api.routing.yml**
```yaml
# ── Current User Info (with roles, store, permissions) ──
budhound_api.me:
  path: '/api/budhound/me'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\UserController::me'
  requirements:
    _permission: 'access content'
  methods: [GET]

# ── Dashboard Stats ──
budhound_api.dashboard:
  path: '/api/budhound/dashboard'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\DashboardController::stats'
  requirements:
    _permission: 'view store dashboard'
  methods: [GET]

# ── Inventory Adjustment ──
budhound_api.inventory_adjust:
  path: '/api/budhound/inventory/{product_variation_id}/adjust'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\InventoryController::adjust'
  requirements:
    _permission: 'manage store inventory'
  methods: [POST]

# ── Inventory Audit Log ──
budhound_api.inventory_log:
  path: '/api/budhound/inventory/log'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\InventoryController::auditLog'
  requirements:
    _permission: 'view inventory audit log'
  methods: [GET]

# ── Order Status Update ──
budhound_api.order_status:
  path: '/api/budhound/orders/{order_id}/status'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\OrderController::updateStatus'
  requirements:
    _permission: 'manage order status'
  methods: [PATCH]

# ── Assign Driver to Order ──
budhound_api.order_assign_driver:
  path: '/api/budhound/orders/{order_id}/assign-driver'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\OrderController::assignDriver'
  requirements:
    _permission: 'assign delivery driver'
  methods: [PATCH]

# ── Process Refund ──
budhound_api.refund:
  path: '/api/budhound/orders/{order_id}/refund'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\OrderController::refund'
  requirements:
    _permission: 'process refunds'
  methods: [POST]

# ── Sales Reports ──
budhound_api.report_sales:
  path: '/api/budhound/reports/sales'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\ReportController::sales'
  requirements:
    _permission: 'view sales reports'
  methods: [GET]

# ── Tax Report ──
budhound_api.report_tax:
  path: '/api/budhound/reports/tax'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\ReportController::tax'
  requirements:
    _permission: 'view tax reports'
  methods: [GET]

# ── Staff Management ──
budhound_api.staff_list:
  path: '/api/budhound/staff'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\StaffController::list'
  requirements:
    _permission: 'view store staff'
  methods: [GET]

budhound_api.staff_invite:
  path: '/api/budhound/staff/invite'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\StaffController::invite'
  requirements:
    _permission: 'manage store staff'
  methods: [POST]
```

### Key Controller: `/api/budhound/me`

This endpoint is called immediately after login to populate the React AuthContext:

**src/Controller/UserController.php**
```php
<?php

namespace Drupal\budhound_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\budhound_store_access\Access\StoreAccessHandler;

class UserController extends ControllerBase {

  public function me(): JsonResponse {
    $user = $this->entityTypeManager()->getStorage('user')->load($this->currentUser()->id());

    $roles = $user->getRoles(TRUE); // Exclude 'authenticated'
    $store_id = StoreAccessHandler::getUserStoreId($this->currentUser());

    // Load store details if assigned.
    $store_data = NULL;
    if ($store_id) {
      $store = $this->entityTypeManager()->getStorage('commerce_store')->load($store_id);
      if ($store) {
        $store_data = [
          'id' => $store->id(),
          'name' => $store->getName(),
          'timezone' => $store->getTimezone(),
        ];
      }
    }

    // Collect all granted permissions for client-side checks.
    $all_permissions = [];
    $role_storage = $this->entityTypeManager()->getStorage('user_role');
    foreach ($roles as $role_id) {
      $role = $role_storage->load($role_id);
      if ($role) {
        $all_permissions = array_merge($all_permissions, $role->getPermissions());
      }
    }
    // Filter to only budhound-specific permissions.
    $bh_permissions = array_values(array_filter(array_unique($all_permissions), function ($perm) {
      return strpos($perm, 'view store') === 0 ||
             strpos($perm, 'manage store') === 0 ||
             strpos($perm, 'view own') === 0 ||
             strpos($perm, 'view all') === 0 ||
             strpos($perm, 'create sales') === 0 ||
             strpos($perm, 'process refund') === 0 ||
             strpos($perm, 'assign delivery') === 0 ||
             strpos($perm, 'manage order') === 0 ||
             strpos($perm, 'manage product') === 0 ||
             strpos($perm, 'view assigned') === 0 ||
             strpos($perm, 'view customer') === 0 ||
             strpos($perm, 'view sales') === 0 ||
             strpos($perm, 'view tax') === 0 ||
             strpos($perm, 'view inventory') === 0 ||
             strpos($perm, 'view compliance') === 0 ||
             strpos($perm, 'export report') === 0 ||
             strpos($perm, 'perform id') === 0;
    }));

    return new JsonResponse([
      'id' => $user->id(),
      'email' => $user->getEmail(),
      'name' => $user->getDisplayName(),
      'roles' => $roles,
      'store' => $store_data,
      'permissions' => $bh_permissions,
    ]);
  }
}
```

### Key Controller: Dashboard Stats

**src/Controller/DashboardController.php** (structure)
```php
public function stats(Request $request): JsonResponse {
  $store_id = StoreAccessHandler::getUserStoreId($this->currentUser());
  $range = $request->query->get('range', 'today'); // today, week, month

  // Query orders for this store within date range.
  // Calculate: total_revenue, order_count, avg_order_value, top_products.
  // For budtender role: only return their own sales summary.

  $is_budtender = in_array('budtender', $this->currentUser()->getRoles());

  return new JsonResponse([
    'period' => $range,
    'total_revenue' => $total_revenue,       // Omitted for budtender
    'order_count' => $order_count,
    'average_order_value' => $avg,            // Omitted for budtender
    'orders_by_status' => $status_breakdown,
    'top_products' => $top_products,          // Limited for budtender
    'low_stock_alerts' => $low_stock_count,
    'pending_deliveries' => $pending,
  ]);
}
```

---

## Step 6: Inventory Tracking Entity

Drupal Commerce doesn't have built-in inventory tracking with audit logs. Create a custom entity.

### Custom Entity: `budhound_inventory_log`

Fields:
| Field | Type | Description |
|---|---|---|
| `id` | Serial | Primary key |
| `product_variation_id` | Entity Reference | Which product variation |
| `store_id` | Entity Reference | Which store |
| `adjustment_type` | List (string) | `received`, `sold`, `damaged`, `returned`, `correction` |
| `quantity_change` | Integer | Positive or negative |
| `quantity_before` | Integer | Stock level before change |
| `quantity_after` | Integer | Stock level after change |
| `reason` | String (long) | Human-readable reason |
| `performed_by` | Entity Reference (User) | Who made the adjustment |
| `created` | Timestamp | When it happened |

This creates an immutable audit trail — entries are never updated or deleted.

### Stock Level Tracking

Add a `field_stock_quantity` (integer) field to `commerce_product_variation`. The inventory adjustment endpoint:

1. Loads the product variation
2. Validates the user's store matches the product's store
3. Records current quantity as `quantity_before`
4. Applies the adjustment
5. Records new quantity as `quantity_after`
6. Creates an `budhound_inventory_log` entry
7. If stock drops below threshold → triggers low stock notification

---

## Step 7: JSON\:API Configuration

### Enable Required Modules

```bash
drush en jsonapi jsonapi_extras serialization -y
```

### Configure JSON\:API (via jsonapi_extras)

Navigate to `/admin/config/services/jsonapi` and configure:

1. **Resource overrides** — Disable exposing sensitive fields:
   - User entity: Hide `pass`, `init`, `login`, `access`
   - Expose `field_assigned_store`, `roles`

2. **Include paths** — Allow nested includes for efficient fetching:
   ```
   GET /jsonapi/commerce_order/default?include=order_items,order_items.purchased_entity
   ```

3. **Sparse fieldsets** — React app should request only needed fields:
   ```
   GET /jsonapi/commerce_product/default?fields[commerce_product--default]=title,field_image,variations
   ```

### CORS Configuration

In `services.yml` or `default.services.yml`:

```yaml
cors.config:
  enabled: true
  allowedHeaders:
    - authorization
    - content-type
    - x-csrf-token
  allowedMethods:
    - GET
    - POST
    - PATCH
    - DELETE
    - OPTIONS
  allowedOrigins:
    - 'https://manage.budhound.app'
    - 'http://localhost:3000'  # Development
  exposedHeaders: false
  maxAge: 3600
  supportsCredentials: true
```

---

## Step 8: Required Drupal Modules Summary

```bash
# Core/Commerce
composer require drupal/commerce
composer require drupal/commerce_cart_api

# Authentication
composer require drupal/simple_oauth

# API
composer require drupal/jsonapi_extras

# Utility
composer require drupal/token
composer require drupal/pathauto
composer require drupal/admin_toolbar

# Custom modules (enable after creation)
drush en budhound_permissions -y
drush en budhound_store_access -y
drush en budhound_api -y
drush en budhound_inventory -y
```

---

## Step 9: Database Considerations

### Indexes for Performance

```sql
-- Fast order lookups by store
ALTER TABLE commerce_order
ADD INDEX idx_store_id (store_id);

-- Fast inventory log queries
ALTER TABLE budhound_inventory_log
ADD INDEX idx_store_variation (store_id, product_variation_id),
ADD INDEX idx_store_created (store_id, created);

-- User store lookup
ALTER TABLE user__field_assigned_store
ADD INDEX idx_field_assigned_store (field_assigned_store_target_id);
```

### Caching Strategy

- **Entity cache**: Drupal's built-in entity cache handles most reads
- **JSON\:API cache**: Enable `jsonapi` cache tags for automatic invalidation
- **Dashboard stats**: Cache for 5 minutes with cache tags per store
- **Redis**: Use Redis for cache backend in production

---

## Testing Checklist

- [ ] Store Owner can see all store data but NOT other stores
- [ ] Manager cannot change product pricing
- [ ] Budtender can only see own sales and assigned orders
- [ ] Anonymous requests return 401 on all `/api/budhound/` routes
- [ ] Expired tokens return 401 and client refreshes automatically
- [ ] Inventory adjustments create audit log entries
- [ ] Store filter is injected server-side (even if client omits it)
- [ ] OAuth tokens contain correct role scopes
- [ ] CORS blocks requests from unauthorized origins

---

## Related Documents

- **[01-STORE-MANAGEMENT-ARCHITECTURE.md](./01-STORE-MANAGEMENT-ARCHITECTURE.md)** — Overall architecture and planning
- **[03-REACT-FRONTEND-IMPLEMENTATION.md](./03-REACT-FRONTEND-IMPLEMENTATION.md)** — React app implementation
