import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode; // Optional sticky footer
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    hideHeader?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', hideHeader = false }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`
                    relative w-full ${sizeClasses[size]} 
                    bg-white dark:bg-zinc-900 
                    rounded-t-3xl sm:rounded-3xl 
                    shadow-2xl 
                    max-h-[95vh] sm:max-h-[90vh]
                    flex flex-col
                    animate-in 
                    slide-in-from-bottom sm:fade-in sm:zoom-in-95 
                    duration-200
                `}
            >
                {/* Header */}
                {!hideHeader && (
                    <div className="flex-shrink-0 px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex justify-between items-center bg-stone-50 dark:bg-zinc-900/50 rounded-t-3xl">
                        <h2 className="font-bold text-lg text-stone-900 dark:text-zinc-100">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-stone-500 dark:text-zinc-400" />
                        </button>
                    </div>
                )}

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer - Sticky at bottom */}
                {footer && (
                    <div className="flex-shrink-0 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
}
