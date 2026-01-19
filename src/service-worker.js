import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// 1. Clean up old caches and activate immediately
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

// 2. Precache all build assets (JS, CSS, HTML) automatically
// This is the magic part that makes the app load instantly
precacheAndRoute(self.__WB_MANIFEST);

// 3. Handle Push Notifications (Preserved from your old file)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'UniLink Notification';
    const options = {
        body: data.body || 'You have a new update.',
        icon: '/icon-512.png',
        badge: '/icon-512.png', // Small monochrome icon for Android
        vibrate: [200, 100, 200],
        data: { url: data.url || '/app' },
        tag: data.tag || 'general-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 4. Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If the app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});

// 5. Handle SKIP_WAITING message for immediate updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
