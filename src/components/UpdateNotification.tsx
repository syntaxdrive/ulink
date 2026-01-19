import { RefreshCw, X } from 'lucide-react';
import { useAppUpdate } from '../hooks/useAppUpdate';

export default function UpdateNotification() {
    const { updateAvailable, isUpdating, applyUpdate, dismissUpdate } = useAppUpdate();

    if (!updateAvailable) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl p-4 text-white">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">Update Available!</h3>
                        <p className="text-xs text-white/90 mb-3">
                            A new version of UniLink is ready. Refresh to get the latest features and fixes.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={applyUpdate}
                                disabled={isUpdating}
                                className="flex-1 bg-white text-emerald-600 font-semibold text-sm py-2 px-4 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? 'Updating...' : 'Update Now'}
                            </button>
                            <button
                                onClick={dismissUpdate}
                                disabled={isUpdating}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
