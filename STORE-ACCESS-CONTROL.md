# BudHound Store Access Control

> Single source of truth for multi-store data isolation, role-based access, and permission enforcement.

---

## 1. Store Registry

| Store ID | Name | Address | Phone |
|:--------:|------|---------|-------|
| 1 | Elevate Lompoc | 118 S H St, Lompoc, CA 93436 | (805) 819-0077 |
| 2 | One Plant Lompoc | 119 N A St, Lompoc, CA 93436 | (805) 741-7419 |
| 3 | Royal Healing Emporium | 721 W Central Ave, Suite D, Lompoc, CA 93436 | (805) 743-4848 |
| 4 | The Roots Dispensary | 805 W Laurel Ave, Lompoc, CA 93436 | (805) 291-3565 |
| 5 | Bleu Diamond Delivery | 1129 N H St, Lompoc, CA 93436 | (805) 310-1078 |
| 6 | MJ Direct | 715 E Ocean Ave, Lompoc, CA 93436 | (805) 430-8923 |
| 7 | Leaf Dispensary | 423 W Ocean Ave, Lompoc, CA 93436 | (805) 743-4771 |

Each store is a Drupal `commerce_store` entity (bundle: `online`). Every staff user is bound to exactly one store via `field_assigned_store` (entity reference, cardinality 1).

---

## 2. Role Definitions

| Role Machine Name | Display Label | Purpose |
|-------------------|---------------|---------|
| `store_owner` | Store Owner | Full store access: analytics, staff management, pricing, settings, compliance |
| `store_manager` | Manager | Day-to-day operations: orders, inventory, products, driver assignment, reports |
| `budtender` | Budtender | Counter sales (POS), view assigned orders/customers, ID verification |
| `delivery_driver` | Driver | View assigned orders, update delivery status, ID verification |

### Role hierarchy (most to least privileged)

```
store_owner (25 permissions)
  > store_manager (19 permissions)
    > budtender (9 permissions)
    > delivery_driver (5 permissions)
```

**Key restrictions by role:**

- **Owner only:** manage staff, manage settings, view tax reports, view compliance logs, manage pricing, view inventory audit log
- **Owner + Manager:** assign drivers, process refunds, manage inventory, manage products, view all sales, view customer purchase history, view sales/inventory reports, export reports
- **Budtender only:** sees own sales only, assigned orders only, assigned customers only
- **Driver only:** sees assigned orders only, can update order status (delivery transitions)

---

## 3. Permission Registry

28 permissions across 10 feature areas. Defined in `web/modules/custom/budhound_permissions/budhound_permissions.permissions.yml`.

### Dashboard
| Permission | Description |
|------------|-------------|
| `view store dashboard` | Access the management dashboard |
| `view store analytics` | View revenue charts and advanced analytics |

### Orders
| Permission | Description |
|------------|-------------|
| `view own store orders` | View all orders belonging to assigned store |
| `view assigned orders` | View only orders assigned to this user |
| `manage order status` | Update order status (processing, ready, out for delivery, etc.) |
| `assign delivery driver` | Assign a driver to an order |
| `process refunds` | Issue refunds on completed orders |

### Inventory
| Permission | Description |
|------------|-------------|
| `view store inventory` | View inventory levels for assigned store |
| `manage store inventory` | Adjust stock levels, receive shipments |
| `view inventory audit log` | View history of all inventory changes |

### Products
| Permission | Description |
|------------|-------------|
| `view store products` | View product catalog for assigned store |
| `manage store products` | Create, edit, delete products |
| `manage product pricing` | Edit product prices and discounts |

### Sales / POS
| Permission | Description |
|------------|-------------|
| `create sales transactions` | Process point-of-sale transactions |
| `view own sales` | View sales created by this user |
| `view all store sales` | View all sales for the store |

