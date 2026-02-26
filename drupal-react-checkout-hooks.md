# Drupal Commerce + React: Checkout & Cart Hooks

Complete integration guide for connecting a React frontend to Drupal Commerce using JSON\:API, covering add-to-cart functionality and a Cash on Delivery (COD) checkout flow.

---

## Prerequisites

- Drupal Commerce with JSON\:API enabled
- OAuth2 (PKCE) authentication configured
- React frontend with environment variables pointing to your Drupal backend
- Drupal modules: `commerce_cart`, `commerce_checkout`, `commerce_payment`, `commerce_cod` (or manual offline payment gateway)

### Environment Variables

```env
REACT_APP_DRUPAL_BASE_URL=https://your-drupal-site.com
REACT_APP_OAUTH_CLIENT_ID=your_client_id
```

---

## 1. API Client Setup

A shared Axios instance that handles authentication tokens for all Commerce API requests.

```javascript
// src/api/drupalClient.js
import axios from 'axios';

const drupalClient = axios.create({
  baseURL: process.env.REACT_APP_DRUPAL_BASE_URL,
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
  },
  withCredentials: true,
});

// Attach OAuth token to every request
drupalClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('oauth_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — refresh or redirect to login
drupalClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh or redirect to login
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        return drupalClient.request(error.config);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

async function attemptTokenRefresh() {
  const refreshToken = localStorage.getItem('oauth_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_DRUPAL_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.REACT_APP_OAUTH_CLIENT_ID,
      })
    );
    localStorage.setItem('oauth_access_token', res.data.access_token);
    localStorage.setItem('oauth_refresh_token', res.data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export default drupalClient;
```

---

## 2. Cart Context & Provider

A React context that holds cart state globally so any component can read or modify the cart.

```javascript
// src/context/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: true,
    error: null,
  });

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { default: drupalClient } = await import('../api/drupalClient');
      const res = await drupalClient.get(
        '/jsonapi/commerce-cart/carts?include=order_items,order_items.purchased_entity'
      );
      const carts = res.data.data;
      dispatch({ type: 'SET_CART', payload: carts.length > 0 ? carts[0] : null });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }

  return (
    <CartContext.Provider value={{ ...state, dispatch, refreshCart: loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
}
```

---

## 3. useAddToCart Hook

Handles adding product variations to the cart, including quantity updates and optimistic feedback.

```javascript
// src/hooks/useAddToCart.js
import { useState, useCallback } from 'react';
import drupalClient from '../api/drupalClient';
import { useCartContext } from '../context/CartContext';

export function useAddToCart() {
  const { refreshCart } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Add a product variation to the cart.
   *
   * @param {string} variationId  - Drupal product variation UUID
   * @param {number} quantity     - Quantity to add (default 1)
   */
  const addToCart = useCallback(async (variationId, quantity = 1) => {
    setAdding(true);
    setError(null);
    setSuccess(false);

    try {
      await drupalClient.post('/jsonapi/commerce-cart/add', {
        data: [
          {
            type: 'product-variation--default',
            id: variationId,
            meta: {
              quantity: quantity,
            },
          },
        ],
      });

      setSuccess(true);
      await refreshCart();

      // Auto-clear success flag after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.detail ||
        'Failed to add item to cart.';
      setError(msg);
    } finally {
      setAdding(false);
    }
  }, [refreshCart]);

  return { addToCart, adding, error, success };
}
```

### Usage in a Product Component

```jsx
// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useAddToCart } from '../hooks/useAddToCart';

export default function ProductCard({ product }) {
  const { addToCart, adding, error, success } = useAddToCart();
  const [qty, setQty] = useState(1);

  // The default variation UUID
  const variationId = product.relationships
    ?.variations?.data?.[0]?.id;

  return (
    <div className="product-card">
      <h3>{product.attributes.title}</h3>
      <p>{product.attributes.field_thc_percentage}% THC</p>
      <p>${product.attributes.price?.formatted}</p>

      <label>
        Qty:
        <input
          type="number"
          min={1}
          max={10}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10))}
        />
      </label>

      <button
        onClick={() => addToCart(variationId, qty)}
        disabled={adding}
      >
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>

      {success && <span className="toast-success">Added!</span>}
      {error && <span className="toast-error">{error}</span>}
    </div>
  );
}
```

---

## 4. useCart Hook

Manages reading cart contents, updating item quantities, and removing items.

