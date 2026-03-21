import { useState, useEffect } from 'react';
import { Mic2, Search, PlusCircle, Loader2, Play, Pause, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPodcasts, fetchEpisodes, incrementEpisodePlay } from './hooks/usePodcasts';
import type { Podcast } from '../../types';
import { useAudioStore } from '../../stores/useAudioStore';

const CATEGORIES = [
    'All', 'Technology', 'Business', 'Education', 'Entertainment',
    'Health', 'Sports', 'News', 'Comedy', 'Arts', 'Other',
];

const CATEGORY_GRADIENTS: Record<string, string> = {
    Technology:    'from-blue-600 to-cyan-500',
    Business:      'from-amber-500 to-orange-600',
    Education:     'from-purple-600 to-violet-500',
    Entertainment: 'from-pink-500 to-rose-600',
    Health:        'from-green-500 to-emerald-600',
    Sports:        'from-orange-500 to-red-500',
    News:          'from-red-600 to-rose-500',
    Comedy:        'from-yellow-400 to-orange-400',
    Arts:          'from-violet-500 to-purple-600',
    Other:         'from-slate-500 to-zinc-600',
};

// ── Hero: Featured podcast banner ──────────────────────────────
function HeroBanner({ podcast }: { podcast: Podcast }) {
    const navigate = useNavigate();
    const { currentTrack, isPlaying, setQueue, pauseTrack, resumeTrack } = useAudioStore();
    const [loading, setLoading] = useState(false);
    const isActive = currentTrack?.source === podcast.title;
    const isThisPlaying = isActive && isPlaying;

    const handleListen = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActive) {
            isPlaying ? pauseTrack() : resumeTrack();
            return;
        }
        setLoading(true);
        try {
            const eps = await fetchEpisodes(podcast.id);
            if (!eps.length) { navigate(`/app/podcasts/${podcast.id}`); return; }
            const tracks = eps.map(ep => ({
                id: ep.id,
                title: ep.title,
                audioUrl: ep.audio_url,
                source: podcast.title,
                thumbnail: ep.cover_url ?? podcast.cover_url ?? undefined,
                episodeId: ep.id,
            }));
            setQueue(tracks, 0);
            incrementEpisodePlay(eps[0].id).catch(() => {});
        } catch {
            navigate(`/app/podcasts/${podcast.id}`);
        } finally {
            setLoading(false);
        }
    };

    const gradient = CATEGORY_GRADIENTS[podcast.category] ?? 'from-emerald-600 to-teal-500';

    return (
        <div
            onClick={() => navigate(`/app/podcasts/${podcast.id}`)}
            className={`relative overflow-hidden rounded-3xl cursor-pointer group mb-8 bg-gradient-to-br ${gradient}`}
            style={{ minHeight: 200 }}
        >
            {/* Background cover blur */}
            {podcast.cover_url && (
                <img
                    src={podcast.cover_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110 blur-sm"
                />
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content */}
            <div className="relative flex items-end gap-5 p-6">
                {/* Cover art */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 shrink-0">
                    {podcast.cover_url ? (
                        <img
                            src={podcast.cover_url}
                            alt={podcast.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/20">
                            <Mic2 className="w-10 h-10 text-white/70" />
                        </div>
                    )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Featured</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 text-white rounded-full">
                            {podcast.category}
                        </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white truncate leading-tight">
                        {podcast.title}
                    </h2>
                    <p className="text-sm text-white/70 mt-0.5 truncate">by {podcast.creator?.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {podcast.followers_count.toLocaleString()} followers
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                            <Mic2 className="w-3 h-3" /> {podcast.episodes_count} episodes
                        </span>
                    </div>
                </div>

                {/* Play button */}
                <button
                    onClick={handleListen}
                    disabled={loading}
                    className="shrink-0 w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-xl shadow-black/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-70"
                >
                    {loading
                        ? <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
                        : isThisPlaying
                            ? <Pause className="w-6 h-6 fill-zinc-900 text-zinc-900" />
                            : <Play className="w-6 h-6 fill-zinc-900 text-zinc-900 translate-x-0.5" />
                    }
                </button>
            </div>
        </div>
    );
}

// ── Trending card (horizontal scroll) ──────────────────────────
function TrendingCard({ podcast }: { podcast: Podcast }) {
    const navigate = useNavigate();
    const { currentTrack, isPlaying } = useAudioStore();
    const isActive = currentTrack?.source === podcast.title;
    const isThisPlaying = isActive && isPlaying;
    const gradient = CATEGORY_GRADIENTS[podcast.category] ?? 'from-emerald-600 to-teal-500';

    return (
        <button
            onClick={() => navigate(`/app/podcasts/${podcast.id}`)}
            className="group shrink-0 w-36 md:w-44 text-left"
        >
            <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-md bg-gradient-to-br ${gradient} mb-2`}>
                {podcast.cover_url ? (
                    <img
                        src={podcast.cover_url}
                        alt={podcast.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Mic2 className="w-10 h-10 text-white/60" />
                    </div>
                )}
                {/* Glass overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Stats badge */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Mic2 className="w-2.5 h-2.5" /> {podcast.episodes_count}
                    </span>
                    <span className="text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> {podcast.followers_count}
                    </span>
                </div>
                {/* Playing indicator */}
                {isThisPlaying && (
                    <div className="absolute bottom-2 right-2 flex gap-0.5 items-end h-4">
                        {[0.6, 1, 0.8, 0.4].map((h, j) => (
                            <div
                                key={j}
                                className="w-0.5 bg-white rounded-full animate-bounce"
                                style={{ height: `${h * 100}%`, animationDuration: `${0.4 + j * 0.15}s` }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {podcast.title}
            </h4>
            <p className="text-xs text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                {podcast.creator?.name}
            </p>
        </button>
    );
}

// ── Category browse card ────────────────────────────────────────
function CategoryCard({ category, onClick }: { category: string; onClick: () => void }) {
    const gradient = CATEGORY_GRADIENTS[category] ?? 'from-slate-500 to-zinc-600';
    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl h-16 md:h-20 bg-gradient-to-br ${gradient} text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md`}
        >
            <span className="relative z-10 px-4">{category}</span>
            <div className="absolute right-2 bottom-1 opacity-20 text-5xl font-black pointer-events-none select-none leading-none">
                {category[0]}
            </div>
        </button>
    );
}

// ── Main page ───────────────────────────────────────────────────
export default function PodcastsPage() {
    const navigate = useNavigate();
    const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchPodcasts()
            .then(setAllPodcasts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const featured = allPodcasts[0] ?? null;

    const trending = allPodcasts.slice(0, 8);

    const browseCategories = CATEGORIES.filter(c => c !== 'All');

    const filtered = allPodcasts.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchSearch = !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.creator?.name ?? '').toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Mic2 className="w-6 h-6 text-emerald-600" />
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Podcasts</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(s => !s)}
                        className="p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/app/podcasts/manage')}
                        className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4" /> Your Podcast
                    </button>
                </div>
            </div>

            {/* ── Search bar (toggleable) ── */}
            {showSearch && (
                <div className="relative mb-6 animate-in slide-in-from-top-2 duration-200">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search podcasts or creators..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                </div>
            )}

            {/* ── If searching: show results only ── */}
            {search ? (
                <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                        Search results
                    </p>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Mic2 className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-zinc-400 font-medium">No podcasts match your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filtered.map(p => (
                                <TrendingCard key={p.id} podcast={p} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* ── Hero banner ── */}
                    {featured && <HeroBanner podcast={featured} />}

                    {/* ── Trending Now ── */}
                    {trending.length > 0 && (
                        <section className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Trending Now</h2>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                                {trending.map(p => (
                                    <TrendingCard key={p.id} podcast={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Browse by Category ── */}
                    <section className="mb-8">
                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Browse Categories
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {browseCategories.map(cat => (
                                <CategoryCard
                                    key={cat}
                                    category={cat}
                                    onClick={() => {
                                        setCategory(cat);
                                        document.getElementById('all-podcasts')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                />
                            ))}
                        </div>
                    </section>

                    {/* ── All Podcasts / Category filter ── */}
                    <section id="all-podcasts">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                {category === 'All' ? 'All Podcasts' : category}
                            </h2>
                            {category !== 'All' && (
                                <button
                                    onClick={() => setCategory('All')}
                                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                    Show all
                                </button>
                            )}
                        </div>

                        {/* Category chips */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        category === cat
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                                            : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-400 hover:text-emerald-600'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <Mic2 className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-zinc-400 font-medium">
                                    No podcasts in this category yet.
                                </p>
                                <button
                                    onClick={() => navigate('/app/podcasts/manage')}
                                    className="mt-3 text-emerald-600 font-semibold hover:underline text-sm"
                                >
                                    Be the first — apply now
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filtered.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => navigate(`/app/podcasts/${p.id}`)}
                                        className="group text-left"
                                    >
                                        <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENTS[p.category] ?? 'from-slate-500 to-zinc-600'} mb-2 shadow-sm group-hover:shadow-lg group-hover:scale-[1.03] active:scale-95 transition-all duration-200`}>
                                            {p.cover_url ? (
                                                <img
                                                    src={p.cover_url}
                                                    alt={p.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Mic2 className="w-8 h-8 text-white/60" />
                                                </div>
                                            )}
                                            {/* Bottom glass bar */}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-white/90 flex items-center gap-0.5">
                                                        <Mic2 className="w-2.5 h-2.5" /> {p.episodes_count} ep{p.episodes_count !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="text-white/40">·</span>
                                                    <span className="text-[10px] font-bold text-white/90 flex items-center gap-0.5">
                                                        <Users className="w-2.5 h-2.5" /> {p.followers_count}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Category badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className="text-[9px] font-bold text-white bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {p.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                                            {p.creator?.name}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
