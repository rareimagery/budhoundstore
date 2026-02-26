import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStores } from "../api/stores";
import { useStoreContext } from "../context/StoreContext";
import StoreSelector from "../components/StoreSelector";

export default function StoreSelectorPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectStore } = useStoreContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores()
      .then(setStores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (store) => {
    selectStore(store);
    navigate(`/store/${store.id}`);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Hero with banner */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        {/* Banner background */}
        <div className="absolute inset-0">
          <img
            src="/banner.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/80 to-brand-black" />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-6 text-center">
          {/* Logo */}
          <img
            src="/logo.jpg"
            alt="BudStore"
            className="w-24 h-24 mx-auto mb-8 rounded-full border-2 border-brand-green/40 object-cover shadow-lg shadow-brand-green/10"
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/20 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs font-medium text-brand-green uppercase tracking-wider">
              7 Dispensaries in Lompoc
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Choose Your<br />
            <span className="text-brand-green">Dispensary</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-xl mx-auto mb-16 leading-relaxed">
            Select a dispensary to browse their menu. Each store carries unique products from top California brands.
          </p>
        </div>
      </section>

      {/* Store grid */}
      <section className="max-w-screen-xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="bg-brand-surface rounded-2xl border border-zinc-800 p-6 animate-pulse"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 mb-4" />
                <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-brand-green hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (
          <StoreSelector stores={stores} onSelect={handleSelect} />
        )}
      </section>

      {/* Bottom info */}
      <section className="max-w-screen-xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              title: "Licensed & Compliant",
              desc: "All dispensaries are fully licensed and operate under California regulations.",
            },
            {
              icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
              title: "250+ Products",
              desc: "Browse flower, edibles, concentrates, vapes, pre-rolls, and more.",
            },
            {
              icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
              title: "Lompoc, California",
              desc: "Serving the Santa Barbara County community with premium cannabis.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 rounded-2xl bg-brand-surface/50 border border-zinc-800/50"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
