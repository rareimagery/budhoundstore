# BudHound → Android: Best Approach

Given you already have a working React app, **Capacitor** is the clear winner here. It wraps your existing React app into a native Android shell with minimal code changes while giving you full access to native APIs you'll need — camera (ID scanning), GPS (delivery tracking), background location (driver app), and push notifications.

Here's the full picture of your options before committing:

---

## Option Comparison

| Approach | Effort | Native APIs | Performance | Best For |
|---|---|---|---|---|
| **Capacitor** | Low | ✅ Full access | Near-native | Wrapping existing React app |
| **React Native** | High (rewrite) | ✅ Full access | Native | Greenfield mobile-first build |
| **PWA** | Minimal | ⚠️ Limited | Web | Quick win, no Play Store |
| **WebView wrapper** | Minimal | ❌ Very limited | Poor | Not recommended |

---

## Recommended Architecture: Capacitor + Drupal JSON:API

```
┌─────────────────────────────────────────────┐
│           Android App (Capacitor)            │
│  ┌───────────────────────────────────────┐  │
│  │         React App (your existing)     │  │
│  │  - Marketplace UI                     │  │
│  │  - Store apps                         │  │
│  │  - Driver app                         │  │
│  │  - POS interface                      │  │
│  └───────────────┬───────────────────────┘  │
│                  │                           │
│  ┌───────────────▼───────────────────────┐  │
│  │        Capacitor Native Layer         │  │
│  │  @capacitor/camera  → ID scanning     │  │
│  │  @capacitor/geolocation → GPS         │  │
│  │  @capacitor/push-notifications        │  │
│  │  @capacitor/background-runner         │  │
│  │  @capacitor/secure-storage            │  │
│  └───────────────────────────────────────┘  │
└─────────────────────┬───────────────────────┘
                      │ JSON:API / WebSocket
┌─────────────────────▼───────────────────────┐
│              Drupal Commerce Backend         │
│  - Products, Orders, Users                  │
│  - Cannabis compliance modules              │
│  - ID verification                          │
│  - Multi-store isolation                    │
│                                             │
│              Node.js / Socket.io            │
│  - Real-time delivery tracking              │
│  - Driver location broadcast                │
└─────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1 — Capacitor Setup (1-2 days)

```bash
# In your React app root
npm install @capacitor/core @capacitor/cli
npx cap init BudHound com.budhound.app --web-dir=build

npm install @capacitor/android
npx cap add android

# Build React, then sync to Android
npm run build
npx cap sync android
```

### Phase 2 — Native Plugin Integration

Install the plugins you'll specifically need for BudHound:

```bash
# ID verification (camera access)
npm install @capacitor/camera

# Delivery tracking
npm install @capacitor/geolocation
npm install @capacitor-community/background-geolocation  # for driver app

# Compliance & auth
npm install @capacitor/secure-storage  # store tokens securely
npm install @capacitor/push-notifications

# App-to-app deep links (for dispensary white-label apps)
npm install @capacitor/app
```

### Phase 3 — Adapt Your React Code

The key change is switching from browser APIs to Capacitor plugins where needed:

```javascript
// BEFORE (browser)
navigator.geolocation.getCurrentPosition(...)

// AFTER (Capacitor - works on both web and Android)
import { Geolocation } from '@capacitor/geolocation';

const position = await Geolocation.getCurrentPosition();
```

```javascript
// ID scanning with camera
import { Camera, CameraResultType } from '@capacitor/camera';

const captureID = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    resultType: CameraResultType.Base64,
    // Send to your Drupal ID verification endpoint
  });
  
  await fetch('/api/v1/verify-id', {
    method: 'POST',
    body: JSON.stringify({ image: image.base64String })
  });
};
```

### Phase 4 — Multiple App Builds

Since BudHound has multiple app personas (marketplace, white-label store, driver, POS), use environment variables + Capacitor config to produce separate APKs from the same codebase:

```javascript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: process.env.APP_ID || 'com.budhound.marketplace',
  appName: process.env.APP_NAME || 'BudHound',
  webDir: 'build',
  plugins: {
    BackgroundGeolocation: {
      // Only needed for driver app
      enabled: process.env.APP_TYPE === 'driver'
    }
  }
};
```

---

## BudHound-Specific Considerations

**Age Verification Gate** — On Android, you can use Capacitor's `@capacitor/camera` to capture ID images and send to your Drupal verification module. The native camera gives much better image quality than web camera APIs.

**Background Location (Driver App)** — This is the critical one. Use `@capacitor-community/background-geolocation` which keeps GPS running when the app is backgrounded. This feeds your Socket.io delivery tracking.

**Secure Token Storage** — Don't use localStorage for auth tokens in the Android app. Use `@capacitor/preferences` or a secure keychain plugin instead — this matters for cannabis compliance audits.

**Deep Linking** — Configure Android App Links so dispensary-specific URLs (`lompoc-collective.budhound.app`) open the correct white-label app.

**Play Store** — Cannabis delivery apps can be published to the Google Play Store as long as you implement age gating before any content is shown and comply with their Restricted Content policy. Frame it as a "delivery platform" not a cannabis store.

---

## Quick Start Command Sequence

```bash
cd /path/to/budhound-react-app
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npm run build
npx cap add android
npx cap open android  # Opens Android Studio
```

From Android Studio you can run on an emulator or connected device immediately. The whole initial setup should take under an hour given your existing React app.
