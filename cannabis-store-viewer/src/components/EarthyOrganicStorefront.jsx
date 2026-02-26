import { useState } from "react";
import { Link } from "react-router-dom";
import { slugify } from "../api";

const PRODUCTS = [
  { id: 1, name: "Blue Dream", brand: "Pacific Stone", category: "Flower", subcategory: "Hybrid", thc: 21.3, cbd: 0.1, price: 35, weight: "3.5g", effects: ["Relaxing", "Creative", "Euphoric"], description: "A legendary sativa-dominant hybrid with sweet berry notes and a balanced cerebral high.", stock: 24, image: "🌿" },
  { id: 2, name: "OG Kush", brand: "Raw Garden", category: "Flower", subcategory: "Indica", thc: 24.8, cbd: 0.2, price: 45, weight: "3.5g", effects: ["Relaxing", "Sleepy", "Happy"], description: "The backbone of West Coast cannabis. Earthy pine with a heavy body stone.", stock: 12, image: "🌿" },
  { id: 3, name: "Sour Diesel", brand: "Stiiizy", category: "Flower", subcategory: "Sativa", thc: 22.1, cbd: 0.1, price: 40, weight: "3.5g", effects: ["Energizing", "Creative", "Focused"], description: "Pungent diesel aroma with an invigorating, fast-acting cerebral high.", stock: 8, image: "🌿" },
  { id: 4, name: "Gelato #41", brand: "Cookies", category: "Flower", subcategory: "Hybrid", thc: 25.6, cbd: 0.1, price: 55, weight: "3.5g", effects: ["Euphoric", "Relaxing", "Creative"], description: "Dense, purple-tinged buds with sweet sherbet flavor and potent effects.", stock: 6, image: "🌿" },
  { id: 5, name: "Live Resin Cart — Mango Haze", brand: "Raw Garden", category: "Concentrates", subcategory: "Cartridge", thc: 84.2, cbd: 0.3, price: 50, weight: "1g", effects: ["Euphoric", "Energizing", "Creative"], description: "Refined live resin with tropical mango terpenes. Smooth draw, clean effects.", stock: 15, image: "💧" },
  { id: 6, name: "Diamond Sauce — GMO", brand: "Apex", category: "Concentrates", subcategory: "Dab", thc: 89.1, cbd: 0.1, price: 40, weight: "1g", effects: ["Relaxing", "Sleepy", "Happy"], description: "THCA diamonds in terpene-rich sauce. Garlic, mushroom, onion terp profile.", stock: 10, image: "💎" },
  { id: 7, name: "Watermelon Gummies", brand: "Kanha", category: "Edibles", subcategory: "Gummies", thc: 10, cbd: 0, price: 22, weight: "100mg", effects: ["Relaxing", "Happy", "Sleepy"], description: "10 precisely dosed gummies, 10mg THC each. Natural watermelon flavor.", stock: 30, image: "🍬" },
  { id: 8, name: "Dark Chocolate Bar", brand: "Kiva", category: "Edibles", subcategory: "Chocolate", thc: 5, cbd: 5, price: 24, weight: "100mg", effects: ["Relaxing", "Happy", "Balanced"], description: "Award-winning 1:1 THC:CBD dark chocolate. 20 precisely dosed pieces.", stock: 18, image: "🍫" },
  { id: 9, name: "Midnight Berry Pre-Roll 5pk", brand: "Lowell Farms", category: "Pre-Rolls", subcategory: "Multi-Pack", thc: 26.3, cbd: 0.1, price: 38, weight: "3.5g", effects: ["Relaxing", "Euphoric", "Sleepy"], description: "Five hand-rolled joints of premium indica flower. Perfect for sharing.", stock: 20, image: "🚬" },
  { id: 10, name: "Sativa Infused Pre-Roll", brand: "Jeeter", category: "Pre-Rolls", subcategory: "Infused", thc: 35.2, cbd: 0.1, price: 18, weight: "1g", effects: ["Energizing", "Creative", "Euphoric"], description: "Liquid diamond-infused pre-roll with kief coating. Heavy hitter.", stock: 25, image: "🚬" },
  { id: 11, name: "1:1 Relief Tincture", brand: "Care By Design", category: "Tinctures", subcategory: "Sublingual", thc: 15, cbd: 15, price: 45, weight: "30ml", effects: ["Relaxing", "Balanced", "Focused"], description: "Balanced THC:CBD formula for targeted relief. Graduated dropper for precise dosing.", stock: 14, image: "💊" },
  { id: 12, name: "Grandaddy Purple", brand: "Pacific Stone", category: "Flower", subcategory: "Indica", thc: 19.7, cbd: 0.3, price: 28, weight: "3.5g", effects: ["Relaxing", "Sleepy", "Happy"], description: "Classic indica with grape and berry aromatics. Deep body relaxation.", stock: 32, image: "🌿" },
  { id: 13, name: "Jack Herer", brand: "Flow Kana", category: "Flower", subcategory: "Sativa", thc: 20.5, cbd: 0.2, price: 42, weight: "3.5g", effects: ["Energizing", "Creative", "Focused"], description: "Named after the legendary activist. Spicy pine with clear-headed uplift.", stock: 9, image: "🌿" },
  { id: 14, name: "Pax Era Pod — Wedding Cake", brand: "Pax", category: "Concentrates", subcategory: "Cartridge", thc: 78.5, cbd: 0.2, price: 55, weight: "0.5g", effects: ["Relaxing", "Euphoric", "Happy"], description: "Temperature-controlled pod with sweet vanilla terps.", stock: 11, image: "💧" },
  { id: 15, name: "CBD Recovery Balm", brand: "Papa & Barkley", category: "Topicals", subcategory: "Balm", thc: 0, cbd: 180, price: 35, weight: "15ml", effects: ["Soothing", "Balanced"], description: "Whole-plant infusion for targeted topical relief. No psychoactive effects.", stock: 22, image: "🧴" },
];

