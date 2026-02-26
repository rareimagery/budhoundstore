import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { StoreProvider } from "./context/StoreContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import AgeGate from "./components/AgeGate";
import StoreSelectorPage from "./pages/StoreSelectorPage";
import StorefrontPage from "./pages/StorefrontPage";
import MenuPage from "./pages/MenuPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ErrorBoundary>
      <StoreProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-brand-black">
            <AgeGate />
            <Header onCartClick={() => setCartOpen(true)} />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            <main className="flex-1 pt-[68px]">
              <Routes>
                <Route path="/" element={<StoreSelectorPage />} />
                <Route path="/store/:storeId" element={<StorefrontPage />} />
                <Route path="/store/:storeId/menu" element={<MenuPage />} />
                <Route path="/store/:storeId/menu/:category" element={<MenuPage />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route
                  path="*"
                  element={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <div className="text-center">
                        <h1 className="text-4xl font-display font-bold mb-2 text-brand-gold">404</h1>
                        <p className="text-zinc-500">Page not found.</p>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </CartProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
