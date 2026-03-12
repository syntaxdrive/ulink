import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mic2, Heart, Loader2, Radio } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchEpisodes, fetchIsFollowing, followPodcast, unfollowPodcast } from './hooks/usePodcasts';
import EpisodeItem from './components/EpisodeItem';
import type { Podcast, PodcastEpisode } from '../../types';

export default function PodcastChannelPage() {
    const { podcastId } = useParams<{ podcastId: string }>();
    const navigate = useNavigate();

    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!podcastId) return;

        Promise.all([
            supabase
                .from('podcasts')
                .select('*, creator:profiles!creator_id(id, name, username, avatar_url, is_verified)')
                .eq('id', podcastId)
                .single(),
            fetchEpisodes(podcastId),
            fetchIsFollowing(podcastId),
        ])
            .then(([{ data }, eps, following]) => {
                if (data) setPodcast(data as Podcast);
                setEpisodes(eps);
                setIsFollowing(following);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [podcastId]);

    const handleFollow = async () => {
        if (!podcastId) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowPodcast(podcastId);
                setIsFollowing(false);
                setPodcast(p => p ? { ...p, followers_count: Math.max(0, p.followers_count - 1) } : p);
            } else {
                await followPodcast(podcastId);
                setIsFollowing(true);
                setPodcast(p => p ? { ...p, followers_count: p.followers_count + 1 } : p);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500 dark:text-zinc-400">Podcast not found.</p>
                <button
                    onClick={() => navigate('/app/podcasts')}
                    className="mt-4 text-emerald-600 font-semibold hover:underline text-sm"
                >
                    Browse podcasts
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Back */}
            <button
                onClick={() => navigate('/app/podcasts')}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Podcasts
            </button>

            {/* Channel header */}
            <div className="flex gap-5 mb-6">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 shadow-lg">
                    {podcast.cover_url ? (
                        <img src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Mic2 className="w-10 h-10 text-white/80" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{podcast.title}</h1>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                                by {podcast.creator?.name}
                            </p>
                        </div>
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-60 ${
                                isFollowing
                                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {podcast.followers_count.toLocaleString()} followers
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5" /> {podcast.episodes_count} episodes
                        </span>
                    </div>

                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full">
                        {podcast.category}
                    </span>
                </div>
            </div>

            {podcast.description && (
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-8 leading-relaxed">
                    {podcast.description}
                </p>
            )}

            {/* Episodes */}
            <div>
                <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                    Episodes
                </h2>

                {episodes.length === 0 ? (
                    <div className="text-center py-12">
                        <Mic2 className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 dark:text-zinc-500">No episodes yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                        {episodes.map((ep, i) => (
                            <EpisodeItem
                                key={ep.id}
                                episode={ep}
                                podcastTitle={podcast.title}
                                podcastCover={podcast.cover_url}
                                queue={episodes}
                                queueIndex={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
