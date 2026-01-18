import { useState, useEffect } from 'react';

// Global event listener to capture the install prompt
// This needs to be at the module level to survive HMR
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        console.log('✅ PWA Install Prompt Captured (Global)');
    });
}

interface UsePWAInstallOptions {
    onInstallAvailable?: () => void;
}

export function usePWAInstall(options?: UsePWAInstallOptions) {
    const [isIOs, setIsIOs] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [canPrompt, setCanPrompt] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);

    useEffect(() => {
        // Detect iOS devices
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOs(isIosDevice);

        // Check if app is already installed (running in standalone mode)
        const checkStandalone = () => {
            return window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;
        };
        setIsStandalone(checkStandalone());

        // Check if we already have a deferred prompt
        if ((window as any).deferredPrompt) {
            setCanPrompt(true);
            console.log('✅ Deferred prompt already available');
        }

        // Listen for the beforeinstallprompt event
        const handler = (e: Event) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
            setCanPrompt(true);
            console.log('✅ PWA Install Prompt Captured (Hook)');

            // Notify that install is now available
            if (options?.onInstallAvailable) {
                options.onInstallAvailable();
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful installation
        const installedHandler = () => {
            console.log('✅ PWA Installed Successfully');
            setCanPrompt(false);
            setIsStandalone(true);
            (window as any).deferredPrompt = null;
        };

        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, [options]);

    const install = async () => {
        const promptEvent = (window as any).deferredPrompt;

        if (!promptEvent) {
            console.warn('⚠️ Install prompt not available - button should not be visible');
            return;
        }

        try {
            // Show the native install prompt
            promptEvent.prompt();

            // Wait for the user's response
            const { outcome } = await promptEvent.userChoice;
            console.log(`User response to install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }

            // Clear the deferred prompt
            (window as any).deferredPrompt = null;
            setCanPrompt(false);
        } catch (error) {
            console.error('Error showing install prompt:', error);
        }
    };

    // DIRECT INSTALL ONLY MODE:
    // Only show install button when the native browser prompt is available
    // This means:
    // - Chrome/Edge/Android: Shows when beforeinstallprompt fires
    // - iOS/Safari: Never shows (no native support)
    // - Already installed: Never shows
    const isInstallable = !isStandalone && canPrompt;

    return {
        isInstallable,
        install,
        showInstallModal,
        setShowInstallModal,
        isIOs,
        canPrompt, // Export this so components can check if native prompt is available
    };
}