### Customers
| Permission | Description |
|------------|-------------|
| `view store customers` | View customer list and profiles |
| `view assigned customers` | View only customers assigned to this user |
| `view customer purchase history` | Access full purchase history for customers |

### Reports
| Permission | Description |
|------------|-------------|
| `view sales reports` | Access sales and revenue reports |
| `view tax reports` | Access excise and sales tax reports |
| `view inventory reports` | Access inventory movement and valuation reports |
| `export reports` | Download reports as CSV or PDF |

### Staff
| Permission | Description |
|------------|-------------|
| `manage store staff` | Invite, edit, deactivate staff members |
| `view store staff` | View team members |

### Settings
| Permission | Description |
|------------|-------------|
| `manage store settings` | Edit store profile, hours, delivery zones |

### Compliance
| Permission | Description |
|------------|-------------|
| `view compliance logs` | Access full audit trail of compliance-related actions |
| `perform id verification` | Verify customer identity at delivery |

---

## 4. Permission Matrix

Y = granted. Blank = denied.

| # | Permission | Owner | Manager | Budtender | Driver |
|---|------------|:-----:|:-------:|:---------:|:------:|
| | **Dashboard** | | | | |
| 1 | `view store dashboard` | Y | Y | Y | Y |
| 2 | `view store analytics` | Y | Y | | |
| | **Orders** | | | | |
| 3 | `view own store orders` | Y | Y | | |
| 4 | `view assigned orders` | | | Y | Y |
| 5 | `manage order status` | Y | Y | Y | Y |
| 6 | `assign delivery driver` | Y | Y | | |
| 7 | `process refunds` | Y | Y | | |
| | **Inventory** | | | | |
| 8 | `view store inventory` | Y | Y | Y | |
| 9 | `manage store inventory` | Y | Y | | |
| 10 | `view inventory audit log` | Y | | | |
| | **Products** | | | | |
| 11 | `view store products` | Y | Y | Y | |
| 12 | `manage store products` | Y | Y | | |
| 13 | `manage product pricing` | Y | | | |
| | **Sales / POS** | | | | |
| 14 | `create sales transactions` | Y | Y | Y | |
| 15 | `view own sales` | | | Y | |
| 16 | `view all store sales` | Y | Y | | |
| | **Customers** | | | | |
| 17 | `view store customers` | Y | Y | | |
| 18 | `view assigned customers` | | | Y | |
| 19 | `view customer purchase history` | Y | Y | | |
| | **Reports** | | | | |
| 20 | `view sales reports` | Y | Y | | |
| 21 | `view tax reports` | Y | | | |
| 22 | `view inventory reports` | Y | Y | | |
| 23 | `export reports` | Y | Y | | |
| | **Staff** | | | | |
| 24 | `manage store staff` | Y | | | |
| 25 | `view store staff` | Y | Y | | |
| | **Settings** | | | | |
| 26 | `manage store settings` | Y | | | |
| | **Compliance** | | | | |
| 27 | `view compliance logs` | Y | | | |
| 28 | `perform id verification` | Y | Y | Y | Y |

**Totals:** Owner = 25, Manager = 19, Budtender = 9, Driver = 5

---

## 5. Store Isolation Rules

Store data isolation is enforced at 3 independent layers. A breach at any single layer cannot expose another store's data.

### Layer 1: User-Store Binding

Every staff user has `field_assigned_store` (entity reference to `commerce_store`, cardinality 1). This is the foundation of all access control.

**File:** `web/modules/custom/budhound_store_access/src/Access/StoreAccessHandler.php`

```
StoreAccessHandler::getUserStoreId($account)
  -> User::load($uid)->get('field_assigned_store')->target_id
```

- Returns the single store ID assigned to a user
- Admins with `administer commerce_store` bypass all store checks

### Layer 2: JSON:API Auto-Filter

All JSON:API requests are automatically filtered by store_id before reaching entity access.

**File:** `web/modules/custom/budhound_store_access/src/EventSubscriber/JsonApiStoreFilterSubscriber.php`

