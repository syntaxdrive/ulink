
import { useState, useEffect } from 'react';
import { Send, X, Search, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useNetwork } from '../../network/hooks/useNetwork';
import type { Post, Profile } from '../../../types';

interface ShareToConnectionsModalProps {
    post: Post;
    onClose: () => void;
}

export default function ShareToConnectionsModal({ post, onClose }: ShareToConnectionsModalProps) {
    const { myNetwork, loading: networkLoading } = useNetwork();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id);
        });
    }, []);

    const filteredConnections = myNetwork.filter(profile => 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleShare = async () => {
        if (!currentUserId || selectedIds.size === 0) return;

        setSending(true);
        try {
            const postUrl = `https://unilink.ng/app/post/${post.id}`;
            const messageText = `Check out this post on UniLink!\n\n${post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : ''}\n\n${postUrl}`;

            const messages = Array.from(selectedIds).map(recipientId => ({
                sender_id: currentUserId,
                recipient_id: recipientId,
                content: messageText,
            }));

            const { error } = await supabase.from('messages').insert(messages);
            if (error) throw error;

            setSent(true);
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            console.error('Failed to share to connections:', error);
            alert('Failed to send messages. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Container */}
            <div className="relative w-full max-w-md bg-white dark:bg-bg-cardDark rounded-[2.5rem] shadow-2xl p-6 border border-stone-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Share to Connections</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Sent!</h3>
                        <p className="text-stone-500 dark:text-zinc-400">Post shared with {selectedIds.size} connection{selectedIds.size !== 1 ? 's' : ''}.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400 dark:text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-2xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Search connections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-6">
                            {networkLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                    <p className="text-xs text-stone-400">Loading your network...</p>
                                </div>
                            ) : filteredConnections.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-stone-400 text-sm">No connections found.</p>
                                </div>
                            ) : (
                                filteredConnections.map(profile => (
                                    <button
                                        key={profile.id}
                                        onClick={() => toggleSelection(profile.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                            selectedIds.has(profile.id)
                                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                                : 'bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <img
                                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                                            alt={profile.name}
                                            className="w-10 h-10 rounded-full object-cover shadow-sm"
                                        />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{profile.name}</p>
                                            <p className="text-xs text-stone-400 dark:text-zinc-500 truncate">@{profile.username}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedIds.has(profile.id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-stone-200 dark:border-zinc-700'
                                        }`}>
                                            {selectedIds.has(profile.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            disabled={selectedIds.size === 0 || sending}
                            onClick={handleShare}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-stone-100 dark:disabled:bg-zinc-800 text-white disabled:text-stone-400 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                            Share with {selectedIds.size} Connection{selectedIds.size !== 1 ? 's' : ''}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
