import { useMemo } from 'react';
import { TrendingUp, Activity, Calendar, Target, Users, Award } from 'lucide-react';
import type { Profile } from '../../../types';

interface AnalyticsChartsProps {
    users: Profile[];
    activities?: Activity[];
}

interface Activity {
    activity_type: string;
    user_id: string;
    user_name: string;
    user_avatar: string | null;
    description: string;
    created_at: string;
}

export default function AnalyticsCharts({ users, activities = [] }: AnalyticsChartsProps) {
    // Activity distribution
    const activityStats = useMemo(() => {
        const stats = { posts: 0, comments: 0, jobs: 0, signups: 0 };
        activities.forEach(a => {
            if (a.activity_type === 'post') stats.posts++;
            if (a.activity_type === 'comment') stats.comments++;
            if (a.activity_type === 'job') stats.jobs++;
            if (a.activity_type === 'signup') stats.signups++;
        });
        return stats;
    }, [activities]);

    // Calculate growth metrics
    const growthMetrics = useMemo(() => {
        if (users.length === 0) return { daily: 0, weekly: 0, monthly: 0, total: 0 };

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const dailySignups = users.filter(u => new Date(u.created_at) >= oneDayAgo).length;
        const weeklySignups = users.filter(u => new Date(u.created_at) >= oneWeekAgo).length;
        const monthlySignups = users.filter(u => new Date(u.created_at) >= oneMonthAgo).length;

        return {
            daily: dailySignups,
            weekly: weeklySignups,
            monthly: monthlySignups,
            total: users.length
        };
    }, [users]);

    // Calculate engagement rate (verified users as proxy)
    const engagementRate = useMemo(() => {
        if (users.length === 0) return 0;
        const verifiedCount = users.filter(u => u.is_verified).length;
        return Math.round((verifiedCount / users.length) * 100);
    }, [users]);

    // Top universities
    const topUniversities = useMemo(() => {
        const uniMap = new Map<string, number>();
        users.forEach(u => {
            const uni = u.university?.trim() || 'Not Specified';
            uniMap.set(uni, (uniMap.get(uni) || 0) + 1);
        });
        return Array.from(uniMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [users]);



    return (
        <div className="space-y-6">
            {/* Key Metrics for Investors */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp className="w-48 h-48" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3 tracking-tighter uppercase italic">
                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
                    Growth Analytics
                </h2>
                <p className="text-emerald-100/80 mb-8 text-sm md:text-lg font-medium">Real-time platform acquisition & engagement metrics</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-emerald-300" />
                            <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Last 24h</p>
                        </div>
                        <p className="text-3xl md:text-5xl font-black tracking-tighter">{growthMetrics.daily}</p>
                        <p className="text-xs text-emerald-200/60 mt-2 font-bold uppercase">New signups</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-emerald-300" />
                            <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">7 Days</p>
                        </div>
                        <p className="text-3xl md:text-5xl font-black tracking-tighter">{growthMetrics.weekly}</p>
                        <p className="text-xs text-emerald-200/60 mt-2 font-bold uppercase">New signups</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-emerald-300" />
                            <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">30 Days</p>
                        </div>
                        <p className="text-3xl md:text-5xl font-black tracking-tighter">{growthMetrics.monthly}</p>
                        <p className="text-xs text-emerald-200/60 mt-2 font-bold uppercase">New signups</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-emerald-300" />
                            <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Total</p>
                        </div>
                        <p className="text-3xl md:text-5xl font-black tracking-tighter">{growthMetrics.total}</p>
                        <p className="text-xs text-emerald-200/60 mt-2 font-bold uppercase">Members</p>
                    </div>
                </div>
            </div>

            {/* Engagement & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Breakdown */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Engagement Mix
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 mb-1">Posts</p>
                            <p className="text-2xl font-bold text-stone-900 dark:text-white">{activityStats.posts}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 mb-1">Comments</p>
                            <p className="text-2xl font-bold text-stone-900 dark:text-white">{activityStats.comments}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 mb-1">Jobs</p>
                            <p className="text-2xl font-bold text-stone-900 dark:text-white">{activityStats.jobs}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-stone-400 dark:text-zinc-500 mb-1">Conversion</p>
                            <p className="text-2xl font-bold text-stone-900 dark:text-white">{engagementRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Top Universities */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-stone-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        Top Universities
                    </h3>
                    <div className="space-y-4">
                        {topUniversities.map(([uni, count], index) => (
                            <div key={uni} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold text-sm flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </span>
                                        <span className="font-bold text-stone-700 dark:text-zinc-300 text-sm truncate">{uni}</span>
                                    </div>
                                    <span className="font-black text-stone-900 dark:text-white text-base ml-2">{count}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${(count / users.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
