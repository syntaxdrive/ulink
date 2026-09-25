import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const DISMISSED_KEY = 'pwa-install-dismissed';

export default function PWAInstallBanner() {
    const { isInstallable, install, isIOs } = usePWAInstall();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Don't show if already dismissed this session or permanently
        if (localStorage.getItem(DISMISSED_KEY)) return;

        // Don't show if already running as installed PWA
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        if (isStandalone) return;

        // Show after a short delay so it doesn't interrupt page load
        const timer = setTimeout(() => {
            if (isInstallable || isIOs) setVisible(true);
        }, 3500);

        return () => clearTimeout(timer);
    }, [isInstallable, isIOs]);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem(DISMISSED_KEY, '1');
    };

    const handleInstall = async () => {
        await install();
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9998] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 text-white border border-white/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl flex-shrink-0">
                        {isIOs ? (
                            <Share className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <Download className="w-5 h-5 text-emerald-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm mb-1">Install UniLink</h3>
                        {isIOs ? (
                            <p className="text-xs text-white/80 mb-3">
                                Tap <strong>Share</strong> <span className="inline-block align-middle">⬆</span> then{' '}
                                <strong>"Add to Home Screen"</strong> to install the app.
                            </p>
                        ) : (
                            <>
                                <p className="text-xs text-white/80 mb-3">
                                    Install UniLink on your device for instant access — works offline too.
                                </p>
                                <button
                                    onClick={handleInstall}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-colors"
                                >
                                    Install App
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={dismiss}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>
            </div>
        </div>
    );
}
