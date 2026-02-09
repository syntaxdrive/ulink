import { useState } from 'react';
import { Search, BadgeCheck, Mail, Users } from 'lucide-react';
import type { Profile } from '../../../types';
import { supabase } from '../../../lib/supabase';
import SendEmailModal from './SendEmailModal';

interface UserTableProps {
    users: Profile[];
    setUsers: React.Dispatch<React.SetStateAction<Profile[]>>;
    stats: any;
    setStats: React.Dispatch<React.SetStateAction<any>>;
}

export default function UserTable({ users, setUsers, stats, setStats }: UserTableProps) {
    const [search, setSearch] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailTargetUser, setEmailTargetUser] = useState<Profile | null>(null);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const openEmailModal = (user?: Profile) => {
        setEmailTargetUser(user || null);
        setIsEmailModalOpen(true);
    };

    const toggleVerify = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase.rpc('admin_toggle_verify', {
            target_id: userId,
            should_verify: !currentStatus
        });

        if (!error) {
            // Update local state instead of refetching all users for better performance
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === userId ? { ...user, is_verified: !currentStatus } : user
            ));

            // Update stats
            if (stats) {
                setStats({
                    ...stats,
                    total_verified: currentStatus ? stats.total_verified - 1 : stats.total_verified + 1
                });
            }
        } else {
            console.error('Error toggling verification:', error);
            alert('Failed to update verification status. Please try again.');
        }
    };

    // Toggle Gold Verification (if implemented in backend)
    // For now, ignoring gold verified toggle as it wasn't in original file explicitly for toggle, 
    // but the UI shows gold badges.

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-lg">
                        <Users className="w-5 h-5 text-stone-600 dark:text-zinc-400" />
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">User Management</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openEmailModal()}
                        className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        Broadcast
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-emerald-500 w-full md:w-64 text-sm text-stone-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 dark:bg-zinc-800/50 text-stone-500 dark:text-zinc-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">User</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">University</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-grab active:cursor-grabbing"
                                draggable="true"
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/ulink-user', JSON.stringify(user));
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden pointer-events-none">
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-stone-900 dark:text-white flex items-center gap-1">
                                                {user.name}
                                                {user.gold_verified ? (
                                                    <BadgeCheck className="w-4 h-4 text-yellow-500" />
                                                ) : user.is_verified ? (
                                                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                                                ) : null}
                                            </p>
                                            <p className="text-xs text-stone-500 dark:text-zinc-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_admin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : (user.role === 'org' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400')
                                        }`}>
                                        {user.is_admin ? 'Admin' : (user.role === 'org' ? 'Organization' : 'Student')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-stone-600 dark:text-zinc-400 text-sm">
                                    {user.university || 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    {user.gold_verified ? (
                                        <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 text-xs font-medium">
                                            <BadgeCheck className="w-4 h-4" /> Gold
                                        </span>
                                    ) : user.is_verified ? (
                                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500 text-xs font-medium">
                                            <BadgeCheck className="w-4 h-4" /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-stone-400 dark:text-zinc-600 text-xs">Unverified</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {/* Email Action */}
                                        <button
                                            onClick={() => openEmailModal(user)}
                                            className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                            title="Send Email"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => toggleVerify(user.id, user.is_verified || false)}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${user.is_verified
                                                ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-500'
                                                : 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/20 dark:text-blue-500'
                                                }`}
                                        >
                                            {user.is_verified ? 'Remove Badge' : 'Verify'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SendEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                preSelectedUser={emailTargetUser}
                allUsers={users}
            />
        </div>
    );
}