- Runs at `KernelEvents::REQUEST` priority 100 (early in request stack)
- Auto-injects `filter[store_id][value]` for: `commerce_order`, `commerce_product`, `commerce_product_variation`
- Skips for anonymous users and platform admins
- **Cannot be bypassed** — even if the React client omits the filter, the server injects it

### Layer 3: Controller-Level Store Validation

Every custom API endpoint explicitly verifies entity ownership.

**File:** `web/modules/custom/budhound_api/src/Controller/BudhoundControllerBase.php`

```
$store_id = $this->getCurrentStoreId();      // Get user's store
$order->getStoreId() !== $store_id;          // Verify entity belongs to store
// Returns 403 if mismatch
```

Controllers that enforce this:
- `DashboardController::stats()` — filters orders by `store_id`
- `OrderController::updateStatus()` — verifies order belongs to store
- `OrderController::assignDriver()` — verifies BOTH order AND driver belong to same store
- `InventoryController::adjust()` — verifies product belongs to store
- `InventoryController::auditLog()` — returns logs keyed by store
- `StaffController::list()` — queries users with `field_assigned_store = store_id`
- `StaffController::invite()` — assigns new user to current store, prevents cross-store email reuse
- `ReportController::sales()` — queries orders by store_id
- `ReportController::tax()` — queries orders by store_id

---

## 6. Page Access by Role

What each role can see and do on each page of the React app.

### Dashboard (`/dashboard`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| Stat cards (orders, revenue) | All 4 | All 4 | Orders only | Orders only |
| Revenue chart | Y | Y | Hidden | Hidden |
| Orders summary | Y | Y | Y | Y |
| Top products | 5 items | 5 items | 3 items | Hidden |
| Stock alerts | Y | Y | Y | Hidden |
| Recent orders | Y | Y | Assigned only | Assigned only |

**Guard:** `PERMS.VIEW_DASHBOARD` (all 4 roles have it)
**Server-side:** DashboardController strips `total_revenue` and `average_order_value` for budtenders

### Orders (`/orders`, `/orders/:orderId`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| View all store orders | Y | Y | | |
| View assigned orders only | | | Y | Y |
| Update order status | Y | Y | Y | Y |
| Assign driver | Y | Y | | |
| Process refund | Y | Y | | |
| View customer info on order | Y | Y | | |

**Route guard:** None (relies on backend filtering)
**Sidebar permission:** `null` (visible to all roles)

### Inventory (`/inventory`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| View stock levels | Y | Y | Y | |
| Adjust stock | Y | Y | | |
| View audit log | Y | | | |

**Route guard:** `PERMS.VIEW_INVENTORY`
**Driver:** No access (no `view store inventory` permission)

### Products (`/products`, `/products/new`, `/products/:id/edit`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| View catalog | Y | Y | Y | |
| Create/edit product | Y | Y | | |
| Edit pricing | Y | | | |
| Delete product | Y | Y | | |

**Route guard:** `PERMS.VIEW_PRODUCTS` (list), `PERMS.MANAGE_PRODUCTS` (create/edit)
**Driver:** No access

### Sales / POS (`/pos`, `/sales`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| POS interface | Y | Y | Y | |
| View all sales history | Y | Y | | |
| View own sales only | | | Y | |

**Route guard:** `PERMS.CREATE_SALES`
**Driver:** No access

### Customers (`/customers`, `/customers/:id`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| View all customers | Y | Y | | |
| View assigned customers | | | Y | |
| View purchase history | Y | Y | | |
| ID verification | Y | Y | Y | Y |

**Route guard:** None (relies on backend filtering)

### Reports (`/reports`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| Sales report | Y | Y | | |
| Tax compliance report | Y | | | |
| Inventory report | Y | Y | | |
| Export CSV/PDF | Y | Y | | |

**Route guard:** `PERMS.VIEW_SALES_REPORTS`

