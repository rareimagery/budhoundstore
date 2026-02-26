# BudStore — Drupal Roles & Permissions

## Role Hierarchy

```
administrator          (Drupal built-in — full system access)
│
├── dispensary_owner   (top of store hierarchy)
│     └── manages: products, orders, payments, promotions, taxes, staff
│
├── dispensary_manager (day-to-day store operations)
│     └── manages: products, orders
│
├── budtender          (in-store / counter staff)
│     └── can: view products, view & update orders
│
├── delivery_driver    (delivery staff only)
│     └── can: view & update delivery orders
│
├── authenticated      (registered customer)
│     └── can: shop, checkout, view own orders
│
└── anonymous          (public visitor)
      └── can: browse products and store listings
```

---

## Role Definitions

### 1. `administrator`
- Built-in Drupal role. Implicitly has all permissions.
- Reserved for the site developer / hosting admin.
- **Do not assign to dispensary staff.**

---

### 2. `dispensary_owner`
Top-level role for the owner of a dispensary location.

#### Admin UI
| Permission | Purpose |
|---|---|
| `access administration pages` | Access `/admin` routes |
| `access toolbar` | See the black Drupal admin toolbar |
| `view the administration theme` | See Seven/Gin theme when in admin |
| `access content overview` | `/admin/content` listing |
| `access contextual links` | Edit links on front-end |
| `access files overview` | Manage uploaded files |
| `access user profiles` | View staff profiles |

#### Commerce — Store
| Permission | Purpose |
|---|---|
| `administer commerce_store` | Create/edit store entities |
| `view commerce_store` | View store detail |

#### Commerce — Products
| Permission | Purpose |
|---|---|
| `administer commerce_product` | Full product administration |
| `administer commerce_product_type` | Create/edit product types |
| `view commerce_product` | View products |
| `create {type} commerce_product` | Per-type create (all 10 types) |
| `update any {type} commerce_product` | Per-type update (all 10 types) |
| `delete any {type} commerce_product` | Per-type delete (all 10 types) |

#### Commerce — Orders & Payments
| Permission | Purpose |
|---|---|
| `administer commerce_order` | Full order administration |
| `administer commerce_payment` | Full payment administration |
| `administer commerce_promotion` | Manage discounts & coupons |
| `administer commerce_tax` | Manage tax rates |
| `view commerce_order` | View all orders |
| `view own commerce_order` | View their own orders |
| `update default commerce_order` | Edit order fields/status |

#### User Management
| Permission | Purpose |
|---|---|
| `administer users` | Create/edit/disable user accounts |
| `assign dispensary_manager role` | Promote staff to manager |
| `assign budtender role` | Assign budtender role to staff |
| `assign delivery_driver role` | Assign delivery driver role |

#### Text Formats
| Permission | Purpose |
|---|---|
| `use text format basic_html` | Product descriptions |
| `use text format restricted_html` | Simple text fields |

---

### 3. `dispensary_manager`
Day-to-day manager. Can manage all products and orders but **cannot** administer the store, payment gateways, or user accounts.

#### Admin UI
| Permission | Purpose |
|---|---|
| `access administration pages` | Access `/admin` routes |
| `access toolbar` | See the black Drupal admin toolbar |
| `view the administration theme` | See Seven/Gin theme when in admin |
| `access content overview` | `/admin/content` listing |
| `access contextual links` | Edit links on front-end |
| `access files overview` | Upload/manage product images |
| `access user profiles` | View staff profiles |

#### Commerce — Products *(all 10 product types)*
| Permission | Purpose |
|---|---|
| `create {type} commerce_product` | Add new products |
| `update any {type} commerce_product` | Edit any product |
| `delete any {type} commerce_product` | Delete any product |
| `delete own {type} commerce_product` | Delete products they created |
| `view commerce_product` | View products |

#### Commerce — Orders
| Permission | Purpose |
|---|---|
| `view commerce_order` | View all orders |
| `view own commerce_order` | View their own orders |
| `update default commerce_order` | Update order status |

#### Store & Text Formats
| Permission | Purpose |
|---|---|
| `view commerce_store` | View store detail |
| `use text format basic_html` | Product descriptions (rich text) |
| `use text format restricted_html` | Simple text fields |