```javascript
// src/hooks/useCart.js
import { useCallback } from 'react';
import drupalClient from '../api/drupalClient';
import { useCartContext } from '../context/CartContext';

export function useCart() {
  const { cart, loading, error, refreshCart, dispatch } = useCartContext();

  // Compute derived values
  const items = cart?.relationships?.order_items?.data || [];
  const itemCount = items.reduce((sum, item) => {
    const qty = item.meta?.quantity || item.attributes?.quantity || 1;
    return sum + qty;
  }, 0);
  const totalPrice = cart?.attributes?.total_price?.formatted || '$0.00';

  /**
   * Update quantity of a specific order item.
   */
  const updateItemQuantity = useCallback(async (orderItemId, newQuantity) => {
    try {
      await drupalClient.patch(
        `/jsonapi/commerce-cart/items/${orderItemId}`,
        {
          data: {
            type: 'order-item--default',
            id: orderItemId,
            attributes: {
              quantity: newQuantity,
            },
          },
        }
      );
      await refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    }
  }, [refreshCart]);

  /**
   * Remove an item from the cart entirely.
   */
  const removeItem = useCallback(async (orderItemId) => {
    try {
      await drupalClient.delete(
        `/jsonapi/commerce-cart/items/${orderItemId}`
      );
      await refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      throw err;
    }
  }, [refreshCart]);

  /**
   * Clear all items from the cart.
   */
  const clearCart = useCallback(async () => {
    if (!cart) return;
    try {
      await drupalClient.delete(`/jsonapi/commerce-cart/carts/${cart.id}/items`);
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  }, [cart, dispatch]);

  return {
    cart,
    items,
    itemCount,
    totalPrice,
    loading,
    error,
    updateItemQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };
}
```

---

## 5. useCheckout Hook — Cash on Delivery

Handles the full checkout flow: collecting customer info, applying the COD payment gateway, and placing the order.

### 5a. Drupal-Side Setup: COD Payment Gateway

Before the hook works, configure a manual/COD payment gateway in Drupal:

1. Go to **Commerce → Configuration → Payment gateways**
2. Add a new gateway:
   - **Plugin**: Manual
   - **Label**: `Cash on Delivery`
   - **Machine name**: `cash_on_delivery`
   - **Display name**: `Pay with Cash at Pickup / Delivery`
   - **Mode**: Live
   - **Instructions**: `Please have exact cash ready. Payment is collected on delivery.`
3. Save the gateway.

### 5b. The Checkout Hook

```javascript
// src/hooks/useCheckout.js
import { useState, useCallback } from 'react';
import drupalClient from '../api/drupalClient';
import { useCartContext } from '../context/CartContext';

const INITIAL_CHECKOUT = {
  step: 'information',   // information → review → complete
  customerInfo: {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: 'CA',
      zip: '',
      country: 'US',
    },
  },
  orderNotes: '',
};

export function useCheckout() {
  const { cart, refreshCart, dispatch } = useCartContext();
  const [checkout, setCheckout] = useState(INITIAL_CHECKOUT);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  /**
   * Update customer information fields.
   */
  const updateCustomerInfo = useCallback((field, value) => {
    setCheckout((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value,
      },
    }));
  }, []);

  /**
   * Update nested address fields.
   */
  const updateAddress = useCallback((field, value) => {
    setCheckout((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        address: {
          ...prev.customerInfo.address,
          [field]: value,
        },
      },
    }));
  }, []);

  /**
   * Navigate between checkout steps.
   */
  const goToStep = useCallback((step) => {
    setCheckout((prev) => ({ ...prev, step }));
  }, []);

  /**
   * Step 1: Save billing/shipping profile to the order.
   */
  const saveCustomerInfo = useCallback(async () => {
    if (!cart) throw new Error('No active cart');
    setProcessing(true);
    setError(null);

    const { customerInfo } = checkout;

    try {
      // Update the order with customer email
      await drupalClient.patch(`/jsonapi/orders/default/${cart.id}`, {
        data: {
          type: cart.type,
          id: cart.id,
          attributes: {
            mail: customerInfo.email,
            field_order_notes: checkout.orderNotes || '',
          },
        },
      });

      // Set billing profile
      await drupalClient.post(`/jsonapi/profiles/customer`, {
        data: {
          type: 'profile--customer',
          attributes: {
            address: {
              country_code: customerInfo.address.country,
              administrative_area: customerInfo.address.state,
              locality: customerInfo.address.city,
              postal_code: customerInfo.address.zip,
              address_line1: customerInfo.address.line1,
              address_line2: customerInfo.address.line2,
              given_name: customerInfo.firstName,
              family_name: customerInfo.lastName,
            },
            field_phone: customerInfo.phone,
          },
        },
      });

      goToStep('review');
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.detail ||
        'Failed to save customer info.';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [cart, checkout, goToStep]);

  /**
   * Step 2: Place the order with Cash on Delivery.
   * This creates a manual payment and transitions the order to "completed."
   */
  const placeOrder = useCallback(async () => {
    if (!cart) throw new Error('No active cart');
    setProcessing(true);
    setError(null);

    try {
      // Apply the COD payment gateway to the order
      const paymentRes = await drupalClient.post('/jsonapi/payments/manual', {
        data: {
          type: 'payment--payment-manual',
          attributes: {
            payment_gateway_mode: 'live',
          },
          relationships: {
            payment_gateway: {
              data: {
                type: 'commerce_payment_gateway--commerce_payment_gateway',
                id: 'cash_on_delivery',  // machine name from Drupal config
              },
            },
            order: {
              data: {
                type: cart.type,
                id: cart.id,
              },
            },
          },
        },
      });

      // Transition the order through checkout completion
      await drupalClient.post(
        `/jsonapi/commerce-checkout/${cart.id}/complete`
      );

      setCompletedOrder({
        orderId: cart.attributes?.order_number || cart.id,
        total: cart.attributes?.total_price?.formatted,
        paymentMethod: 'Cash on Delivery',
      });

      goToStep('complete');
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.detail ||
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [cart, dispatch, goToStep]);

  return {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  };
}
```

