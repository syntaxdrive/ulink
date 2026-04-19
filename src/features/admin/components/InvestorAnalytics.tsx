import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import {
    TrendingUp, Users, Newspaper, MessageCircle, BookOpen,
    Briefcase, ShoppingBag, Mic2, Activity, Globe, Award,
    ArrowUpRight, ArrowDownRight, Minus, BarChart3, Target,
    Zap, Eye, Clock
} from 'lucide-react';

interface DailySignup { date: string; count: number; }
interface FeatureStat { label: string; count: number; icon: any; color: string; growth?: number; }

export default function InvestorAnalytics() {
    const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [totalMessages, setTotalMessages] = useState(0);
    const [totalConnections, setTotalConnections] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalListings, setTotalListings] = useState(0);
    const [totalPodcasts, setTotalPodcasts] = useState(0);
    const [totalStudyRooms, setTotalStudyRooms] = useState(0);
    const [totalCommunities, setTotalCommunities] = useState(0);
    const [signupCurve, setSignupCurve] = useState<DailySignup[]>([]);
    const [topUnis, setTopUnis] = useState<[string, number][]>([]);
    const [dauCount, setDauCount] = useState(0);
    const [wauCount, setWauCount] = useState(0);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Parallel fetches for speed
            const [
                { count: uc }, { count: pc }, { count: mc },
                { count: cc }, { count: jc }, { count: crc },
                { count: lc }, { count: poc }, { count: src },
                { count: comc },
                { data: users },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('*', { count: 'exact', head: true }),
                supabase.from('messages').select('*', { count: 'exact', head: true }),
                supabase.from('connections').select('*', { count: 'exact', head: true }),
                supabase.from('jobs').select('*', { count: 'exact', head: true }),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('marketplace_listings').select('*', { count: 'exact', head: true }),
                supabase.from('podcasts').select('*', { count: 'exact', head: true }),
                supabase.from('study_rooms').select('*', { count: 'exact', head: true }),
                supabase.from('communities').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('id, created_at, university').order('created_at').limit(5000),
            ]);

            setTotalUsers(uc ?? 0);
            setTotalPosts(pc ?? 0);
            setTotalMessages(mc ?? 0);
            setTotalConnections(cc ?? 0);
            setTotalJobs(jc ?? 0);
            setTotalCourses(crc ?? 0);
            setTotalListings(lc ?? 0);
            setTotalPodcasts(poc ?? 0);
            setTotalStudyRooms(src ?? 0);
            setTotalCommunities(comc ?? 0);

            if (users) {
                // Signup curve (last 30 days)
                const now = new Date();
                const days: DailySignup[] = [];
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    const count = users.filter(u => u.created_at?.startsWith(key)).length;
                    days.push({ date: key, count });
                }
                setSignupCurve(days);

                // DAU / WAU
                const oneDayAgo = new Date(now.getTime() - 86400000);
                const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
                setDauCount(users.filter(u => u.created_at && new Date(u.created_at) >= oneDayAgo).length);
                setWauCount(users.filter(u => u.created_at && new Date(u.created_at) >= oneWeekAgo).length);

                // Top universities
                const uniMap = new Map<string, number>();
                users.forEach(u => {
                    const uni = u.university?.trim();
                    if (uni) uniMap.set(uni, (uniMap.get(uni) || 0) + 1);
                });
                setTopUnis(
                    Array.from(uniMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                );
            }
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Signup curve max for chart scaling
    const curveMax = useMemo(() => Math.max(...signupCurve.map(d => d.count), 1), [signupCurve]);
    const totalLast30 = useMemo(() => signupCurve.reduce((s, d) => s + d.count, 0), [signupCurve]);
    const totalPrev30 = useMemo(() => Math.max(totalUsers - totalLast30, 0), [totalUsers, totalLast30]);
    const growthPct = totalPrev30 > 0 ? Math.round((totalLast30 / totalPrev30) * 100) : totalLast30 > 0 ? 100 : 0;

    const featureStats: FeatureStat[] = [
        { label: 'Posts', count: totalPosts, icon: Newspaper, color: 'blue' },
        { label: 'Messages', count: totalMessages, icon: MessageCircle, color: 'violet' },
        { label: 'Connections', count: totalConnections, icon: Users, color: 'emerald' },
        { label: 'Communities', count: totalCommunities, icon: Globe, color: 'sky' },
        { label: 'Job Listings', count: totalJobs, icon: Briefcase, color: 'amber' },
        { label: 'Courses', count: totalCourses, icon: BookOpen, color: 'indigo' },
        { label: 'Marketplace', count: totalListings, icon: ShoppingBag, color: 'rose' },
        { label: 'Podcasts', count: totalPodcasts, icon: Mic2, color: 'purple' },
        { label: 'Study Rooms', count: totalStudyRooms, icon: Target, color: 'teal' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Hero KPI Banner ── */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5">
                    <TrendingUp className="w-72 h-72 -mr-16 -mt-16" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Investor Analytics</h2>
                            <p className="text-slate-400 text-sm">Live platform metrics · Updated now</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">Total Users</span>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter">{totalUsers.toLocaleString()}</p>
                            <div className="flex items-center gap-1 mt-2">
                                {growthPct > 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <Minus className="w-3 h-3 text-slate-400" />}
                                <span className={`text-xs font-bold ${growthPct > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {growthPct}% growth (30d)
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">DAU (New)</span>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter">{dauCount}</p>
                            <p className="text-xs text-slate-500 mt-2">Signups last 24h</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-violet-400" />
                                <span className="text-[10px] text-violet-300 font-bold uppercase tracking-widest">WAU (New)</span>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter">{wauCount}</p>
                            <p className="text-xs text-slate-500 mt-2">Signups last 7d</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Engagement</span>
                            </div>
                            <p className="text-4xl md:text-5xl font-black tracking-tighter">
                                {totalUsers > 0 ? Math.round(((totalPosts + totalMessages + totalConnections) / totalUsers) * 10) / 10 : 0}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Actions per user</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Signup Growth Chart ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Signup Growth Curve
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Last 30 days · {totalLast30} new users</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                        {growthPct > 0 ? <ArrowUpRight className="w-4 h-4" /> : growthPct < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        {growthPct}%
                    </div>
                </div>

                {/* Bar chart */}
                <div className="flex items-end gap-[3px] h-48 md:h-56">
                    {signupCurve.map((d, i) => {
                        const pct = (d.count / curveMax) * 100;
                        const isToday = i === signupCurve.length - 1;
                        return (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {d.date.slice(5)} · {d.count}
                                </div>
                                <div
                                    className={`w-full rounded-t-md transition-all duration-500 ${
                                        isToday
                                            ? 'bg-emerald-500 shadow-lg'
                                            : 'bg-emerald-200 dark:bg-emerald-800/40 group-hover:bg-emerald-400 dark:group-hover:bg-emerald-600'
                                    }`}
                                    style={{
                                        height: `${Math.max(pct, 2)}%`,
                                        animationDelay: `${i * 30}ms`,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                    <span>{signupCurve[0]?.date.slice(5)}</span>
                    <span>Today</span>
                </div>
            </div>

            {/* ── Feature Adoption Grid ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Feature Adoption
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
                    {featureStats.map(f => {
                        const Icon = f.icon;
                        const colorMap: Record<string, string> = {
                            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                            violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
                            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
                            sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
                            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
                            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
                            rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
                            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
                            teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
                        };
                        return (
                            <div key={f.label} className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-slate-100 dark:border-zinc-700/50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className={`w-9 h-9 rounded-xl ${colorMap[f.color] || colorMap.blue} flex items-center justify-center mb-3`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{f.count.toLocaleString()}</p>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">{f.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Campus Penetration ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Campus Penetration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {topUnis.map(([uni, count], i) => (
                        <div key={uni} className="group">
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-xs flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-zinc-300 text-sm truncate">{uni}</span>
                                </div>
                                <span className="font-black text-slate-900 dark:text-white text-sm ml-2">{count} students</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                                    style={{ width: `${Math.min((count / (topUnis[0]?.[1] || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {topUnis.length === 0 && (
                        <p className="text-sm text-slate-400 col-span-2 text-center py-8">No university data available yet.</p>
                    )}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-400">Total universities represented</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{topUnis.length}+</span>
                </div>
            </div>
        </div>
    );
}
