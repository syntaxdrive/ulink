import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award, TrendingUp, BadgeCheck, Loader2 } from 'lucide-react';
import { useLeaderboardStore } from '../../stores/useLeaderboardStore';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    headline: string | null;
    points: number;
    is_verified: boolean;
    gold_verified: boolean;
}

interface UserRank {
    rank: number;
    total_users: number;
    points: number;
}

const POINT_ACTIVITIES = [
    { points: 10, title: 'Create a Post', description: 'Share your thoughts and updates with campus' },
    { points: 2, title: 'Receive a Like', description: 'Earn points when peers like your content' },
    { points: 5, title: 'Comment', description: 'Engage in active campus discussions' },
    { points: 15, title: 'Make a Connection', description: 'Both users earn points upon connecting' },
    { points: 110, title: 'Complete Your Profile', description: 'One-time bonus for adding avatar, headline, bio, skills, and experience', span: true }
];

export default function LeaderboardPage() {
    const store = useLeaderboardStore();

    // Hydrate from store immediately for instant render on revisit
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(store.leaderboard);
    const [userRank, setUserRank] = useState<UserRank | null>(store.userRank);
    const [loading, setLoading] = useState(store.leaderboard.length === 0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(store.currentUserId);

    useEffect(() => {
        // Skip fetch if cache is still fresh
        if (!store.needsRefresh() && store.leaderboard.length > 0) {
            setLoading(false);
            return;
        }
        fetchLeaderboard();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchLeaderboard = async () => {
        try {
            if (leaderboard.length === 0) {
                setLoading(true);
            }

            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            const uid = user?.id || null;
            setCurrentUserId(uid);

            const { data: leaderboardData, error: leaderboardError } = await supabase
                .rpc('get_leaderboard', { p_limit: 100, p_offset: 0 });

            if (leaderboardError) throw leaderboardError;
            const lb = leaderboardData || [];
            setLeaderboard(lb);

            let rank: UserRank | null = null;
            if (uid) {
                const { data: rankData, error: rankError } = await supabase
                    .rpc('get_user_rank', { p_user_id: uid });
                if (!rankError && rankData && rankData.length > 0) {
                    rank = rankData[0];
                    setUserRank(rank);
                }
            }

            // Persist to store for instant render on next visit
            store.setLeaderboardData({ leaderboard: lb, userRank: rank, currentUserId: uid });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-base font-bold text-slate-500 dark:text-zinc-500">#{rank}</span>;
    };

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
        if (rank === 2) return 'bg-slate-500/10 border border-slate-500/30 text-slate-600 dark:text-slate-300';
        if (rank === 3) return 'bg-amber-600/10 border border-amber-600/30 text-amber-700 dark:text-amber-400';
        if (rank <= 10) return 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400';
        return 'bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-10 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg text-white shrink-0">
                            <Trophy className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                                Student Leaderboard
                            </h1>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-0.5">
                                Top 100 most active students on UniLink Nigeria
                            </p>
                        </div>
                    </div>

                    {/* User's Rank Card */}
                    {userRank && (
                        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700/60 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div>
                                        <p className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Your Rank</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">#{userRank.rank}</span>
                                            <span className="text-slate-400 dark:text-zinc-500 text-xs">/ {userRank.total_users.toLocaleString()} students</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200 dark:bg-zinc-700" />
                                    <div>
                                        <p className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Points</p>
                                        <p className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">{userRank.points.toLocaleString()} <span className="text-xs font-sans text-slate-500 dark:text-zinc-400">PTS</span></p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Active Campus Rank</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Leaderboard List - Full Width 7XL Layout */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-12 py-8 space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {leaderboard.map((entry, index) => (
                        <Link
                            key={entry.user_id}
                            to={`/app/profile/${entry.username || entry.user_id}`}
                            className={`flex items-center gap-4 p-4 md:p-5 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/60 ${index !== leaderboard.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800/80' : ''
                                } ${entry.user_id === currentUserId ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : ''}`}
                        >
                            {/* Rank Badge */}
                            <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl shrink-0 ${getRankBadgeColor(entry.rank)}`}>
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-700">
                                <img
                                    src={entry.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=random`}
                                    alt={entry.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate">
                                        {entry.name}
                                    </h3>
                                    {entry.gold_verified && (
                                        <BadgeCheck className="w-4 h-4 text-yellow-500 shrink-0" />
                                    )}
                                    {entry.is_verified && !entry.gold_verified && (
                                        <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                                    )}
                                    {entry.username && (
                                        <span className="text-xs text-slate-400 dark:text-zinc-500 truncate hidden sm:inline">@{entry.username}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                    {entry.headline || entry.university || 'UniLink Student'}
                                </p>
                            </div>

                            {/* Points */}
                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1.5 justify-end">
                                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {entry.points.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">points</p>
                            </div>
                        </Link>
                    ))}

                    {leaderboard.length === 0 && (
                        <div className="text-center py-16">
                            <Trophy className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-zinc-500 text-sm">No leaderboard rankings available yet.</p>
                        </div>
                    )}
                </div>

                {/* Points Info Rules */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        How Points Are Earned
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {POINT_ACTIVITIES.map((activity, index) => (
                            <div key={index} className={`flex items-start gap-3.5 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 ${activity.span ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">+{activity.points}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-white">{activity.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
