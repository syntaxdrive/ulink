import type { CapacitorConfig } from '@capacitor/cli';

// Set CAP_DEV=true when running live-reload dev mode so LiveUpdate doesn't
// override the local dev server connection.
const isDevMode = process.env.CAP_DEV === 'true';

const config: CapacitorConfig = {
  appId: 'com.syntaxdrive.ulink',
  appName: 'UniLink',
  webDir: 'dist',
  server: {
    // The APK will behave essentially as a secure, full-screen browser 
    // pointing directly to your live production website.
    // Any push to Cloudflare will INSTANTLY update inside the APK upon reload.
    url: 'https://unilink.ng',
    cleartext: true,
    // CRITICAL: This allows Capacitor Native Plugins (like Camera, Share) to still work 
    // even though the web view is pointing to your remote domain instead of localhost.
    allowNavigation: ['unilink.ng', '*.unilink.ng'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
