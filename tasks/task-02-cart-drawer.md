# Task 02 — Cart Drawer UI Improvements

## Goal
Improve the CartDrawer with product images, cleaner item layout, an animated empty state, and a better visual design — all within `CartDrawer.jsx` only.

## Files to Modify
- `c:\BudStore\cannabis-store-viewer\src\components\CartDrawer.jsx`

## Files to Create
- `c:\BudStore\cannabis-store-viewer\src\components\CartDrawer.css`

## DO NOT TOUCH
- `App.css` — use `CartDrawer.css` for all new cart drawer styles
- Any other component files

---

## Current State (from App.css)
The drawer uses these existing classes:
- `.cart-drawer` — fixed right, 360px, dark green header
- `.drawer-item` — flex row, item name/price
- `.drawer-qty-btn` — ± buttons
- `.drawer-backdrop` — semi-transparent overlay

---

## Changes to CartDrawer.jsx

### 1. Import the new CSS file
Add at top: `import "./CartDrawer.css";`

### 2. Empty State Illustration
When `items.length === 0`, replace plain text with:
```jsx
<div className="drawer-empty">
  <div className="drawer-empty__icon">🛒</div>
  <p className="drawer-empty__title">Your cart is empty</p>
  <p className="drawer-empty__sub">Browse a store and add some products</p>
</div>
```

### 3. Item Layout Improvements
Each cart item currently shows: name | price | qty controls | trash.

Improve the layout to show a small product thumbnail placeholder on the left:
```jsx
<div className="drawer-item-img">
  {/* 44x44px green-tinted placeholder square with first letter of product name */}
  <div className="drawer-item-avatar" aria-hidden="true">
    {item.title?.[0] || "?"}
  </div>
</div>
<div className="drawer-item-info">
  <span className="drawer-item-title">{item.title}</span>
  <span className="drawer-item-sku">{item.sku || ""}</span>
</div>
<div className="drawer-item-controls">
  {/* qty controls */}
</div>
<div className="drawer-item-price">
  {/* line total */}
</div>
```

### 4. Item Count in Footer
In the footer, show:
```jsx
<div className="drawer-footer-meta">
  <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
  <span className="drawer-footer-total-label">Total</span>
</div>
<div className="drawer-footer-amount">{formattedTotal}</div>
```

### 5. Checkout Button Improvement
Add a lock icon and payment info:
```jsx
<button className="btn-primary btn-full">
  🔒 Checkout — Cash on Delivery
</button>
<p className="drawer-cod-note">Pay with cash at delivery</p>
```

---

## CartDrawer.css Spec

```css
/* Empty state */
.drawer-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; padding: 48px 24px;
  text-align: center;
}
.drawer-empty__icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.4; }
.drawer-empty__title { font-weight: 600; color: #1b4332; margin: 0 0 8px; font-size: 1.1rem; }
.drawer-empty__sub { color: #888; font-size: 0.875rem; margin: 0; }

/* Item avatar (letter placeholder) */
.drawer-item-avatar {
  width: 44px; height: 44px; border-radius: 8px;
  background: linear-gradient(135deg, #d8f3e3, #b7e4c7);
  color: #2d6a4f; font-weight: 700; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; text-transform: uppercase;
}

/* Item info */
.drawer-item-title { font-weight: 600; color: #1b4332; font-size: 0.85rem; display: block; margin-bottom: 2px; }
.drawer-item-sku { color: #999; font-size: 0.75rem; display: block; }

/* Footer meta */
.drawer-footer-meta {
  display: flex; justify-content: space-between;
  font-size: 0.8rem; color: #888; margin-bottom: 4px;
}
.drawer-footer-amount { font-size: 1.15rem; font-weight: 700; color: #1b4332; margin-bottom: 12px; }

/* COD note */
.drawer-cod-note {
  text-align: center; font-size: 0.78rem;
  color: #888; margin: 6px 0 0;
}
```

---

## Data Available in CartDrawer.jsx
From `useCart()`:
- `items` — array of order items (each has `title`, `quantity`, `unitPrice`, `id`, `type`)
- `total` — formatted total string (e.g. "$45.00")
- `totalItems` — count of all items (sum of quantities)
- `updateItemQuantity(id, qty)` — function
- `removeItem(id)` — function
- `clearCart()` — function

Read `CartDrawer.jsx` and `CartContext.js` first to confirm what properties are available on each item object.

---

## Verification
- Drawer shows empty state with icon when cart is empty
- Each item shows letter avatar, title, quantity controls, and line price
- Footer shows item count and total
- Checkout button has lock icon and COD note
- No errors in browser console
