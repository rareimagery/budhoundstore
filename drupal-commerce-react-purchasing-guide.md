# Drupal Commerce + React: Product Purchasing Implementation Guide

## Overview

This guide covers the recommended architecture and step-by-step implementation for enabling product purchasing on a **React frontend** powered by **Drupal Commerce** as the backend. The approach uses Drupal's **JSON:API** (or **REST API**) to expose commerce endpoints, and the React app consumes them to handle the full cart → checkout → payment flow.

---

## Recommended Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│     React Frontend       │  HTTP   │     Drupal Commerce Backend   │
│                          │◄───────►│                              │
│  - Product Display       │ JSON:API│  - Commerce Product entities │
│  - Add to Cart           │   or    │  - Commerce Order system     │
│  - Cart Management       │  REST   │  - Commerce Cart API         │
│  - Checkout Form         │         │  - Commerce Payment          │
│  - Payment Integration   │         │  - JSON:API / REST resources │
│  - Order Confirmation    │         │  - OAuth2 / Session Auth     │
└─────────────────────────┘         └──────────────────────────────┘
```

### Why This Stack

| Concern | Recommendation | Reason |
|---------|---------------|--------|
| **API Layer** | JSON:API (core) + Commerce Cart API | JSON:API is in Drupal core, well-supported, and Drupal Commerce provides dedicated cart/checkout REST resources |
| **Authentication** | Simple OAuth (OAuth2) for registered users; session-based for anonymous carts | Enables token-based auth for React SPA while still supporting guest checkout |
| **Payment** | Stripe via `commerce_stripe` or PayPal via `commerce_paypal` | First-class Drupal Commerce integration modules; tokenized payments keep PCI scope minimal |
| **State Management** | React Context or Zustand for cart state | Lightweight, avoids Redux boilerplate for a cart-centric flow |

---

## Part 1: Drupal Backend Configuration

### 1.1 Required Modules

Install and enable these modules on your Drupal site:

```bash
composer require drupal/commerce
composer require drupal/commerce_cart_api
composer require drupal/commerce_api
composer require drupal/simple_oauth
composer require drupal/cors_ui          # or configure CORS manually
composer require drupal/restui           # admin UI for REST resources (dev)
```

Enable the modules:

```bash
drush en commerce commerce_product commerce_cart commerce_checkout \
  commerce_payment commerce_order commerce_cart_api commerce_api \
  simple_oauth jsonapi restui cors_ui -y
```

### 1.2 Module Breakdown

| Module | Purpose |
|--------|---------|
| `commerce` | Core commerce framework |
| `commerce_product` | Product types, variations, pricing |
| `commerce_cart` | Cart functionality |
| `commerce_cart_api` | **Critical** — Exposes REST endpoints for cart operations (`/cart`, `/cart/add`, `/cart/{id}/items`) |
| `commerce_api` | Enhanced JSON:API support for commerce entities |
| `commerce_checkout` | Checkout flow (backend processing) |
| `commerce_payment` | Payment gateway integration |
| `simple_oauth` | OAuth2 token-based authentication for the React SPA |
| `jsonapi` | Core JSON:API (ships with Drupal 9/10/11) |

### 1.3 CORS Configuration

Your React app runs on a different origin, so CORS must be configured. Edit `sites/default/services.yml`:

```yaml
cors.config:
  enabled: true
  allowedHeaders:
    - Content-Type
    - Authorization
    - X-CSRF-Token
    - Commerce-Current-Store
    - Commerce-Cart-Token
  allowedMethods:
    - GET
    - POST
    - PATCH
    - DELETE
    - OPTIONS
  allowedOrigins:
    - 'http://localhost:3000'       # React dev server
    - 'https://your-production-domain.com'
  exposedHeaders:
    - Commerce-Cart-Token
  maxAge: 600
  supportsCredentials: true
