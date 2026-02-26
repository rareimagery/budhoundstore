import { createContext, useContext, useReducer, useEffect } from "react";
import { fetchCart } from "../api/cart";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload, loading: false, error: null };
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_CART":
      return { ...state, cart: null, loading: false };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    dispatch({ type: "SET_LOADING" });
    try {
      const cart = await fetchCart();
      dispatch({ type: "SET_CART", payload: cart });
    } catch (err) {
      console.warn("Cart unavailable:", err.message);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }

  return (
    <CartContext.Provider value={{ ...state, dispatch, refreshCart: loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

const EMPTY_CONTEXT = {
  cart: null,
  loading: false,
  error: null,
  dispatch: () => {},
  refreshCart: () => Promise.resolve(),
};

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    console.warn("useCartContext used outside CartProvider — returning empty context");
    return EMPTY_CONTEXT;
  }
  return ctx;
}
