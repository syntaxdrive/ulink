import { useEffect, useState } from 'react';

export function useAppUpdate() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Get the service worker registration
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);

                // Check for updates every 60 seconds
                setInterval(() => {
                    reg.update();
                }, 60000);

                // Listen for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
            });

            // Listen for controller change (when new SW takes over)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }, []);

    const applyUpdate = async () => {
        if (!registration || !registration.waiting) return;

        setIsUpdating(true);
        try {
            // Tell the waiting service worker to take over
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } catch (error) {
            console.error('Error updating app:', error);
            setIsUpdating(false);
        }
    };

    const dismissUpdate = () => {
        setUpdateAvailable(false);
    };

    return {
        updateAvailable,
        isUpdating,
        applyUpdate,
        dismissUpdate,
    };
}
