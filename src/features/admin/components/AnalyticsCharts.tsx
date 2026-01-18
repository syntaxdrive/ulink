import { useMemo } from 'react';
import type { Profile } from '../../../types';
import { GraduationCap, BarChart3, Users } from 'lucide-react';

interface AnalyticsChartsProps {
    users: Profile[];
}

export default function AnalyticsCharts({ users }: AnalyticsChartsProps) {
    // 1. Process Daily Signups (Histogram)
    const chartData = useMemo(() => {
        if (users.length === 0) return [];

        const dateMap = new Map<string, number>();

        // Populate with raw counts
        users.forEach(user => {
            // Use local date string YYYY-MM-DD
            const date = new Date(user.created_at).toISOString().split('T')[0];
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        // Convert to array and sort
        let data = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Take the last 14 days of activity to keep chart readable
        return data.slice(-14);
    }, [users]);

    // 2. Compute Bar Dimensions
    const { bars } = useMemo(() => {
        if (chartData.length === 0) return { bars: [], maxCount: 0 };

        const max = Math.max(...chartData.map(d => d.count)) || 1;
        // ViewBox is 100 x 40
        const chartWidth = 100;
        const chartHeight = 40;
        const gap = 2; // space between bars
        const barWidth = (chartWidth / chartData.length) - gap;

        const computedBars = chartData.map((d, i) => {
            const height = (d.count / max) * chartHeight;
            const x = i * (barWidth + gap) + (gap / 2);
            const y = chartHeight - height; // SVG Y grows downwards
            return { x, y, width: Math.max(barWidth, 1), height: Math.max(height, 1) }; // Ensure at least 1px
        });

        return { bars: computedBars, maxCount: max };
    }, [chartData]);

    const topUniversities = useMemo(() => {
        const statsMap = new Map<string, { count: number, displayName: string }>();

        users.forEach(u => {
            const rawUni = u.university ? u.university.trim() : 'Not Specified';
            const key = rawUni.toLowerCase();

            if (!statsMap.has(key)) {
                statsMap.set(key, { count: 0, displayName: rawUni });
            }

            const entry = statsMap.get(key)!;
            entry.count++;

            // Heuristic: Prefer "Title Case" over "lowercase" for display
            if (rawUni[0] !== rawUni[0].toLowerCase() && entry.displayName[0] === entry.displayName[0].toLowerCase()) {
                entry.displayName = rawUni;
            }
        });

        return Array.from(statsMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(item => [item.displayName, item.count] as [string, number]);
    }, [users]);

    const roleDistribution = useMemo(() => {
        const roles = { student: 0, org: 0, admin: 0 };
        users.forEach(u => {
            if (u.is_admin) roles.admin++;
            else if (u.role === 'org') roles.org++;
            else roles.student++;
        });
        return roles;
    }, [users]);

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Daily Signups (Histogram) */}
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                            Daily Signups
                        </h2>
                        <p className="text-stone-500 text-sm">New registrations per day (Last 14 active days)</p>
                    </div>
                </div>

                {/* Bar Chart SVG */}
                <div className="relative h-48 w-full flex items-end justify-center">
                    {chartData.length > 0 ? (
                        <div className="w-full h-full relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between text-[10px] text-stone-300 pointer-events-none pb-6">
                                <div className="border-b border-dashed border-stone-100 w-full"></div>
                                <div className="border-b border-dashed border-stone-100 w-full"></div>
                                <div className="border-b border-dashed border-stone-100 w-full"></div>
                                <div className="border-b border-stone-200 w-full"></div>
                            </div>

                            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#34D399" />
                                    </linearGradient>
                                </defs>
                                {bars.map((bar, i) => (
                                    <rect
                                        key={i}
                                        x={bar.x}
                                        y={bar.y}
                                        width={bar.width}
                                        height={bar.height}
                                        fill="url(#barGradient)"
                                        rx="1"
                                        className="transition-all duration-500 hover:opacity-80"
                                    />
                                ))}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                                {chartData.map((d) => (
                                    <div key={d.date} className="text-[10px] text-stone-400 font-medium text-center" style={{ width: `${100 / chartData.length}%` }}>
                                        {formatDate(d.date)}
                                    </div>
                                ))}
                            </div>

                            {/* Hover Tooltip (Basic CSS based) */}
                            {chartData.map((d, i) => {
                                const bar = bars[i];
                                return (
                                    <div
                                        key={`tooltip-${i}`}
                                        className="absolute group-hover:opacity-100 opacity-0 transition-opacity bg-stone-900 text-white text-[10px] py-1 px-2 rounded -top-8 pointer-events-none"
                                        style={{
                                            left: `${bar.x}%`,
                                            top: `${Math.min(bar.y, 30)}%`, // Rough positioning
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        {d.count} users
                                    </div>
                                )
                            })}

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400 text-sm">
                            No recent activity data.
                        </div>
                    )}
                </div>
            </div>

            {/* University Distribution */}
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Top Universities
                </h3>
                <div className="space-y-4">
                    {topUniversities.map(([uni, count]) => (
                        <div key={uni} className="group">
                            <div className="flex justify-between items-center mb-1.5 text-sm">
                                <span className="font-medium text-stone-700 truncate max-w-[70%]">{uni}</span>
                                <span className="font-bold text-stone-900">{count}</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-500"
                                    style={{ width: `${(count / users.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {topUniversities.length === 0 && <p className="text-stone-400 text-sm">No university data yet.</p>}
                </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Demographics
                </h3>

                <div className="flex items-center justify-center py-4">
                    {/* Donut Chart */}
                    <div
                        className="w-40 h-40 rounded-full relative shadow-inner"
                        style={{
                            background: `conic-gradient(
                                #10B981 0% ${(roleDistribution.student / users.length) * 100}%,
                                #F59E0B ${(roleDistribution.student / users.length) * 100}% ${(roleDistribution.student / users.length) * 100 + (roleDistribution.org / users.length) * 100}%,
                                #8B5CF6 ${(roleDistribution.student / users.length) * 100 + (roleDistribution.org / users.length) * 100}% 100%
                            )`
                        }}
                    >
                        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-stone-900">{users.length}</span>
                            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-stone-500 uppercase">Students</span>
                        </div>
                        <p className="text-xl font-bold text-stone-900">{roleDistribution.student}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-bold text-stone-500 uppercase">Orgs</span>
                        </div>
                        <p className="text-xl font-bold text-stone-900">{roleDistribution.org}</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