---

## 6. Checkout Page Component

Ties together the `useCart` and `useCheckout` hooks into a multi-step checkout UI.

```jsx
// src/pages/CheckoutPage.jsx
import React from 'react';
import { useCart } from '../hooks/useCart';
import { useCheckout } from '../hooks/useCheckout';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  } = useCheckout();

  if (checkout.step === 'complete' && completedOrder) {
    return (
      <div className="checkout-complete">
        <h2>Order Confirmed!</h2>
        <p>Order #: {completedOrder.orderId}</p>
        <p>Total: {completedOrder.total}</p>
        <p>Payment: {completedOrder.paymentMethod}</p>
        <p>Please have cash ready at the time of pickup/delivery.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {/* Step indicator */}
      <div className="checkout-steps">
        <span className={checkout.step === 'information' ? 'active' : ''}>
          1. Information
        </span>
        <span className={checkout.step === 'review' ? 'active' : ''}>
          2. Review & Pay
        </span>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      {/* STEP 1: Customer Information */}
      {checkout.step === 'information' && (
        <form onSubmit={(e) => { e.preventDefault(); saveCustomerInfo(); }}>
          <fieldset>
            <legend>Contact</legend>
            <input
              type="email" required placeholder="Email"
              value={checkout.customerInfo.email}
              onChange={(e) => updateCustomerInfo('email', e.target.value)}
            />
            <input
              type="tel" placeholder="Phone"
              value={checkout.customerInfo.phone}
              onChange={(e) => updateCustomerInfo('phone', e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>Billing Address</legend>
            <input
              placeholder="First Name" required
              value={checkout.customerInfo.firstName}
              onChange={(e) => updateCustomerInfo('firstName', e.target.value)}
            />
            <input
              placeholder="Last Name" required
              value={checkout.customerInfo.lastName}
              onChange={(e) => updateCustomerInfo('lastName', e.target.value)}
            />
            <input
              placeholder="Address Line 1" required
              value={checkout.customerInfo.address.line1}
              onChange={(e) => updateAddress('line1', e.target.value)}
            />
            <input
              placeholder="Address Line 2"
              value={checkout.customerInfo.address.line2}
              onChange={(e) => updateAddress('line2', e.target.value)}
            />
            <input
              placeholder="City" required
              value={checkout.customerInfo.address.city}
              onChange={(e) => updateAddress('city', e.target.value)}
            />
            <input
              placeholder="State" value={checkout.customerInfo.address.state}
              onChange={(e) => updateAddress('state', e.target.value)}
            />
            <input
              placeholder="ZIP" required
              value={checkout.customerInfo.address.zip}
              onChange={(e) => updateAddress('zip', e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>Order Notes (optional)</legend>
            <textarea
              placeholder="Special instructions..."
              value={checkout.orderNotes}
              onChange={(e) =>
                updateCustomerInfo('orderNotes', e.target.value)
              }
            />
          </fieldset>

          <button type="submit" disabled={processing}>
            {processing ? 'Saving...' : 'Continue to Review'}
          </button>
        </form>
      )}

      {/* STEP 2: Review & Place Order */}
      {checkout.step === 'review' && (
        <div className="review-step">
          <h3>Order Summary</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.attributes?.title} — Qty: {item.attributes?.quantity}
              </li>
            ))}
          </ul>
          <p><strong>Total: {totalPrice}</strong></p>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="cod-badge">
              💵 Cash on Delivery
            </div>
            <p>Payment will be collected in cash at time of delivery/pickup.</p>
          </div>

          <div className="review-actions">
            <button onClick={() => goToStep('information')}>
              ← Back
            </button>
            <button
              onClick={placeOrder}
              disabled={processing}
              className="place-order-btn"
            >
              {processing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Cart Sidebar / Drawer Component

A quick-view cart component that uses the `useCart` hook.

```jsx
// src/components/CartDrawer.jsx
import React from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    items, itemCount, totalPrice,
    updateItemQuantity, removeItem, clearCart, loading,
  } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Cart ({itemCount})</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {loading && <p>Loading cart...</p>}

        {!loading && items.length === 0 && (
          <p className="empty-cart">Your cart is empty.</p>
        )}

        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span>{item.attributes?.title}</span>
              <span>{item.attributes?.unit_price?.formatted}</span>
            </div>
            <div className="cart-item-actions">
              <button onClick={() =>
                updateItemQuantity(item.id, item.attributes.quantity - 1)
              } disabled={item.attributes.quantity <= 1}>
                −
              </button>
              <span>{item.attributes.quantity}</span>
              <button onClick={() =>
                updateItemQuantity(item.id, item.attributes.quantity + 1)
              }>
                +
              </button>
              <button onClick={() => removeItem(item.id)}>🗑</button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total: {totalPrice}</strong>
            </div>
            <button onClick={() => { onClose(); navigate('/checkout'); }}>
              Checkout (Cash on Delivery)
            </button>
            <button onClick={clearCart} className="clear-btn">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 8. App Entry Point with Cart Provider

