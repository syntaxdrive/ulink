/**
 * Central utility to resolve notification URLs into a React Router-compatible path 
 * or an absolute URL for external links.
 * 
 * It ensures the /app prefix is present and singular/plural routes are mapped correctly.
 */
export function resolveNotificationUrl(rawUrl: string | undefined): { to: string; isExternal: boolean } {
    if (!rawUrl || rawUrl === '#') return { to: '/app/notifications', isExternal: false };

    let to = rawUrl;
    let isExternal = false;

    try {
        const parsed = new URL(rawUrl);
        const productionDomain = 'unilink.ng';
        const isInternal = parsed.origin === window.location.origin ||
            parsed.hostname === productionDomain ||
            parsed.hostname === `www.${productionDomain}`;

        if (isInternal) {
            to = parsed.pathname + parsed.search + parsed.hash;
        } else {
            isExternal = true;
        }
    } catch {
        // Relative path
    }

    if (!isExternal) {
        // Ensure leading slash
        if (!to.startsWith('/')) to = '/' + to;

        // Map plural to singular if needed
        to = to.replace(/^\/posts\//, '/post/');

        // If it starts with a key path but lacks /app prefix, add it
        const routesToPrefix = [
            '/post/',
            '/profile/',
            '/communities/',
            '/network',
            '/messages',
            '/jobs',
            '/talent',
            '/learn',
            '/study',
            '/leaderboard',
            '/challenge',
            '/settings',
            '/admin',
            '/news'
        ];

        if (!to.startsWith('/app/')) {
            if (routesToPrefix.some(r => to.startsWith(r))) {
                to = '/app' + to;
            }
        }
    }

    return { to, isExternal };
}
