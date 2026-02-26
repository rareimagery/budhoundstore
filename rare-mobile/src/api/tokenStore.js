import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * In-memory + AsyncStorage token store.
 *
 * Axios interceptors are synchronous, so we keep an in-memory cache
 * and persist to AsyncStorage in the background.
 */

const KEYS = {
  oauthAccess: "oauth_access_token",
  oauthRefresh: "oauth_refresh_token",
  cartToken: "commerce_cart_token",
  oauthToken: "oauth_token",
};

// In-memory cache (synchronous reads)
const cache = {};

/** Load all tokens from AsyncStorage into memory. Call once at app start. */
export async function hydrateTokens() {
  const pairs = await AsyncStorage.multiGet(Object.values(KEYS));
  for (const [key, value] of pairs) {
    if (value !== null) cache[key] = value;
  }
}

/** Get a token synchronously from the in-memory cache. */
export function getToken(key) {
  return cache[key] || null;
}

/** Set a token (updates cache immediately, persists async). */
export function setToken(key, value) {
  cache[key] = value;
  AsyncStorage.setItem(key, value).catch(() => {});
}

/** Remove a token. */
export function removeToken(key) {
  delete cache[key];
  AsyncStorage.removeItem(key).catch(() => {});
}

export { KEYS };
