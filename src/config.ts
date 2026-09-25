import { Capacitor } from '@capacitor/core';

export const APP_CONFIG = {
    NAME: 'UniLink Nigeria',
    VERSION: '1.0.0',
    DOMAIN: 'unilink.ng',
    getBaseUrl: () => {
        if (Capacitor.isNativePlatform()) {
            return 'https://unilink.ng';
        }
        return window.location.origin;
    }
};

export const getBaseUrl = APP_CONFIG.getBaseUrl;
