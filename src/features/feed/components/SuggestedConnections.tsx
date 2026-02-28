import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { UserPlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    headline: string | null;
    is_verified: boolean;
}

export default function SuggestedConnections() {
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get current user's profile
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('university')
                .eq('id', user.id)
                .single();

            // Get existing connections
            const { data: connections } = await supabase
                .from('connections')
                .select('requester_id, recipient_id')
                .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .in('status', ['accepted', 'pending']);

            const connectedIds = new Set(
                connections?.flatMap(c => [c.requester_id, c.recipient_id]) || []
            );
            connectedIds.add(user.id); // Exclude self

            // Fetch suggested users (same university, not connected)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, username, avatar_url, university, headline, is_verified')
                .eq('university', currentProfile?.university)
                .not('id', 'in', `(${Array.from(connectedIds).join(',')})`)
                .limit(10);

            if (profiles) {
                // Shuffle for variety
                const shuffled = profiles.sort(() => Math.random() - 0.5);
                setSuggestions(shuffled.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (profileId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

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

            <div className="mb-4">
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    People You May Know
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">From your university</p>
            </div>

            <div className="relative">
                {/* Profile Card */}
                <div className="bg-white dark:bg-bg-cardDark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-zinc-800">
                    <Link to={`/app/profile/${currentProfile.username || currentProfile.id}`} className="block">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={currentProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name)}&background=10b981&color=fff`}
                                alt={currentProfile.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 dark:text-zinc-100 truncate flex items-center gap-1">
                                    {currentProfile.name}
                                    {currentProfile.is_verified && (
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">
                                    {currentProfile.headline || currentProfile.university}
                                </p>
                            </div>
                        </div>
                    </Link>

                    <button
                        onClick={() => handleConnect(currentProfile.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Connect
                    </button>
                </div>

                {/* Navigation */}
                {suggestions.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={prevSlide}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors"
                            disabled={suggestions.length === 1}
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>

                        <div className="flex gap-1.5">
                            {suggestions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentIndex
                                        ? 'w-6 bg-emerald-600'
                                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors"
                            disabled={suggestions.length === 1}
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
