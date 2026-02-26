import { useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import "./ProductModal.css";

/**
 * ProductModal — full-screen product detail modal.
 *
 * Props:
 *   product  {object} — flat product object from api.js
 *   onClose  {function} — called to close the modal
 */
export default function ProductModal({ product, onClose }) {
  // Lock body scroll when the modal is open; restore on unmount.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close when clicking the backdrop (overlay), but not the dialog itself.
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const hasMultipleVariations =
    product.variationDetails && product.variationDetails.length > 1;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={product.title}>
      <div className="modal-dialog">
        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &#x2715;
        </button>

        <div className="modal-body">
          {/* Left column — image + Leafly link */}
          <div className="modal-left">
            {product.imageUrl ? (
              <img
                className="modal-image"
                src={product.imageUrl}
                alt={product.title}
              />
            ) : (
              <div className="modal-image--placeholder" aria-hidden="true">
                &#x1F33F;
              </div>
            )}

            {product.leaflyUrl && (
              <a
                className="modal-leafly-link"
                href={product.leaflyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                &#x1F343; View on Leafly
              </a>
            )}
          </div>

          {/* Right column — product details */}
          <div className="modal-content">
            {/* Category badge */}
            <span className="modal-category">{product.typeLabel}</span>

            {/* Title */}
            <h2 className="modal-title">{product.title}</h2>

            {/* Brand */}
            {product.brand && (
              <p className="modal-brand">{product.brand}</p>
            )}

            {/* Price */}
            {product.price !== null && product.price !== undefined && (
              <p className="modal-price">From ${product.price.toFixed(2)}</p>
            )}

            <hr className="modal-divider" />

            {/* Description */}
            {product.description ? (
              <p className="modal-description">{product.description}</p>
            ) : (
              <p className="modal-no-desc">No description available.</p>
            )}

            <hr className="modal-divider" />

            {/* Variations / Add to Cart */}
            {hasMultipleVariations ? (
              <div className="modal-variations">
                <p className="modal-variations-title">Available Options</p>
                {product.variationDetails.map((v, idx) => (
                  <div className="modal-variation-row" key={v.uuid || v.internalId || idx}>
                    <span className="modal-variation-label">
                      {v.sku ? v.sku : `Option ${idx + 1}`}
                    </span>
                    {v.price !== null && v.price !== undefined && (
                      <span className="modal-variation-price">
                        ${Number(v.price).toFixed(2)}
                      </span>
                    )}
                    <AddToCartButton
                      variationUuid={v.uuid}
                      variationType={v.variationType}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="modal-single-atc">
                <AddToCartButton
                  variationUuid={product.firstVariationUuid}
                  variationType={product.firstVariationType}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