Wrap the entire app in the `CartProvider` so all components have access to cart state.

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProductListPage from './pages/ProductListPage';
import CheckoutPage from './pages/CheckoutPage';
import CartDrawer from './components/CartDrawer';

export default function App() {
  const [cartOpen, setCartOpen] = React.useState(false);

  return (
    <CartProvider>
      <BrowserRouter>
        <header>
          <button onClick={() => setCartOpen(true)}>🛒 Cart</button>
        </header>
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
```

---

## 9. Hook Summary

| Hook | Purpose | Key Methods |
|------|---------|-------------|
| `useAddToCart` | Add product variations to cart | `addToCart(variationId, qty)` |
| `useCart` | Read/modify cart state | `updateItemQuantity`, `removeItem`, `clearCart` |
| `useCheckout` | Multi-step COD checkout flow | `saveCustomerInfo`, `placeOrder`, `goToStep` |
| `useCartContext` | Access raw cart context | `cart`, `refreshCart`, `dispatch` |

---

## 10. Drupal Module Checklist

Ensure these modules are enabled and configured:

- **commerce_cart** — Cart API and session handling
- **commerce_checkout** — Checkout flow management
- **commerce_payment** — Payment gateway framework
- **jsonapi** — Core JSON\:API support
- **jsonapi_extras** — Fine-tune exposed resources
- **simple_oauth** — OAuth2 tokens for API auth
- **commerce_order** — Order type configuration

### CORS Configuration (`services.yml`)

```yaml
cors.config:
  enabled: true
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  allowedOrigins: ['https://your-react-app.com']
  supportsCredentials: true
```

---

## 11. Troubleshooting

**403 on cart endpoints** — Ensure the authenticated user role has permissions for `access cart`, `update own commerce_order`, and `use payment gateways`.

**Empty cart response** — The Commerce Cart API requires a session or authenticated user. Verify OAuth tokens are being sent and CORS allows credentials.

**COD gateway not appearing** — Confirm the gateway is enabled and set to "Live" mode. Check that the machine name matches what the hook references (`cash_on_delivery`).

**Order stuck in "draft"** — The `/complete` endpoint needs the checkout flow to be properly configured in Drupal. Verify under Commerce → Configuration → Checkout flows that your order type is mapped.
