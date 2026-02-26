# BudStore API Reference

All endpoints are served by Drupal 11 at `http://localhost:8080` (development).

## Authentication

### Anonymous (Cart Token)

Anonymous users access the cart via a `Commerce-Cart-Token` header. Drupal
issues this token as a response header (`commerce-cart-token`) on the first
cart operation. The React frontend captures it automatically and stores it in
`localStorage` under the key `commerce_cart_token`.

All subsequent cart requests must include:

```
Commerce-Cart-Token: <token>
```

### Authenticated (OAuth Bearer Token)

Authenticated users send an OAuth 2.0 bearer token:

```
Authorization: Bearer <access_token>
```

The `drupalClient.js` Axios instance handles automatic token refresh on 401
responses using the stored `oauth_refresh_token`.

---

## JSON:API Cart Endpoints

Provided by the `commerce_api` contrib module. All paths use `_format=json`.

### GET /cart

Fetch all carts for the current session/user. Returns an array; the first
element is the active cart.

```
GET /cart?_format=json
```

**Headers (anonymous):**
```
Commerce-Cart-Token: <token>
```

**Response:** Array of cart order objects.

```json
[
  {
    "order_id": 5,
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "order_number": null,
    "state": "draft",
    "total_price": { "number": "45.00", "currency_code": "USD", "formatted": "$45.00" },
    "order_items": [ ... ]
  }
]
```

**Example curl:**
```bash
curl -s "http://localhost:8080/cart?_format=json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN"
```

---

### POST /cart/add

Add a product variation to the cart.

```
POST /cart/add?_format=json
Content-Type: application/json
```

**Request body:** Array of items to add.

```json
[
  {
    "purchased_entity_type": "commerce_product_variation",
    "purchased_entity_id": 12,
    "quantity": 1
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purchased_entity_type` | string | yes | Always `"commerce_product_variation"` |
| `purchased_entity_id` | integer | yes | Drupal internal variation ID (`drupal_internal__variation_id`) |
| `quantity` | integer | yes | Number of units to add |

**Response:** Array of added order item objects.

**Note:** The response includes a `commerce-cart-token` header for new anonymous
carts. The React `commerceClient.js` interceptor captures and stores this
automatically.

**Example curl:**
```bash
curl -s -X POST "http://localhost:8080/cart/add?_format=json" \
  -H "Content-Type: application/json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN" \
  -d '[{"purchased_entity_type":"commerce_product_variation","purchased_entity_id":12,"quantity":1}]'
```

---

### PATCH /cart/{order_id}/items/{item_id}

Update the quantity of a specific order item.

```
PATCH /cart/{order_id}/items/{item_id}?_format=json
Content-Type: application/json
```

**URL parameters:**

| Parameter | Description |
|-----------|-------------|
| `order_id` | Cart order ID (integer) |
| `item_id` | Order item ID (integer) |

**Request body:**

```json
{ "quantity": 3 }
```

**Response:** Updated order item object.

**Example curl:**
```bash
curl -s -X PATCH "http://localhost:8080/cart/5/items/8?_format=json" \
  -H "Content-Type: application/json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN" \
  -d '{"quantity":3}'
```

---

### DELETE /cart/{order_id}/items/{item_id}

Remove a single item from the cart.

```
DELETE /cart/{order_id}/items/{item_id}?_format=json
```

**Response:** `204 No Content`

**Example curl:**
```bash
curl -s -X DELETE "http://localhost:8080/cart/5/items/8?_format=json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN"
```

---

### DELETE /cart/{order_id}/items

Remove all items from the cart (clear cart).

```
DELETE /cart/{order_id}/items?_format=json
```

**Response:** `204 No Content`

**Example curl:**
```bash
curl -s -X DELETE "http://localhost:8080/cart/5/items?_format=json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN"
```

---

## JSON:API Product Endpoints

