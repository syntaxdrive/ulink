import { useState, useEffect } from 'react';
import {
    Newspaper,
    Mic2,
    Play,
    ExternalLink,
    Calendar,
    Clock,
    TrendingUp,
    Search,
    Volume2,
    Share2,
    MessageCircle,
    ArrowLeft,
    Globe,
    BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../../stores/useAudioStore';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useNewsStore } from '../../stores/useNewsStore';

interface NewsItem {
    id: string;
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
    description: string;
    source: string;
    type: 'article' | 'video' | 'podcast';
    audioUrl?: string;
    author?: string;
}

const FEED_SOURCES = {
    ARTICLES: [
        { name: 'Nairametrics', url: 'https://nairametrics.com/feed/', category: 'Nigeria' },
        { name: 'The Cable', url: 'https://www.thecable.ng/feed', category: 'Nigeria' },
        { name: 'Daily Post', url: 'https://dailypost.ng/feed/', category: 'Nigeria' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
        { name: 'Punch News', url: 'https://rss.punchng.com/v1/category/latest', category: 'Nigeria' },
        { name: 'Vanguard', url: 'https://www.vanguardngr.com/feed/', category: 'Nigeria' },
        { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed', category: 'Nigeria' },
        { name: 'Pulse Nigeria', url: 'https://pulse.ng/news/rss', category: 'Nigeria' },
        { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-topics=world-news&post_type=best', category: 'World' },
        { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'World' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World' },
        { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/rss/fulltext', category: 'Science' },
        { name: 'The Economist', url: 'https://www.economist.com/finance-and-economics/rss.xml', category: 'Economics' },
        { name: 'Guardian Students', url: 'https://www.theguardian.com/education/students/rss', category: 'Campus' },
        { name: 'ASUU News', url: 'https://asuunigeria.org/feed/', category: 'Campus' },
        { name: 'Linda Ikeji', url: 'https://www.lindaikejisblog.com/feed', category: 'Life' },
        { name: 'Vision FM', url: 'https://visionfm.ng/rss/latest-posts', category: 'Nigeria' },
        { name: 'All Africa', url: 'https://allafrica.com/tools/headlines/rss', category: 'Africa' },
        { name: 'Africa News', url: 'https://www.africanews.com/feed/rss/latest', category: 'Africa' }
    ],
    PODCASTS: [
        { name: 'BBC Focus on Africa', url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss' },
        { name: 'BBC Global News', url: 'https://podcasts.files.bbci.co.uk/p02nrsln.rss' },
        { name: 'NPR News Now', url: 'https://feeds.npr.org/500005/podcast.xml' },
        { name: 'The Bugle', url: 'https://feeds.acast.com/public/shows/the-bugle' }
    ]
};

export default function NewsPage() {
    const navigate = useNavigate();
    const store = useNewsStore();
    const [activeTab, setActiveTab] = useState<'all' | 'africa' | 'podcasts'>('all');
    const [news, setNews] = useState<NewsItem[]>(store.news[activeTab] || []);
    const [loading, setLoading] = useState(!store.news[activeTab]);
    const [searchQuery, setSearchQuery] = useState('');
    const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useAudioStore();

    useEffect(() => {
        setSearchQuery('');
        if (store.news[activeTab]) {
            setNews(store.news[activeTab]);
            if (!store.needsRefresh(activeTab)) {
                setLoading(false);
                return;
            }
        }
        fetchInitialNews();
    }, [activeTab]);

    const fetchInitialNews = async (query: string = '') => {
        if (!query && !store.news[activeTab]) {
            setLoading(true);
        } else if (query) {
            setLoading(true);
        }

        try {
            let feedsToFetch: any[] = [];

            if (query) {
                feedsToFetch = [
                    {
                        name: 'Google Global',
                        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`
                    },
                    {
                        name: 'Google Nigeria',
                        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-NG&gl=NG&ceid=NG:en`
                    },
                    {
                        name: 'Bing News',
                        url: `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`
                    }
                ];
            } else {
                if (activeTab === 'all') {
                    feedsToFetch = FEED_SOURCES.ARTICLES.slice(0, 12);
                } else if (activeTab === 'africa') {
                    feedsToFetch = FEED_SOURCES.ARTICLES.filter(s => s.category === 'Africa' || s.category === 'Nigeria');
                } else if (activeTab === 'podcasts') {
                    feedsToFetch = FEED_SOURCES.PODCASTS;
                }
            }

            const allResults = await Promise.all(
                feedsToFetch.map(async (source) => {
                    const rssUrl = encodeURIComponent(source.url);
                    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
                    const data = await response.json();

                    if (data.status === 'ok') {
                        return data.items.map((item: any) => {
                            let thumbnail = item.thumbnail || item.enclosure?.link;

                            if (!thumbnail || thumbnail.includes('placeholder')) {
                                if (activeTab === 'podcasts') {
                                    thumbnail = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800';
                                } else {
                                    thumbnail = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                                }
                            }

                            return {
                                id: item.guid || item.link,
                                title: item.title,
                                link: item.link,
                                thumbnail,
                                pubDate: new Date(item.pubDate).toLocaleDateString(),
                                description: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
                                source: source.name,
                                type: query ? 'article' : (activeTab === 'podcasts' ? 'podcast' : 'article'),
                                audioUrl: item.enclosure?.type?.includes('audio') ? item.enclosure.link : undefined,
                                author: item.author || source.name
                            };
                        });
                    }
                    return [];
                })
            );

            const flattened = allResults.flat()
                .filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id || t.title === item.title)
                )
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            setNews(flattened);
            if (!query) {
                store.setNews(activeTab, flattened);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) {
                fetchInitialNews(searchQuery);
            } else if (searchQuery.length === 0 && news.length === 0) {
                fetchInitialNews();
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const displayedNews = searchQuery
        ? news
        : news.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.source.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const openInAppBrowser = async (url: string) => {
        if (Capacitor.isNativePlatform()) {
            await Browser.open({ url });
        } else {
            window.open(url, '_blank');
        }
    };

    const handleShare = async (item: NewsItem) => {
        const url = item.link;
        const text = `Check out this news on UniLink: ${item.title}`;

        if (Capacitor.isNativePlatform()) {
            try {
                // @ts-ignore
                await navigator.share({ title: item.title, text, url });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        }
    };

    const toggleAudio = (item: NewsItem) => {
        if (currentTrack?.audioUrl === item.audioUrl) {
            isPlaying ? pauseTrack() : resumeTrack();
        } else {
            playTrack({
                id: item.id,
                title: item.title,
                audioUrl: item.audioUrl!,
                source: item.source,
                thumbnail: item.thumbnail
            });
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-600 dark:text-zinc-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <h1 className="text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight">
                        Campus & Global News
                    </h1>

                    <div className="w-9" />
                </div>

                {/* Search Bar */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
                    <div className="relative group max-w-3xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search news topics, university updates, and events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchInitialNews(searchQuery)}
                            className="w-full h-12 pl-5 pr-28 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-400"
                                >
                                    <ArrowLeft className="w-4 h-4 rotate-45" />
                                </button>
                            )}
                            <button
                                onClick={() => fetchInitialNews(searchQuery)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" />
                                Search
                            </button>
                        </div>
                    </div>

                    {!searchQuery && (
                        <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 self-center">Trending:</span>
                            {['Education', 'Technology', 'Nigeria Business', 'Campus News', 'Science', 'Global Policy'].map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        fetchInitialNews(topic);
                                    }}
                                    className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full hover:border-emerald-500 transition-colors"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Pills */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'Latest Feed', icon: Newspaper },
                        { id: 'africa', label: 'Nigeria & Africa', icon: TrendingUp },
                        { id: 'podcasts', label: 'Podcasts', icon: Mic2 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Container - Full Screen 7XL Width */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {searchQuery && (
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                            Search results for <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{searchQuery}"</span>
                        </h2>
                    </div>
                )}

                {/* Full-Screen News Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 animate-pulse space-y-4">
                                <div className="w-full h-48 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
                                <div className="h-4 w-1/3 bg-slate-100 dark:bg-zinc-800 rounded" />
                                <div className="h-6 w-full bg-slate-100 dark:bg-zinc-800 rounded" />
                                <div className="h-12 w-full bg-slate-100 dark:bg-zinc-800 rounded" />
                            </div>
                        ))
                    ) : displayedNews.length > 0 ? (
                        displayedNews.map((item) => (
                            <article
                                key={item.id}
                                className="group bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    {/* Media Thumbnail */}
                                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {item.type === 'podcast' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <button
                                                    onClick={() => toggleAudio(item)}
                                                    className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
                                                >
                                                    {currentTrack?.audioUrl === item.audioUrl && isPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Play className="w-6 h-6 fill-white translate-x-0.5" />}
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            {item.source}
                                        </div>
                                    </div>

                                    {/* Date & Type */}
                                    <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {item.pubDate}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {item.type === 'podcast' ? 'Podcast' : 'Article'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                        {item.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-auto">
                                    <button
                                        onClick={() => openInAppBrowser(item.link)}
                                        className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        <span>Read Full Article</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => navigate('/app/communities')}
                                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            title="Discuss with classmates"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleShare(item)}
                                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            title="Share article"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 flex flex-col items-center justify-center">
                            <Search className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">No stories found</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">Try searching for a different keyword or selecting another tab.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Source Credit */}
                <div className="mt-16 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Curated from trusted publishers & RSS sources
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                        Feeds update automatically. All rights belong to respective publications.
                    </p>
                </div>
            </main>
        </div>
    );
}
