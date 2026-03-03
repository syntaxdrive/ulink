import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Building2, Mail, LayoutDashboard, Smile, Zap } from 'lucide-react';
import { type Profile } from '../../types';
import SendEmailModal from './components/SendEmailModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import SponsoredPostsManager from './components/SponsoredPostsManager';
import ReportsManager from './components/ReportsManager';
import UserTable from './components/UserTable';
import AdminReactionsBoard from './components/AdminReactionsBoard';
import AdminPollCreator from './components/AdminPollCreator';
import AdminIntercom from './components/AdminIntercom';
import RecentActivity from './components/RecentActivity';
import { Newspaper, TrendingUp } from 'lucide-react';

interface DashboardStats {
    total_users: number;
    total_verified: number;
    total_orgs: number;
    total_posts: number;
    total_communities: number;
    total_jobs: number;
    total_courses: number;
    pending_reports: number;
    active_sponsored_posts: number;
    total_revenue: number;
}

interface Activity {
    activity_type: string;
    user_id: string;
    user_name: string;
    user_avatar: string | null;
    description: string;
    created_at: string;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'board' | 'polls'>('dashboard');

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<Profile[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);

    // Email Modal State (Global Broadcast)
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/');

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            navigate('/app/feed');
            return;
        }

        setIsAdmin(true);
        fetchDashboardData();
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats
            const { data: statsData } = await supabase.rpc('get_admin_stats');
            if (statsData) setStats(statsData);

            // 2. Fetch Recent Activities
            const { data: activityData } = await supabase.rpc('get_recent_activity', { p_limit: 20 });
            if (activityData) setActivities(activityData);

            // 3. Fetch Recent Users (Full List)
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (usersData) setUsers(usersData);

            // 4. Fetch Reports
            const { data: reportsData } = await supabase
                .from('reports')
                .select(`
                    *,
                    reporter:reporter_id(name, email, avatar_url),
                    reported:reported_id(name, email, avatar_url)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (reportsData) setReports(reportsData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && loading) return <div className="p-8 text-center text-stone-500">Checking permissions...</div>;
    if (!isAdmin) return null;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-stone-900 dark:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-900/20">
                        <Shield className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white font-display">Admin Dashboard</h1>
                        <p className="text-stone-500 dark:text-zinc-400 text-sm">Manage users and collaborate</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all text-sm"
                >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Send Broadcast</span>
                    <span className="sm:hidden">Broadcast</span>
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard'
                        ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users'
                        ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('board')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'board'
                        ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <Smile className="w-4 h-4" />
                    Board
                </button>
                <button
                    onClick={() => setActiveTab('polls')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'polls'
                        ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                        }`}
                >
                    <Zap className="w-4 h-4" />
                    Challenges
                </button>
            </div>

            {activeTab === 'dashboard' ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-2xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Users</p>
                                <p className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{stats?.total_users || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-2xl">
                                <Newspaper className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Posts</p>
                                <p className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{stats?.total_posts || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 rounded-2xl">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Organizations</p>
                                <p className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{stats?.total_orgs || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500 rounded-2xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-stone-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Revenue (₦)</p>
                                <p className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{Math.floor(stats?.total_revenue || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Advanced Analytics Charts */}
                            <AnalyticsCharts users={users} activities={activities} />

                            {/* Sponsored Posts Manager */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm p-6 overflow-hidden">
                                <SponsoredPostsManager />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <RecentActivity activities={activities} />

                            <div className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-zinc-800 dark:to-zinc-900 p-6 rounded-[2rem] text-white shadow-xl">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-500" />
                                    System Health
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-400">Database Status</span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Optimal
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-400">Media CDN</span>
                                        <span className="text-emerald-500 font-bold">Stable</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-400">Queue Workers</span>
                                        <span>4 Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Reports */}
                    {reports.length > 0 && (
                        <ReportsManager reports={reports} setReports={setReports} />
                    )}
                </div>
            ) : activeTab === 'users' ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <UserTable
                        users={users}
                        setUsers={setUsers}
                        stats={stats}
                        setStats={setStats}
                    />
                </div>
            ) : activeTab === 'board' ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <AdminReactionsBoard />
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <AdminPollCreator />
                </div>
            )}

            {/* Email Modal */}
            <SendEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                preSelectedUser={null} // Broadcast mode
                allUsers={users}
            />

            {/* Live Mission Control Intercom */}
            <AdminIntercom />
        </div>
    );
}