### Staff (`/staff`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| View team members | Y | Y | | |
| Invite new member | Y | | | |

**Route guard:** `PERMS.VIEW_STAFF`

### Settings (`/settings`)

| Feature | Owner | Manager | Budtender | Driver |
|---------|:-----:|:-------:|:---------:|:------:|
| Edit store profile | Y | | | |

**Route guard:** `PERMS.MANAGE_SETTINGS`

---

## 7. API Endpoint Access Map

All endpoints defined in `web/modules/custom/budhound_api/budhound_api.routing.yml`. Authentication: OAuth2 or cookie. Permissions checked in controllers via `$this->checkPermission()`.

| Method | Endpoint | Required Permission | Store Scoped |
|--------|----------|-------------------|:------------:|
| GET | `/api/budhound/me` | Authenticated | Returns user's store |
| GET | `/api/budhound/dashboard` | `view store dashboard` | Y |
| POST | `/api/budhound/inventory/{id}/adjust` | `manage store inventory` | Y |
| GET | `/api/budhound/inventory/log` | `view inventory audit log` | Y |
| PATCH | `/api/budhound/orders/{id}/status` | `manage order status` | Y |
| PATCH | `/api/budhound/orders/{id}/assign-driver` | `assign delivery driver` | Y (both order + driver) |
| POST | `/api/budhound/orders/{id}/refund` | `process refunds` | Y |
| GET | `/api/budhound/reports/sales` | `view sales reports` | Y |
| GET | `/api/budhound/reports/tax` | `view tax reports` | Y |
| GET | `/api/budhound/staff` | `view store staff` | Y |
| POST | `/api/budhound/staff/invite` | `manage store staff` | Y |

### JSON:API Endpoints (auto-filtered by store)

| Method | Endpoint | Auto-Filtered |
|--------|----------|:-------------:|
| GET | `/jsonapi/commerce_order/default` | Y |
| GET | `/jsonapi/commerce_product/default` | Y |
| GET | `/jsonapi/commerce_product_variation/default` | Y |
| GET | `/jsonapi/profile/customer/{id}` | No (uses entity access) |
| GET | `/jsonapi/commerce_store/online/{id}` | No (filtered by user.store.id in React) |

---

## 8. Security Layers (Defense in Depth)

7 independent layers ensure no single point of failure can expose another store's data.

```
Request Flow:
  Browser
    -> [1] OAuth2 Token (JWT with user sub claim)
    -> [2] Drupal Route Guard (_user_is_logged_in)
    -> [3] JSON:API Store Filter Subscriber (auto-inject store_id)
    -> [4] Controller Permission Check ($user->hasPermission())
    -> [5] Controller Store Validation (entity.store_id === user.store_id)
    -> [6] Role Hierarchy Rules (budtender can't invite owners)
    -> Response (filtered data)
```

| Layer | What | Where | Protects Against |
|:-----:|------|-------|------------------|
| 1 | **OAuth2 authentication** | Simple OAuth v6 | Unauthenticated access |
| 2 | **Route-level auth guard** | `budhound_api.routing.yml` | Missing/expired tokens |
| 3 | **JSON:API auto-filter** | `JsonApiStoreFilterSubscriber` | Cross-store data leakage via JSON:API |
| 4 | **Permission check** | `BudhoundControllerBase::checkPermission()` | Unauthorized actions (e.g., budtender managing staff) |
| 5 | **Entity store validation** | Every controller method | Direct entity access by ID across stores |
| 6 | **Role hierarchy** | `StaffController::invite()` | Privilege escalation (e.g., budtender inviting owner) |
| 7 | **Frontend gating** | `RoleGuard`, `PermissionGate`, `Sidebar` | UI exposure of unauthorized features |

### Token Security
- Access tokens: in-memory only (React state), cleared on page close
- Refresh tokens: httpOnly cookie, never accessible to JavaScript
- Auto-refresh with deduplication (single inflight refresh at a time)
- Force logout on refresh failure

