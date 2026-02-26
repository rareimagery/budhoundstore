import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { fetchProductByUuid } from "../api/products";
import { useAddToCart } from "../hooks/useAddToCart";
import { formatPrice } from "../lib/constants";
import StrainBadge from "../components/StrainBadge";
import PotencyBar from "../components/PotencyBar";

export default function ProductPage() {
  const { productId } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart, adding, success, error } = useAddToCart();

  useEffect(() => {
    if (product) {
      setSelectedVariation(product.variations?.[0] || null);
      return;
    }
    fetchProductByUuid(productId)
      .then((p) => {
        setProduct(p);
        setSelectedVariation(p?.variations?.[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-zinc-500 mb-6">This product doesn't exist or has been removed.</p>
          <Link to="/" className="text-brand-green hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImg = images[currentImage];
  const variations = product.variations || [];

  // Get unique variation attributes for selection
  const uniqueWeights = [...new Set(variations.map((v) => v.weight).filter(Boolean))];

  const handleAddToCart = () => {
    if (!selectedVariation?.uuid || !selectedVariation?.type) return;
    addToCart(selectedVariation.uuid, selectedVariation.type, 1);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-300 capitalize">{product.type?.replace("_", " ")}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image section */}
        <div>
          <div className="relative aspect-square bg-brand-surface rounded-2xl overflow-hidden mb-4">
            {currentImg ? (
              <img
                src={currentImg.url}
                alt={currentImg.alt || product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}

            {/* Strain badge */}
            {product.strainType && (
              <div className="absolute top-4 left-4">
                <StrainBadge strain={product.strainType} size="lg" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                    idx === currentImage
                      ? "border-brand-green"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {/* Category + brand */}
          <p className="text-brand-green text-xs font-semibold uppercase tracking-widest mb-2">
            {product.type?.replace("_", " ")}
            {product.brand && ` \u2022 ${product.brand}`}
          </p>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            {selectedVariation?.price ? (
              <span className="text-2xl font-bold text-brand-gold">
                {formatPrice(selectedVariation.price)}
              </span>
            ) : product.priceRange ? (
              <span className="text-2xl font-bold text-brand-gold">
                {product.priceRange.min === product.priceRange.max
                  ? formatPrice(product.priceRange.min)
                  : `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`}
              </span>
            ) : null}
          </div>

          {/* Attributes */}
          <div className="space-y-4 mb-8 p-6 bg-brand-surface rounded-2xl border border-zinc-800">
            {product.strainType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Strain</span>
                <StrainBadge strain={product.strainType} />
              </div>
            )}
            {product.potencyRange && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-500">Potency</span>
                  <span className="text-sm text-zinc-300">{product.potencyRange}</span>
                </div>
                <PotencyBar potencyRange={product.potencyRange} showLabel={false} />
              </div>
            )}
            {selectedVariation?.weight && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Weight</span>
                <span className="text-sm text-white font-medium">
                  {selectedVariation.weight}
                  {selectedVariation.weightQuantity && ` (${selectedVariation.weightQuantity})`}
                </span>
              </div>
            )}
            {selectedVariation?.formFactor && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Form</span>
                <span className="text-sm text-white font-medium">{selectedVariation.formFactor}</span>
              </div>
            )}
            {selectedVariation?.flavorProfile && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Flavor</span>
                <span className="text-sm text-white font-medium">{selectedVariation.flavorProfile}</span>
              </div>
            )}
          </div>

          {/* Weight selection */}
          {uniqueWeights.length > 1 && (
            <div className="mb-6">
              <label className="text-sm text-zinc-400 font-medium mb-3 block">
                Select Weight
              </label>
              <div className="flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.uuid}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      selectedVariation?.uuid === v.uuid
                        ? "border-brand-green bg-brand-green/10 text-brand-green"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {v.weight || v.sku}
                    {v.price && (
                      <span className="ml-2 text-xs text-zinc-500">
                        {formatPrice(v.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || !selectedVariation}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all cursor-pointer ${
              success
                ? "bg-green-500 text-white"
                : adding
                  ? "bg-zinc-700 text-zinc-400"
                  : "bg-brand-green text-black hover:bg-green-400"
            }`}
          >
            {success ? "Added to Cart!" : adding ? "Adding..." : "Add to Cart"}
          </button>

          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <h3 className="text-sm font-semibold text-white mb-3">Description</h3>
              <div
                className="text-sm text-zinc-400 leading-relaxed prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
