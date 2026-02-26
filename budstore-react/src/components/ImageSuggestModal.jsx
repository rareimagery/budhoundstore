import { useState, useCallback } from "react";
import drupalClient from "../api/drupalClient";

export default function ImageSuggestModal({ product, onImageSelected, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const buildDefaultQuery = useCallback(() => {
    const parts = [];
    if (product?.title) parts.push(`"${product.title}"`);
    if (product?.type) parts.push(product.type);
    if (product?.brand) parts.push(product.brand);
    parts.push("cannabis");
    return parts.join(" ");
  }, [product]);

  const handleSearch = async (query) => {
    const q = query || buildDefaultQuery();
    setSearchQuery(q);
    setLoading(true);
    setSelectedIndex(null);

    try {
      const res = await drupalClient.get(
        `/api/budhound/image-search?q=${encodeURIComponent(q)}`
      );
      setImages(res.data?.images || []);
    } catch (err) {
      console.error("Image search failed:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (selectedIndex === null) return;
    setDownloading(true);
    const selected = images[selectedIndex];

    try {
      const res = await drupalClient.post("/api/budhound/image-download", {
        url: selected.url,
        product_id: product.internalId,
        filename: `${product.title || "product"}-${product.type || "image"}`,
      });

      if (res.data?.success) {
        onImageSelected?.(res.data.file_id);
        onClose();
      }
    } catch (err) {
      console.error("Image download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-brand-surface border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="font-display text-lg font-bold text-white">
            Find Product Image
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              placeholder="Search for product images..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-green"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-4 py-2 bg-brand-green text-black text-sm font-semibold rounded-lg hover:bg-green-400 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => handleSearch(buildDefaultQuery())}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              Auto
            </button>
          </div>
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-zinc-400">Searching...</span>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndex === i
                      ? "border-brand-green ring-2 ring-brand-green/30"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <img
                    src={img.thumbnail}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-[10px] text-zinc-300">{img.width}x{img.height}</span>
                  </div>
                  {selectedIndex === i && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-center text-zinc-500 py-12 text-sm">
              No images found. Try adjusting your search query.
            </p>
          ) : (
            <p className="text-center text-zinc-500 py-12 text-sm">
              Click "Auto" to search based on product info, or type a custom query.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={selectedIndex === null || downloading}
            className="px-5 py-2 bg-brand-green text-black text-sm font-semibold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {downloading ? "Downloading..." : "Use Selected Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