---

## 9. Test Accounts

All accounts are assigned to **Elevate Lompoc** (store_id: 1). Run these commands from Git Bash:

### Existing Account
```
Username: storeowner
Password: password
Role: store_owner
Store: Elevate Lompoc (1)
```

### Create Additional Test Accounts

```bash
# Store Manager
MSYS_NO_PATHCONV=1 docker exec budstore-drupal-1 bash -c "
  cd /opt/drupal &&
  vendor/bin/drush --uri=http://localhost:8081 user:create testmanager --mail=manager@elevate.test --password=password &&
  vendor/bin/drush --uri=http://localhost:8081 user:role:add store_manager testmanager &&
  vendor/bin/drush --uri=http://localhost:8081 php:eval \"
    \\\$user = user_load_by_name('testmanager');
    \\\$user->set('field_assigned_store', 1);
    \\\$user->save();
    echo 'Assigned testmanager to store 1';
  \"
"

# Budtender
MSYS_NO_PATHCONV=1 docker exec budstore-drupal-1 bash -c "
  cd /opt/drupal &&
  vendor/bin/drush --uri=http://localhost:8081 user:create testbudtender --mail=budtender@elevate.test --password=password &&
  vendor/bin/drush --uri=http://localhost:8081 user:role:add budtender testbudtender &&
  vendor/bin/drush --uri=http://localhost:8081 php:eval \"
    \\\$user = user_load_by_name('testbudtender');
    \\\$user->set('field_assigned_store', 1);
    \\\$user->save();
    echo 'Assigned testbudtender to store 1';
  \"
"

# Delivery Driver
MSYS_NO_PATHCONV=1 docker exec budstore-drupal-1 bash -c "
  cd /opt/drupal &&
  vendor/bin/drush --uri=http://localhost:8081 user:create testdriver --mail=driver@elevate.test --password=password &&
  vendor/bin/drush --uri=http://localhost:8081 user:role:add delivery_driver testdriver &&
  vendor/bin/drush --uri=http://localhost:8081 php:eval \"
    \\\$user = user_load_by_name('testdriver');
    \\\$user->set('field_assigned_store', 1);
    \\\$user->save();
    echo 'Assigned testdriver to store 1';
  \"
"
```

### Test Account Summary

| Username | Password | Role | Store | Can Access |
|----------|----------|------|-------|------------|
| `storeowner` | `password` | `store_owner` | Elevate Lompoc | Everything |
| `testmanager` | `password` | `store_manager` | Elevate Lompoc | Operations (no staff/settings/tax/compliance) |
| `testbudtender` | `password` | `budtender` | Elevate Lompoc | POS, assigned orders/customers |
| `testdriver` | `password` | `delivery_driver` | Elevate Lompoc | Assigned orders, delivery status |

### Verify OAuth Login

```bash
curl -s -X POST http://localhost:8081/oauth/token \
  -d "grant_type=password&client_id=budhound_management&username=storeowner&password=password"
```

---

## 10. Delivery Driver Implementation Notes

The `delivery_driver` role exists in Drupal but is **not yet integrated** into the BudHound React app or the `budhound_permissions` install hook.

### What needs to be added

#### Backend (Drupal)

**1. Add driver permissions to install hook**
File: `web/modules/custom/budhound_permissions/budhound_permissions.install`

```php
'delivery_driver' => [
  'view store dashboard',
  'view assigned orders',
  'manage order status',
  'perform id verification',
  'view store analytics' // Optional: remove if drivers shouldn't see analytics
],
```

**2. Add `delivery_driver` to assignable roles in StaffController**
File: `web/modules/custom/budhound_api/src/Controller/StaffController.php`

Add `'delivery_driver'` to the `ASSIGNABLE_ROLES` constant.

