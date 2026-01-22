import { useMemo } from 'react';
import type { Profile } from '../../../types';
import { TrendingUp, Users, Activity, Calendar, Award, Target } from 'lucide-react';

interface AnalyticsChartsProps {
    users: Profile[];
}

export default function AnalyticsCharts({ users }: AnalyticsChartsProps) {
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

    // Role distribution
    const roleStats = useMemo(() => {
        const stats = { students: 0, orgs: 0, verified: 0 };
        users.forEach(u => {
            if (u.role === 'org') stats.orgs++;
            else stats.students++;
            if (u.is_verified) stats.verified++;
        });
        return stats;
    }, [users]);

    return (
        <div className="space-y-6">
            {/* Key Metrics for Investors */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2rem] p-6 md:p-8 text-white shadow-xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
                    Platform Growth
                </h2>
                <p className="text-emerald-100 mb-6 text-sm md:text-base">Real-time user acquisition metrics</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-emerald-200" />
                            <p className="text-xs md:text-sm text-emerald-200 font-medium">Last 24h</p>
                        </div>
                        <p className="text-2xl md:text-4xl font-bold">{growthMetrics.daily}</p>
                        <p className="text-xs text-emerald-200 mt-1">new users</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-emerald-200" />
                            <p className="text-xs md:text-sm text-emerald-200 font-medium">Last 7 days</p>
                        </div>
                        <p className="text-2xl md:text-4xl font-bold">{growthMetrics.weekly}</p>
                        <p className="text-xs text-emerald-200 mt-1">new users</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-emerald-200" />
                            <p className="text-xs md:text-sm text-emerald-200 font-medium">Last 30 days</p>
                        </div>
                        <p className="text-2xl md:text-4xl font-bold">{growthMetrics.monthly}</p>
                        <p className="text-xs text-emerald-200 mt-1">new users</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-emerald-200" />
                            <p className="text-xs md:text-sm text-emerald-200 font-medium">Total</p>
                        </div>
                        <p className="text-2xl md:text-4xl font-bold">{growthMetrics.total}</p>
                        <p className="text-xs text-emerald-200 mt-1">registered</p>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Engagement Rate */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm md:text-base">Engagement Rate</h3>
                    </div>
                    <p className="text-3xl md:text-5xl font-bold text-green-600">{engagementRate}%</p>
                    <p className="text-xs md:text-sm text-stone-500 mt-2">{roleStats.verified} verified users</p>
                </div>

                {/* Student Count */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm md:text-base">Students</h3>
                    </div>
                    <p className="text-3xl md:text-5xl font-bold text-blue-600">{roleStats.students}</p>
                    <p className="text-xs md:text-sm text-stone-500 mt-2">
                        {Math.round((roleStats.students / users.length) * 100)}% of total
                    </p>
                </div>

                {/* Organizations */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Target className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-stone-900 text-sm md:text-base">Organizations</h3>
                    </div>
                    <p className="text-3xl md:text-5xl font-bold text-orange-600">{roleStats.orgs}</p>
                    <p className="text-xs md:text-sm text-stone-500 mt-2">
                        {Math.round((roleStats.orgs / users.length) * 100)}% of total
                    </p>
                </div>
            </div>

            {/* Top Universities - Mobile Optimized */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 md:mb-6 text-base md:text-lg">Top Universities</h3>
                <div className="space-y-3 md:space-y-4">
                    {topUniversities.map(([uni, count], index) => (
                        <div key={uni} className="group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs md:text-sm flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-stone-700 text-sm md:text-base truncate">{uni}</span>
                                </div>
                                <span className="font-bold text-stone-900 text-base md:text-lg ml-2">{count}</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2 md:h-3 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                    style={{ width: `${(count / users.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {topUniversities.length === 0 && (
                        <p className="text-stone-400 text-sm text-center py-4">No university data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
