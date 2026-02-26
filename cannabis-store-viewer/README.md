# BudStore React Frontend

React 19 SPA for the BudStore cannabis marketplace. Connects to a Drupal 11
Commerce backend via JSON:API and custom REST endpoints.

## Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | ^19.2.4 | UI framework |
| react-dom | ^19.2.4 | DOM rendering |
| react-router-dom | ^7.13.0 | Client-side routing |
| axios | ^1.13.5 | HTTP client (cart & checkout) |
| @stripe/react-stripe-js | ^5.6.0 | Stripe Elements (future use) |
| @stripe/stripe-js | ^8.7.0 | Stripe JS SDK (future use) |
| tailwindcss | ^3.4.19 | Utility CSS (StoreDirectory) |

Styling is a mix of plain CSS (`App.css`, component-level `.css` files) and
Tailwind utility classes used in `StoreDirectory.js`.

## Setup

```bash
npm install
npm start       # development server on http://localhost:3000
npm run build   # production build -> build/
npm test        # Jest + React Testing Library
```

## Environment Variables

Create a `.env` file in this directory:

```
REACT_APP_DRUPAL_URL=http://localhost:8080
REACT_APP_STORE_TYPE=online
REACT_APP_OAUTH_CLIENT_ID=       # optional — only needed for OAuth authenticated users
```

`REACT_APP_DRUPAL_URL` is used by both `src/api.js` (JSON:API product/store
fetches) and `src/api/commerceClient.js` / `src/api/drupalClient.js` (cart and
checkout calls). Defaults to `http://localhost:8080` if not set.

`REACT_APP_STORE_TYPE` controls which Commerce store type is queried:
`/jsonapi/commerce_store/{STORE_TYPE}`. Defaults to `online`.

## Key Files

```
src/
├── api.js                      — fetchStores(), fetchProductsForStore(), PRODUCT_TYPES, slugify()
├── App.js                      — root component, React Router routes, CartProvider
├── App.css                     — global styles (~1000 lines)
│
├── api/
│   ├── commerceClient.js       — Axios instance for cart/checkout (attaches Commerce-Cart-Token)
│   ├── drupalClient.js         — Axios instance for JSON:API (handles OAuth + token refresh)
│   ├── cart.js                 — fetchCart(), addToCart(), updateCartItem(), removeCartItem(), clearCart()
│   └── auth.js                 — OAuth helpers
│
├── components/
│   ├── StoreDirectory.js       — homepage: hero, "how it works", store grid
│   ├── StorePage.js            — per-store product listing with category filter
│   ├── ProductModal.jsx        — product detail modal (description, variations, add-to-cart)
│   ├── ProductDescription.jsx  — renders Leafly description text
│   ├── AddToCartButton.jsx     — add-to-cart UI with variation selector
│   ├── CartDrawer.jsx          — slide-out cart panel
│   ├── CartPage.jsx            — full cart page (/cart route)
│   ├── CheckoutPage.jsx        — multi-step checkout (information -> review -> complete)
│   ├── Nav.js                  — top navigation bar with cart icon
│   └── ErrorBoundary.jsx       — React error boundary wrapper
│
├── context/
│   └── CartContext.js          — CartProvider, useCartContext(); cart state via Drupal Commerce
│
└── hooks/
    ├── useCart.js              — reads cart items and total from CartContext
    ├── useAddToCart.js         — wraps addToCart() API call with loading/error state
    └── useCheckout.js          — multi-step COD checkout state machine
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `StoreDirectory` | Store listing homepage |
| `/store/:storeId/*` | `StorePage` | Product menu for a specific store |
| `/cart` | `CartPage` | Full cart view |
| `/checkout` | `CheckoutPage` | COD checkout flow |
| `/order-confirmation` | `OrderConfirmation` | Post-order confirmation screen |

## Cart / Checkout Flow

The checkout uses a three-step state machine managed by `useCheckout.js`:

### Step 1 — Information

Customer enters email, phone, first/last name, and billing address. Data is
validated locally with no API call. Required fields: email, first name, last
name, street address, city, ZIP. Default state and country: `CA` / `US`.

### Step 2 — Review

Customer reviews cart items, billing address, and payment method (always
Cash on Delivery). Clicking "Place Order" triggers `placeOrder()`.

### Step 3 — Complete

`placeOrder()` in `useCheckout.js` calls `POST /api/cod-checkout` with this
payload:

```json
{
  "order_uuid":    "<cart UUID from CartContext>",
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

On success the cart is cleared (`dispatch({ type: "CLEAR_CART" })`) and the
`OrderConfirmation` component is rendered with the returned `order_id`.

### Cart Token Handling

Anonymous sessions use a `Commerce-Cart-Token` header for cart ownership.
`commerceClient.js` reads the token from `localStorage` (`commerce_cart_token`)
and attaches it to every request. Drupal issues the token on the first cart
response; it is captured by the Axios response interceptor and persisted in
`localStorage`.

## Adding a New Product Type

1. Add the machine name to `PRODUCT_TYPES` in `src/api.js`:

```js
const PRODUCT_TYPES = [
  "flower",
  "pre_roll",
  // ... existing types
  "your_new_type",  // add here
];
```

2. Add a display label to `PRODUCT_TYPE_LABELS` in the same file:

```js
const PRODUCT_TYPE_LABELS = {
  // ... existing labels
  your_new_type: "Your New Type",
};
```

3. Create the matching product type in Drupal at
   `/admin/commerce/config/product-types` with machine name `your_new_type`.

The frontend will automatically fetch and display products of the new type
for every store on the next page load. Products are fetched in parallel via
`Promise.allSettled` so a missing type returns an empty array without
breaking the other types.
