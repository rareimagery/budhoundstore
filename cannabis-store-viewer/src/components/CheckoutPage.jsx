import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import "./CheckoutPage.css";

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Information", "Review", "Confirmed"];
  const stepIndex = { information: 0, review: 1, complete: 2 }[step] ?? 0;
  return (
    <div className="step-indicator">
      {steps.map((label, i) => (
        <div
          key={i}
          className={`step-item${i <= stepIndex ? " step-item--done" : ""}${i === stepIndex ? " step-item--active" : ""}`}
        >
          <div className="step-circle">{i < stepIndex ? "✓" : i + 1}</div>
          <span className="step-label">{label}</span>
          {i < steps.length - 1 && (
            <div className={`step-line${i < stepIndex ? " step-line--done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Required-field label helper ────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label className="field-label">
      {children}
      <span className="field-required" aria-hidden="true">*</span>
    </label>
  );
}

// ── Step 1: Customer information ───────────────────────────────────────────────
function InformationStep({
  checkout,
  processing,
  error,
  updateCustomerInfo,
  updateAddress,
  updateOrderNotes,
  saveCustomerInfo,
}) {
  const { customerInfo, orderNotes } = checkout;
  const { address } = customerInfo;

  // Track which required fields have been validated (attempted submit)
  const [touched, setTouched] = useState({});

  // Fields that must be non-empty to proceed
  const required = {
    email: customerInfo.email,
    firstName: customerInfo.firstName,
    lastName: customerInfo.lastName,
    line1: address.line1,
    city: address.city,
    zip: address.zip,
  };

  const isInvalid = (field) => touched[field] && !required[field];

  function handleSubmit(e) {
    e.preventDefault();

    // Mark all required fields as touched so errors become visible
    const allTouched = Object.fromEntries(Object.keys(required).map((k) => [k, true]));
    setTouched(allTouched);

    // Only call hook when all required fields pass local check
    const hasErrors = Object.values(required).some((v) => !v);
    if (hasErrors) return;

    saveCustomerInfo();
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <section className="checkout-section">
        <h2 className="checkout-section-title">Contact</h2>

        <div className="field-wrapper">
          <FieldLabel>Email address</FieldLabel>
          <input
            className={`checkout-input${isInvalid("email") ? " checkout-input--error" : ""}`}
            type="email"
            placeholder="you@example.com"
            value={customerInfo.email}
            aria-invalid={isInvalid("email") ? "true" : "false"}
            onChange={(e) => updateCustomerInfo("email", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          {isInvalid("email") && <span className="field-error">Required</span>}
        </div>

        <div className="field-wrapper">
          <label className="field-label">Phone number</label>
          <input
            className="checkout-input"
            type="tel"
            placeholder="(805) 555-0100"
            value={customerInfo.phone}
            onChange={(e) => updateCustomerInfo("phone", e.target.value)}
          />
        </div>
      </section>

      <section className="checkout-section">
        <h2 className="checkout-section-title">Billing Address</h2>

        <div className="checkout-row">
          <div className="field-wrapper">
            <FieldLabel>First name</FieldLabel>
            <input
              className={`checkout-input${isInvalid("firstName") ? " checkout-input--error" : ""}`}
              placeholder="Jane"
              value={customerInfo.firstName}
              aria-invalid={isInvalid("firstName") ? "true" : "false"}
              onChange={(e) => updateCustomerInfo("firstName", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
            />
            {isInvalid("firstName") && <span className="field-error">Required</span>}
          </div>

          <div className="field-wrapper">
            <FieldLabel>Last name</FieldLabel>
            <input
              className={`checkout-input${isInvalid("lastName") ? " checkout-input--error" : ""}`}
              placeholder="Smith"
              value={customerInfo.lastName}
              aria-invalid={isInvalid("lastName") ? "true" : "false"}
              onChange={(e) => updateCustomerInfo("lastName", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
            />
            {isInvalid("lastName") && <span className="field-error">Required</span>}
          </div>
        </div>

        <div className="field-wrapper">
          <FieldLabel>Street address</FieldLabel>
          <input
            className={`checkout-input${isInvalid("line1") ? " checkout-input--error" : ""}`}
            placeholder="123 Main St"
            value={address.line1}
            aria-invalid={isInvalid("line1") ? "true" : "false"}
            onChange={(e) => updateAddress("line1", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, line1: true }))}
          />
          {isInvalid("line1") && <span className="field-error">Required</span>}
        </div>

        <div className="field-wrapper">
          <label className="field-label">Apt, suite, unit (optional)</label>
          <input
            className="checkout-input"
            placeholder="Apt 4B"
            value={address.line2}
            onChange={(e) => updateAddress("line2", e.target.value)}
          />
        </div>

        <div className="checkout-row checkout-row--3">
          <div className="field-wrapper">
            <FieldLabel>City</FieldLabel>
            <input
              className={`checkout-input${isInvalid("city") ? " checkout-input--error" : ""}`}
              placeholder="Lompoc"
              value={address.city}
              aria-invalid={isInvalid("city") ? "true" : "false"}
              onChange={(e) => updateAddress("city", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, city: true }))}
            />
            {isInvalid("city") && <span className="field-error">Required</span>}
          </div>

          <div className="field-wrapper">
            <label className="field-label">State</label>
            <input
              className="checkout-input"
              placeholder="CA"
              value={address.state}
              onChange={(e) => updateAddress("state", e.target.value)}
            />
          </div>

          <div className="field-wrapper">
            <FieldLabel>ZIP</FieldLabel>
            <input
              className={`checkout-input${isInvalid("zip") ? " checkout-input--error" : ""}`}
              placeholder="93436"
              value={address.zip}
              aria-invalid={isInvalid("zip") ? "true" : "false"}
              onChange={(e) => updateAddress("zip", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, zip: true }))}
            />
            {isInvalid("zip") && <span className="field-error">Required</span>}
          </div>
        </div>
      </section>

      <section className="checkout-section">
        <h2 className="checkout-section-title">Order Notes (optional)</h2>
        <textarea
          className="checkout-input checkout-textarea"
          placeholder="Special instructions for delivery or pickup…"
          rows={3}
          value={orderNotes}
          onChange={(e) => updateOrderNotes(e.target.value)}
        />
      </section>

      {error && <div className="checkout-error">{error}</div>}

      <button
        type="submit"
        className="btn-primary btn-full checkout-submit"
        disabled={processing}
      >
        {processing ? "Saving…" : "Continue to Review"}
      </button>
    </form>
  );
}

// ── Helper: derive unit price from item attributes ─────────────────────────────
function getUnitPrice(item) {
  const unitPrice = item.attributes?.unit_price?.formatted;
  if (unitPrice) return unitPrice;

  // Fallback: calculate from total / quantity
  const totalRaw = item.attributes?.total_price?.number;
  const qty = Number(item.attributes?.quantity || 1);
  if (totalRaw && qty) {
    const unit = parseFloat(totalRaw) / qty;
    return `$${unit.toFixed(2)}`;
  }
  return null;
}

// ── Step 2: Review & place order ───────────────────────────────────────────────
function ReviewStep({
  checkout,
  items,
  totalPrice,
  processing,
  error,
  goToStep,
  placeOrder,
}) {
  const { customerInfo } = checkout;
  const { address } = customerInfo;

  return (
    <div className="review-step">
      <div className="checkout-layout">
        <div className="checkout-form-col">
          <section className="checkout-section">
            <div className="review-section-header">
              <h2 className="checkout-section-title">Contact</h2>
              <button className="review-edit-btn" onClick={() => goToStep("information")}>
                Edit
              </button>
            </div>
            <p className="review-value">{customerInfo.email}</p>
            {customerInfo.phone && <p className="review-value">{customerInfo.phone}</p>}
          </section>

          <section className="checkout-section">
            <div className="review-section-header">
              <h2 className="checkout-section-title">Billing Address</h2>
              <button className="review-edit-btn" onClick={() => goToStep("information")}>
                Edit
              </button>
            </div>
            <p className="review-value">
              {customerInfo.firstName} {customerInfo.lastName}<br />
              {address.line1}{address.line2 && `, ${address.line2}`}<br />
              {address.city}, {address.state} {address.zip}
            </p>
          </section>

          <section className="checkout-section">
            <h2 className="checkout-section-title">Payment Method</h2>
            <div className="cod-badge">💵 Cash on Delivery</div>
            <p className="cod-note">
              Payment collected in cash at delivery or pickup. Please have the
              exact amount ready.
            </p>
          </section>

          {error && <div className="checkout-error">{error}</div>}

          <div className="review-actions">
            <button className="btn-secondary" onClick={() => goToStep("information")}>
              &larr; Back
            </button>
            <button
              className="btn-primary place-order-btn"
              onClick={placeOrder}
              disabled={processing}
            >
              {processing ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </div>

        <div className="checkout-summary-col">
          <div className="checkout-summary-box">
            <h3>Order Summary</h3>

            {items.map((item) => {
              const title = item.attributes?.title || "Product";
              const qty = Number(item.attributes?.quantity || 1);
              const totalFormatted = item.attributes?.total_price?.formatted;
              const unitFormatted = getUnitPrice(item);

              return (
                <div key={item.id} className="checkout-summary-item">
                  <div>
                    <div className="summary-item-name">{title}</div>
                    {unitFormatted && (
                      <div className="summary-item-price-line">
                        {unitFormatted} &times; {qty}
                      </div>
                    )}
                  </div>
                  <span className="summary-item-total">
                    {totalFormatted || "—"}
                  </span>
                </div>
              );
            })}

            <div className="checkout-summary-subtotals">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>{totalPrice}</span>
              </div>
              <div className="checkout-summary-row checkout-summary-row--delivery">
                <span>Delivery</span>
                <strong>Free</strong>
              </div>
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
              <strong>{totalPrice}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Order confirmed ────────────────────────────────────────────────────────────
export function OrderConfirmation({ completedOrder }) {
  return (
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
  );
}

// ── Main checkout page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, loading } = useCart();
  const {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    updateOrderNotes,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  } = useCheckout();

  if (loading) return <div className="page center"><p>Loading…</p></div>;

  if (checkout.step === "complete" && completedOrder) {
    return (
      <div className="page">
        <StepIndicator step="complete" />
        <OrderConfirmation completedOrder={completedOrder} />
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="page center">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>
          Browse Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="page checkout-page">
      <Link to="/cart" className="back-link">&larr; Back to Cart</Link>
      <h1>Checkout</h1>
      <StepIndicator step={checkout.step} />

      {checkout.step === "information" && (
        <InformationStep
          checkout={checkout}
          processing={processing}
          error={error}
          updateCustomerInfo={updateCustomerInfo}
          updateAddress={updateAddress}
          updateOrderNotes={updateOrderNotes}
          saveCustomerInfo={saveCustomerInfo}
        />
      )}

      {checkout.step === "review" && (
        <ReviewStep
          checkout={checkout}
          items={items}
          totalPrice={totalPrice}
          processing={processing}
          error={error}
          goToStep={goToStep}
          placeOrder={placeOrder}
        />
      )}
    </div>
  );
}