```

> **Important:** `Commerce-Cart-Token` is used by the Cart API to associate anonymous sessions with carts. It must be in both `allowedHeaders` and `exposedHeaders`.

### 1.4 Authentication Setup (Simple OAuth)

1. Navigate to **Configuration → People → Simple OAuth** (`/admin/config/people/simple_oauth`)
2. Generate keys:
   ```bash
   openssl genrsa -out /path/to/private.key 2048
   openssl rsa -in /path/to/private.key -pubout -out /path/to/public.key
   chmod 600 /path/to/private.key
   ```
3. Set the key paths in Simple OAuth settings
4. Create an OAuth Consumer at `/admin/config/services/consumer/add`:
   - **Label:** React Frontend
   - **Client ID:** (auto-generated or custom)
   - **New Secret:** (your client secret)
   - **Scopes:** Assign appropriate roles
   - **Redirect URI:** `http://localhost:3000/callback` (or production URL)

### 1.5 Commerce Store & Product Setup

Ensure you have at least one **Store** configured and products created with **variations** (size, color, etc.). Each variation holds the SKU, price, and stock.

Navigate to: **Commerce → Configuration → Stores** and **Commerce → Products**

### 1.6 Payment Gateway Configuration

#### Stripe (Recommended)

```bash
composer require drupal/commerce_stripe
drush en commerce_stripe -y
```

Configure at **Commerce → Configuration → Payment gateways → Add payment gateway**:

- **Plugin:** Stripe (Stripe.js + Elements)
- **Mode:** Test → Live when ready
- **Publishable Key:** `pk_test_...`
- **Secret Key:** `sk_test_...`

> **Note:** With Stripe Elements, the card form is rendered by Stripe's JS SDK in the React frontend. The payment token is sent to Drupal, which processes it server-side. This keeps you out of PCI scope.

#### PayPal (Alternative)

```bash
composer require drupal/commerce_paypal
drush en commerce_paypal -y
```

Configure similarly with your PayPal client ID and secret.

---

## Part 2: API Endpoints Reference

### 2.1 Product Data (JSON:API)

```
GET /jsonapi/commerce_product/default
GET /jsonapi/commerce_product/default/{uuid}
GET /jsonapi/commerce_product_variation/default?filter[product_id]={id}
```

Include related data with `?include=variations,variations.field_images`

### 2.2 Cart Operations (Commerce Cart API)

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| Get carts | `GET` | `/cart?_format=json` | — |
| Add to cart | `POST` | `/cart/add?_format=json` | `[{ purchased_entity_type, purchased_entity_id, quantity }]` |
| Update quantity | `PATCH` | `/cart/{order_id}/items/{item_id}?_format=json` | `{ quantity: 2 }` |
| Remove item | `DELETE` | `/cart/{order_id}/items/{item_id}?_format=json` | — |
| Clear cart | `DELETE` | `/cart/{order_id}/items?_format=json` | — |

### 2.3 Checkout (Commerce API / Custom REST)

The `commerce_api` module provides JSON:API-compatible checkout resources:

```
PATCH /jsonapi/commerce_order/default/{uuid}
  Body: { data: { type, id, attributes: { shipping_info, billing_info } } }
```

For custom checkout flows, you may need a **custom REST resource** or use the `commerce_api` checkout endpoints.

### 2.4 Payment

Payment is typically handled by:

1. Collecting payment info in React (e.g., Stripe Elements captures card → returns `paymentMethod` token)
2. Sending the token to Drupal via a custom or contrib REST endpoint
3. Drupal processes the payment server-side through the configured gateway

---

## Part 3: React Frontend Implementation

### 3.1 Project Setup

```bash
npx create-react-app drupal-commerce-store
cd drupal-commerce-store
npm install axios @stripe/stripe-js @stripe/react-stripe-js
```

### 3.2 API Client

Create a centralized API client that handles auth tokens and cart tokens:

