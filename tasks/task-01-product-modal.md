# Task 01 — Product Detail Modal

## Goal
Create a full-screen product detail modal that opens when a user clicks a product name in the StorePage table. The modal shows all product details in a clean layout with an Add to Cart button.

## Files to Create
- `c:\BudStore\cannabis-store-viewer\src\components\ProductModal.jsx`
- `c:\BudStore\cannabis-store-viewer\src\components\ProductModal.css`

## Files to Modify
- `c:\BudStore\cannabis-store-viewer\src\components\StorePage.js`

## DO NOT TOUCH
- `App.css` — use `ProductModal.css` for all modal styles
- Any other component files

---

## ProductModal.jsx Spec

Props:
```js
{ product, onClose }
// product = the flat product object from api.js
// onClose = function to close the modal
```

Layout (desktop: 2 columns; mobile: 1 column):

**Left column:**
- Product image (large, if available; placeholder if not)
- Below image: Leafly link button if `product.leaflyUrl` exists

**Right column:**
- Category badge (product.typeLabel)
- Product title (h2)
- Brand name (muted, smaller)
- Price: "From $XX.XX" (if price exists)
- Horizontal divider
- Description text (product.description) — shown if exists; "No description available." if not
- Horizontal divider
- Variations section (if product.variationDetails.length > 1):
  - Header: "Available Options"
  - Each variation: SKU or "Option N" label, price, Add to Cart button
- If only one variation: just show Add to Cart button prominently
- Close button in top-right corner (✕)

**Behavior:**
- Closes on: ✕ button click, backdrop click, Escape key (useEffect)
- Locks body scroll when open (`document.body.style.overflow = 'hidden'`)
- Restores scroll on close/unmount

**AddToCartButton integration:**
- Import AddToCartButton from `./AddToCartButton`
- Pass `variationUuid={v.uuid}` and `variationType={v.variationType}` for each variation
- After adding, show success message "Added to cart!" (comes from AddToCartButton internally)

---

## ProductModal.css Spec

```css
/* Overlay */
.modal-overlay — fixed inset-0, z-index 1000, rgba(0,0,0,0.6), display flex, align-items center, justify-content center, padding 16px */

/* Dialog */
.modal-dialog — background white, border-radius 12px, max-width 860px, width 100%, max-height 90vh, overflow-y auto, position relative, box-shadow */

/* Close button */
.modal-close — position absolute, top 16px, right 16px, 36x36px button, no background, border 1px solid #ddd, border-radius 50%, cursor pointer, font-size 1.1rem */

/* Two-column layout */
.modal-body — display grid, grid-template-columns 300px 1fr (desktop), gap 32px, padding 32px

/* Image area */
.modal-image — width 100%, aspect-ratio 1/1, object-fit contain, border-radius 8px, border 1px solid #eee, background #f8f8f8
.modal-image--placeholder — same dimensions, background #e8f5e9 with dashed border

/* Content area */
.modal-category — green badge (reuse .category-badge style)
.modal-title — font-size 1.5rem, font-weight 700, color #1b4332, margin 8px 0 4px
.modal-brand — color #666, font-size 0.9rem, margin-bottom 16px
.modal-price — font-size 1.25rem, font-weight 600, color #2d6a4f, margin-bottom 16px
.modal-divider — border-top 1px solid #e8ece9, margin 16px 0
.modal-description — font-size 0.9rem, line-height 1.7, color #374151
.modal-no-desc — italic, color #999, font-size 0.875rem

/* Variations */
.modal-variations-title — font-weight 600, color #1b4332, margin-bottom 12px, font-size 0.95rem
.modal-variation-row — display flex, align-items center, gap 12px, padding 10px 0, border-bottom 1px solid #f0f0f0
.modal-variation-label — flex 1, font-size 0.875rem, color #444
.modal-variation-price — font-weight 600, color #2d6a4f, font-size 0.9rem

/* Leafly link */
.modal-leafly-link — display inline-flex, align-items center, gap 6px, margin-top 12px, color #52b788, font-size 0.8rem, text-decoration none

/* Mobile */
@media (max-width: 640px) { .modal-body grid-template-columns 1fr; .modal-dialog padding 16px }
```

---

## StorePage.js Modifications

1. Add import at top:
```js
import ProductModal from "./ProductModal";
```

2. Add state variable (after existing state):
```js
const [selectedProduct, setSelectedProduct] = useState(null);
```

3. Make product title clickable (in the `<td className="product-name">` cell):
```jsx
<button className="product-name-btn" onClick={() => setSelectedProduct(p)}>
  {p.title}
</button>
```
Keep the existing `desc-toggle` button if description exists.

4. Add modal at bottom of JSX (before closing `</div>`):
```jsx
{selectedProduct && (
  <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
)}
```

5. Add CSS for the button:
In `ProductModal.css`, add:
```css
.product-name-btn {
  background: none; border: none; padding: 0; cursor: pointer;
  font-weight: 600; color: #1b4332; font-size: inherit;
  text-align: left; text-decoration: underline dotted;
}
.product-name-btn:hover { color: #2d6a4f; text-decoration: underline; }
```
And import ProductModal.css in ProductModal.jsx.

---

## Verification
After implementing:
- ProductModal.jsx renders without errors
- Clicking a product name in StorePage opens the modal
- Backdrop click and Escape key close the modal
- Add to Cart button inside modal works
- No TypeScript/linting errors
