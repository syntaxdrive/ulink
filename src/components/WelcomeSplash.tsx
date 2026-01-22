import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/useUIStore';

export default function WelcomeSplash() {
    const { showSplash, setShowSplash } = useUIStore();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (showSplash) {
            // Start fade out after 2 seconds
            const fadeTimer = setTimeout(() => {
                setFadeOut(true);
            }, 2000);

            // Hide splash completely after fade animation
            const hideTimer = setTimeout(() => {
                setShowSplash(false);
            }, 2800);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [showSplash, setShowSplash]);

    if (!showSplash) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Animated background patterns */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-300"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8">
                {/* Logo */}
                <div className="mb-8 animate-bounce-slow">
                    <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                        <img
                            src="/icon-512.png"
                            alt="UniLink"
                            className="w-28 h-28 rounded-2xl"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white drop-shadow-lg animate-fade-in">
                        UniLink
                    </h1>
                    <p className="text-xl md:text-2xl text-emerald-50 font-medium animate-fade-in-delay">
                        Connect. Network. Grow.
                    </p>

                    {/* Loading indicator */}
                    <div className="flex justify-center gap-2 mt-8 animate-fade-in-delay-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .animate-fade-in-delay {
                    opacity: 0;
                    animation: fade-in 0.8s ease-out 0.3s forwards;
                }

                .animate-fade-in-delay-2 {
                    opacity: 0;
                    animation: fade-in 0.8s ease-out 0.6s forwards;
                }
            `}</style>
        </div>
    );
}