```javascript
// src/api/commerceClient.js

import axios from 'axios';

const DRUPAL_BASE_URL = process.env.REACT_APP_DRUPAL_URL || 'https://your-drupal-site.com';

const client = axios.create({
  baseURL: DRUPAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Attach OAuth token for authenticated users
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('oauth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach cart token for anonymous users
  const cartToken = localStorage.getItem('commerce_cart_token');
  if (cartToken) {
    config.headers['Commerce-Cart-Token'] = cartToken;
  }

  return config;
});

// Capture cart token from responses
client.interceptors.response.use((response) => {
  const cartToken = response.headers['commerce-cart-token'];
  if (cartToken) {
    localStorage.setItem('commerce_cart_token', cartToken);
  }
  return response;
});

export default client;
```

### 3.3 Authentication Service

```javascript
// src/api/auth.js

import client from './commerceClient';

const CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_OAUTH_CLIENT_SECRET;

export async function login(username, password) {
  const response = await client.post('/oauth/token', new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username,
    password,
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  localStorage.setItem('oauth_token', response.data.access_token);
  localStorage.setItem('oauth_refresh', response.data.refresh_token);

  return response.data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem('oauth_refresh');
  const response = await client.post('/oauth/token', new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refresh,
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  localStorage.setItem('oauth_token', response.data.access_token);
  localStorage.setItem('oauth_refresh', response.data.refresh_token);

  return response.data;
}

export function logout() {
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('oauth_refresh');
}
```

### 3.4 Product Fetching

```javascript
// src/api/products.js

import client from './commerceClient';

export async function getProducts() {
  const response = await client.get(
    '/jsonapi/commerce_product/default?include=variations,variations.field_images&sort=-created'
  );
  return response.data;
}

export async function getProduct(uuid) {
  const response = await client.get(
    `/jsonapi/commerce_product/default/${uuid}?include=variations,variations.field_images`
  );
  return response.data;
}
```

### 3.5 Cart Context & Provider

```jsx
// src/context/CartContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/commerceClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const response = await client.get('/cart?_format=json');
      // Cart API returns an array of carts; use the first (default) one
      const carts = response.data;
      setCart(carts.length > 0 ? carts[0] : null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (variationId, quantity = 1) => {
    try {
      await client.post('/cart/add?_format=json', [
        {
          purchased_entity_type: 'commerce_product_variation',
          purchased_entity_id: variationId,
          quantity,
        },
      ]);
      await fetchCart();
    } catch (error) {
      console.error('Add to cart failed:', error);
      throw error;
    }
  };

  const updateCartItem = async (orderItemId, quantity) => {
    if (!cart) return;
    try {
      await client.patch(
        `/cart/${cart.order_id}/items/${orderItemId}?_format=json`,
        { quantity }
      );
      await fetchCart();
    } catch (error) {
      console.error('Update cart failed:', error);
      throw error;
    }
  };

  const removeCartItem = async (orderItemId) => {
    if (!cart) return;
    try {
      await client.delete(
        `/cart/${cart.order_id}/items/${orderItemId}?_format=json`
      );
      await fetchCart();
    } catch (error) {
      console.error('Remove from cart failed:', error);
      throw error;
    }
  };

  const cartCount = cart?.order_items?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const cartTotal = cart?.total_price?.formatted || '$0.00';

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        addToCart,
        updateCartItem,
        removeCartItem,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
```

### 3.6 Add to Cart Button Component

```jsx
// src/components/AddToCartButton.jsx

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function AddToCartButton({ variationId, label = 'Add to Cart' }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    setSuccess(false);
    try {
      await addToCart(variationId, quantity);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      alert('Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="add-to-cart">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
      />
      <button onClick={handleAdd} disabled={adding}>
        {adding ? 'Adding...' : success ? 'Added!' : label}
      </button>
    </div>
  );
}
```

### 3.7 Cart Page Component

