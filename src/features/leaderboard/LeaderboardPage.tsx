import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award, TrendingUp, BadgeCheck, Loader2 } from 'lucide-react';

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
    { points: 10, title: 'Create a Post', description: 'Share your thoughts' },
    { points: 2, title: 'Receive a Like', description: 'On your posts' },
    { points: 5, title: 'Comment', description: 'Engage in discussions' },
    { points: 15, title: 'Make a Connection', description: 'Both users earn points' },
    { points: 110, title: 'Complete Your Profile', description: 'One-time bonus for adding avatar, headline, about, skills, and experience', span: true }
];

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<UserRank | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            // Fetch leaderboard using the SQL function
            const { data: leaderboardData, error: leaderboardError } = await supabase
                .rpc('get_leaderboard', { p_limit: 100, p_offset: 0 });

            if (leaderboardError) throw leaderboardError;
            setLeaderboard(leaderboardData || []);

            // Fetch current user's rank if logged in
            if (user?.id) {
                const { data: rankData, error: rankError } = await supabase
                    .rpc('get_user_rank', { p_user_id: user.id });

                if (!rankError && rankData && rankData.length > 0) {
                    setUserRank(rankData[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-lg font-bold text-stone-500 dark:text-zinc-500">#{rank}</span>;
    };

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
        if (rank <= 10) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
        return 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950">
            {/* Header */}
            <div className="relative overflow-hidden bg-white/50 dark:bg-zinc-950 border-b border-stone-200/50 dark:border-zinc-800/50 py-16 px-6">
                {/* Background Glass Orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-600/20">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight">Leaderboard</h1>
                            <p className="text-stone-500 dark:text-zinc-400 text-lg font-medium mt-1">
                                Top 100 most active students on UniLink
                            </p>
                        </div>
                    </div>

                    {/* User's Rank Card */}
                    {userRank && (
                        <div className="mt-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white dark:border-zinc-800 shadow-xl shadow-stone-200/20 dark:shadow-black/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <p className="text-stone-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Your Rank</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-extrabold text-stone-900 dark:text-zinc-100 italic tracking-tighter">#{userRank.rank}</span>
                                            <span className="text-stone-400 dark:text-zinc-600 text-sm font-medium">/ {userRank.total_users.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-stone-200 dark:border-zinc-800" />
                                    <div className="flex flex-col">
                                        <p className="text-stone-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Points</p>
                                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-500">{userRank.points.toLocaleString()} <span className="text-xs font-bold font-sans">PTS</span></p>
                                    </div>
                                </div>
                                <div className="hidden sm:block p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl">
                                    <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
                    {leaderboard.map((entry, index) => (
                        <Link
                            key={entry.user_id}
                            to={`/app/profile/${entry.username || entry.user_id}`}
                            className={`flex items-center gap-4 p-5 transition-all hover:bg-stone-50 dark:hover:bg-zinc-800 ${index !== leaderboard.length - 1 ? 'border-b border-stone-200 dark:border-zinc-800' : ''
                                } ${entry.user_id === currentUserId ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}
                        >
                            {/* Rank Badge */}
                            <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${getRankBadgeColor(entry.rank)}`}>
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-700 flex-shrink-0">
                                <img
                                    src={entry.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=random`}
                                    alt={entry.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-stone-900 dark:text-zinc-100 truncate">
                                        {entry.name}
                                    </h3>
                                    {entry.gold_verified && (
                                        <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 flex-shrink-0" />
                                    )}
                                    {entry.is_verified && !entry.gold_verified && (
                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 dark:fill-blue-950 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm text-stone-600 dark:text-zinc-400 truncate">
                                    {entry.headline || entry.university || 'Student'}
                                </p>
                            </div>

                            {/* Points */}
                            <div className="text-right flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                                        {entry.points.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">points</p>
                            </div>
                        </Link>
                    ))}

                    {leaderboard.length === 0 && (
                        <div className="text-center py-12">
                            <Trophy className="w-16 h-16 text-stone-300 dark:text-zinc-700 mx-auto mb-4" />
                            <p className="text-stone-500 dark:text-zinc-500">No leaderboard data available yet</p>
                        </div>
                    )}
                </div>

                {/* Points Info */}
                <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 p-6">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-emerald-600" />
                        How to Earn Points
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {POINT_ACTIVITIES.map((activity, index) => (
                            <div key={index} className={`flex items-start gap-3 ${activity.span ? 'md:col-span-2' : ''}`}>
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">+{activity.points}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-stone-900 dark:text-zinc-100">{activity.title}</p>
                                    <p className="text-sm text-stone-600 dark:text-zinc-400">{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
