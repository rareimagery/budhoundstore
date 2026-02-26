import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useStoreContext } from "../context/StoreContext";
import { PRODUCT_CATEGORIES } from "../lib/constants";

export default function Header({ onCartClick }) {
  const { itemCount } = useCart();
  const { selectedStore } = useStoreContext();
  const { storeId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const base = storeId ? `/store/${storeId}` : selectedStore ? `/store/${selectedStore.id}` : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-brand-black/80 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="BudStore"
            className="w-9 h-9 rounded-full border border-brand-green/30 object-cover"
          />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            BudStore
          </span>
          {selectedStore && (
            <span className="hidden sm:inline text-xs text-brand-gold font-medium px-2 py-0.5 rounded-full bg-brand-gold/10 ml-1">
              {selectedStore.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        {base && (
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink
              to={`${base}/menu`}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-brand-green bg-brand-green/10" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              Full Menu
            </NavLink>
            {PRODUCT_CATEGORIES.slice(1, 6).map((cat) => (
              <NavLink
                key={cat.key}
                to={`${base}/menu/${cat.key}`}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-brand-green bg-brand-green/10" : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                {cat.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Change store */}
          {selectedStore && (
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 text-xs text-zinc-500 hover:text-brand-gold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch Store
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative text-zinc-400 hover:text-brand-green transition-colors cursor-pointer"
            aria-label="Open cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-green text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-zinc-400 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 bg-brand-black z-50 pt-20 px-6 overflow-y-auto">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-5 right-6 text-zinc-400 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col gap-6">
            {base && (
              <>
                <NavLink
                  to={`${base}/menu`}
                  end
                  onClick={() => setMenuOpen(false)}
                  className="text-xl font-medium text-zinc-300 hover:text-brand-green"
                >
                  Full Menu
                </NavLink>
                {PRODUCT_CATEGORIES.slice(1).map((cat) => (
                  <NavLink
                    key={cat.key}
                    to={`${base}/menu/${cat.key}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-lg text-zinc-400 hover:text-brand-green"
                  >
                    {cat.label}
                  </NavLink>
                ))}
              </>
            )}
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-brand-gold hover:text-brand-gold mt-4 pt-4 border-t border-zinc-800"
            >
              Switch Dispensary
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
