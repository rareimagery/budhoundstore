# Task 04 — Checkout Page UX Polish

## Goal
Polish the CheckoutPage multi-step checkout form with better validation feedback, improved step indicator, a sticky order summary that updates live, and a more detailed confirmation page.

## Files to Modify
- `c:\BudStore\cannabis-store-viewer\src\components\CheckoutPage.jsx`

## Files to Create
- `c:\BudStore\cannabis-store-viewer\src\components\CheckoutPage.css`

## DO NOT TOUCH
- `App.css` — put all new styles in `CheckoutPage.css`
- `useCheckout.js` — do not change the hook
- Any other component files

---

## Read These Files First
- `c:\BudStore\cannabis-store-viewer\src\components\CheckoutPage.jsx` — current full component
- `c:\BudStore\cannabis-store-viewer\src\hooks\useCheckout.js` — hook API available
- `c:\BudStore\cannabis-store-viewer\src\context\CartContext.js` — cart data shape

---

## Changes

### 1. Import new CSS
At top: `import "./CheckoutPage.css";`

### 2. Improved Step Indicator
Current: simple underline tabs.
New: numbered circle steps with connecting line:
```jsx
function StepIndicator({ step }) {
  const steps = ["Information", "Review", "Confirmed"];
  const stepIndex = { information: 0, review: 1, complete: 2 }[step] ?? 0;
  return (
    <div className="step-indicator">
      {steps.map((label, i) => (
        <div key={i} className={`step-item ${i <= stepIndex ? "step-item--done" : ""} ${i === stepIndex ? "step-item--active" : ""}`}>
          <div className="step-circle">{i < stepIndex ? "✓" : i + 1}</div>
          <span className="step-label">{label}</span>
          {i < steps.length - 1 && <div className={`step-line ${i < stepIndex ? "step-line--done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}
```

### 3. Field Validation Indicators
Add a visual `required` asterisk to labels and show inline error if field is blank when user clicks "Continue":
- Add `className="checkout-input--error"` to inputs that are empty when validated
- The error styling is a red border + red helper text below

The checkout hook's `saveCustomerInfo` already returns (no value) when validation fails and sets `error`. Read the current form to understand what fields exist, then:
- Add `aria-invalid` attribute to invalid inputs
- Show a `<span className="field-error">Required</span>` beneath each invalid field

Since we can't modify `useCheckout.js`, track which fields were "touched" locally in `CheckoutPage.jsx` state:
```js
const [touched, setTouched] = useState({});
const markTouched = (field) => setTouched(t => ({ ...t, [field]: true }));
```

### 4. Live Order Summary in Review Step
In the Review step, the order summary currently shows items from cart. Improve the display:
- Add product type emoji before each item name based on type (optional, enhance visually)
- Show individual item prices formatted as `$XX.XX × qty = $XX.XX`
- Add a subtle divider between items
- Show "Subtotal" and "Delivery" rows (Delivery: Free / Cash)

### 5. Confirmation Page Enhancement
After order is placed, show a richer confirmation:
```jsx
<div className="confirm-box">
  <div className="confirm-icon">✓</div>
  <h1 className="confirm-heading">Order Placed!</h1>
  <p className="confirm-sub">Order #{completedOrder?.orderId}</p>
  <div className="confirm-card">
    <div className="confirm-row">
      <span>Total</span>
      <strong>{completedOrder?.total || "—"}</strong>
    </div>
    <div className="confirm-row">
      <span>Payment</span>
      <strong>Cash on Delivery</strong>
    </div>
    <div className="confirm-row">
      <span>Status</span>
      <strong className="confirm-status">Confirmed</strong>
    </div>
  </div>
  <p className="confirm-instructions">
    💵 Please have cash ready when your delivery arrives.
    You'll be contacted to confirm the delivery window.
  </p>
  <Link className="btn-primary" to="/">Browse More Stores</Link>
</div>
```

---

## CheckoutPage.css Spec

```css
/* Step indicator */
.step-indicator {
  display: flex; align-items: flex-start; justify-content: center;
  gap: 0; margin-bottom: 32px; padding: 0 16px;
}
.step-item {
  display: flex; flex-direction: column; align-items: center;
  position: relative; flex: 1; max-width: 160px;
}
.step-circle {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid #d0d5dd; background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 600; color: #888;
  z-index: 1;
}
.step-item--active .step-circle { border-color: #2d6a4f; color: #2d6a4f; }
.step-item--done .step-circle { background: #2d6a4f; border-color: #2d6a4f; color: #fff; }
.step-label { font-size: 0.78rem; color: #888; margin-top: 6px; text-align: center; }
.step-item--active .step-label, .step-item--done .step-label { color: #2d6a4f; font-weight: 600; }
.step-line {
  position: absolute; top: 18px; left: 50%; width: 100%;
  height: 2px; background: #e0e0e0;
}
.step-line--done { background: #2d6a4f; }

/* Field error */
.checkout-input--error { border-color: #dc2626 !important; }
.field-error { display: block; font-size: 0.75rem; color: #dc2626; margin-top: 4px; }

/* Confirm box */
.confirm-box {
  max-width: 440px; margin: 0 auto; text-align: center; padding: 32px 16px;
}
.confirm-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: #d8f3e3; color: #2d6a4f;
  font-size: 2rem; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 24px;
}
.confirm-heading { font-size: 1.75rem; font-weight: 700; color: #1b4332; margin: 0 0 8px; }
.confirm-sub { color: #888; font-size: 0.9rem; margin: 0 0 24px; }
.confirm-card {
  background: #f6fdf8; border: 1px solid #b7e4c7;
  border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: left;
}
.confirm-row {
  display: flex; justify-content: space-between;
  padding: 8px 0; font-size: 0.9rem;
  border-bottom: 1px solid #e8f5e9;
}
.confirm-row:last-child { border-bottom: none; }
.confirm-status { color: #2d6a4f; }
.confirm-instructions {
  font-size: 0.875rem; color: #555; line-height: 1.6;
  margin-bottom: 24px; padding: 12px 16px;
  background: #fffbeb; border-radius: 8px; text-align: left;
}
```

---

## Verification
- Step indicator shows numbered circles with connecting line
- Required fields highlight red when left empty and "Continue" is clicked
- Review step shows itemized order with prices
- Confirmation page shows order ID, total, payment method card
