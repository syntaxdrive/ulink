
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Handles systemic deep links (https://unilink.ng/...) and redirects
 * the internal React Router to the correct page.
 */
export default function DeepLinkHelper() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Listener for deep links
        const setupListener = async () => {
            const listener = await App.addListener('appUrlOpen', (data: any) => {
                try {
                    console.log('Deep link received:', data.url);
                    const url = new URL(data.url);

                    // We only care about paths like /app/post/uuid or /app/profile/username
                    // and similar unilink.ng routes.
                    const productionDomain = 'unilink.ng';
                    const isInternalHost = url.hostname === productionDomain ||
                        url.hostname === `www.${productionDomain}` ||
                        url.protocol === 'com.syntaxdrive.ulink:';

                    if (isInternalHost || data.url.includes('tokens')) {
                        // Extract path and query
                        const path = url.pathname;
                        const search = url.search;
                        const hash = url.hash;

                        // Navigate internally if it's an app route
                        if (path.startsWith('/app') || path.startsWith('/onboarding')) {
                            navigate(path + search + hash);
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse deep link URL:', e);
                }
            });

            return () => {
                listener.remove();
            };
        };

        setupListener();
    }, [navigate]);

    return null; // This component doesn't render anything
}