```jsx
// src/components/CartPage.jsx

import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { cart, loading, cartTotal, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <p>Loading cart...</p>;
  if (!cart || !cart.order_items?.length) return <p>Your cart is empty.</p>;

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.order_items.map((item) => (
            <tr key={item.order_item_id}>
              <td>{item.title}</td>
              <td>{item.unit_price?.formatted}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateCartItem(item.order_item_id, parseInt(e.target.value) || 1)
                  }
                />
              </td>
              <td>{item.total_price?.formatted}</td>
              <td>
                <button onClick={() => removeCartItem(item.order_item_id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <strong>Total: {cartTotal}</strong>
        <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
}
```

### 3.8 Checkout with Stripe Payment

```jsx
// src/components/CheckoutPage.jsx

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import client from '../api/commerceClient';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, refreshCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const [billingInfo, setBillingInfo] = useState({
    given_name: '',
    family_name: '',
    address_line1: '',
    locality: '',        // city
    administrative_area: '', // state
    postal_code: '',
    country_code: 'US',
  });

  const [email, setEmail] = useState('');

  const handleInputChange = (field) => (e) => {
    setBillingInfo({ ...billingInfo, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Update the order with billing/contact info
      await client.patch(`/cart/${cart.order_id}?_format=json`, {
        mail: email,
        billing_profile: {
          address: billingInfo,
        },
      });

      // Step 2: Create Stripe PaymentMethod
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${billingInfo.given_name} ${billingInfo.family_name}`,
          email: email,
          address: {
            line1: billingInfo.address_line1,
            city: billingInfo.locality,
            state: billingInfo.administrative_area,
            postal_code: billingInfo.postal_code,
            country: billingInfo.country_code,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Step 3: Send payment method to Drupal to process
      // This endpoint depends on your Drupal setup. Common patterns:
      //   - Custom REST resource that accepts Stripe PaymentMethod ID
      //   - commerce_api checkout endpoint
      const paymentResponse = await client.post(
        `/commerce/checkout/${cart.order_id}/payment?_format=json`,
        {
          gateway: 'stripe',                     // machine name of payment gateway
          payment_method_id: paymentMethod.id,
        }
      );

      // Step 4: Handle 3D Secure / SCA if required
      if (paymentResponse.data.requires_action) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          paymentResponse.data.client_secret
        );
        if (confirmError) {
          setError(confirmError.message);
          setProcessing(false);
          return;
        }
        // Confirm with Drupal that 3DS was completed
        await client.post(
          `/commerce/checkout/${cart.order_id}/payment/confirm?_format=json`
        );
      }

      // Step 5: Place the order
      await client.post(`/commerce/checkout/${cart.order_id}/complete?_format=json`);

      setOrderComplete(true);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="order-confirmation">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2>Contact Information</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <h2>Billing Address</h2>
      <input placeholder="First Name" value={billingInfo.given_name}
        onChange={handleInputChange('given_name')} required />
      <input placeholder="Last Name" value={billingInfo.family_name}
        onChange={handleInputChange('family_name')} required />
      <input placeholder="Address" value={billingInfo.address_line1}
        onChange={handleInputChange('address_line1')} required />
      <input placeholder="City" value={billingInfo.locality}
        onChange={handleInputChange('locality')} required />
      <input placeholder="State" value={billingInfo.administrative_area}
        onChange={handleInputChange('administrative_area')} required />
      <input placeholder="ZIP Code" value={billingInfo.postal_code}
        onChange={handleInputChange('postal_code')} required />

      <h2>Payment</h2>
      <div className="stripe-card-wrapper">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#32325d' },
            invalid: { color: '#fa755a' },
          },
        }} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={!stripe || processing}>
        {processing ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <div className="checkout-page">
        <h1>Checkout</h1>
        <CheckoutForm />
      </div>
    </Elements>
  );
}
```

### 3.9 App Router Setup

```jsx
// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProductListPage from './components/ProductListPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:uuid" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
```

---

## Part 4: Custom Drupal REST Endpoint (If Needed)

If `commerce_api` doesn't expose checkout/payment endpoints matching your flow, create a custom module:

```php
// modules/custom/commerce_react_checkout/src/Plugin/rest/resource/CheckoutPaymentResource.php

