import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Mail, Smile, Zap, Mic2, BarChart3 } from 'lucide-react';
import { type Profile } from '../../types';
import SendEmailModal from './components/SendEmailModal';
import SponsoredPostsManager from './components/SponsoredPostsManager';
import ReportsManager from './components/ReportsManager';
import UserTable from './components/UserTable';
import AdminReactionsBoard from './components/AdminReactionsBoard';
import AdminPollCreator from './components/AdminPollCreator';
import AdminPodcastQueue from './components/AdminPodcastQueue';
import AdminIntercom from './components/AdminIntercom';
import InvestorAnalytics from './components/InvestorAnalytics';


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


export default function AdminPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'board' | 'polls' | 'podcasts'>('analytics');

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<Profile[]>([]);

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
            .select('is_admin')
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

            // 2. Fetch Recent Users
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            if (usersData) setUsers(usersData as any);

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

            {/* Navigation Tabs — scrollable on mobile */}
            <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
                <div className="flex gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl w-max min-w-full sm:w-fit">
                    {([
                        { key: 'analytics', icon: BarChart3, label: 'Analytics' },
                        { key: 'users', icon: Users, label: 'Users' },
                        { key: 'board', icon: Smile, label: 'Board' },
                        { key: 'polls', icon: Zap, label: 'Challenges' },
                        { key: 'podcasts', icon: Mic2, label: 'Podcasts' },
                    ] as const).map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${isActive
                                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <InvestorAnalytics />

                    {/* Sponsored Ads Manager */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm p-6 overflow-hidden">
                        <SponsoredPostsManager />
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
            ) : activeTab === 'polls' ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <AdminPollCreator />
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <AdminPodcastQueue />
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
