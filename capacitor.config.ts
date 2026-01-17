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
  },
};

export default config;
