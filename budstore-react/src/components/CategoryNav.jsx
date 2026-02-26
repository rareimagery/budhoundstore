import { PRODUCT_CATEGORIES } from "../lib/constants";

export default function CategoryNav({ activeCategory, onSelect }) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
      <div className="flex gap-2 min-w-max pb-2">
        {PRODUCT_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelect(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-brand-green text-black"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
