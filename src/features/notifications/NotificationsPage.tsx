import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UserPlus, Check, X, Bell, MessageSquare, Heart, AtSign, Info, Trash2 } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';

export default function NotificationsPage() {
    const { requests, generalNotifications, loading, processing, handleAction, clearAll, deleteNotifications } = useNotifications();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Delete ${selectedIds.size} notification(s)?`)) return;
        await deleteNotifications(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear all notifications?')) return;
        await clearAll();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-100 shadow-sm sticky top-20 z-10">
                <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    Notifications
                    {requests.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {requests.length}
                        </span>
                    )}
                </h1>

                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedIds.size})
                        </button>
                    )}

                    {generalNotifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm transition-colors px-3 py-2"
                        >
                            <span>Clear All</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {(requests.length === 0 && generalNotifications.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 border-dashed">
                        <Bell className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="text-stone-900 font-medium">No new notifications</h3>
                        <p className="text-stone-500 text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    <>
                        {/* Connection Requests Section */}
                        {requests.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider pl-1">Connection Requests</h3>
                                {requests.map((req) => (
                                    <div key={req.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden relative">
                                                <img
                                                    src={req.requester.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.name)}&background=random`}
                                                    alt={req.requester.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                                                    <UserPlus className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-stone-900 text-sm">
                                                    <span className="font-bold">{req.requester.name}</span> wants to connect with you.
                                                </p>
                                                <p className="text-xs text-stone-500 mt-0.5">
                                                    {req.requester.role === 'org' ? 'Organization' : req.requester.university} • {new Date(req.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, 'accept')}
                                                disabled={processing === req.id}
                                                className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                                title="Accept"
                                            >
                                                {processing === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'reject')}
                                                disabled={processing === req.id}
                                                className="p-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Activity Section */}
                        {generalNotifications.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider pl-1">Recent Activity</h3>
                                {generalNotifications.map((notif) => {
                                    let icon = <Info className="w-5 h-5 text-stone-500" />;
                                    let bgClass = "bg-stone-100";
                                    let link = "#";

                                    switch (notif.type) {
                                        case 'message':
                                            icon = <MessageSquare className="w-5 h-5 text-indigo-500" />;
                                            bgClass = "bg-indigo-50";
                                            link = "/app/messages";
                                            break;
                                        case 'like':
                                            icon = <Heart className="w-5 h-5 text-red-500" />;
                                            bgClass = "bg-red-50";
                                            break;
                                        case 'mention':
                                            icon = <AtSign className="w-5 h-5 text-orange-500" />;
                                            bgClass = "bg-orange-50";
                                            break;
                                        case 'connection_rejected':
                                            icon = <X className="w-5 h-5 text-red-500" />;
                                            bgClass = "bg-red-50";
                                            break;
                                        case 'connection_accepted':
                                            icon = <Check className="w-5 h-5 text-green-500" />;
                                            bgClass = "bg-green-50";
                                            link = "/app/network";
                                            break;
                                    }

                                    return (
                                        <div key={notif.id} className="flex items-center gap-3">
                                            <div className="pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(notif.id)}
                                                    onChange={() => toggleSelection(notif.id)}
                                                    className="w-5 h-5 rounded-md border-stone-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <Link
                                                to={link}
                                                className="flex-1 block bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-stone-200 transition-all font-sans"
                                                onClick={(e) => {
                                                    // Prevent navigation if clicking specific controls, though checkbox is outside link
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl ${bgClass}`}>
                                                        {icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-stone-900 text-sm">{notif.content}</p>
                                                        <p className="text-xs text-stone-400 mt-1">
                                                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {!notif.read && (
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                                                    )}
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
