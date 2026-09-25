import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Clean up old caches and activate immediately
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// 2. Precache all build assets (JS, CSS, HTML)
precacheAndRoute(self.__WB_MANIFEST);

// 3. SPA navigation — serve cached index.html on every route so the
//    app keeps working offline and deep links load instantly
registerRoute(
    new NavigationRoute(
        new NetworkFirst({
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
            plugins: [
                new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 }),
            ],
        })
    )
);

// 4. Images — cache-first so feed photos load instantly offline
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 14 * 24 * 60 * 60 }),
        ],
    })
);

// 5. Google Fonts stylesheets — stale-while-revalidate
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

// 6. Google Fonts files — cache-first (fonts rarely change)
registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts-files',
        plugins: [
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
    })
);

// 7. Handle Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'UniLink Notification';
    const options = {
        body: data.body || 'You have a new update.',
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/app' },
        tag: data.tag || 'general-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 8. Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// 9. Handle SKIP_WAITING message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 10. Re-subscribe when push subscription expires (e.g. after 60 days on some browsers)
self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil(
        self.registration.pushManager.subscribe(event.oldSubscription.options)
            .then((newSub) => {
                // Notify all open clients so they can save the new endpoint to Supabase
                return self.clients.matchAll({ type: 'window' }).then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({ type: 'PUSH_SUBSCRIPTION_RENEWED', subscription: newSub.toJSON() });
                    });
                });
            })
            .catch((err) => console.error('[SW] pushsubscriptionchange failed:', err))
    );
});
