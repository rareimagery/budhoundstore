import React from "react";
import { Link } from "react-router-dom";
import { slugify } from "../api";
import "./StoreDirectory.css";

// ─── Hero section ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-dark" style={{ minHeight: "420px" }}>
      {/* Hero image — budhound mascot, positioned so the dog's face stays centred */}
      <div className="absolute inset-0">
        <img
          src="/budhound2.jpg"
          alt="BudHound mascot"
          className="h-full w-full object-cover object-center"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Left-to-right dark fade so text on the left stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/70 to-transparent" />
        {/* Bottom fade to blend into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-dark to-transparent" />
      </div>

      {/* Content — left-aligned to avoid covering the dog's face */}
      <div className="relative mx-auto max-w-5xl px-8 py-24 sm:py-32">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-light">
          Lompoc&apos;s Cannabis Marketplace
        </p>

        <h1 className="text-6xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-7xl">
          Bud<span className="text-brand-light">Hound</span>
        </h1>

        <p className="mt-4 max-w-sm text-base text-stone-300 sm:text-lg">
          7 local dispensaries. One menu. Cash on delivery.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#stores"
            className="rounded-full bg-brand-green px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light"
          >
            Browse Dispensaries
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-stone-400 px-8 py-3 text-sm font-semibold text-stone-200 transition hover:border-white hover:text-white"
          >
            How It Works
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">7</span>
            <span className="hero-stat-label">Dispensaries</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">249+</span>
            <span className="hero-stat-label">Products</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">COD</span>
            <span className="hero-stat-label">Cash Delivery</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">Lompoc</span>
            <span className="hero-stat-label">CA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How it works strip ───────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: "🏪", title: "Choose a Dispensary", desc: "Browse 7 Lompoc dispensaries and their full menus" },
    { icon: "🌿", title: "Add to Cart", desc: "Select products and quantities from any store" },
    { icon: "💵", title: "Cash at Delivery", desc: "Place your order and pay the driver in cash" },
  ];

  return (
    <section id="how-it-works" className="bg-brand-cream py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-brand-dark">
          How It Works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <span className="mb-4 text-5xl">{s.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-brand-dark">{s.title}</h3>
              <p className="text-sm text-stone-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Store card ───────────────────────────────────────────────────────────────
function StoreCard({ store }) {
  const { name, address, drupal_internal__store_id: sid } = store.attributes;
  const slug = slugify(name);

  const mapsQuery = encodeURIComponent(
    `${address.address_line1}, ${address.locality}, ${address.administrative_area}`
  );

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-brand-green hover:shadow-md">
      {/* Colour accent bar */}
      <div className="mb-4 h-1.5 w-10 rounded-full bg-brand-green" />

      <h3 className="scard-name">🌿 {name}</h3>

      <address className="scard-address">
        {address.address_line1}{address.address_line2 && `, ${address.address_line2}`}
        <br />
        {address.locality}, {address.administrative_area} {address.postal_code}
      </address>

      <div className="scard-actions">
        <a
          className="scard-maps-link"
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📍 Directions
        </a>
        <Link className="scard-menu-link" to={`/store/${sid}/${slug}`}>
          Browse Menu →
        </Link>
      </div>
    </div>
  );
}

// ─── Store grid ───────────────────────────────────────────────────────────────
function StoreGrid({ stores }) {
  return (
    <section id="stores" className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Dispensaries Near You</h2>
          <p className="mt-1 text-sm text-stone-500">
            {stores.length} location{stores.length !== 1 ? "s" : ""} in Lompoc, CA
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-xs text-stone-400">
        <p className="mb-1 font-semibold text-stone-600">BudHound</p>
        <p>Serving Lompoc, CA · Must be 21+ to purchase · For medical use where applicable</p>
        <p className="mt-3">© {new Date().getFullYear()} BudHound. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function StoreDirectory({ stores }) {
  if (!stores || stores.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-stone-500">No stores found.</p>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <HowItWorks />
      <StoreGrid stores={stores} />
      <Footer />
    </>
  );
}
