# Store Worker Order Creation — Implementation Spec

Staff at each dispensary need to create orders directly from the BudHound management app (`localhost:3002`). This covers walk-in customers, phone orders, and any situation where a worker places an order on behalf of a customer.

---

## Current State

### What exists
- **Order viewing & management**: list, detail, status transitions, driver assignment, refunds, COD payment receipt
- **POS interface** (`/pos`): product search, cart UI, tax calculations, checkout button — but the backend endpoint it calls (`/api/budhound/sales/create`) **does not exist yet**
- **Sales history** (`/sales`): lists completed orders as a table
- **Product browsing**: `useProducts` hook queries all 9 product bundles (flower, concentrate, edible, pre_roll, tincture, topical, vape_cartridge, cannabis_clone_seed, accessory) with variations and pricing

### What's missing
| Layer | Gap |
|-------|-----|
| Backend | `POST /api/budhound/sales/create` endpoint (route + controller) |
| Backend | Inventory auto-deduction on sale |
| Frontend | The POS checkout calls a missing endpoint — needs the backend wired up |
| Frontend | Full order creation form on `/orders/new` (customer info, address, payment method) |

---

## Architecture

### Two creation paths

**Path A — Quick POS Sale** (walk-in, counter sale)
```
Staff searches products → adds to cart → enters customer name → clicks "Complete Sale"
→ POST /api/budhound/sales/create { customer_name, items[] }
→ Creates draft order → transitions to "placed" → returns order
```
- Minimal friction, no address required
- Default payment: Cash on Delivery
- Customer name optional (defaults to "Walk-in")
- Already has full frontend UI in `POSInterface.jsx`

**Path B — Full Order** (phone order, delivery, detailed record)
```
Staff clicks "New Order" on /orders → fills customer info + address → selects items
→ POST /api/budhound/orders/create { customer, address, items[], payment_method, notes }
→ Creates draft order → transitions to "placed" → returns order
```
- Full customer info (name, email, phone, address)
- Supports delivery assignment
- Order notes
- New frontend form needed

---

## Backend Implementation

### 1. New route — `budhound_api.routing.yml`

```yaml
budhound_api.sales.create:
  path: '/api/budhound/sales/create'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\SalesController::create'
  requirements:
    _user_is_logged_in: 'TRUE'
  methods: [POST]

budhound_api.orders.create:
  path: '/api/budhound/orders/create'
  defaults:
    _controller: '\Drupal\budhound_api\Controller\SalesController::createFullOrder'
  requirements:
    _user_is_logged_in: 'TRUE'
  methods: [POST]
```

### 2. New controller — `SalesController.php`

Location: `web/modules/custom/budhound_api/src/Controller/SalesController.php`

Extends `BudhoundControllerBase` (provides `checkPermission()`, `getCurrentStoreId()`, `loadRealUser()`).

#### `create()` — Quick POS sale

**Request body:**
```json
{
  "customer_name": "Jane Doe",
  "items": [
    { "variation_id": "da38ecf5-8277-454f-...", "quantity": 2 },
    { "variation_id": "b1c2d3e4-...", "quantity": 1 }
  ]
}
```

**Logic:**
1. `checkPermission('create sales transactions')` → 403 if denied
2. `getCurrentStoreId()` → get staff's assigned store
3. Validate `items` array is non-empty
4. For each item:
   - Load `commerce_product_variation` by UUID
   - Verify it belongs to a product in the user's store (via `stores` relationship)
   - Get the variation price
5. Create `commerce_order` entity:
   - `type` → `default`
   - `store_id` → staff's store
   - `uid` → `0` (anonymous/walk-in) or staff user ID
   - `mail` → store email or staff email
   - `field_order_notes` → `"POS sale by {staff_username}"`
   - `state` → `draft`
6. For each item, create `commerce_order_item`:
   - `type` → `default`
   - `purchased_entity` → variation entity
   - `quantity` → from request
   - `unit_price` → from variation
   - `title` → variation title
7. Add order items to order, save
8. Transition `draft → placed`
9. Optionally deduct inventory (`field_stock_quantity` on variations)
10. Return response

**Response:**
```json
{
  "status": "placed",
  "order_id": 42,
  "order_number": "15",
  "total": "$125.50",
  "items_count": 3
}
```

#### `createFullOrder()` — Full order with customer details

