import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import StorePage from "./components/StorePage";
import CartPage from "./components/CartPage";
import CartDrawer from "./components/CartDrawer";
import CheckoutPage, { OrderConfirmation } from "./components/CheckoutPage";
import ProductDetailPage from "./components/ProductDetailPage";
import EarthyOrganicStorefront from "./components/EarthyOrganicStorefront";
import { CartProvider } from "./context/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { fetchStores } from "./api";
import "./App.css";

// Inner shell so useLocation works inside BrowserRouter
function AppShell() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  // Only show the BudHound nav on store-specific pages
  const showNav = location.pathname !== "/";

  useEffect(() => {
    fetchStores()
      .then((data) => { setStores(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (showNav && loading) return <div className="page center">Loading...</div>;
  if (showNav && error) return <div className="page center error">Error: {error}</div>;

  return (
    <>
      {showNav && (
        <>
          <Nav stores={stores} onCartOpen={() => setCartOpen(true)} />
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
      )}
      <Routes>
        {/* Earthy organic storefront — standalone, has its own header & cart */}
        <Route path="/" element={<EarthyOrganicStorefront stores={stores} />} />

        {/* Drupal-backed store pages */}
        <Route path="/store/:storeId/product/:productId" element={<ProductDetailPage />} />
        <Route path="/store/:storeId/*" element={<StorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