const CATEGORIES = ["All", "Flower", "Concentrates", "Edibles", "Pre-Rolls", "Tinctures", "Topicals"];
const EFFECTS = ["Relaxing", "Creative", "Euphoric", "Energizing", "Sleepy", "Happy", "Focused", "Balanced", "Soothing"];
const MOODS = [
  { name: "Unwind", icon: "🌙", effects: ["Relaxing", "Sleepy"] },
  { name: "Create", icon: "✨", effects: ["Creative", "Focused"] },
  { name: "Energize", icon: "☀️", effects: ["Energizing", "Euphoric"] },
  { name: "Balance", icon: "🧘", effects: ["Balanced", "Soothing"] },
];

function AgeGate({ onVerify }) {
  const [h, setH] = useState(false);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#F7F2EB",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23795548' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div style={{ textAlign: "center", maxWidth: 520, padding: "0 24px", position: "relative" }}>
        <img src="/budhound.jpg" alt="BudHound" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 24 }} />
        <h1 style={{
          fontSize: 36, fontWeight: 400, color: "#3E2723",
          fontFamily: "'Playfair Display', serif",
          marginBottom: 8, lineHeight: 1.2
        }}>
          BudHound
        </h1>
        <p style={{
          fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#8D6E63", marginBottom: 28,
          fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300
        }}>
          7 Lompoc Dispensaries · Cash on Delivery
        </p>
        <div style={{
          display: "flex", justifyContent: "center", gap: 4, marginBottom: 28
        }}>
          {[..."🌿🌸🍃🌻🌿"].map((e, i) => (
            <span key={i} style={{ fontSize: 18, opacity: 0.4 }}>{e}</span>
          ))}
        </div>
        <p style={{
          fontSize: 15, color: "#6D4C41", lineHeight: 1.7, marginBottom: 36,
          fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300
        }}>
          Welcome, friend. Please confirm you're 21 or older<br />to explore our garden.
        </p>
        <button
          onClick={onVerify}
          onMouseEnter={() => setH(true)}
          onMouseLeave={() => setH(false)}
          style={{
            padding: "16px 48px",
            background: h ? "#5D4037" : "#6D4C41",
            color: "#F7F2EB", border: "none",
            borderRadius: 50, fontSize: 15, fontWeight: 400,
            cursor: "pointer", transition: "all 0.3s ease",
            fontFamily: "'Nunito Sans', sans-serif",
            boxShadow: h ? "0 8px 24px rgba(109,76,65,0.25)" : "0 4px 12px rgba(109,76,65,0.15)"
          }}
        >Yes, I'm 21+</button>
        <button onClick={() => window.location.href = "https://google.com"} style={{
          display: "block", margin: "16px auto 0", background: "none", border: "none",
          color: "#BCAAA4", fontSize: 13, cursor: "pointer",
          fontFamily: "'Nunito Sans', sans-serif"
        }}>I'm under 21</button>
      </div>
    </div>
  );
}

