import axios from "axios";

const BASE = process.env.REACT_APP_DRUPAL_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor: attach auth + cart tokens ─────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("oauth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const cartToken = localStorage.getItem("commerce_cart_token");
  if (cartToken) {
    config.headers["Commerce-Cart-Token"] = cartToken;
  }

  return config;
});

// ── Response interceptor: capture cart token issued by Drupal ─────────────
client.interceptors.response.use(
  (response) => {
    const cartToken = response.headers["commerce-cart-token"];
    if (cartToken) {
      localStorage.setItem("commerce_cart_token", cartToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default client;