**3. Create the Drupal role if it doesn't exist**
```bash
MSYS_NO_PATHCONV=1 docker exec budstore-drupal-1 bash -c "
  cd /opt/drupal &&
  vendor/bin/drush --uri=http://localhost:8081 role:create delivery_driver 'Delivery Driver'
"
```

#### Frontend (React)

**4. Add driver role to permissions.js**
File: `budhound-management/src/utils/permissions.js`

```javascript
export const ROLES = {
  OWNER: 'store_owner',
  MANAGER: 'store_manager',
  BUDTENDER: 'budtender',
  DRIVER: 'delivery_driver',
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Store Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.BUDTENDER]: 'Budtender',
  [ROLES.DRIVER]: 'Driver',
};
```

**5. Add driver to route guard**
File: `budhound-management/src/routes.jsx`

```javascript
<RoleGuard roles={[ROLES.OWNER, ROLES.MANAGER, ROLES.BUDTENDER, ROLES.DRIVER]}>
```

**6. Add driver option to StaffPage invite form**
File: `budhound-management/src/components/staff/StaffPage.jsx`

```html
<option value="delivery_driver">Driver</option>
```

---

## 11. Known Gaps

| # | Gap | Severity | Location |
|---|-----|:--------:|----------|
| 1 | **Driver role not in React** | High | `routes.jsx`, `permissions.js` — driver users cannot log in to BudHound |
| 2 | **Driver role not in permission install** | High | `budhound_permissions.install` — driver has no BudHound permissions |
| 3 | **Orders route has no permission guard** | Medium | `routes.jsx` line 67 — relies solely on backend filtering |
| 4 | **Customers route has no permission guard** | Medium | `routes.jsx` line 83 — relies solely on backend filtering |
| 5 | **Orders sidebar has no permission filter** | Low | `Sidebar.jsx` line 30 — `permission: null` shows Orders to all roles |
| 6 | **Customers sidebar has no permission filter** | Low | `Sidebar.jsx` line 73 — `permission: null` shows Customers to all roles |
| 7 | **Admin user bypass** | By Design | Admin/uid=1 bypasses all store checks — platform team only |

### Gap Impact

- Gaps 1-2: Delivery drivers cannot use BudHound until the driver role is integrated
- Gaps 3-6: Low risk because backend still enforces store filtering and permission checks. Budtenders/drivers may see empty pages for orders/customers they shouldn't access. Adding frontend guards would improve UX by hiding inaccessible pages.
- Gap 7: Intentional — the `admin` account (uid 1) has `administrator` role which bypasses `StoreAccessHandler`. This is for platform-level administration only and should never be used for store operations.

---

## Source Files

| File | Purpose |
|------|---------|
| `web/modules/custom/budhound_permissions/budhound_permissions.permissions.yml` | Permission definitions (28) |
| `web/modules/custom/budhound_permissions/budhound_permissions.install` | Role-to-permission assignments |
| `web/modules/custom/budhound_store_access/src/Access/StoreAccessHandler.php` | User-store binding + access checks |
| `web/modules/custom/budhound_store_access/src/EventSubscriber/JsonApiStoreFilterSubscriber.php` | Auto-inject store filter on JSON:API |
| `web/modules/custom/budhound_api/src/Controller/BudhoundControllerBase.php` | Base controller (checkPermission, getCurrentStoreId) |
| `web/modules/custom/budhound_api/budhound_api.routing.yml` | API route definitions (13 routes) |
| `budhound-management/src/utils/permissions.js` | Frontend PERMS/ROLES constants |
| `budhound-management/src/routes.jsx` | Route guards (RoleGuard + permission) |
| `budhound-management/src/components/auth/RoleGuard.jsx` | Route-level access control |
| `budhound-management/src/components/auth/PermissionGate.jsx` | Component-level UI gating |
| `budhound-management/src/components/layout/Sidebar.jsx` | Permission-filtered navigation |
| `budhound-management/src/contexts/AuthContext.jsx` | Auth state + permission helpers |
