import { createContext, useContext, useReducer, useEffect } from "react";
import drupalClient from "../api/drupalClient";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        cart: action.payload.cart,
        included: action.payload.included || [],
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_CART":
      return { ...state, cart: null, included: [], loading: false };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    included: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCart() {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await drupalClient.get(
        "/jsonapi/carts?include=order_items,order_items.purchased_entity"
      );
      const carts = res.data?.data || [];
      const included = res.data?.included || [];
      dispatch({
        type: "SET_CART",
        payload: { cart: carts.length > 0 ? carts[0] : null, included },
      });
    } catch (err) {
      // Cart API may not be configured yet — fail silently
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
  included: [],
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