---

### 4. `budtender`
In-store counter staff. Can look up products and process walk-in orders. **Cannot** create or delete products.

| Permission | Purpose |
|---|---|
| `access administration pages` | Access `/admin` routes |
| `access toolbar` | See the admin toolbar |
| `view the administration theme` | See admin theme |
| `access content` | View content |
| `access user profiles` | Look up customer profiles |
| `view commerce_product` | Browse products |
| `view commerce_store` | View store info |
| `view commerce_order` | Look up any order |
| `view own commerce_order` | View their own orders |
| `update default commerce_order` | Update order status (e.g. mark ready for pickup) |

---

### 5. `delivery_driver`
Delivery-only staff. Can see orders assigned to them and mark them delivered.

| Permission | Purpose |
|---|---|
| `access content` | Basic content access |
| `view commerce_order` | View orders |
| `view own commerce_order` | View their own assigned orders |
| `update default commerce_order` | Mark order as delivered |

---

### 6. `authenticated` (registered customer)
Standard customer account.

| Permission | Purpose |
|---|---|
| `access checkout` | Complete checkout |
| `access content` | View site content |
| `view commerce_product` | Browse products |
| `view commerce_store` | View store pages |
| `view own commerce_order` | Order history |
| `manage own commerce_payment_method` | Save payment methods |
| `use text format basic_html` | Write reviews/comments |

---

### 7. `anonymous` (public visitor)
Not logged in.

| Permission | Purpose |
|---|---|
| `access checkout` | Guest checkout |
| `access content` | View site content |
| `view commerce_product` | Browse products |
| `view commerce_store` | View store listings |
| `search content` | Search the site |
| `use text format restricted_html` | Basic text |

---

## Product Types

| Machine Name | Label |
|---|---|
| `accessory` | Accessory |
| `cannabis_clone_seed` | Cannabis Clone / Seed |
| `concentrate` | Concentrate |
| `default` | Default |
| `edible` | Edible |
| `flower` | Flower |
| `pre_roll` | Pre-Roll |
| `tincture` | Tincture |
| `topical` | Topical |
| `vape_cartridge` | Vape / Cartridge |

---

## Applying to Drupal

### One-time setup (PowerShell)

```powershell
# 1. Copy script into container
docker cp "c:\BudStore\setup-roles-permissions.php" "budstore-drupal-1:/var/www/html/setup-roles-permissions.php"

# 2. Run it
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush php-script /var/www/html/setup-roles-permissions.php
```

### Verify via Drush

```powershell
# Show all roles and their permissions
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush role:list

# Show permissions for one role
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush role:perm:list dispensary_manager
```

### Verify via Admin UI

| URL | What to check |
|---|---|
| `http://localhost:8080/admin/people/roles` | All roles listed |
| `http://localhost:8080/admin/people/permissions` | Full permissions grid |
| `http://localhost:8080/admin/people` | Assign roles to users |

---

## Creating Staff Users (Drush)

```powershell
# Create a dispensary owner
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:create owner1 --mail="owner@budstore.com" --password="SecurePass123"
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:role:add dispensary_owner owner1

# Create a manager
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:create manager1 --mail="manager@budstore.com" --password="SecurePass123"
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:role:add dispensary_manager manager1

# Create a budtender
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:create budtender1 --mail="bud@budstore.com" --password="SecurePass123"
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:role:add budtender budtender1

# Create a delivery driver
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:create driver1 --mail="driver@budstore.com" --password="SecurePass123"
docker exec budstore-drupal-1 /var/www/html/vendor/bin/drush user:role:add delivery_driver driver1
```

---

## Notes

- The `dispensary_owner` role can assign `dispensary_manager`, `budtender`, and `delivery_driver` roles to staff via `/admin/people` — but **cannot** grant `administrator` or `dispensary_owner` to anyone. Only a Drupal administrator can elevate to those levels.
- All Commerce product permissions are applied per product type. Adding a new product type in the future requires re-running `setup-roles-permissions.php` (after updating the `$product_types` array).
- The `administer commerce_product` permission on `dispensary_owner` is a catch-all that covers all future product types automatically.