namespace Drupal\commerce_react_checkout\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\commerce_order\Entity\Order;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides a checkout payment resource.
 *
 * @RestResource(
 *   id = "commerce_checkout_payment",
 *   label = @Translation("Commerce Checkout Payment"),
 *   uri_paths = {
 *     "create" = "/api/checkout/{order_id}/pay"
 *   }
 * )
 */
class CheckoutPaymentResource extends ResourceBase {

  public function post($order_id, Request $request) {
    $data = json_decode($request->getContent(), TRUE);
    $order = Order::load($order_id);

    // Validate order belongs to current user/session
    // Process payment through the configured gateway
    // Transition order state to 'completed'

    /** @var \Drupal\commerce_payment\PaymentGatewayManager $gateway_manager */
    $gateway_manager = \Drupal::service('plugin.manager.commerce_payment_gateway');

    // Implementation depends on your specific gateway and flow
    // See commerce_stripe module for Stripe-specific processing

    return new ResourceResponse(['status' => 'success', 'order_id' => $order->id()]);
  }
}
```

---

## Part 5: Environment Variables

Create a `.env` file in your React project:

```env
REACT_APP_DRUPAL_URL=https://your-drupal-site.com
REACT_APP_OAUTH_CLIENT_ID=your-oauth-client-id
REACT_APP_OAUTH_CLIENT_SECRET=your-oauth-client-secret
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

> **Security Note:** `CLIENT_SECRET` in a client-side app is not truly secret. For production, consider using the **Authorization Code + PKCE** OAuth2 flow instead of the password grant. Simple OAuth supports this.

---

## Part 6: Deployment Checklist

### Drupal Backend
- [ ] All commerce modules installed and configured
- [ ] At least one Store entity created
- [ ] Products and variations created with correct pricing
- [ ] Payment gateway configured (Stripe/PayPal) in **Live** mode
- [ ] Simple OAuth keys generated and consumer configured
- [ ] CORS configured for production domain
- [ ] SSL/TLS enabled (required for payment processing)
- [ ] Cron configured for order processing and cleanup
- [ ] Permissions reviewed: anonymous users can access cart API endpoints

### React Frontend
- [ ] Environment variables set for production
- [ ] Stripe publishable key switched to live
- [ ] Error handling and loading states implemented
- [ ] Cart persistence tested across sessions (anonymous + authenticated)
- [ ] 3D Secure / SCA flow tested
- [ ] Order confirmation page/email verified
- [ ] Mobile responsiveness validated

### Security
- [ ] OAuth tokens stored securely (consider httpOnly cookies via a proxy)
- [ ] Cart token validated server-side
- [ ] Rate limiting on checkout endpoints
- [ ] Input validation on all form fields
- [ ] PCI compliance verified (no raw card data touches your servers)

---

## Part 7: Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `services.yml` config, clear Drupal cache (`drush cr`) |
| 403 on cart endpoints | Check permissions at `/admin/people/permissions` — anonymous users need "Use cart API" |
| Cart not persisting | Ensure `Commerce-Cart-Token` header is sent/received; check CORS `exposedHeaders` |
| OAuth token expired | Implement token refresh logic in your Axios interceptor |
| Payment fails | Check Drupal logs (`/admin/reports/dblog`), Stripe dashboard for error details |
| Products not appearing in JSON:API | Ensure products are **published** and JSON:API is not restricted by role |

---

## Additional Resources

- [Drupal Commerce Documentation](https://docs.drupalcommerce.org/)
- [Commerce Cart API Module](https://www.drupal.org/project/commerce_cart_api)
- [Commerce API Module](https://www.drupal.org/project/commerce_api)
- [Simple OAuth Documentation](https://www.drupal.org/project/simple_oauth)
- [Stripe Elements React](https://stripe.com/docs/stripe-js/react)
- [Drupal JSON:API Documentation](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module)
