# Task 03 — Store Directory Enhancements

## Goal
Enhance the StoreDirectory home page with richer store cards (address format, Google Maps link, dispensary icon), an improved hero section subtitle, and a "Featured" strain spotlight section.

## Files to Modify
- `c:\BudStore\cannabis-store-viewer\src\components\StoreDirectory.js`

## Files to Create
- `c:\BudStore\cannabis-store-viewer\src\components\StoreDirectory.css`

## DO NOT TOUCH
- `App.css` — put all new styles in `StoreDirectory.css`
- Any other component files

---

## Current StoreDirectory Structure
```
Hero (mascot image + title + CTAs)
HowItWorks (3 steps: Choose → Pick → Order)
StoreGrid (7 store cards, each: name + address + "View Menu")
Footer
```

---

## Changes

### 1. Import new CSS
At top of StoreDirectory.js: `import "./StoreDirectory.css";`

### 2. Enhanced Store Cards

Read the current `StoreCard` component first to understand the data shape (each store from the API has `attributes.name` and `attributes.address`).

Replace/enhance `StoreCard` to add:

**Address formatting:**
```jsx
<address className="scard-address">
  {address.address_line1}{address.address_line2 && `, ${address.address_line2}`}
  <br />
  {address.locality}, {address.administrative_area} {address.postal_code}
</address>
```

**Google Maps link** (opens in new tab):
```jsx
const mapsQuery = encodeURIComponent(
  `${address.address_line1}, ${address.locality}, ${address.administrative_area}`
);
<a
  className="scard-maps-link"
  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
  target="_blank"
  rel="noopener noreferrer"
>
  📍 Get Directions
</a>
```

**Dispensary icon** — add a cannabis leaf emoji or icon before the store name:
```jsx
<h3 className="scard-name">🌿 {name}</h3>
```

**Layout update** — make card footer have two links side by side:
```jsx
<div className="scard-actions">
  <a className="scard-maps-link" ...>📍 Directions</a>
  <Link className="scard-menu-link" to={`/store/${storeId}`}>Browse Menu →</Link>
</div>
```

### 3. Hero Improvement
Add a statistics strip below the hero CTAs showing:
```jsx
<div className="hero-stats">
  <div className="hero-stat"><span className="hero-stat-num">7</span><span className="hero-stat-label">Dispensaries</span></div>
  <div className="hero-stat"><span className="hero-stat-num">249+</span><span className="hero-stat-label">Products</span></div>
  <div className="hero-stat"><span className="hero-stat-num">COD</span><span className="hero-stat-label">Cash Delivery</span></div>
  <div className="hero-stat"><span className="hero-stat-num">Lompoc</span><span className="hero-stat-label">CA</span></div>
</div>
```

### 4. How It Works Icons
Replace emoji in How It Works with more detailed descriptions:
```
Step 1: 🏪 Choose a Dispensary → "Browse 7 Lompoc dispensaries and their full menus"
Step 2: 🌿 Add to Cart → "Select products and quantities from any store"
Step 3: 💵 Cash at Delivery → "Place your order and pay the driver in cash"
```

---

## StoreDirectory.css Spec

```css
/* Stats strip */
.hero-stats {
  display: flex; gap: 32px; justify-content: center;
  margin-top: 32px; flex-wrap: wrap;
}
.hero-stat { text-align: center; }
.hero-stat-num {
  display: block; font-size: 1.75rem; font-weight: 800;
  color: #fff; line-height: 1;
}
.hero-stat-label {
  display: block; font-size: 0.8rem; color: rgba(255,255,255,0.75);
  text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;
}

/* Enhanced store card */
.scard-name {
  font-size: 1.05rem; font-weight: 700; color: #1b4332; margin: 0 0 8px;
}
.scard-address {
  font-style: normal; font-size: 0.85rem; color: #555; line-height: 1.5;
  margin-bottom: 12px;
}
.scard-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef;
}
.scard-maps-link {
  font-size: 0.8rem; color: #666; text-decoration: none;
}
.scard-maps-link:hover { color: #2d6a4f; text-decoration: underline; }
.scard-menu-link {
  font-size: 0.875rem; font-weight: 600; color: #2d6a4f;
  text-decoration: none;
}
.scard-menu-link:hover { text-decoration: underline; }
```

---

## Important Notes
- Do NOT break existing store routing — `storeId` must still work with `/store/:storeId`
- Read `StoreDirectory.js` fully before editing to understand current `StoreCard` prop shape
- The store data comes from `fetchStores()` → each store has `attributes.name`, `attributes.address`, `attributes.drupal_internal__store_id`
- Do not modify `App.css`

---

## Verification
- Home page loads with enhanced store cards
- "Get Directions" opens Google Maps in new tab
- "Browse Menu →" still navigates to the correct store page
- Hero shows 4 statistics
- How It Works descriptions are updated
