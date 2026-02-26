import React from "react";
import { Link, useLocation } from "react-router-dom";
import { slugify } from "../api";
import { useCart } from "../hooks/useCart";

export default function Nav({ stores, onCartOpen }) {
  const location = useLocation();
  const { itemCount } = useCart() || {};

  if (!stores || stores.length === 0) return null;

  return (
    <nav className="sticky top-0 z-50 flex items-center bg-brand-dark px-6 shadow-md">
      {/* Brand */}
      <Link
        to="/"
        className={[
          "mr-2 whitespace-nowrap border-r border-white/15 py-4 pr-5 text-lg font-bold transition hover:text-white",
          location.pathname === "/" ? "text-white" : "text-brand-light",
        ].join(" ")}
      >
        Bud<span className="text-white">Hound</span>
      </Link>

      {/* Store links */}
      <div
        className="flex flex-1 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {stores.map((store) => {
          const sid = store.attributes.drupal_internal__store_id;
          const slug = slugify(store.attributes.name);
          const path = `/store/${sid}/${slug}`;
          const isActive = location.pathname.startsWith(`/store/${sid}`);
          return (
            <Link
              key={store.id}
              to={path}
              className={[
                "whitespace-nowrap px-4 py-4 text-sm transition",
                isActive
                  ? "border-b-2 border-brand-light font-semibold text-white"
                  : "text-white/70 hover:text-white",
              ].join(" ")}
            >
              {store.attributes.name}
            </Link>
          );
        })}
      </div>

      {/* Cart */}
      <button
        onClick={onCartOpen}
        aria-label="Open cart"
        className={[
          "relative ml-2 flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-white/10",
          location.pathname === "/cart" ? "text-brand-light" : "text-white/80 hover:text-white",
        ].join(" ")}
      >
        🛒
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-dark">
            {itemCount}
          </span>
        )}
      </button>
    </nav>
  );
}
