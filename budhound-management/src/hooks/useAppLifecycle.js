import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { isNative } from '../utils/platform';

/**
 * Handles native app lifecycle events (background/foreground transitions).
 *
 * - Calls `onResume` when the app returns to the foreground.
 * - Calls `onPause` when the app goes to the background.
 * - No-ops on web (browser handles visibility natively via refetchOnWindowFocus).
 */
export function useAppLifecycle({ onResume, onPause } = {}) {
  const onResumeRef = useRef(onResume);
  const onPauseRef = useRef(onPause);
  onResumeRef.current = onResume;
  onPauseRef.current = onPause;

  useEffect(() => {
    if (!isNative) return;

    const listener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        onResumeRef.current?.();
      } else {
        onPauseRef.current?.();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);
}
