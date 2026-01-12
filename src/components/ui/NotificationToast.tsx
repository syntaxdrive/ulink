import { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationToastProps {
    title: string;
    message: string;
    isVisible: boolean;
    onClose: () => void;
    onClick?: () => void;
}

export default function NotificationToast({ title, message, isVisible, onClose, onClick }: NotificationToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none md:justify-end md:left-auto md:right-4 md:translate-x-0">
            <div
                onClick={() => {
                    if (onClick) {
                        onClick();
                        onClose();
                    }
                }}
                className={`bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 ring-1 ring-black/5 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:bg-white transition-colors' : ''}`}
            >
                <div className="p-2 bg-indigo-500/10 rounded-full shrink-0">
                    <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 max-h-10 overflow-hidden text-ellipsis">{message}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
