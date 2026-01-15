import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, BadgeCheck, Search, Building2, Mail, Flag } from 'lucide-react';
import { type Profile } from '../../types';
import SendEmailModal from './components/SendEmailModal';

interface DashboardStats {
    total_users: number;
    total_verified: number;
    total_orgs: number;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');

    // Email Modal State
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailTargetUser, setEmailTargetUser] = useState<Profile | null>(null);

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
        // 1. Fetch Stats
        const { data: statsData } = await supabase.rpc('get_admin_stats');
        if (statsData) setStats(statsData);

        // 2. Fetch Recent Users
        const { data: usersData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (usersData) setUsers(usersData);

        // 3. Fetch Reports
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

        setLoading(false);
    };

    const resolveReport = async (reportId: string) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'resolved' })
            .eq('id', reportId);

        if (!error) {
            setReports(prev => prev.filter(r => r.id !== reportId));
        }
    };

    const toggleVerify = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase.rpc('admin_toggle_verify', {
            target_id: userId,
            should_verify: !currentStatus
        });

        if (!error) {
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_verified: !currentStatus } : u
            ));
            // Update stats vaguely
            if (stats) {
                setStats({
                    ...stats,
                    total_verified: currentStatus ? stats.total_verified - 1 : stats.total_verified + 1
                });
            }
        }
    };

    const openEmailModal = (user?: Profile) => {
        setEmailTargetUser(user || null);
        setIsEmailModalOpen(true);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (!isAdmin && loading) return <div className="p-8 text-center text-stone-500">Checking permissions...</div>;
    if (!isAdmin) return null;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-stone-900 text-white rounded-2xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 font-display">Admin Dashboard</h1>
                        <p className="text-stone-500">Manage users and view platform analytics</p>
                    </div>
                </div>

                <button
                    onClick={() => openEmailModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                >
                    <Mail className="w-4 h-4" />
                    Send Broadcast
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-stone-500 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-stone-900">{stats?.total_users || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                        <BadgeCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-stone-500 text-sm font-medium">Verified Accounts</p>
                        <p className="text-3xl font-bold text-stone-900">{stats?.total_verified || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-stone-500 text-sm font-medium">Organizations</p>
                        <p className="text-3xl font-bold text-stone-900">{stats?.total_orgs || 0}</p>
                    </div>
                </div>
            </div>

            {/* User Reports Section */}
            <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <Flag className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900">Flagged Accounts & Reports</h2>
                </div>

                <div className="overflow-x-auto">
                    {reports.length === 0 ? (
                        <div className="p-8 text-center text-stone-500">
                            <p>No active reports found. All good! 👍</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-red-50 text-red-900 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Reported User</th>
                                    <th className="px-6 py-4 font-semibold">Reported By</th>
                                    <th className="px-6 py-4 font-semibold">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                                                    <img src={report.reported?.avatar_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-stone-900 text-sm">{report.reported?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-stone-500">{report.reported?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                                                    <img src={report.reporter?.avatar_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-sm font-medium text-stone-700">{report.reporter?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-stone-700 max-w-xs">{report.reason}</p>
                                            <p className="text-xs text-stone-400 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => resolveReport(report.id)}
                                                className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold rounded-lg shadow-sm"
                                            >
                                                Mark Resolved
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
                {/* ... existing table ... */}
                <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-stone-900">User Management</h2>
                    <div className="relative">
                        <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 w-full md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">University</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-900 flex items-center gap-1">
                                                    {user.name}
                                                    {user.gold_verified ? (
                                                        <BadgeCheck className="w-4 h-4 text-yellow-500" />
                                                    ) : user.is_verified ? (
                                                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                                                    ) : null}
                                                </p>
                                                <p className="text-xs text-stone-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_admin ? 'bg-purple-100 text-purple-700' : (user.role === 'org' ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-600')
                                            }`}>
                                            {user.is_admin ? 'Admin' : (user.role === 'org' ? 'Organization' : 'Student')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600 text-sm">
                                        {user.university || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_verified ? (
                                            <span className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                                                <BadgeCheck className="w-4 h-4" /> Verified
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 text-xs">Unverified</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {/* Email Action */}
                                            <button
                                                onClick={() => openEmailModal(user)}
                                                className="p-1.5 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Send Email"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => toggleVerify(user.id, user.is_verified || false)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${user.is_verified
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {user.is_verified ? 'Remove Badge' : 'Verify User'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Modal */}
            <SendEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                preSelectedUser={emailTargetUser}
                allUsers={users}
            />
        </div>
    );
}