**Request body:**
```json
{
  "customer": {
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "805-555-1234"
  },
  "address": {
    "line1": "123 Main St",
    "line2": "",
    "city": "Lompoc",
    "state": "CA",
    "zip": "93436",
    "country": "US"
  },
  "items": [
    { "variation_id": "da38ecf5-...", "quantity": 2 }
  ],
  "payment_method": "cod",
  "notes": "Call before delivery"
}
```

**Logic:** Same as `create()` plus:
- Create billing profile with address
- Set customer email on order
- Store customer phone in notes or custom field
- If `payment_method` is `cod`, assign COD gateway + create pending payment record
- Return order UUID (for detail page redirect)

**Response:**
```json
{
  "status": "placed",
  "order_id": 42,
  "order_number": "15",
  "uuid": "abc123-...",
  "total": "$125.50",
  "state": "placed"
}
```

### 3. Tax handling

Drupal Commerce applies tax adjustments automatically through order processors when the order is saved. The store's tax configuration (California excise 15%, Lompoc sales 9.25%) is applied server-side. The frontend can calculate an estimate for display, but the server is authoritative.

If Commerce tax modules aren't configured, apply manually:
```php
$subtotal = $order->getSubtotalPrice();
$excise = $subtotal->multiply('0.15');
$sales_tax = $subtotal->add($excise)->multiply('0.0925');
// Add as order adjustments
```

### 4. Inventory deduction

When a sale is created, optionally deduct stock:
```php
foreach ($order->getItems() as $item) {
  $variation = $item->getPurchasedEntity();
  if ($variation->hasField('field_stock_quantity')) {
    $current = (int) $variation->get('field_stock_quantity')->value;
    $new_qty = max(0, $current - (int) $item->getQuantity());
    $variation->set('field_stock_quantity', $new_qty);
    $variation->save();
  }
}
```

### 5. Permission check

The `create sales transactions` permission is already defined in `budhound_permissions.permissions.yml` and granted to:
- `store_owner` (26 perms)
- `store_manager` (20 perms)
- `budtender` (19 perms — includes this permission)

No new permissions needed for Path A (POS). For Path B, reuse the same permission or add `create store orders` if finer-grained control is wanted.

---

## Frontend Implementation

### Path A — Wire up existing POS

The `POSInterface.jsx` already has the full UI. It calls `useCreateSale()` which calls `apiClient.post('/api/budhound/sales/create', ...)`. Once the backend endpoint exists, the POS will work.

**Files to verify (no changes expected):**
- `budhound-management/src/components/sales/POSInterface.jsx` — cart UI, product search, checkout
- `budhound-management/src/hooks/useSales.js` — `useCreateSale()` mutation
- `budhound-management/src/hooks/useProducts.js` — product queries

**Only change needed:** Add the endpoint constant in `endpoints.js`:
```js
SALES_CREATE: '/api/budhound/sales/create',
```

### Path B — New Order form

**New files:**
- `budhound-management/src/components/orders/OrderCreateForm.jsx`
- `budhound-management/src/hooks/useOrderCreate.js`

**Modified files:**
- `budhound-management/src/routes.jsx` — add `/orders/new` route
- `budhound-management/src/api/endpoints.js` — add `ORDERS_CREATE`
- `budhound-management/src/components/orders/OrdersPage.jsx` — add "New Order" button

