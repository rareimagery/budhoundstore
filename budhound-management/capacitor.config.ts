import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budhound.management',
  appName: 'BudHound',
  webDir: 'dist',
  server: {
    // In production, the app loads from bundled assets.
    // For dev, uncomment the url below to live-reload from your machine:
    // url: 'http://10.0.2.2:3002',  // Android emulator → host machine
    // Use 'http' for local dev to avoid mixed-content blocking against http://10.0.2.2.
    // Switch back to 'https' for production builds.
    androidScheme: 'http',
    allowNavigation: ['10.0.2.2', 'localhost'],
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#111827', // gray-900
      showSpinner: true,
      spinnerColor: '#10b981',    // emerald-500 (brand green)
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111827',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
