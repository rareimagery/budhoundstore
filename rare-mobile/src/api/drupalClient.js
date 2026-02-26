import axios from "axios";
import { API_BASE_URL, OAUTH_CLIENT_ID } from "./config";
import { getToken, setToken, removeToken } from "./tokenStore";

const drupalClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  },
});

// Request: attach OAuth + cart tokens
drupalClient.interceptors.request.use((config) => {
  const token = getToken("oauth_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const cartToken = getToken("commerce_cart_token");
  if (cartToken) config.headers["Commerce-Cart-Token"] = cartToken;

  return config;
});

// Response: capture cart token, auto-refresh on 401
drupalClient.interceptors.response.use(
  (response) => {
    const cartToken = response.headers["commerce-cart-token"];
    if (cartToken) setToken("commerce_cart_token", cartToken);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) return drupalClient.request(error.config);
      removeToken("oauth_access_token");
      removeToken("oauth_refresh_token");
    }
    return Promise.reject(error);
  }
);

async function attemptTokenRefresh() {
  const refreshToken = getToken("oauth_refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await axios.post(
      `${API_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: OAUTH_CLIENT_ID,
      })
    );
    setToken("oauth_access_token", res.data.access_token);
    setToken("oauth_refresh_token", res.data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export default drupalClient;
