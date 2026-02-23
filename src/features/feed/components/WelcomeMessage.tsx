import { useEffect, useState } from 'react';
import { Flame, Zap, TrendingUp, X } from 'lucide-react';

interface WelcomeMessageProps {
    userName: string;
}

const MESSAGES_BY_HOUR: Record<string, { emoji: string; msg: string }> = {
    morning: { emoji: '☀️', msg: 'Start your day strong — see what\'s happening on campus!' },
    afternoon: { emoji: '🚀', msg: 'Midday check-in! Catch up on what you\'ve missed.' },
    evening: { emoji: '🌆', msg: 'Wind down, connect, and share your day.' },
    night: { emoji: '🌙', msg: 'Night owl mode. The campus never sleeps!' },
};

function getTimeKey() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 21) return 'evening';
    return 'night';
}

function getStreak(): number {
    const data = localStorage.getItem('ulink_streak');
    if (!data) return 1;
    const { streak, lastDate } = JSON.parse(data);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today) return streak;
    if (lastDate === yesterday) return streak + 1;
    return 1;
}

function saveStreak(streak: number) {
    localStorage.setItem('ulink_streak', JSON.stringify({ streak, lastDate: new Date().toDateString() }));
}

export default function WelcomeMessage({ userName }: WelcomeMessageProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [streak, setStreak] = useState(1);
    const [likeAnim, setLikeAnim] = useState(false);

    useEffect(() => {
        const lastDismissed = localStorage.getItem('welcomeMessageDismissed2');
        const today = new Date().toDateString();
        const s = getStreak();
        setStreak(s);
        saveStreak(s);

        if (lastDismissed !== today) {
            setTimeout(() => {
                setIsVisible(true);
                setTimeout(() => setLikeAnim(true), 700);
            }, 400);
        } else {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            localStorage.setItem('welcomeMessageDismissed2', new Date().toDateString());
        }, 300);
    };

    if (isDismissed) return null;

    const timeKey = getTimeKey();
    const { emoji, msg } = MESSAGES_BY_HOUR[timeKey];
    const xpProgress = Math.min(100, (streak % 7) * 14 + 14);
    const nextMilestone = 7 - (streak % 7);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
                } bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 border-emerald-500/30 shadow-lg shadow-emerald-500/10`}
        >
            {/* Background glow orbs */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest mb-1">
                            {emoji} {timeKey.charAt(0).toUpperCase() + timeKey.slice(1)}
                        </p>
                        <h2 className="text-white text-lg font-bold leading-tight">
                            Hey, {userName}! 👋
                        </h2>
                        <p className="text-emerald-100/80 text-sm mt-0.5 leading-relaxed">
                            {msg}
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4 text-emerald-200/60" />
                    </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3">
                    {/* Streak */}
                    <div className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 transition-all duration-500 ${likeAnim ? 'scale-100' : 'scale-90 opacity-0'}`}>
                        <Flame className={`w-4 h-4 text-orange-400 ${streak >= 3 ? 'animate-pulse' : ''}`} />
                        <span className="text-white font-bold text-sm">{streak}</span>
                        <span className="text-emerald-200/70 text-xs">day streak</span>
                    </div>

                    {/* XP bar */}
                    <div className={`flex-1 transition-all duration-700 ${likeAnim ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-emerald-200/80 text-xs font-medium">Weekly XP</span>
                            </div>
                            <span className="text-white text-xs font-bold">{nextMilestone}d to milestone</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: likeAnim ? `${xpProgress}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* Trending icon */}
                    <div className={`flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-2 border border-white/10 transition-all duration-500 delay-200 ${likeAnim ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        <span className="text-white text-xs font-semibold">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
