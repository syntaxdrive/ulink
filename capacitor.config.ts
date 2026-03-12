import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_DEV=true when running live-reload dev mode so LiveUpdate doesn't
// override the local dev server connection.
const isDevMode = process.env.CAP_DEV === 'true';

const config: CapacitorConfig = {
  appId: 'com.syntaxdrive.ulink',
  appName: 'UniLink Nigeria',
  webDir: 'dist',
  plugins: {
    LiveUpdate: {
      // Disable OTA check in dev mode — the Vite dev server takes priority
      enabled: !isDevMode,
      autoUpdateMethod: 'on-app-start',
      resetOnUpdate: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
