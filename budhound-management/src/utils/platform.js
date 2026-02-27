import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities for Capacitor/web dual-target builds.
 */

/** True when running inside a native Capacitor shell (Android/iOS). */
export const isNative = Capacitor.isNativePlatform();

/** Current platform: 'android' | 'ios' | 'web' */
export const platform = Capacitor.getPlatform();

/** True on Android specifically. */
export const isAndroid = platform === 'android';

/** True when running in a regular browser (no Capacitor shell). */
export const isWeb = platform === 'web';