Provided by Drupal core's JSON:API module. Responses follow the
[JSON:API specification](https://jsonapi.org/).

### GET /jsonapi/commerce_store/online

List all active dispensary stores.

```
GET /jsonapi/commerce_store/online
Accept: application/vnd.api+json
```

**Response:** JSON:API collection of store objects. Each store's `attributes`
includes `drupal_internal__store_id`, `name`, `address`, etc.

**Example curl:**
```bash
curl -s "http://localhost:8080/jsonapi/commerce_store/online" \
  -H "Accept: application/vnd.api+json"
```

---

### GET /jsonapi/commerce_product/{type}

List products of a specific type, optionally filtered by store.

```
GET /jsonapi/commerce_product/{type}?filter[stores.meta.drupal_internal__target_id]={store_id}&include=variations,field_brand,field_image,field_image.thumbnail&page[limit]=50
Accept: application/vnd.api+json
```

**Path parameter:**

| Parameter | Values |
|-----------|--------|
| `type` | `flower`, `pre_roll`, `edible`, `concentrate`, `vape_cartridge`, `tincture`, `topical`, `accessory`, `cannabis_clone_seed` |

**Query parameters used by the React frontend:**

| Parameter | Description |
|-----------|-------------|
| `filter[stores.meta.drupal_internal__target_id]` | Filter by store internal ID |
| `include` | Comma-separated related resources to sideload |
| `page[limit]` | Max results per page (default 50) |
| `fields[commerce_product--{type}]` | Sparse fieldset |

**Response:** JSON:API collection with sideloaded `included` resources
(variations, taxonomy terms for brands, media entities, file entities).

**Example curl (flower products for store 1):**
```bash
curl -s "http://localhost:8080/jsonapi/commerce_product/flower?filter[stores.meta.drupal_internal__target_id]=1&include=variations,field_brand,field_image,field_image.thumbnail&page[limit]=50" \
  -H "Accept: application/vnd.api+json"
```

---

### GET /jsonapi/commerce_product_variation/{bundle}

List product variations by bundle (type). Used to retrieve pricing and SKU
data independently of products.

```
GET /jsonapi/commerce_product_variation/{bundle}
Accept: application/vnd.api+json
```

**Path parameter:** `bundle` matches the product type machine name
(e.g., `flower`, `pre_roll`).

**Example curl:**
```bash
curl -s "http://localhost:8080/jsonapi/commerce_product_variation/flower" \
  -H "Accept: application/vnd.api+json"
```

---

## Custom Endpoints

### POST /api/cod-checkout

Place a Cash on Delivery order. Defined by the `budstore_checkout` custom
module (`web/modules/custom/budstore_checkout`).

```
POST /api/cod-checkout
Content-Type: application/json
```

**Route definition** (`budstore_checkout.routing.yml`):
- Path: `/api/cod-checkout`
- Methods: `POST`, `OPTIONS`
- Access: public (`_access: 'TRUE'`)

**Request body:**

```json
{
  "order_uuid":    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "email":         "customer@example.com",
  "first_name":    "Jane",
  "last_name":     "Doe",
  "phone":         "805-555-1234",
  "address_line1": "123 Main St",
  "address_line2": "",
  "city":          "Lompoc",
  "state":         "CA",
  "zip":           "93436",
  "country":       "US",
  "notes":         "Leave at door."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_uuid` | string (UUID) | yes | UUID of the cart order (from `GET /cart`) |
| `email` | string | yes | Customer email address |
| `first_name` | string | yes | Customer first name |
| `last_name` | string | yes | Customer last name |
| `phone` | string | no | Customer phone number |
| `address_line1` | string | yes | Street address |
| `address_line2` | string | no | Apartment, suite, unit (may be empty) |
| `city` | string | yes | City |
| `state` | string | no | State/province code; defaults to `CA` |
| `zip` | string | yes | Postal code |
| `country` | string | no | ISO 3166-1 alpha-2 country code; defaults to `US` |
| `notes` | string | no | Order / delivery notes |

**Authentication:** Anonymous requests must include the cart token:

```
Commerce-Cart-Token: <token>
```

**What the endpoint does (in order):**

1. Validates the request body and required fields
2. Loads the `commerce_order` by `order_uuid`
3. Verifies cart ownership (anonymous: via `Commerce-Cart-Token` header;
   authenticated: by matching `customer_id`)
4. Checks the order is in `draft` or `cart` state
5. Sets the customer email on the order
6. Saves order notes to `field_order_notes` (if the field exists)
7. Creates a billing `profile` entity with the supplied address
8. Assigns the `cod` payment gateway to the order
9. Transitions the order state: `draft` -> `place` (and `validate` if required)
10. Creates a pending `commerce_payment` record
11. Returns the placed order details

**Success response (200):**

```json
{
  "status":       "placed",
  "order_id":     42,
  "order_number": "3",
  "state":        "fulfillment"
}
```

**Error responses:**

| Status | `message` | Cause |
|--------|-----------|-------|
| 400 | `order_uuid is required.` | Missing `order_uuid` in request body |
| 400 | `Missing required customer fields.` | Missing email, name, address, city, or ZIP |
| 403 | `Access denied.` | Cart token mismatch or wrong user |
| 404 | `Order not found.` | No order with the given UUID |
| 409 | `Order is no longer editable (state: ...).` | Order not in `draft`/`cart` state |
| 500 | Exception message | Unexpected server error (see Drupal watchdog) |

**Example curl:**

```bash
curl -s -X POST "http://localhost:8080/api/cod-checkout" \
  -H "Content-Type: application/json" \
  -H "Commerce-Cart-Token: YOUR_TOKEN" \
  -d '{
    "order_uuid":    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "email":         "jane@example.com",
    "first_name":    "Jane",
    "last_name":     "Doe",
    "phone":         "805-555-1234",
    "address_line1": "123 Main St",
    "city":          "Lompoc",
    "state":         "CA",
    "zip":           "93436",
    "country":       "US",
    "notes":         ""
  }'
```

**CORS / Preflight:**

The endpoint also handles `OPTIONS` requests (CORS preflight). CORS headers
themselves are managed by Drupal middleware configuration.

---

## Typical Full Checkout Sequence

```
1. GET  /cart                              — get or confirm cart exists
2. POST /cart/add                          — add items (captures Commerce-Cart-Token)
3. PATCH /cart/{order_id}/items/{item_id} — update quantities (optional)
4. POST /api/cod-checkout                 — place order (clears cart in React)
```