#### `OrderCreateForm.jsx` layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Orders                        New Order          │
├─────────────────────────────┬───────────────────────────────┤
│                             │                               │
│  Customer Information       │  Order Items                  │
│  ┌───────────────────────┐  │  ┌─────────────────────────┐  │
│  │ Email                 │  │  │ 🔍 Search products...   │  │
│  │ First name / Last name│  │  │                         │  │
│  │ Phone                 │  │  │ Product grid            │  │
│  └───────────────────────┘  │  │ (click to add to cart)  │  │
│                             │  │                         │  │
│  Delivery Address           │  └─────────────────────────┘  │
│  ┌───────────────────────┐  │                               │
│  │ Street address        │  │  Cart                         │
│  │ City / State / ZIP    │  │  ┌─────────────────────────┐  │
│  └───────────────────────┘  │  │ Item 1     x2   $50.00  │  │
│                             │  │ Item 2     x1   $35.00  │  │
│  Payment                    │  │─────────────────────────│  │
│  ○ Cash on Delivery         │  │ Subtotal       $135.00  │  │
│                             │  │ Excise (15%)    $20.25  │  │
│  Notes                      │  │ Sales (9.25%)   $14.36  │  │
│  ┌───────────────────────┐  │  │ Total          $169.61  │  │
│  │ Special instructions  │  │  └─────────────────────────┘  │
│  └───────────────────────┘  │                               │
│                             │  [  Create Order  ]           │
└─────────────────────────────┴───────────────────────────────┘
```

#### `useOrderCreate.js`

```js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useOrderCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) =>
      apiClient.post('/api/budhound/orders/create', orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

#### Route addition

```jsx
// routes.jsx
import OrderCreateForm from './components/orders/OrderCreateForm';

// Inside the orders section:
{ path: 'orders/new', element: guarded(OrderCreateForm, { permission: PERMS.CREATE_SALES }) },
```

---

## Data Flow Summary

```
                   POSInterface.jsx           OrderCreateForm.jsx
                        │                           │
                   useCreateSale()             useOrderCreate()
                        │                           │
                   POST /api/budhound/       POST /api/budhound/
                   sales/create              orders/create
                        │                           │
                        └───────────┬───────────────┘
                                    │
                          SalesController.php
                          (extends BudhoundControllerBase)
                                    │
                        ┌───────────┼───────────────┐
                        │           │               │
                   Permission   Load store    Load variations
                   check        from user     by UUID
                        │           │               │
                        └───────────┼───────────────┘
                                    │
                           Create commerce_order
                           Create commerce_order_items
                           Apply billing profile
                           Transition draft → placed
                           (Optional: deduct inventory)
                                    │
                              Return JSON response
                           { order_id, order_number,
                             total, state }
```

---

## Variation UUID Lookup

The POS and order form need product variation UUIDs to send to the backend. The existing `useProducts` hook fetches products with included variations via JSON:API:

```
GET /jsonapi/commerce_product/{bundle}?include=variations&fields[...]
```

Each variation in the `included` array has:
- `id` — UUID (used for `variation_id` in the request)
- `attributes.title` — Display name
- `attributes.price` — `{ number, currency_code, formatted }`
- `attributes.sku` — SKU string
- `attributes.field_stock_quantity` — Current stock level

The frontend already extracts these in `useProducts.js`.

---

## Role Access Matrix

| Action | store_owner | store_manager | budtender | delivery_driver |
|--------|:-----------:|:-------------:|:---------:|:---------------:|
| Quick POS sale | Yes | Yes | Yes | No |
| Full order create | Yes | Yes | No | No |
| View orders | Yes | Yes | Assigned only | Assigned only |
| Update order status | Yes | Yes | Yes | Yes |
| Assign driver | Yes | Yes | No | No |
| Process refund | Yes | Yes | No | No |
| Receive COD payment | Yes | Yes | No | No |

---

## Implementation Order

### Phase 1 — POS sales (highest impact, least work)
1. Create `SalesController.php` with `create()` method
2. Add route to `budhound_api.routing.yml`
3. Deploy to Docker, clear cache
4. Test POS from `localhost:3002/pos`

### Phase 2 — Full order creation
5. Add `createFullOrder()` method to `SalesController.php`
6. Add route for `/api/budhound/orders/create`
7. Create `OrderCreateForm.jsx` component
8. Create `useOrderCreate.js` hook
9. Add `/orders/new` route
10. Add "New Order" button to `OrdersPage.jsx`

### Phase 3 — Inventory integration
11. Auto-deduct `field_stock_quantity` on sale/order creation
12. Prevent sale if stock is 0 (optional — configurable)
13. Log inventory changes to audit trail

---

## Testing Checklist

- [ ] Login as `elevate_budtender_1` → POS → add items → complete sale → order appears in orders list
- [ ] Login as `leaf_owner` → POS → complete sale → order scoped to Leaf Dispensary only
- [ ] Login as `roots_manager` → /orders/new → fill customer info → add items → create order → see in order detail
- [ ] Login as `elevate_driver_1` → POS → should be denied (no `create sales transactions` permission)
- [ ] Cross-store isolation: `leaf_owner` cannot see orders from Elevate Lompoc
- [ ] Inventory deduction: stock decreases after sale
- [ ] Tax calculation: excise 15% + sales 9.25% applied correctly
- [ ] Order appears in BudHound order list with correct status ("placed")
- [ ] Order status flow: placed → processing → ready → completed
