import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface WelcomeMessageProps {
    userName: string;
}

export default function WelcomeMessage({ userName }: WelcomeMessageProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user has dismissed the welcome message today
        const lastDismissed = localStorage.getItem('welcomeMessageDismissed');
        const today = new Date().toDateString();

        if (lastDismissed !== today) {
            // Show message after a short delay
            setTimeout(() => setIsVisible(true), 500);
        } else {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            localStorage.setItem('welcomeMessageDismissed', new Date().toDateString());
        }, 300);
    };

    if (isDismissed) return null;

    const getGreeting = () => {
        const hour = new Date().getHours();

        // 5am - 11:59am = Morning
        if (hour >= 5 && hour < 12) return 'Morning';

        // 12pm - 4:59pm = Afternoon  
        if (hour >= 12 && hour < 17) return 'Afternoon';

        // 5pm - 8:59pm = Evening
        if (hour >= 17 && hour < 21) return 'Evening';

        // 9pm - 4:59am = Night (or just "Hey" for late night)
        return 'Night';
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 p-6 shadow-sm transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
        >
            {/* Content */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-1">
                        {getGreeting()}, {userName}
                    </h2>
                    <p className="text-stone-600 dark:text-zinc-400 text-sm">
                        What's happening on campus today?
                    </p>
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4 text-stone-400 dark:text-zinc-500" />
                </button>
            </div>
        </div>
    );
}
