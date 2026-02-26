import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ── Token state (in-memory only — never localStorage) ──
let accessToken = null;
let refreshToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function setRefreshToken(token) {
  refreshToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  refreshToken = null;
}

// ── Request interceptor: attach Bearer token ──
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: handle 401 with silent refresh ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isTokenRequest = originalRequest.url?.includes('/oauth/token');
    if (error.response?.status === 401 && !originalRequest._retry && !isTokenRequest) {
      originalRequest._retry = true;

      // Deduplicate: if a refresh is already in-flight, wait for it.
      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh();
      }

      try {
        const newToken = await refreshPromise;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — broadcast forced logout.
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('auth:forceLogout'));
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

async function attemptTokenRefresh() {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await apiClient.post(
    '/oauth/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
    })
  );
  // Update refresh token if a new one is issued.
  if (response.data.refresh_token) {
    refreshToken = response.data.refresh_token;
  }
  return response.data.access_token;
}

export default apiClient;
