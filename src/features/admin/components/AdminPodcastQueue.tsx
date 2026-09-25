import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Mic2, Check, X, Pause, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import type { Podcast, Profile } from '../../../types';

type StatusFilter = 'pending' | 'approved' | 'all';

interface PodcastWithCreator extends Podcast {
    creator: Pick<Profile, 'id' | 'name' | 'username' | 'avatar_url' | 'is_verified'> | null;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    suspended: 'bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-zinc-400',
};

export default function AdminPodcastQueue() {
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [podcasts, setPodcasts] = useState<PodcastWithCreator[]>([]);
    const [loading, setLoading] = useState(true);

    // Per-row state
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [rejectOpen, setRejectOpen] = useState<Record<string, boolean>>({});
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const fetchPodcasts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('podcasts')
                .select('*, creator:profiles!creator_id(id, name, username, avatar_url, is_verified)')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setPodcasts((data ?? []) as PodcastWithCreator[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchPodcasts(); }, [fetchPodcasts]);

    const setRowLoading = (id: string, val: boolean) =>
        setActionLoading(prev => ({ ...prev, [id]: val }));

    const updateStatus = async (
        id: string,
        status: 'approved' | 'rejected' | 'suspended',
        rejection_reason?: string,
    ) => {
        setRowLoading(id, true);
        try {
            const patch: Record<string, unknown> = { status };
            if (rejection_reason !== undefined) patch.rejection_reason = rejection_reason;

            const { error } = await supabase
                .from('podcasts')
                .update(patch)
                .eq('id', id);

            if (error) throw error;

            // Optimistically remove from list if filter no longer matches
            setPodcasts(prev => {
                if (filter === 'all') {
                    return prev.map(p => p.id === id ? { ...p, status, rejection_reason } : p);
                }
                return prev.filter(p => p.id !== id);
            });

            // Clean up UI state
            setRejectOpen(prev => { const n = { ...prev }; delete n[id]; return n; });
            setRejectReason(prev => { const n = { ...prev }; delete n[id]; return n; });
        } catch (err) {
            console.error(err);
            alert('Action failed. Please try again.');
        } finally {
            setRowLoading(id, false);
        }
    };

    const handleApprove = (id: string) => updateStatus(id, 'approved');
    const handleSuspend = (id: string) => updateStatus(id, 'suspended');
    const handleReject = (id: string) => {
        const reason = rejectReason[id]?.trim() ?? '';
        updateStatus(id, 'rejected', reason || undefined);
    };

    const toggleRejectBox = (id: string) => {
        setRejectOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const pendingCount = filter === 'pending' ? podcasts.length : undefined;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                        Podcast Applications
                        {pendingCount !== undefined && pendingCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
                        Review and moderate podcast channels
                    </p>
                </div>
                <button
                    onClick={fetchPodcasts}
                    disabled={loading}
                    className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl w-fit">
                {(['pending', 'approved', 'all'] as StatusFilter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                            filter === f
                                ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-sm'
                                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
                        }`}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
            ) : podcasts.length === 0 ? (
                <div className="text-center py-16">
                    <Mic2 className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-stone-500 dark:text-zinc-400 font-medium">
                        {filter === 'pending' ? 'No pending applications.' : 'No podcasts found.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {podcasts.map(podcast => {
                        const isExp = expanded[podcast.id];
                        const isRejecting = rejectOpen[podcast.id];
                        const busy = actionLoading[podcast.id];

                        return (
                            <div
                                key={podcast.id}
                                className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-2xl overflow-hidden"
                            >
                                {/* Main row */}
                                <div className="flex items-start gap-4 p-4">
                                    {/* Cover art */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 shrink-0">
                                        {podcast.cover_url ? (
                                            <img
                                                src={podcast.cover_url}
                                                alt={podcast.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                                <Mic2 className="w-7 h-7 text-white/80" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 flex-wrap">
                                            <h3 className="font-bold text-stone-900 dark:text-white text-sm leading-tight truncate max-w-xs">
                                                {podcast.title}
                                            </h3>
                                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[podcast.status] ?? ''}`}>
                                                {podcast.status}
                                            </span>
                                        </div>

                                        {/* Creator */}
                                        {podcast.creator && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {podcast.creator.avatar_url ? (
                                                    <img
                                                        src={podcast.creator.avatar_url}
                                                        alt={podcast.creator.name}
                                                        className="w-4 h-4 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[8px] font-bold text-emerald-700">
                                                        {podcast.creator.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-xs text-stone-500 dark:text-zinc-400">
                                                    {podcast.creator.name}
                                                    <span className="text-stone-400 dark:text-zinc-600 ml-1">@{podcast.creator.username}</span>
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                                                {podcast.category}
                                            </span>
                                            <span className="text-[10px] text-stone-400 dark:text-zinc-600">
                                                {new Date(podcast.created_at).toLocaleDateString('en-NG', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand toggle */}
                                    <button
                                        onClick={() => toggleExpand(podcast.id)}
                                        className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Expanded description */}
                                {isExp && podcast.description && (
                                    <div className="px-4 pb-3 border-t border-stone-100 dark:border-zinc-800 pt-3">
                                        <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
                                            {podcast.description}
                                        </p>
                                    </div>
                                )}

                                {/* Rejection reason (if already rejected) */}
                                {podcast.status === 'rejected' && podcast.rejection_reason && (
                                    <div className="px-4 pb-3 border-t border-stone-100 dark:border-zinc-800 pt-3">
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            <span className="font-semibold">Rejection reason:</span> {podcast.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="px-4 pb-4 flex flex-wrap gap-2">
                                    {podcast.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(podcast.id)}
                                                disabled={busy}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                            >
                                                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => toggleRejectBox(podcast.id)}
                                                disabled={busy}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {podcast.status === 'approved' && (
                                        <>
                                            <button
                                                onClick={() => handleSuspend(podcast.id)}
                                                disabled={busy}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-stone-600 dark:text-zinc-300 hover:text-amber-700 dark:hover:text-amber-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                            >
                                                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                                                Suspend
                                            </button>
                                            <button
                                                onClick={() => toggleRejectBox(podcast.id)}
                                                disabled={busy}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {podcast.status === 'rejected' && (
                                        <button
                                            onClick={() => handleApprove(podcast.id)}
                                            disabled={busy}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                        >
                                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Approve
                                        </button>
                                    )}

                                    {podcast.status === 'suspended' && (
                                        <button
                                            onClick={() => handleApprove(podcast.id)}
                                            disabled={busy}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                        >
                                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Reinstate
                                        </button>
                                    )}
                                </div>

                                {/* Reject reason box */}
                                {isRejecting && (
                                    <div className="px-4 pb-4 border-t border-stone-100 dark:border-zinc-800 pt-3 space-y-2">
                                        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400">
                                            Rejection reason <span className="text-stone-400 font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="e.g. Content doesn't meet community guidelines..."
                                            value={rejectReason[podcast.id] ?? ''}
                                            onChange={e => setRejectReason(prev => ({ ...prev, [podcast.id]: e.target.value }))}
                                            className="w-full text-sm bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-stone-800 dark:text-zinc-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReject(podcast.id)}
                                                disabled={busy}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                                            >
                                                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                                Confirm Reject
                                            </button>
                                            <button
                                                onClick={() => toggleRejectBox(podcast.id)}
                                                className="px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
