import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/products";
import { useStoreContext } from "../context/StoreContext";
import ProductGrid from "../components/ProductGrid";
import StoreMap from "../components/StoreMap";
import { PRODUCT_CATEGORIES, STORE_COORDINATES, STORE_LOGOS, CATEGORY_ICONS } from "../lib/constants";

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimateIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function StorefrontPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { selectedStore, selectStore } = useStoreContext();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedStore && !storeId) {
      navigate("/");
      return;
    }
    fetchProducts()
      .then((all) => {
        // Shuffle and pick 8 featured products
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        setFeatured(shuffled.slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [storeId]);

  const storeName = selectedStore?.name || "BudStore";
  const storeLogo = selectedStore?.internalId
    ? STORE_LOGOS[selectedStore.internalId]
    : null;

  return (
    <div>
      {/* Hero with banner */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Banner background */}
        <div className="absolute inset-0">
          <img
            src="/banner.jpg"
            alt=""
            className="w-full h-full object-cover object-center animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black/90 via-brand-black/70 to-brand-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-6 py-24 lg:py-32 w-full">
          <AnimateIn>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={storeLogo || "/logo.jpg"}
                alt={storeName}
                className={`w-14 h-14 rounded-full border-2 object-cover ${
                  storeLogo
                    ? "border-brand-gold/40 bg-white p-1"
                    : "border-brand-green/40"
                }`}
              />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-brand-gold" />
                <span className="text-xs font-medium text-brand-gold uppercase tracking-wider">
                  Now Open
                </span>
              </div>
            </div>
          </AnimateIn>

          <AnimateIn delay={100}>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] mb-6">
              {storeName}
            </h1>
          </AnimateIn>

          <AnimateIn delay={200}>
            <p className="text-lg md:text-xl text-zinc-300 max-w-lg mb-10 leading-relaxed">
              Premium cannabis products from California's finest cultivators.
              Browse our curated selection.
            </p>
          </AnimateIn>

          <AnimateIn delay={300}>
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/store/${storeId}/menu`}
                className="inline-flex items-center gap-2 bg-brand-green text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-colors"
              >
                Browse Menu
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm text-zinc-300 px-8 py-4 rounded-xl font-medium text-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                Change Store
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Find Us — Store location map */}
      {selectedStore && (
        <section className="py-16 border-t border-zinc-800/50">
          <div className="max-w-screen-2xl mx-auto px-6">
            <AnimateIn>
              <h2 className="font-display text-2xl font-bold text-white mb-8">
                Find Us
              </h2>
            </AnimateIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map */}
              <AnimateIn className="lg:col-span-2">
                <StoreMap store={selectedStore} />
              </AnimateIn>

              {/* Store info card */}
              <AnimateIn delay={150}>
                <div className="bg-brand-surface rounded-2xl border border-zinc-800 p-6 flex flex-col gap-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Address</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {selectedStore.address?.address_line1 && (
                          <>{selectedStore.address.address_line1}<br /></>
                        )}
                        {selectedStore.address?.locality && `${selectedStore.address.locality}, `}
                        {selectedStore.address?.administrative_area} {selectedStore.address?.postal_code}
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Hours</h3>
                      <p className="text-sm text-zinc-400">
                        Mon - Sun: 8:00 AM - 10:00 PM
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Contact</h3>
                      <p className="text-sm text-zinc-400">
                        Call for details
                      </p>
                    </div>
                  </div>

                  {/* Get Directions button */}
                  {selectedStore.address?.address_line1 && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${selectedStore.address.address_line1}, ${selectedStore.address.locality || "Lompoc"}, ${selectedStore.address.administrative_area || "CA"}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-brand-green/10 text-brand-green px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-green/20 transition-colors mt-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Get Directions
                    </a>
                  )}
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>
      )}

      {/* Category quick-links */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="max-w-screen-2xl mx-auto px-6">
          <AnimateIn>
            <h2 className="font-display text-2xl font-bold text-white mb-8">
              Shop by Category
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PRODUCT_CATEGORIES.slice(1, 6).map((cat, i) => {
              const icon = CATEGORY_ICONS[cat.key];
              return (
                <AnimateIn key={cat.key} delay={i * 80}>
                  <Link
                    to={`/store/${storeId}/menu/${cat.key}`}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-brand-surface border border-zinc-800 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-xl bg-zinc-800 group-hover:bg-brand-green/20 flex items-center justify-center transition-colors">
                      <svg className="w-9 h-9 text-zinc-500 group-hover:text-brand-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon?.paths.map((d, j) => (
                          <path key={j} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
                        ))}
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {cat.label}
                    </span>
                  </Link>
                </AnimateIn>
              );
            })}
          </div>

          {/* More categories row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {PRODUCT_CATEGORIES.slice(6).map((cat, i) => {
              const icon = CATEGORY_ICONS[cat.key];
              return (
                <AnimateIn key={cat.key} delay={400 + i * 80}>
                  <Link
                    to={`/store/${storeId}/menu/${cat.key}`}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-brand-surface/50 border border-zinc-800/50 hover:border-zinc-600 transition-all"
                  >
                    <svg className="w-6 h-6 text-zinc-600 group-hover:text-brand-green flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon?.paths.map((d, j) => (
                        <path key={j} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
                      ))}
                    </svg>
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                      {cat.label}
                    </span>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-brand-gold ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </AnimateIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="max-w-screen-2xl mx-auto px-6">
          <AnimateIn>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-white">
                Featured Products
              </h2>
              <Link
                to={`/store/${storeId}/menu`}
                className="text-sm text-brand-green hover:underline"
              >
                View All
              </Link>
            </div>
          </AnimateIn>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
            <ProductGrid products={featured} columns={4} />
          )}
        </div>
      </section>

      {/* Stats / trust bar */}
      <section className="py-12 border-t border-zinc-800/50 bg-brand-surface/30">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "250+", label: "Products" },
              { value: "7", label: "Dispensaries" },
              { value: "10", label: "Categories" },
              { value: "21+", label: "Adults Only" },
            ].map((stat) => (
              <AnimateIn key={stat.label}>
                <div className="text-center">
                  <div className="font-display text-3xl font-bold text-brand-gold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <AnimateIn>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to explore?
            </h2>
            <p className="text-zinc-400 mb-10 max-w-md mx-auto">
              Browse our full menu with flower, concentrates, edibles, vapes, and more.
            </p>
            <Link
              to={`/store/${storeId}/menu`}
              className="inline-flex items-center gap-3 bg-brand-green text-black px-10 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-green-400 transition-colors"
            >
              View Full Menu
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
