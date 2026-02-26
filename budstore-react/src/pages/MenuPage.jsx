import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../api/products";
import CategoryNav from "../components/CategoryNav";
import ProductGrid from "../components/ProductGrid";
import { getCategoryLabel } from "../lib/constants";

const SORT_OPTIONS = [
  { key: "name-asc", label: "Name A-Z" },
  { key: "name-desc", label: "Name Z-A" },
  { key: "price-asc", label: "Price Low-High" },
  { key: "price-desc", label: "Price High-Low" },
];

export default function MenuPage() {
  const { storeId, category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [sort, setSort] = useState("name-asc");
  const [search, setSearch] = useState("");

  // Sync URL category with state
  useEffect(() => {
    setActiveCategory(category || "all");
  }, [category]);

  useEffect(() => {
    setLoading(true);
    const type = activeCategory === "all" ? null : activeCategory;
    fetchProducts(type)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  // Filter by search
  let filtered = products;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.strainType?.toLowerCase().includes(q)
    );
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "price-asc":
        return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
      case "price-desc":
        return (b.priceRange?.min || 0) - (a.priceRange?.min || 0);
      default:
        return 0;
    }
  });

  const handleCategorySelect = (key) => {
    setActiveCategory(key);
    // Update URL without full reload
    const basePath = `/store/${storeId}/menu`;
    const newPath = key === "all" ? basePath : `${basePath}/${key}`;
    window.history.replaceState(null, "", newPath);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Page header */}
      <section className="pt-8 pb-6 border-b border-zinc-800/50">
        <div className="max-w-screen-2xl mx-auto px-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            {activeCategory === "all" ? "Full Menu" : getCategoryLabel(activeCategory)}
          </h1>

          {/* Category tabs */}
          <CategoryNav
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-4 border-b border-zinc-800/30">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-brand-green focus:outline-none transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-brand-surface border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:border-brand-green focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Count */}
          <span className="text-sm text-zinc-500 ml-auto">
            {loading ? "Loading..." : `${filtered.length} products`}
          </span>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-8">
        <div className="max-w-screen-2xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-brand-surface rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-zinc-800" />
                  <div className="p-4">
                    <div className="h-3 bg-zinc-800 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid
              products={filtered}
              emptyMessage={
                search
                  ? `No results for "${search}"`
                  : "No products found in this category."
              }
              columns={4}
            />
          )}
        </div>
      </section>
    </div>
  );
}
