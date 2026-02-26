import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";
import "./ProductDetailPage.css";

/** Quantity stepper used for each variation */
function QtyStepper({ value, onChange }) {
  return (
    <div className="pdp-qty">
      <button
        className="pdp-qty-btn"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="pdp-qty-val">{value}</span>
      <button
        className="pdp-qty-btn"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { storeId } = useParams();
  const location = useLocation();
  const product = location.state?.product;

  // Per-variation quantity state, keyed by variation uuid
  const [quantities, setQuantities] = useState({});

  function getQty(uuid) {
    return quantities[uuid] ?? 1;
  }
  function setQty(uuid, val) {
    setQuantities((prev) => ({ ...prev, [uuid]: val }));
  }

  if (!product) {
    return (
      <div className="page pdp-not-found">
        <p>Product not found.</p>
        <Link to={`/store/${storeId}`} className="pdp-back-link">
          ← Back to store
        </Link>
      </div>
    );
  }

  const hasVariations =
    product.variationDetails && product.variationDetails.length > 1;

  // Derive a clean strain name (strip "Brand — " prefix if present)
  const strainName = product.title.includes(" — ")
    ? product.title.split(" — ").slice(1).join(" — ")
    : product.title;

  return (
    <div className="page pdp-page">
      {/* Breadcrumb */}
      <Link to={`/store/${storeId}`} className="pdp-back-link">
        ← Back to store
      </Link>

      <div className="pdp-layout">
        {/* ── Left column: image ─────────────────────────── */}
        <div className="pdp-image-col">
          {product.imageUrl ? (
            <img
              className="pdp-image"
              src={product.imageUrl}
              alt={product.title}
            />
          ) : (
            <div className="pdp-image-placeholder" aria-hidden="true">
              🌿
            </div>
          )}

          {product.leaflyUrl && (
            <a
              className="pdp-leafly-link"
              href={product.leaflyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              🍃 View on Leafly
            </a>
          )}
        </div>

        {/* ── Right column: details ───────────────────────── */}
        <div className="pdp-detail-col">
          <span className="pdp-badge">{product.typeLabel}</span>
          {product.onSale && <span className="pdp-sale-badge">Sale</span>}

          <h1 className="pdp-title">{strainName}</h1>

          {product.brand && (
            <p className="pdp-brand">by {product.brand}</p>
          )}

          {product.price !== null && product.price !== undefined && (
            <p className="pdp-price">
              From{" "}
              {product.onSale && product.salePrice !== null ? (
                <>
                  <span className="price-original">${product.price.toFixed(2)}</span>
                  <strong className="price-sale">${product.salePrice.toFixed(2)}</strong>
                </>
              ) : (
                <strong>${product.price.toFixed(2)}</strong>
              )}
            </p>
          )}

          <hr className="pdp-divider" />

          {/* Description */}
          <div className="pdp-description-section">
            <h2 className="pdp-section-heading">About this product</h2>
            {product.description ? (
              <p className="pdp-description">{product.description}</p>
            ) : (
              <p className="pdp-no-desc">No description available yet.</p>
            )}
          </div>

          <hr className="pdp-divider" />

          {/* Cart section */}
          <div className="pdp-cart-section">
            <h2 className="pdp-section-heading">
              {hasVariations ? "Choose an option" : "Add to cart"}
            </h2>

            {hasVariations ? (
              <div className="pdp-variations">
                {product.variationDetails.map((v, idx) => (
                  <div className="pdp-variation-row" key={v.uuid || idx}>
                    <div className="pdp-variation-info">
                      <span className="pdp-variation-label">
                        {v.sku || `Option ${idx + 1}`}
                      </span>
                      {v.price !== null && v.price !== undefined && (
                        <span className="pdp-variation-price">
                          {product.onSale && v.salePrice !== null ? (
                            <>
                              <span className="price-original">${Number(v.price).toFixed(2)}</span>
                              <span className="price-sale">${Number(v.salePrice).toFixed(2)}</span>
                            </>
                          ) : (
                            `$${Number(v.price).toFixed(2)}`
                          )}
                        </span>
                      )}
                    </div>
                    <div className="pdp-variation-actions">
                      <QtyStepper
                        value={getQty(v.uuid)}
                        onChange={(val) => setQty(v.uuid, val)}
                      />
                      <AddToCartButton
                        variationUuid={v.uuid}
                        variationType={v.variationType}
                        quantity={getQty(v.uuid)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdp-single-atc">
                <QtyStepper
                  value={getQty(product.firstVariationUuid)}
                  onChange={(val) => setQty(product.firstVariationUuid, val)}
                />
                <AddToCartButton
                  variationUuid={product.firstVariationUuid}
                  variationType={product.firstVariationType}
                  quantity={getQty(product.firstVariationUuid)}
                />
              </div>
            )}

            <div className="pdp-cod-note">
              💵 Cash on Delivery — pay the driver when your order arrives
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
