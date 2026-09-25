import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Sparkles, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../../../types';

export default function SuggestedConnections() {
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            // Fetch current user's profile to get university
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('university').limit(50)
                .eq('id', user.id)
                .single();

            // Fetch current user's existing connections
            const { data: existingConnections } = await supabase
                .from('connections')
                .select('requester_id, recipient_id').limit(50)
                .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

            const connectedIds = new Set<string>([user.id]);
            if (existingConnections) {
                existingConnections.forEach(c => {
                    connectedIds.add(c.requester_id);
                    connectedIds.add(c.recipient_id);
                });
            }

            // Fetch suggested users (same university, not connected)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, username, avatar_url, university, headline, is_verified').limit(50)
                .eq('university', currentProfile?.university)
                .not('id', 'in', `(${Array.from(connectedIds).join(',')})`)
                .limit(10);

            if (profiles) {
                // Shuffle for variety
                const shuffled = profiles.sort(() => Math.random() - 0.5);
                setSuggestions((shuffled as any).slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (profileId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            await supabase
                .from('connections')
                .delete()
                .or(`and(requester_id.eq.${user.id},recipient_id.eq.${profileId}),and(requester_id.eq.${profileId},recipient_id.eq.${user.id})`);

            await supabase.from('connections').insert({
                requester_id: user.id,
                recipient_id: profileId,
                status: 'pending'
            });

            // Remove from suggestions
            setSuggestions(prev => prev.filter(p => p.id !== profileId));
        } catch (error) {
            console.error('Error sending connection:', error);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % suggestions.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    };

    if (loading || suggestions.length === 0 || dismissed) return null;

    const currentProfile = suggestions[currentIndex];

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden">
            {/* Dismiss button */}
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-full transition-colors z-10"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shrink-0">
                    <Sparkles className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Suggested Connection
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {currentIndex + 1} of {suggestions.length}
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-1">
                        Connect with peers from {currentProfile?.university || 'your campus'}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        Expand your academic & professional network by connecting with classmates.
                    </p>

                    {/* Profile Card */}
                    {currentProfile && (
                        <div className="bg-white dark:bg-zinc-900/80 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30 mb-4 flex items-center gap-3">
                            <img
                                src={currentProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentProfile.username}`}
                                alt={currentProfile.name || 'User'}
                                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                        {currentProfile.name || currentProfile.username}
                                    </span>
                                    {currentProfile.is_verified && (
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                    {currentProfile.headline || currentProfile.university}
                                </p>
                            </div>
                            <button
                                onClick={() => handleConnect(currentProfile.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Connect
                            </button>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <Link
                            to="/app/network"
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                            View all suggestions
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        {suggestions.length > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={prevSlide}
                                    className="p-1 text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="p-1 text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
