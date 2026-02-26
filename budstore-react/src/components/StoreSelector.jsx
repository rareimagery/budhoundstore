import { useStoreContext } from "../context/StoreContext";
import { STORE_LOGOS } from "../lib/constants";

const STORE_ICONS = {
  "Elevate Lompoc": "M13 10V3L4 14h7v7l9-11h-7z",
  "One Plant": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Royal Healing": "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  "The Roots": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "Bleu Diamond": "M12 3l2.5 7.5H22l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z",
};

function getStoreIcon(storeName) {
  for (const [key, path] of Object.entries(STORE_ICONS)) {
    if (storeName?.includes(key)) return path;
  }
  return "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4";
}

export default function StoreSelector({ stores, onSelect }) {
  const { selectedStore } = useStoreContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stores.map((store) => {
        const isSelected = selectedStore?.id === store.id;
        const addr = store.address;
        const iconPath = getStoreIcon(store.name);
        const storeLogo = store.internalId ? STORE_LOGOS[store.internalId] : null;

        return (
          <button
            key={store.id}
            onClick={() => onSelect(store)}
            className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
              isSelected
                ? "bg-brand-green/10 border-brand-green"
                : "bg-brand-surface border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50"
            }`}
          >
            {/* Icon or Logo */}
            {storeLogo ? (
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 overflow-hidden transition-colors ${
                  isSelected ? "ring-2 ring-brand-green" : ""
                }`}
              >
                <img src={storeLogo} alt={store.name} className="w-full h-full object-cover bg-white rounded-xl" />
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected
                    ? "bg-brand-green/20 text-brand-green"
                    : "bg-zinc-800 text-zinc-500 group-hover:text-brand-gold"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                </svg>
              </div>
            )}

            {/* Name */}
            <h3 className="font-display font-bold text-white text-lg mb-1">
              {store.name}
            </h3>

            {/* Address */}
            {addr && (
              <p className="text-sm text-zinc-500 leading-relaxed">
                {addr.address_line1 && <span>{addr.address_line1}<br /></span>}
                {addr.locality && `${addr.locality}, `}
                {addr.administrative_area} {addr.postal_code}
              </p>
            )}

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-4 right-4">
                <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
