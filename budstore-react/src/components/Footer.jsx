import { Link } from "react-router-dom";
import { useStoreContext } from "../context/StoreContext";

export default function Footer() {
  const { selectedStore } = useStoreContext();
  const base = selectedStore ? `/store/${selectedStore.id}` : "";

  return (
    <footer className="bg-black border-t border-zinc-800/50 py-16 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpg"
                alt="BudStore"
                className="w-10 h-10 rounded-full border border-brand-green/30 object-cover"
              />
              <span className="font-display text-xl font-bold text-white">BudStore</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              Premium cannabis from Lompoc's finest dispensaries.
              Quality products, expert guidance.
            </p>
          </div>

          {/* Menu */}
          <div>
            <div className="font-mono uppercase text-xs mb-4 text-zinc-600 tracking-wider">Menu</div>
            <div className="space-y-2 text-sm">
              <Link to={`${base}/menu/flower`} className="block text-zinc-500 hover:text-brand-green transition-colors">Flower</Link>
              <Link to={`${base}/menu/concentrate`} className="block text-zinc-500 hover:text-brand-green transition-colors">Concentrates</Link>
              <Link to={`${base}/menu/edible`} className="block text-zinc-500 hover:text-brand-green transition-colors">Edibles</Link>
              <Link to={`${base}/menu/vape`} className="block text-zinc-500 hover:text-brand-green transition-colors">Vapes</Link>
              <Link to={`${base}/menu/pre_roll`} className="block text-zinc-500 hover:text-brand-green transition-colors">Pre-Rolls</Link>
            </div>
          </div>

          {/* Dispensaries */}
          <div>
            <div className="font-mono uppercase text-xs mb-4 text-zinc-600 tracking-wider">Dispensaries</div>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-zinc-500 hover:text-brand-gold transition-colors">All Locations</Link>
              <span className="block text-zinc-600">Lompoc, CA</span>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div className="font-mono uppercase text-xs mb-4 text-zinc-600 tracking-wider">Info</div>
            <div className="space-y-2 text-sm">
              <Link to="/cart" className="block text-zinc-500 hover:text-white transition-colors">Cart</Link>
              <Link to="/checkout" className="block text-zinc-500 hover:text-white transition-colors">Checkout</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-600">
            &copy; {new Date().getFullYear()} BudStore. All rights reserved. For adults 21+ only.
          </p>
          <p className="text-[10px] text-zinc-700">
            Cannabis products are intended for use by adults 21 years of age or older.
          </p>
        </div>
      </div>
    </footer>
  );
}