function ProductCard({ product, onClick, onAddToCart }) {
  const [h, setH] = useState(false);
  const strainBg = { Indica: "#E8EAF6", Sativa: "#FFF3E0", Hybrid: "#E8F5E9" };
  const strainColor = { Indica: "#5C6BC0", Sativa: "#EF6C00", Hybrid: "#43A047" };
  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "#FFFDF9",
        borderRadius: 20,
        border: "1px solid #E8DFD3",
        padding: 0, cursor: "pointer",
        transition: "all 0.3s ease",
        transform: h ? "translateY(-6px)" : "none",
        boxShadow: h ? "0 16px 40px rgba(62,39,35,0.08)" : "0 2px 8px rgba(62,39,35,0.03)",
        overflow: "hidden"
      }}
    >
      <div style={{
        width: "100%", height: 160,
        background: "linear-gradient(135deg, #F5EDE3 0%, #EDE4D8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 56, position: "relative"
      }}>
        <div style={{
          position: "absolute", bottom: -20, right: -20, fontSize: 120, opacity: 0.04
        }}>🍃</div>
        {product.image}
        {product.stock < 10 && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            fontSize: 10, fontWeight: 600, color: "#EF6C00",
            background: "#FFF3E0", padding: "4px 10px", borderRadius: 20,
            fontFamily: "'Nunito Sans', sans-serif"
          }}>Almost gone</span>
        )}
      </div>
      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            color: strainColor[product.subcategory] || "#8D6E63",
            background: strainBg[product.subcategory] || "#EFEBE9",
            padding: "2px 8px", borderRadius: 10, letterSpacing: "0.06em",
            fontFamily: "'Nunito Sans', sans-serif"
          }}>{product.subcategory}</span>
          <span style={{ fontSize: 11, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif" }}>{product.brand}</span>
        </div>
        <h3 style={{
          fontSize: 18, fontWeight: 400, color: "#3E2723",
          fontFamily: "'Playfair Display', serif",
          marginBottom: 8
        }}>{product.name}</h3>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {product.effects.slice(0, 2).map(e => (
            <span key={e} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: "#F5EDE3", color: "#8D6E63",
              fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300
            }}>{e}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: "#E8F5E9", color: "#2E7D32",
            padding: "2px 8px", borderRadius: 8,
            fontFamily: "'Nunito Sans', sans-serif"
          }}>THC {product.thc}%</span>
          {product.cbd > 0.5 && <span style={{
            fontSize: 11, fontWeight: 600,
            background: "#E3F2FD", color: "#1565C0",
            padding: "2px 8px", borderRadius: 8,
            fontFamily: "'Nunito Sans', sans-serif"
          }}>CBD {product.cbd}%</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>${product.price}</span>
            <span style={{ fontSize: 12, color: "#BCAAA4", marginLeft: 4, fontFamily: "'Nunito Sans', sans-serif" }}>{product.weight}</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onAddToCart(product); }} style={{
            width: 42, height: 42, borderRadius: "50%",
            border: "none",
            background: h ? "#6D4C41" : "#EFEBE9",
            color: h ? "#FFFDF9" : "#6D4C41",
            fontSize: 20, cursor: "pointer", transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 300
          }}>+</button>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, onClose, onAddToCart }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(62,39,35,0.25)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#FFFDF9", borderRadius: 28, maxWidth: 600, width: "100%",
        maxHeight: "85vh", overflow: "auto", padding: 40,
        boxShadow: "0 32px 64px rgba(62,39,35,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>{product.category} · {product.subcategory}</span>
          <button onClick={onClose} style={{ background: "#EFEBE9", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, color: "#8D6E63" }}>×</button>
        </div>
        <div style={{
          width: "100%", height: 200,
          background: "linear-gradient(135deg, #F5EDE3 0%, #EDE4D8 100%)",
          borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 80, marginBottom: 28
        }}>{product.image}</div>
        <p style={{ fontSize: 12, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif", marginBottom: 4 }}>{product.brand}</p>
        <h2 style={{ fontSize: 32, fontWeight: 400, color: "#3E2723", fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>{product.name}</h2>
        <p style={{ fontSize: 15, color: "#6D4C41", lineHeight: 1.8, marginBottom: 24, fontFamily: "'Nunito Sans', sans-serif", fontWeight: 300 }}>{product.description}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, background: "#E8F5E9", color: "#2E7D32", padding: "4px 14px", borderRadius: 12, fontFamily: "'Nunito Sans', sans-serif" }}>THC {product.thc}%</span>
          {product.cbd > 0.5 && <span style={{ fontSize: 12, fontWeight: 600, background: "#E3F2FD", color: "#1565C0", padding: "4px 14px", borderRadius: 12, fontFamily: "'Nunito Sans', sans-serif" }}>CBD {product.cbd}%</span>}
          <span style={{ fontSize: 12, background: "#EFEBE9", color: "#8D6E63", padding: "4px 14px", borderRadius: 12, fontFamily: "'Nunito Sans', sans-serif" }}>{product.weight}</span>
        </div>
        <p style={{ fontSize: 11, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>How it feels</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {product.effects.map(e => (
            <span key={e} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, background: "#F5EDE3", color: "#6D4C41", fontFamily: "'Nunito Sans', sans-serif" }}>{e}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #E8DFD3" }}>
          <div>
            <span style={{ fontSize: 32, fontWeight: 600, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>${product.price}</span>
            <span style={{ fontSize: 13, color: "#BCAAA4", marginLeft: 6, fontFamily: "'Nunito Sans', sans-serif" }}>+ tax</span>
          </div>
          <button onClick={() => onAddToCart(product)} style={{
            padding: "14px 36px", background: "#6D4C41", color: "#FFFDF9",
            border: "none", borderRadius: 50, fontSize: 14, fontWeight: 400,
            cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(109,76,65,0.2)"
          }}>Add to Cart 🌿</button>
        </div>
        <p style={{ fontSize: 11, color: "#BCAAA4", marginTop: 16, fontFamily: "'Nunito Sans', sans-serif" }}>
          {product.stock} available · SKU: LVC-{String(product.id).padStart(4, "0")}
        </p>
      </div>
    </div>
  );
}

function Cart({ items, onRemove, onClose }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = total * 0.3775;
  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 400, maxWidth: "90vw",
      background: "#FFFDF9", borderLeft: "1px solid #E8DFD3",
      zIndex: 2000, display: "flex", flexDirection: "column"
    }}>
      <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #E8DFD3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 18, fontWeight: 400, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>Your Cart ({items.reduce((s, i) => s + i.qty, 0)})</h3>
        <button onClick={onClose} style={{ background: "#EFEBE9", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, color: "#8D6E63" }}>×</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🌱</p>
            <p style={{ color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif" }}>Your garden awaits</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F5EDE3" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F5EDE3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.image}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 400, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>{item.name}</p>
              <p style={{ fontSize: 11, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif" }}>{item.brand} · {item.weight}</p>
              <p style={{ fontSize: 13, color: "#6D4C41", marginTop: 4, fontFamily: "'Nunito Sans', sans-serif" }}>Qty: {item.qty} · ${item.price * item.qty}</p>
            </div>
            <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#BCAAA4", cursor: "pointer", fontSize: 14, alignSelf: "start" }}>×</button>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div style={{ padding: 24, borderTop: "1px solid #E8DFD3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#8D6E63", fontFamily: "'Nunito Sans', sans-serif" }}>Subtotal</span>
            <span style={{ fontSize: 14, color: "#3E2723", fontWeight: 500 }}>${total.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#BCAAA4", fontFamily: "'Nunito Sans', sans-serif" }}>Est. Tax (37.75%)</span>
            <span style={{ fontSize: 12, color: "#BCAAA4" }}>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingTop: 14, borderTop: "1px solid #E8DFD3" }}>
            <span style={{ fontSize: 16, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#3E2723", fontFamily: "'Playfair Display', serif" }}>${(total + tax).toFixed(2)}</span>
          </div>
          <button style={{
            width: "100%", padding: "16px", background: "#6D4C41", color: "#FFFDF9",
            border: "none", borderRadius: 50, fontSize: 14,
            cursor: "pointer", fontFamily: "'Nunito Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(109,76,65,0.15)"
          }}>Checkout 🌿</button>
        </div>
      )}
    </div>
  );
}

export default function EarthyOrganicStorefront({ stores = [] }) {
  const [verified, setVerified] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEffects, setSelectedEffects] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [activeMood, setActiveMood] = useState(null);

  const toggleEffect = (e) => setSelectedEffects(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);
  const addToCart = (product) => setCart(p => { const ex = p.find(i => i.id === product.id); return ex ? p.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...product, qty: 1 }]; });
  const removeFromCart = (id) => setCart(p => p.filter(i => i.id !== id));

  const selectMood = (mood) => {
    if (activeMood === mood.name) {
      setActiveMood(null);
      setSelectedEffects([]);
    } else {
      setActiveMood(mood.name);
      setSelectedEffects(mood.effects);
    }
  };

  const filtered = PRODUCTS
    .filter(p => category === "All" || p.category === category)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .filter(p => selectedEffects.length === 0 || selectedEffects.some(e => p.effects.includes(e)))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "thc") return b.thc - a.thc;
      return a.name.localeCompare(b.name);
    });

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,600;0,6..12,700;1,6..12,300&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #F7F2EB; color: #3E2723; font-family: 'Nunito Sans', sans-serif; }
    ::selection { background: #D7CCC8; }
    input:focus, select:focus { outline: 2px solid #8D6E63; outline-offset: 1px; }
  `;

  if (!verified) return (<><style>{css}</style><AgeGate onVerify={() => setVerified(true)} /></>);

  return (
    <>
      <style>{css}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(247,242,235,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #E8DFD3", padding: "0 32px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/budhound.jpg" alt="BudHound" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#3E2723" }}>
                BudHound
              </h1>
              <p style={{ fontSize: 10, color: "#BCAAA4", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300 }}>Lompoc's Cannabis Marketplace</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <input
              type="text" placeholder="Search the garden..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                padding: "10px 18px", borderRadius: 50, border: "1px solid #E8DFD3",
                background: "#FFFDF9", fontSize: 13, width: 220,
                fontFamily: "'Nunito Sans', sans-serif"
              }}
            />
            <button onClick={() => setCartOpen(true)} style={{
              position: "relative", background: "#EFEBE9", border: "none",
              width: 44, height: 44, borderRadius: "50%",
              cursor: "pointer", fontSize: 18
            }}>
              🛒
              {cart.length > 0 && (
                <span style={{
                  position: "absolute", top: 0, right: 0,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#6D4C41", color: "#FFFDF9",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 64px" }}>
        {/* Hero */}
        <div style={{
          backgroundImage: "url('/budhound2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 28, padding: "56px 40px", marginBottom: 36,
          position: "relative", overflow: "hidden"
        }}>
          {/* Overlay for text readability */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(30, 15, 10, 0.52)",
            borderRadius: 28
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", fontWeight: 600, marginBottom: 12 }}>LOMPOC, CA · 7 DISPENSARIES</p>
            <h2 style={{ fontSize: 36, fontWeight: 400, fontFamily: "'Playfair Display', serif", color: "#FFFDF9", marginBottom: 12, lineHeight: 1.2 }}>
              Lompoc's Finest,<br /><span style={{ fontStyle: "italic" }}>One Marketplace</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", maxWidth: 460, lineHeight: 1.7, fontWeight: 300 }}>
              Browse menus from 7 local Lompoc dispensaries. Order online, pay cash at delivery.
            </p>
          </div>
        </div>

        {/* Store List */}
        {stores.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, color: "#BCAAA4", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>Our Dispensaries</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {stores.map(store => {
                const sid = store.attributes.drupal_internal__store_id;
                const name = store.attributes.name;
                const slug = slugify(name);
                return (
                  <Link
                    key={store.id}
                    to={`/store/${sid}/${slug}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 22px", borderRadius: 50,
                      border: "1px solid #E8DFD3",
                      background: "#FFFDF9",
                      color: "#6D4C41",
                      fontSize: 14, transition: "all 0.2s ease",
                      fontFamily: "'Nunito Sans', sans-serif", fontWeight: 400,
                      textDecoration: "none"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#6D4C41"; e.currentTarget.style.color = "#FFFDF9"; e.currentTarget.style.borderColor = "#6D4C41"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFFDF9"; e.currentTarget.style.color = "#6D4C41"; e.currentTarget.style.borderColor = "#E8DFD3"; }}
                  >
                    🌿 {name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "8px 18px", borderRadius: 50,
              border: "1px solid",
              borderColor: category === cat ? "#6D4C41" : "#E8DFD3",
              background: category === cat ? "#3E2723" : "#FFFDF9",
              color: category === cat ? "#FFFDF9" : "#8D6E63",
              fontSize: 13, cursor: "pointer",
              fontFamily: "'Nunito Sans', sans-serif",
              transition: "all 0.2s ease"
            }}>{cat}</button>
          ))}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: "8px 14px", borderRadius: 50, border: "1px solid #E8DFD3",
            background: "#FFFDF9", fontSize: 13, fontFamily: "'Nunito Sans', sans-serif",
            color: "#8D6E63", cursor: "pointer", marginLeft: "auto"
          }}>
            <option value="name">A–Z</option>
            <option value="price-low">Price ↑</option>
            <option value="price-high">Price ↓</option>
            <option value="thc">THC ↓</option>
          </select>
        </div>

        <p style={{ fontSize: 13, color: "#BCAAA4", marginBottom: 20, fontWeight: 300 }}>
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""} {activeMood ? `for "${activeMood}"` : ""}
        </p>

        {/* Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onClick={setSelectedProduct} onAddToCart={addToCart} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🌸</p>
            <p style={{ fontSize: 16, color: "#BCAAA4", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>Nothing blooming here — try a different filter</p>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid #E8DFD3", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 16, fontFamily: "'Playfair Display', serif", color: "#3E2723", marginBottom: 6 }}>🐾 BudHound</p>
            <p style={{ fontSize: 12, color: "#BCAAA4", fontWeight: 300 }}>123 H Street, Lompoc, CA 93436</p>
            <p style={{ fontSize: 12, color: "#BCAAA4", fontWeight: 300 }}>Open Daily 8am–9pm</p>
          </div>
          <div style={{ fontSize: 11, color: "#D7CCC8", textAlign: "right", fontWeight: 300 }}>
            <p>License #C10-0000XXX-LIC</p>
            <p>CA Bureau of Cannabis Control</p>
            <p style={{ marginTop: 8 }}>For use only by adults 21+. Keep out of reach of children.</p>
          </div>
        </footer>
      </main>

      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(62,39,35,0.15)", zIndex: 1999 }} />
          <Cart items={cart} onRemove={removeFromCart} onClose={() => setCartOpen(false)} />
        </>
      )}
    </>
  );
}
