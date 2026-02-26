import axios from "axios";

const BASE = process.env.REACT_APP_DRUPAL_URL || "http://localhost:8080";

const drupalClient = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  },
  withCredentials: true,
});

// ── Request: attach OAuth + cart tokens ───────────────────────────────────────
drupalClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("oauth_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const cartToken = localStorage.getItem("commerce_cart_token");
  if (cartToken) config.headers["Commerce-Cart-Token"] = cartToken;

  return config;
});

// ── Response: capture cart token, auto-refresh on 401 ────────────────────────
drupalClient.interceptors.response.use(
  (response) => {
    const cartToken = response.headers["commerce-cart-token"];
    if (cartToken) localStorage.setItem("commerce_cart_token", cartToken);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) return drupalClient.request(error.config);
      localStorage.removeItem("oauth_access_token");
      localStorage.removeItem("oauth_refresh_token");
    }
    return Promise.reject(error);
  }
);

async function attemptTokenRefresh() {
  const refreshToken = localStorage.getItem("oauth_refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await axios.post(
      `${BASE}/oauth/token`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.REACT_APP_OAUTH_CLIENT_ID || "",
      })
    );
    localStorage.setItem("oauth_access_token", res.data.access_token);
    localStorage.setItem("oauth_refresh_token", res.data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export default drupalClient;
