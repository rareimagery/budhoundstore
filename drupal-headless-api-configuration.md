# Drupal Commerce — Headless API Configuration
### Complete Setup for React Storefront Apps

> **Scope:** Everything that must be configured on the Drupal side before a React app can consume it. This covers module installation, JSON:API configuration, OAuth, CORS, commerce_api, and per-store endpoint verification. React build work is out of scope here.
>
> **Assumed baseline:** Drupal 10, Commerce 2.x, all 7 Lompoc stores created as store entities, product types and migrations from previous guides already complete.

---

## Table of Contents

1. [Module Stack](#1-module-stack)
2. [JSON:API Core Configuration](#2-jsonapi-core-configuration)
3. [jsonapi_extras — Field Control](#3-jsonapi_extras--field-control)
4. [commerce_api — The Critical Piece](#4-commerce_api--the-critical-piece)
5. [OAuth2 Authentication](#5-oauth2-authentication)
6. [CORS Configuration](#6-cors-configuration)
7. [Subrequests — Batch API Calls](#7-subrequests--batch-api-calls)
8. [decoupled_router — Path Resolution](#8-decoupled_router--path-resolution)
9. [Search API + Facets for Product Filtering](#9-search-api--facets-for-product-filtering)
10. [Per-Store Resource Filtering](#10-per-store-resource-filtering)
11. [Menus and Navigation](#11-menus-and-navigation)
12. [Webhooks and Cache Invalidation](#12-webhooks-and-cache-invalidation)
13. [Store API Credentials Reference](#13-store-api-credentials-reference)
14. [Endpoint Reference Sheet](#14-endpoint-reference-sheet)
15. [Verification Checklist](#15-verification-checklist)

---

## 1. Module Stack

Install everything in this order. Dependencies are sequenced intentionally.

### 1.1 Composer Install

```bash
# Core API layer
composer require drupal/jsonapi_extras
composer require drupal/decoupled_router
composer require drupal/subrequests

# Auth
composer require drupal/simple_oauth
composer require drupal/consumers

# Commerce headless layer
composer require drupal/commerce_api

# Search and filtering
composer require drupal/search_api
composer require drupal/search_api_db     # database backend (no Solr needed initially)
composer require drupal/facets

# Performance and cache
composer require drupal/http_cache_control
composer require drupal/cors              # if not handling via server config

# Optional but recommended
composer require drupal/metatag           # SEO tags in API responses
composer require drupal/pathauto          # clean URLs for product paths
composer require drupal/redirect          # path redirect support
```

### 1.2 Drush Enable

```bash
# JSON:API (core — may already be enabled)
drush en jsonapi jsonapi_extras -y

# Routing and batching
drush en decoupled_router subrequests -y

# Auth
drush en simple_oauth consumers -y

# Commerce API (enables its own dependencies)
drush en commerce_api -y

# Search
drush en search_api search_api_db facets -y

# Performance
drush en http_cache_control -y

# Optional
drush en metatag pathauto redirect -y

drush cr
```

### 1.3 Verify Commerce API Installed Correctly

`commerce_api` has its own sub-modules. Enable them all:

```bash
drush en commerce_api_cart commerce_api_checkout -y
drush cr
```

Verify the module is active and its routes are registered:

```bash
drush route --route-name=commerce_api.cart.get
# Should output the cart GET endpoint path
```

If the route is missing, the module installed incorrectly. Check `drush status` for any dependency errors.

---

## 2. JSON:API Core Configuration

JSON:API is enabled as a Drupal core module and works immediately after enabling, but the default configuration is too permissive for a public-facing storefront and too verbose for React consumption. Configure it properly before anything else.

### 2.1 Read-Only Mode vs. Full CRUD

By default in Drupal 10, JSON:API is read-only. Commerce cart and checkout operations go through `commerce_api` endpoints (not JSON:API write operations), so **leave JSON:API in read-only mode**. This is the correct and secure configuration.

Verify at: **Configuration → Web Services → JSON:API → Read-only mode = enabled**

```yaml
# config/sync/jsonapi.settings.yml
read_only: true
```

### 2.2 Resource Types to Expose

Not every Drupal entity type needs to be in the API. Expose only what the React app needs. Navigate to **Configuration → Web Services → JSON:API → Resource Override** or use `jsonapi_extras` (covered in section 3) to disable unused types.

**Expose (enable):**

| Resource Type | Why |
|---|---|
| `commerce_product--flower` | Flower product listings |
| `commerce_product--pre_roll` | Pre-roll listings |
| `commerce_product--vape_cartridge` | Vape listings |
| `commerce_product--concentrate` | Concentrate listings |
| `commerce_product--edible` | Edible listings |
| `commerce_product--tincture` | Tincture listings |
| `commerce_product--topical` | Topical listings |
| `commerce_product--cannabis_clone_seed` | Leaf clone/seed products |
| `commerce_product_variation--flower_variation` | Flower SKUs / pricing |
| `commerce_product_variation--vape_variation` | Vape SKUs / pricing |
| `commerce_product_variation--pre_roll_variation` | Pre-roll SKUs |
| `commerce_product_variation--concentrate_variation` | Concentrate SKUs |
| `commerce_product_variation--edible_variation` | Edible SKUs |
| `commerce_store--online` | Store entity (address, hours, settings) |
| `commerce_promotion--default` | Active promotions per store |
| `taxonomy_term--brand` | Brand taxonomy for filtering |
| `taxonomy_term--cannabis_category` | Category taxonomy |
| `taxonomy_term--strain_type` | Indica/Sativa/Hybrid attribute |
| `file--file` | Product images |
| `menu_link_content--menu_link_content` | Navigation menus |
| `node--page` | Static content pages (About, FAQ) |

**Disable (block from API):**

```
user--user           (security — never expose user list)
commerce_order--*    (handled exclusively by commerce_api, not JSON:API)
comment--*           (not used)
shortcut--*          (internal only)
menu_link_content -- admin menus
path_alias--*        (handled by decoupled_router)
```

### 2.3 Disabling Unused Resource Types via Config

```yaml
# config/sync/jsonapi_resource_type.commerce_order.default.yml
disabled: true
---
# config/sync/jsonapi_resource_type.user.user.yml
disabled: true
```

Or via `jsonapi_extras` UI: **Configuration → Web Services → JSON:API Extras → Resource Types**.

### 2.4 JSON:API URL Structure

All endpoints follow this pattern:

```
/jsonapi/{entity_type}/{bundle}
/jsonapi/{entity_type}/{bundle}/{uuid}
```

For Commerce specifically:
```
GET /jsonapi/commerce_product/flower
GET /jsonapi/commerce_product/flower/{uuid}
GET /jsonapi/commerce_product_variation/flower_variation
GET /jsonapi/commerce_store/online
GET /jsonapi/taxonomy_term/brand
```

---

## 3. jsonapi_extras — Field Control

`jsonapi_extras` gives you control over which fields are exposed in each resource type, what they're called in the API response, and how they're normalized. This is critical for keeping API responses lean and preventing internal field names from leaking to the client.

### 3.1 Global Settings

Navigate to **Configuration → Web Services → JSON:API Extras → Settings**:

- **Include count in collection responses:** Yes (enables pagination metadata)
- **Default page limit:** 50 (override per resource as needed)
- **Include link in collection:** Yes

### 3.2 Field Aliasing — Flower Product Example

The goal is to make API field names match what your React components expect, not Drupal's internal naming. Configure at:

**Configuration → Web Services → JSON:API Extras → Resource Types → commerce_product--flower → Overrides**

| Drupal Field Name | Alias in API | Notes |
|---|---|---|
| `field_brand` | `brand` | Cleaner for React |
| `field_strain_name` | `strain_name` | |
| `field_strain_type` | `strain_type` | |
| `field_thc_pct` | `thc_pct` | |
| `field_cbd_pct` | `cbd_pct` | |
| `field_terpene_profile` | `terpenes` | |
| `field_coa` | `coa_pdf` | |
| `body` | `description` | |
| `field_images` | `images` | |

**Fields to disable (hide from API response):**

```
revision_timestamp
revision_uid
revision_log
changed        (keep 'created', disable 'changed' if not used by React)
promote
sticky
uid            (internal author — not relevant to storefront)
```

### 3.3 Enhancers — Computed and Normalized Fields

`jsonapi_extras` supports field enhancers that transform values before they reach the API response. Useful ones:

**Date normalization** — convert Drupal timestamps to ISO 8601:
```yaml
field_name: created
enhancer:
  id: date_time
  settings:
    dateTimeFormat: 'Y-m-d\TH:i:sP'
```

**Boolean normalization** — Drupal stores booleans as 0/1; React expects true/false:
```yaml
field_name: status
enhancer:
  id: boolean_string
```

**UUID only for relationships** — by default JSON:API includes full relationship data. For taxonomy references like `brand`, you often just want the UUID and let React request the term separately:
```yaml
field_name: field_brand
relationship_type: uuid_only
```

### 3.4 Product Variation Include

When the React app loads a product, it needs the variations (SKUs, prices, stock) in the same request — not a second round-trip. Configure includes at the resource type level:

```
GET /jsonapi/commerce_product/flower/{uuid}?include=variations,field_brand,field_images
```

The `include` parameter works out of the box with JSON:API. Document the include paths in the endpoint reference (section 14) so React developers know exactly what to request.

---

## 4. commerce_api — The Critical Piece

`commerce_api` wraps Drupal Commerce's cart, checkout, and order pipeline in REST endpoints that a decoupled React app can consume. Without it, cart and checkout would have to be re-implemented in React against Commerce's internal API, which is not feasible.

### 4.1 What commerce_api Provides

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/cart` | GET | Retrieve current cart (session or authenticated) |
| `/api/cart` | POST | Add item to cart |
| `/api/cart/{cart_id}/items/{item_id}` | PATCH | Update cart item quantity |
| `/api/cart/{cart_id}/items/{item_id}` | DELETE | Remove item from cart |
| `/api/cart/{cart_id}` | DELETE | Empty / abandon cart |
| `/api/checkout/{cart_id}` | GET | Retrieve checkout state |
| `/api/checkout/{cart_id}` | PATCH | Advance checkout step |
| `/api/checkout/{cart_id}/payment` | POST | Submit payment |

The key thing these endpoints do that JSON:API cannot: they run the full Commerce order pipeline, including promotion resolution, tax calculation, stock decrement, and payment processing. The React app calls these; it never needs to calculate discounts or taxes itself.

### 4.2 commerce_api Configuration

Navigate to **Commerce → Configuration → Commerce API**:

```yaml
# commerce_api settings
cart_provider: session     # 'session' for guest, 'auth' for logged-in
allow_guest_checkout: true
require_email_for_guest: true
checkout_flows:
  - default
tax_included_display: true  # matches Leaf/Elevate's inclusive pricing model
```

**Cart token header:** `commerce_api` uses a custom header `Commerce-Cart-Token` for guest cart persistence. The React app must store this token (in memory or sessionStorage) and send it with every cart request.

```
GET /api/cart
X-Commerce-Cart-Token: {token_from_previous_response}
```

On first cart creation, the response includes the token in the response headers. React must capture and store it.

### 4.3 Enabling Per-Store Cart Isolation

Each store entity must be configured so that carts are isolated — a customer adding items at Elevate should not see those items in their Leaf cart.

In `commerce_api`, cart isolation is per-store when you pass the store UUID in the cart creation request:

```
POST /api/cart
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "commerce_order--default",
    "relationships": {
      "store_id": {
        "data": {
          "type": "commerce_store--online",
          "id": "{STORE_UUID}"
        }
      }
    }
  }
}
```

The React app must pass the correct store UUID when creating a cart. Store UUIDs are documented in section 13.

### 4.4 Promotion Resolution in Cart

When a customer qualifies for a promotion (e.g., The Roots' Wake N Bake 20% off), the promotion is applied server-side when the cart is fetched or updated. The React app does **not** calculate discounts — it reads the `adjustments` array on the cart response:

```json
{
  "data": {
    "type": "commerce_order--default",
    "attributes": {
      "order_total": { "number": "45.00", "currency_code": "USD" },
      "adjustments": [
        {
          "type": "promotion",
          "label": "Wake N Bake 20% Off",
          "amount": { "number": "-9.00", "currency_code": "USD" },
          "source_id": "promotion:12"
        },
        {
          "type": "tax",
          "label": "CA Sales Tax (9.25%)",
          "amount": { "number": "3.33", "currency_code": "USD" }
        }
      ]
    }
  }
}
```

React reads and displays this — it never computes it. This is the correct pattern.

### 4.5 Checkout Flow Configuration

Commerce's checkout flow must be configured for decoupled use. Navigate to **Commerce → Configuration → Checkout flows → Edit default**:

Remove or disable these panes (they are server-rendered and irrelevant to a headless checkout):
- Sidebar (cart summary pane)
- Review pane (React builds its own)
- Completion message (React handles post-order redirect)

Keep these panes (they run server-side logic React depends on):
- Login/guest (handles auth state)
- Order information (shipping address, contact)
- Payment (payment gateway integration)
- Completion (order finalization)

### 4.6 Payment Gateway

Your React checkout UI needs to collect payment and pass it to `commerce_api`. For California cannabis dispensaries operating on cash/debit only, the simplest gateway is a **manual payment gateway** (cash on delivery / pay in store) combined with a debit processor.

```bash
composer require drupal/commerce_payment
drush en commerce_payment -y
```

Navigate to **Commerce → Configuration → Payment gateways → Add gateway**:

- **Label:** Cash / Pay In Store
- **Plugin:** Manual
- **Mode:** Live
- **Display label:** "Pay with Cash or Debit at Pickup/Delivery"

For delivery orders requiring pre-payment via debit, integrate a cannabis-compliant payment processor (Paytender, Hypur, or CanPay are common in CA). Each has a Drupal Commerce module or requires a custom gateway plugin.

---

## 5. OAuth2 Authentication

Guest checkout works with cart tokens (section 4.2). But customer accounts, order history, loyalty points, and the Bleu Diamond wallet require authenticated sessions. `simple_oauth` implements the OAuth 2.0 authorization code flow with PKCE, which is the correct pattern for a public React SPA.

### 5.1 simple_oauth Configuration

Navigate to **Configuration → People → Simple OAuth Settings**:

```yaml
# simple_oauth settings
access_token_expiration: 300      # 5 minutes — short for security
refresh_token_expiration: 1209600 # 14 days
token_signing_public_key: /path/to/public.key
token_signing_private_key: /path/to/private.key
```

Generate the key pair:

```bash
mkdir -p /var/drupal/keys
openssl genrsa -out /var/drupal/keys/private.key 2048
openssl rsa -in /var/drupal/keys/private.key -pubout -out /var/drupal/keys/public.key
chmod 600 /var/drupal/keys/private.key
```

Set the paths in **Configuration → People → Simple OAuth Settings → Key paths**.

### 5.2 Create OAuth Consumers (One Per Store App)

Each React app (each store) gets its own OAuth consumer. This allows you to revoke one store's access without affecting others, and to set store-specific scopes.

Navigate to **Configuration → Web Services → Consumers → Add Consumer**:

Create one consumer per store:

| Store | Client ID | Label | Grant Types |
|---|---|---|---|
| Elevate Lompoc | `elevate_lompoc_app` | Elevate Lompoc React App | Authorization Code, Refresh Token |
| One Plant | `one_plant_app` | One Plant React App | Authorization Code, Refresh Token |
| Royal Healing | `rhe_app` | Royal Healing React App | Authorization Code, Refresh Token |
| The Roots | `trd_app` | TRD React App | Authorization Code, Refresh Token |
| MJ Direct | `mjd_app` | MJ Direct React App | Authorization Code, Refresh Token |
| Bleu Diamond | `bd_app` | Bleu Diamond React App | Authorization Code, Refresh Token |
| Leaf | `leaf_app` | Leaf Dispensary React App | Authorization Code, Refresh Token |

**For each consumer, set:**
- **Redirect URIs:** `https://[store-domain]/auth/callback` (your React app's OAuth callback URL; use `http://localhost:3000/auth/callback` for local dev)
- **Is Confidential:** No (public SPA — PKCE, no client secret)
- **PKCE:** Enabled
- **Scopes:** Select scopes that map to what the app needs (see 5.3)

### 5.3 OAuth Scopes

Define scopes at **Configuration → Web Services → Consumers → Scopes**:

| Scope | Description | Assigned To |
|---|---|---|
| `commerce` | Access to Commerce resources (orders, cart) | All store apps |
| `profile` | Read customer profile | All store apps |
| `profile_edit` | Edit customer profile | All store apps |
| `order_history` | Read past orders | All store apps |
| `authenticated` | Base authenticated session | All store apps |

Drupal roles map to scopes. Ensure the `authenticated` role has the correct permissions for storefront operations.

### 5.4 OAuth Flow for React (PKCE)

The React app implements the Authorization Code + PKCE flow:

```
1. User clicks "Sign In" in React app
2. React generates code_verifier (random string) + code_challenge (SHA-256 hash)
3. React redirects to:
   GET /oauth/authorize
     ?response_type=code
     &client_id={consumer_client_id}
     &redirect_uri=https://[store-domain]/auth/callback
     &scope=commerce+profile+order_history
     &code_challenge={code_challenge}
     &code_challenge_method=S256

4. User logs in at Drupal's /user/login
5. Drupal redirects back to React with:
   https://[store-domain]/auth/callback?code={auth_code}

6. React exchanges code for tokens:
   POST /oauth/token
     grant_type=authorization_code
     &code={auth_code}
     &client_id={consumer_client_id}
     &redirect_uri={redirect_uri}
     &code_verifier={code_verifier}

7. Drupal returns:
   { "access_token": "...", "refresh_token": "...", "expires_in": 300 }

8. React stores access_token in memory (NOT localStorage)
   React stores refresh_token in httpOnly cookie (or sessionStorage for simplicity)
```

**Token storage:** Never store access tokens in `localStorage` — XSS vulnerability. Store in memory (React state/context) and refresh using the refresh token when expired.

### 5.5 Guest Cart + Account Merge

When a guest adds items to a cart and then logs in, Commerce should merge the guest cart into the authenticated user's cart. `commerce_api` handles this automatically when you pass the cart token alongside the OAuth token:

```
GET /api/cart
Authorization: Bearer {access_token}
X-Commerce-Cart-Token: {guest_cart_token}
```

Commerce will merge the carts and return the merged result.

---

## 6. CORS Configuration

CORS must be configured to allow your React app domains to make requests to Drupal. This is done in `services.yml` — not a module, not the UI.

### 6.1 services.yml Configuration

Edit `sites/default/services.yml`:

```yaml
parameters:
  cors.config:
    enabled: true
    # Wildcard allowed origins — lock down to actual app domains in production
    allowedHeaders:
      - '*'
    allowedMethods:
      - GET
      - POST
      - PATCH
      - DELETE
      - OPTIONS
    allowedOrigins:
      # Development
      - 'http://localhost:3000'
      - 'http://localhost:3001'
      - 'http://localhost:3002'
      - 'http://localhost:3003'
      - 'http://localhost:3004'
      - 'http://localhost:3005'
      - 'http://localhost:3006'
      # Staging
      - 'https://staging.elevate-lompoc.com'
      - 'https://staging.oneplant-lompoc.com'
      - 'https://staging.royalhealing-lompoc.com'
      - 'https://staging.trd-lompoc.com'
      - 'https://staging.mjdirect-lompoc.com'
      - 'https://staging.bleudiamond-lompoc.com'
      - 'https://staging.leaf-lompoc.com'
      # Production
      - 'https://elevate-lompoc.com'
      - 'https://www.elevate-lompoc.com'
      - 'https://oneplant-lompoc.com'
      - 'https://www.oneplant-lompoc.com'
      - 'https://royalhealingemporium.org'
      - 'https://www.royalhealingemporium.org'
      - 'https://trd-lompoc.com'
      - 'https://www.trd-lompoc.com'
      - 'https://mjdirect-lompoc.com'
      - 'https://www.mjdirect-lompoc.com'
      - 'https://bleudiamond-lompoc.com'
      - 'https://www.bleudiamond-lompoc.com'
      - 'https://leaflompoc.com'
      - 'https://www.leaflompoc.com'
    exposedHeaders:
      # Commerce cart token — React must be able to read this
      - 'Commerce-Cart-Token'
      - 'X-Drupal-Cache'
      - 'X-Drupal-Cache-Tags'
      - 'X-Drupal-Cache-Max-Age'
    maxAge: 1000
    supportsCredentials: true   # Required for cookie-based sessions / httpOnly refresh tokens
```

After editing `services.yml`, clear cache:

```bash
drush cr
```

### 6.2 Verify CORS Is Working

```bash
curl -I -X OPTIONS https://your-drupal.com/jsonapi/commerce_product/flower \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"

# Expected response headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
# Access-Control-Expose-Headers: Commerce-Cart-Token
```

---

## 7. Subrequests — Batch API Calls

A product listing page in React needs: the product list, brand taxonomy terms, category taxonomy terms, active promotions, and possibly the store entity — that's 5 API calls. `subrequests` collapses these into one HTTP request.

### 7.1 What Subrequests Does

Instead of:
```
GET /jsonapi/commerce_product/flower?filter[stores.id]=X    → 1 request
GET /jsonapi/taxonomy_term/brand                            → 1 request
GET /jsonapi/taxonomy_term/cannabis_category                → 1 request
GET /jsonapi/commerce_promotion/default?filter[stores.id]=X → 1 request
GET /jsonapi/commerce_store/online/{uuid}                   → 1 request
                                                Total: 5 requests
```

You send:
```
POST /subrequests
[all 5 requests as a JSON array]
                                                Total: 1 request
```

### 7.2 Subrequests Example for Store Product Page Load

```json
POST /subrequests?_format=json
Content-Type: application/json

[
  {
    "requestId": "store",
    "action": "view",
    "uri": "/jsonapi/commerce_store/online/{{STORE_UUID}}",
    "headers": { "Accept": "application/vnd.api+json" }
  },
  {
    "requestId": "products",
    "action": "view",
    "uri": "/jsonapi/commerce_product/flower?filter[stores.id]={{STORE_UUID}}&include=variations,field_brand,field_images&page[limit]=24",
    "headers": { "Accept": "application/vnd.api+json" }
  },
  {
    "requestId": "brands",
    "action": "view",
    "uri": "/jsonapi/taxonomy_term/brand?sort=name&page[limit]=100",
    "headers": { "Accept": "application/vnd.api+json" }
  },
  {
    "requestId": "promotions",
    "action": "view",
    "uri": "/jsonapi/commerce_promotion/default?filter[stores.id]={{STORE_UUID}}&filter[status]=1",
    "headers": { "Accept": "application/vnd.api+json" }
  }
]
```

The response is a single JSON object with keys matching each `requestId`. React destructures it in one pass.

### 7.3 Subrequests with Token Reference

Subrequests supports using the response from one sub-request as input to another via `{{requestId.body@$.data.id}}` syntax — useful for fetching a product and then its brand in sequence without client round-trips.

---

## 8. decoupled_router — Path Resolution

The React app will receive human-readable paths (e.g., `/products/flower/biscotti-connected`) and needs to resolve these to the correct JSON:API resource. `decoupled_router` handles this.

### 8.1 How It Works

```
GET /router/translate-path?path=/products/flower/biscotti-connected

Response:
{
  "resolved": "https://drupal.com/products/flower/biscotti-connected",
  "isHomePath": false,
  "entity": {
    "canonical": "https://drupal.com/products/flower/biscotti-connected",
    "type": "commerce_product",
    "bundle": "flower",
    "uuid": "a1b2c3d4-...",
    "id": "42"
  },
  "label": "Biscotti — Connected Cannabis Co.",
  "jsonapi": {
    "individual": "https://drupal.com/jsonapi/commerce_product/flower/a1b2c3d4-...",
    "resourceName": "commerce_product--flower"
  }
}
```

React uses this to convert a URL path into a JSON:API fetch URL. This is the foundational pattern for server-side rendering with Next.js — every page load hits `decoupled_router` first, then fetches the resolved JSON:API resource.

### 8.2 pathauto Integration

Configure `pathauto` patterns so that product URLs are human-readable and consistent:

Navigate to **Configuration → Search and Metadata → URL Aliases → Patterns → Add Pattern**:

| Entity Type | Bundle | Pattern |
|---|---|---|
| Commerce Product | Flower | `/products/flower/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Pre-Roll | `/products/pre-rolls/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Vape | `/products/vapes/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Concentrate | `/products/concentrates/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Edible | `/products/edibles/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Tincture | `/products/tinctures/[commerce_product:field_brand]/[commerce_product:title]` |
| Commerce Product | Topical | `/products/topicals/[commerce_product:field_brand]/[commerce_product:title]` |

```bash
# Generate aliases for all existing products
drush pathauto:aliases-generate --all-types
```

---

## 9. Search API + Facets for Product Filtering

The React storefront needs faceted product filtering: by brand, strain type, THC%, price range, and product category. `search_api` with the database backend provides this without requiring Solr/Elasticsearch.

### 9.1 Create a Search Index

Navigate to **Configuration → Search and Metadata → Search API → Add Index**:

| Setting | Value |
|---|---|
| **Name** | Cannabis Products |
| **Machine Name** | `cannabis_products` |
| **Data Source** | Commerce Product |
| **Server** | Default Database Server |

### 9.2 Add Fields to the Index

Navigate to the index → **Fields tab → Add fields**:

| Field | Type | Boost |
|---|---|---|
| `title` | Fulltext | 5.0 |
| `field_brand:name` | Fulltext | 3.0 |
| `field_strain_name` | Fulltext | 3.0 |
| `body` (description) | Fulltext | 1.0 |
| `field_brand` | String (ID) | — |
| `field_strain_type` | String | — |
| `field_thc_pct` | Decimal | — |
| `field_cbd_pct` | Decimal | — |
| `stores` | String (ID) | — |
| `status` | Boolean | — |
| `type` (bundle) | String | — |
| `variations:price__number` | Decimal | — |
| `variations:field_weight_quantity` | String | — |

### 9.3 Add Processors

Navigate to the index → **Processors tab**:

Enable:
- **HTML filter** — strip HTML from description field
- **Ignore case** — case-insensitive search
- **Tokenizer** — word splitting
- **Stopwords** — common words ignored
- **Number field boost** — boost products with higher THC% for potency searches
- **Published status** — only index published products

### 9.4 Create a Search View for the API

Navigate to **Structure → Views → Add View**:

| Setting | Value |
|---|---|
| **Name** | Product Search API |
| **Show** | Search index: Cannabis Products |
| **Display** | REST Export |
| **Path** | `/api/products/search` |

**Filters to add:**
- Store ID (exposed, required)
- Bundle/product type (exposed, optional)
- Brand (exposed, optional)
- Strain type (exposed, optional)
- Status = Published (fixed, not exposed)

**Sort options to expose:**
- Relevance (default)
- Price (low to high)
- Price (high to low)
- THC% (high to low)
- Name (A-Z)

**Pager:** Full pager, 24 items per page

### 9.5 Facets Configuration

Navigate to **Configuration → Search and Metadata → Facets → Add Facet**:

Create these facets (all linked to the `cannabis_products` index, displayed on the Products Search View):

| Facet | Field | Widget | URL Alias |
|---|---|---|---|
| Brand | `field_brand` | Checkboxes | `brand` |
| Strain Type | `field_strain_type` | Checkboxes | `strain` |
| Product Type | `type` (bundle) | Checkboxes | `category` |
| THC Range | `field_thc_pct` | Range slider | `thc` |
| Price Range | `variations:price__number` | Range slider | `price` |
| Weight | `variations:field_weight_quantity` | Checkboxes | `weight` |

For each facet, configure:
- **URL processor:** Query string (e.g., `?brand=stiiizy&strain=indica`)
- **Show numbers:** Yes (show product count per facet value)
- **Empty behavior:** Don't show facets with 0 results

The Facets module exposes facet results as a block and via a REST endpoint (`/api/products/search?facets=1`). Your React app reads the facet options from the response and renders its own filter UI — it doesn't use Drupal's rendered blocks.

### 9.6 Index and Verify

```bash
drush search-api:index
drush search-api:status
```

Test the endpoint:
```bash
curl "https://your-drupal.com/api/products/search?filter[stores]={STORE_UUID}&page[limit]=10"
```

---

## 10. Per-Store Resource Filtering

Every JSON:API call from a React app must be filtered to the active store. This is enforced through JSON:API filters on the `stores` relationship field.

### 10.1 Store UUID Filter Pattern

The fundamental query pattern for all product requests:

```
GET /jsonapi/commerce_product/flower
  ?filter[stores.id]={STORE_UUID}
  &filter[status]=1
  &include=variations,field_brand,field_images
  &page[limit]=24
  &page[offset]=0
  &sort=-created
```

This pattern applies to **every** product type endpoint. The React app must always pass the store UUID — never request products without the store filter.

### 10.2 Store UUID Lookup

React apps need to know the UUID of their store. Don't hardcode UUIDs in React — fetch them from a `/api/stores` config endpoint (or embed them in the build via environment variables). Get all store UUIDs:

```bash
drush ev "
\$stores = \Drupal::entityTypeManager()->getStorage('commerce_store')->loadMultiple();
foreach (\$stores as \$store) {
  echo \$store->label() . ': ' . \$store->uuid() . PHP_EOL;
}
"
```

Document the output in section 13.

### 10.3 Promotion Filtering by Store

```
GET /jsonapi/commerce_promotion/default
  ?filter[stores.id]={STORE_UUID}
  &filter[status]=1
  &filter[start_date][condition][path]=start_date
  &filter[start_date][condition][operator]=%3C%3D
  &filter[start_date][condition][value]={CURRENT_ISO_DATE}
  &sort=-weight
```

This returns only active promotions for the given store, sorted by display weight. React uses this for the "Deals" section — not for calculating discounts (that's the cart's job).

### 10.4 Restricting API Access by Store (Optional — Advanced)

If you want to enforce that a consumer (OAuth client) can only access its own store's data, implement a custom JSON:API filter event subscriber:

```php
// src/EventSubscriber/StoreFilterSubscriber.php
namespace Drupal\mymodule\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\jsonapi\Events\CollectionResourceQueryEvent;

class StoreFilterSubscriber implements EventSubscriberInterface {
  public static function getSubscribedEvents() {
    return [CollectionResourceQueryEvent::class => 'onQuery'];
  }

  public function onQuery(CollectionResourceQueryEvent $event) {
    // Determine store UUID from active OAuth consumer
    // Add it as a mandatory filter to every commerce_product query
    $consumer = \Drupal::service('simple_oauth.server.consumer_resolver')
      ->resolve(\Drupal::request());
    if ($consumer && $store_uuid = $consumer->get('field_store_uuid')->value) {
      $event->getQuery()->condition('stores.id', $store_uuid);
    }
  }
}
```

This requires adding a `field_store_uuid` field to the Consumer entity type — so each OAuth consumer knows which store it belongs to. This is the most secure approach and prevents one store's app from ever accidentally querying another store's data.

---

## 11. Menus and Navigation

Each store app needs a navigation menu (product categories, deals page, about, etc.). Drupal menus are exposed through the JSON:API and through `decoupled_menus` API.

### 11.1 Create Per-Store Menus

Navigate to **Structure → Menus → Add Menu** — create one per store:

| Menu Name | Machine Name |
|---|---|
| Elevate Lompoc Main Nav | `elevate-main-nav` |
| One Plant Main Nav | `one-plant-main-nav` |
| Royal Healing Main Nav | `rhe-main-nav` |
| The Roots Main Nav | `trd-main-nav` |
| MJ Direct Main Nav | `mjd-main-nav` |
| Bleu Diamond Main Nav | `bd-main-nav` |
| Leaf Main Nav | `leaf-main-nav` |

Add menu items to each (Flower, Pre-Rolls, Vapes, Concentrates, Edibles, Deals, About, Contact).

### 11.2 Fetch Menu via JSON:API

```
GET /jsonapi/menu_link_content/menu_link_content
  ?filter[menu_name]={menu-machine-name}
  &filter[enabled]=1
  &sort=weight
```

Or use `decoupled_router`'s menu endpoint (cleaner for nested menus):

```
GET /api/menu-items/{menu-machine-name}
```

---

## 12. Webhooks and Cache Invalidation

When Drupal product data changes (new inventory, price change, promotion added), the React app's cached data must be invalidated. There are two approaches depending on whether you use SSR/ISR (Next.js) or a pure SPA.

### 12.1 Cache Tags (Drupal → CDN)

Every JSON:API response includes `X-Drupal-Cache-Tags` headers. If your CDN (Cloudflare, Fastly, Varnish) supports tag-based purging, configure it to:

1. Cache all `/jsonapi/*` GET responses
2. On Drupal entity save, purge cached responses matching the entity's cache tags

```yaml
# Example Varnish config snippet
sub vcl_backend_response {
  set beresp.http.Cache-Control = "public, max-age=300";
}
```

Enable `http_cache_control` module and configure at **Configuration → Development → HTTP Cache Control**:

```yaml
max_age: 300          # 5 minutes for product pages
max_age_anonymous: 300
```

### 12.2 On-Demand Revalidation (Next.js ISR)

If using Next.js with ISR (Incremental Static Regeneration), configure Drupal to call Next.js's revalidation API when products change.

Install:
```bash
composer require drupal/next
drush en next -y
```

Navigate to **Configuration → Next.js → Sites → Add Site**:

| Setting | Value |
|---|---|
| **Label** | Elevate Lompoc Next.js |
| **Base URL** | `https://elevate-lompoc.com` |
| **Preview URL** | `https://elevate-lompoc.com/api/preview` |
| **Preview Secret** | (generate a random string, store in Next.js `.env`) |
| **Revalidation URL** | `https://elevate-lompoc.com/api/revalidate` |
| **Revalidation Secret** | (separate random string) |

The `next` module triggers a POST to the revalidation URL whenever a watched entity type is saved, which tells Next.js to regenerate the affected static pages.

Create a site config per store app. The `drupal/next` module is the production-grade bridge between Drupal and Next.js.

### 12.3 Webhooks (Alternative for Non-Next.js React)

If building a pure SPA (not SSR), use the `webhooks` module:

```bash
composer require drupal/webhooks
drush en webhooks -y
```

Configure webhooks to POST to your React app's backend or a serverless function when products change. The function then invalidates the SPA's client-side cache (SWR cache, React Query cache) via a shared cache key invalidation endpoint.

---

## 13. Store API Credentials Reference

Run the following command after store entities are confirmed, then document the output here before sharing with React developers:

```bash
drush ev "
\$stores = \Drupal::entityTypeManager()->getStorage('commerce_store')->loadMultiple();
foreach (\$stores as \$store) {
  echo '---' . PHP_EOL;
  echo 'Label:       ' . \$store->label() . PHP_EOL;
  echo 'UUID:        ' . \$store->uuid() . PHP_EOL;
  echo 'Machine:     ' . \$store->id() . PHP_EOL;
}
"
```

Populate this table with the output — this is the single source of truth for React environment variables:

| Store | UUID | OAuth Client ID | Drupal Store Entity ID |
|---|---|---|---|
| Elevate Lompoc | `[run command]` | `elevate_lompoc_app` | 1 |
| One Plant Lompoc | `[run command]` | `one_plant_app` | 2 |
| Royal Healing Emporium | `[run command]` | `rhe_app` | 3 |
| The Roots Dispensary | `[run command]` | `trd_app` | 4 |
| MJ Direct Lompoc | `[run command]` | `mjd_app` | 5 |
| Bleu Diamond Lompoc | `[run command]` | `bd_app` | 6 |
| Leaf Dispensary | `[run command]` | `leaf_app` | 7 |

Each React app's `.env` file will contain:

```env
# Example: apps/elevate-lompoc/.env.local
NEXT_PUBLIC_DRUPAL_BASE_URL=https://your-drupal-backend.com
NEXT_PUBLIC_STORE_UUID=<uuid from table>
NEXT_PUBLIC_OAUTH_CLIENT_ID=elevate_lompoc_app
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://elevate-lompoc.com/auth/callback
DRUPAL_REVALIDATE_SECRET=<random string>
DRUPAL_PREVIEW_SECRET=<random string>
```

---

## 14. Endpoint Reference Sheet

Complete map of every Drupal endpoint the React apps will call. Share this with frontend developers as the API contract.

### Products

```
# All flower products for a store
GET /jsonapi/commerce_product/flower
  ?filter[stores.id]={STORE_UUID}
  &filter[status]=1
  &include=variations,field_brand,field_images
  &sort=-created
  &page[limit]=24

# Single product by UUID
GET /jsonapi/commerce_product/flower/{UUID}
  ?include=variations,field_brand,field_images

# Single product by path alias (via decoupled_router)
GET /router/translate-path?path=/products/flower/biscotti-connected

# All product types — paginated list
GET /jsonapi/commerce_product/pre_roll?filter[stores.id]={STORE_UUID}&filter[status]=1
GET /jsonapi/commerce_product/vape_cartridge?filter[stores.id]={STORE_UUID}&filter[status]=1
GET /jsonapi/commerce_product/concentrate?filter[stores.id]={STORE_UUID}&filter[status]=1
GET /jsonapi/commerce_product/edible?filter[stores.id]={STORE_UUID}&filter[status]=1
GET /jsonapi/commerce_product/tincture?filter[stores.id]={STORE_UUID}&filter[status]=1
GET /jsonapi/commerce_product/topical?filter[stores.id]={STORE_UUID}&filter[status]=1

# Product search with facets
GET /api/products/search
  ?filter[stores]={STORE_UUID}
  &filter[brand]={BRAND_UUID}
  &filter[strain_type]=indica
  &filter[thc_min]=25
  &sort=price
  &page[limit]=24
```

### Taxonomy / Filters

```
# All brands
GET /jsonapi/taxonomy_term/brand?sort=name&page[limit]=100

# All categories
GET /jsonapi/taxonomy_term/cannabis_category?sort=weight

# All strain types
GET /jsonapi/taxonomy_term/strain_type
```

### Store

```
# Specific store entity
GET /jsonapi/commerce_store/online/{STORE_UUID}

# All stores (React app uses this at init to validate its UUID)
GET /jsonapi/commerce_store/online
```

### Promotions

```
# Active promotions for a store
GET /jsonapi/commerce_promotion/default
  ?filter[stores.id]={STORE_UUID}
  &filter[status]=1
  &sort=-weight
```

### Cart (via commerce_api)

```
# Get current cart
GET /api/cart
X-Commerce-Cart-Token: {TOKEN}        (guest)
Authorization: Bearer {ACCESS_TOKEN}  (authenticated)

# Create cart + add first item
POST /api/cart
Content-Type: application/vnd.api+json
{ "data": { "type": "commerce_order--default", "relationships": { "store_id": ... } } }

# Add item to existing cart
POST /api/cart/{CART_UUID}/items
Content-Type: application/vnd.api+json
{
  "data": [{
    "type": "commerce_order_item--default",
    "attributes": { "quantity": "1" },
    "relationships": {
      "purchased_entity": {
        "data": { "type": "commerce_product_variation--flower_variation", "id": "{VARIATION_UUID}" }
      }
    }
  }]
}

# Update item quantity
PATCH /api/cart/{CART_UUID}/items/{ITEM_UUID}
{ "data": { "attributes": { "quantity": "2" } } }

# Remove item
DELETE /api/cart/{CART_UUID}/items/{ITEM_UUID}

# Clear cart
DELETE /api/cart/{CART_UUID}
```

### Checkout (via commerce_api)

```
# Get checkout state (includes shipping options, payment methods)
GET /api/checkout/{CART_UUID}

# Submit order information (step 1: contact + address)
PATCH /api/checkout/{CART_UUID}
{ "data": { "attributes": { "email": "...", "shipping_information": {...} } } }

# Submit payment (step 2)
POST /api/checkout/{CART_UUID}/payment
{ "data": { "attributes": { "payment_gateway": "manual", ... } } }
```

### OAuth

```
# Authorization endpoint (browser redirect)
GET /oauth/authorize
  ?response_type=code
  &client_id={CONSUMER_CLIENT_ID}
  &redirect_uri={CALLBACK_URL}
  &scope=commerce+profile+order_history
  &code_challenge={CODE_CHALLENGE}
  &code_challenge_method=S256

# Token exchange
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
grant_type=authorization_code
&code={AUTH_CODE}
&client_id={CONSUMER_CLIENT_ID}
&redirect_uri={CALLBACK_URL}
&code_verifier={CODE_VERIFIER}

# Token refresh
POST /oauth/token
Content-Type: application/x-www-form-urlencoded
grant_type=refresh_token
&refresh_token={REFRESH_TOKEN}
&client_id={CONSUMER_CLIENT_ID}
```

### Navigation

```
# Store-specific menu
GET /api/menu-items/{MENU_MACHINE_NAME}

# Path resolution
GET /router/translate-path?path={PATH}
```

---

## 15. Verification Checklist

Run through this after completing all configuration. Every item must pass before handing off to React development.

### Module Installation

```bash
# Verify all required modules are enabled
drush pm:list --status=enabled | grep -E \
  "jsonapi|jsonapi_extras|commerce_api|simple_oauth|consumers|subrequests|decoupled_router|search_api|facets|cors"
```

Expected output should include all 9+ modules.

### JSON:API

- [ ] `GET /jsonapi` returns resource type list with all 7 product types visible
- [ ] `GET /jsonapi/commerce_product/flower?filter[stores.id]={UUID}` returns products for one store only
- [ ] `GET /jsonapi/commerce_store/online` returns all 7 store entities
- [ ] `GET /jsonapi/taxonomy_term/brand` returns brand terms
- [ ] Response includes `X-Drupal-Cache-Tags` header
- [ ] Disabled resources (user, commerce_order) return 404

### commerce_api

- [ ] `GET /api/cart` returns 200 with empty cart (no token) or 403
- [ ] `POST /api/cart` with store UUID creates new cart and returns `Commerce-Cart-Token` header
- [ ] `POST /api/cart/{uuid}/items` adds a product variation to the cart
- [ ] Cart adjustments array shows correct tax calculation
- [ ] Cart adjustments array shows active promotion discount (test with The Roots Wake N Bake at 9am)
- [ ] `GET /api/checkout/{uuid}` returns checkout steps

### OAuth

- [ ] `GET /oauth/authorize` with correct client_id redirects to Drupal login
- [ ] After login, Drupal redirects to `redirect_uri` with `code` parameter
- [ ] `POST /oauth/token` with correct code + code_verifier returns access_token + refresh_token
- [ ] Authenticated `GET /api/cart` with Bearer token returns user's cart
- [ ] Guest cart merges into authenticated cart when token + Bearer sent together

### CORS

- [ ] OPTIONS preflight from `http://localhost:3000` returns `Access-Control-Allow-Origin: http://localhost:3000`
- [ ] `Commerce-Cart-Token` is listed in `Access-Control-Expose-Headers`
- [ ] Requests from production domains return correct CORS headers

### Search

- [ ] `GET /api/products/search?filter[stores]={UUID}` returns results
- [ ] `?filter[brand]={BRAND_UUID}` filters correctly
- [ ] `?filter[strain_type]=indica` filters correctly
- [ ] `?sort=price` sorts correctly
- [ ] Facet counts are included in response

### Path Resolution

- [ ] `GET /router/translate-path?path=/products/flower/biscotti-connected` returns correct JSON:API URL
- [ ] All products have URL aliases generated (`drush pathauto:aliases-generate`)

### Cache Invalidation

- [ ] Updating a product in Drupal admin triggers revalidation POST to Next.js (if configured)
- [ ] `X-Drupal-Cache-Tags` header changes when product data changes

### Store Isolation

- [ ] Products fetched with Store A UUID do not appear when fetching with Store B UUID
- [ ] Promotions fetched with Store A UUID do not include Store B promotions
- [ ] Cart created for Store A UUID cannot have Store B products added to it

---

## Appendix: settings.php Additions

Add to `sites/default/settings.php` before going live:

```php
// Trusted host patterns (replace with actual domains)
$settings['trusted_host_patterns'] = [
  '^your\-drupal\-backend\.com$',
  '^www\.your\-drupal\-backend\.com$',
];

// Reverse proxy support (if behind Nginx/Cloudflare)
$settings['reverse_proxy'] = TRUE;
$settings['reverse_proxy_addresses'] = ['127.0.0.1', '::1'];

// File paths for OAuth keys
$config['simple_oauth.settings']['public_key'] = '/var/drupal/keys/public.key';
$config['simple_oauth.settings']['private_key'] = '/var/drupal/keys/private.key';

// Disable Drupal's internal page cache for API routes (CDN handles caching)
$settings['cache']['bins']['render'] = 'cache.backend.null';
// NOTE: Only do this if using a CDN/Varnish in front. Without a CDN this destroys performance.

// Private file path (for COA PDFs and protected files)
$settings['file_private_path'] = '/var/drupal/private';
```

---

*Last updated: February 2026 | Drupal 10 | Commerce 2.x | commerce_api 1.x | simple_oauth 6.x*
