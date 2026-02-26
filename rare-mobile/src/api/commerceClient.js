import axios from "axios";
import { API_BASE_URL } from "./config";
import { getToken, setToken } from "./tokenStore";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach auth + cart tokens
client.interceptors.request.use((config) => {
  const token = getToken("oauth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const cartToken = getToken("commerce_cart_token");
  if (cartToken) {
    config.headers["Commerce-Cart-Token"] = cartToken;
  }

  return config;
});

// Response interceptor: capture cart token issued by Drupal
client.interceptors.response.use(
  (response) => {
    const cartToken = response.headers["commerce-cart-token"];
    if (cartToken) {
      setToken("commerce_cart_token", cartToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default client;
