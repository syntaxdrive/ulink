import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.syntaxdrive.ulink',
  appName: 'UniLink Nigeria',
  webDir: 'dist',
  plugins: {
    LiveUpdate: {
      enabled: true,
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
