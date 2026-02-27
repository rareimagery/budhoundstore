import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';

/**
 * Platform-aware secure token storage.
 *
 * On native (Android/iOS): Uses Capacitor Preferences (backed by SharedPreferences
 * on Android, UserDefaults on iOS — encrypted at rest by the OS).
 *
 * On web: Falls back to in-memory storage only (no localStorage, matching the
 * existing security model where httpOnly cookies handle persistence).
 */

// In-memory fallback for web
const memoryStore = {};

export async function setItem(key, value) {
  if (isNative) {
    await Preferences.set({ key, value });
  } else {
    memoryStore[key] = value;
  }
}

export async function getItem(key) {
  if (isNative) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  return memoryStore[key] ?? null;
}

export async function removeItem(key) {
  if (isNative) {
    await Preferences.remove({ key });
  } else {
    delete memoryStore[key];
  }
}

// Storage keys
export const KEYS = {
  ACCESS_TOKEN: 'budhound_access_token',
  REFRESH_TOKEN: 'budhound_refresh_token',
  USER_DATA: 'budhound_user_data',
};
