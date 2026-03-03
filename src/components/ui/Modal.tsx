import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const sizeClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center">
            {/* Backdrop - only on desktop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm hidden sm:block"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`
                    relative w-full ${sizeClasses[size]} 
                    bg-white dark:bg-zinc-900 
                    h-full sm:h-auto
                    sm:max-h-[85vh]
                    flex flex-col 
                    sm:rounded-3xl
                    shadow-2xl 
                    animate-in 
                    slide-in-from-bottom sm:fade-in sm:zoom-in-95 
                    duration-200
                `}
            >
                {/* Header */}
                {!hideHeader && (
                    <div className="flex-shrink-0 px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex justify-between items-center bg-stone-50/50 dark:bg-zinc-900/50 rounded-t-none sm:rounded-t-3xl safe-top">
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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {children}
                </div>

                {/* Footer - Sticky at bottom */}
                {footer && (
                    <div className="flex-shrink-0 border-t border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm px-4 sm:px-6 py-4 safe-bottom sm:rounded-b-3xl">
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
                .safe-top {
                    padding-top: max(1rem, env(safe-area-inset-top));
                }
                .safe-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
            `}</style>
        </div>,
        modalRoot
    );
}
