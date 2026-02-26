import { Link } from "react-router-dom";
import { formatPrice } from "../lib/constants";
import StrainBadge from "./StrainBadge";

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const { priceRange } = product;

  const priceLabel =
    priceRange.min === priceRange.max
      ? formatPrice(priceRange.min)
      : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;

  return (
    <Link
      to={`/product/${product.id}`}
      state={{ product }}
      className="group block product-card-glow bg-brand-surface rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-mono text-brand-gold font-semibold">
          {priceLabel}
        </div>

        {/* Strain badge */}
        {product.strainType && (
          <div className="absolute top-3 left-3">
            <StrainBadge strain={product.strainType} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-brand-green text-[10px] font-semibold uppercase tracking-widest mb-1">
          {product.type?.replace("_", " ")}
          {product.brand && ` \u2022 ${product.brand}`}
        </p>
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
          {product.title}
        </h3>
        {product.potencyRange && (
          <p className="text-[11px] text-zinc-500 mt-1">
            {product.potencyRange}
          </p>
        )}
      </div>
    </Link>
  );
}
