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
    Info,
    Share2,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../../stores/useAudioStore';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

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
        { name: 'Nairametrics', url: 'https://nairametrics.com/feed/', category: 'Nigeria', icon: '📈' },
        { name: 'The Cable', url: 'https://www.thecable.ng/feed', category: 'Nigeria', icon: '📡' },
        { name: 'Daily Post', url: 'https://dailypost.ng/feed/', category: 'Nigeria', icon: '🗞️' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech', icon: '💻' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech', icon: '⚡' },
        { name: 'Punch News', url: 'https://rss.punchng.com/v1/category/latest', category: 'Nigeria', icon: '🗞️' },
        { name: 'Vanguard', url: 'https://www.vanguardngr.com/feed/', category: 'Nigeria', icon: '🇳🇬' },
        { name: 'Premium Times', url: 'https://www.premiumtimesng.com/feed', category: 'Nigeria', icon: '🇳🇬' },
        { name: 'Pulse Nigeria', url: 'https://pulse.ng/news/rss', category: 'Nigeria', icon: '🇳🇬' },
        { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-topics=world-news&post_type=best', category: 'World', icon: '🌐' },
        { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'World', icon: '🗽' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'World', icon: '🌏' },
        { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/rss/fulltext', category: 'Science', icon: '🔬' },
        { name: 'The Economist', url: 'https://www.economist.com/finance-and-economics/rss.xml', category: 'Economics', icon: '📈' },
        { name: 'Guardian Students', url: 'https://www.theguardian.com/education/students/rss', category: 'Campus', icon: '🎓' },
        { name: 'ASUU News', url: 'https://asuunigeria.org/feed/', category: 'Campus', icon: '🏫' },
        { name: 'Linda Ikeji', url: 'https://www.lindaikejisblog.com/feed', category: 'Life', icon: '💅' },
        { name: 'Vision FM', url: 'https://visionfm.ng/rss/latest-posts', category: 'Nigeria', icon: '📻' },
        { name: 'All Africa', url: 'https://allafrica.com/tools/headlines/rss', category: 'Africa', icon: '🌍' },
        { name: 'Africa News', url: 'https://www.africanews.com/feed/rss/latest', category: 'Africa', icon: '🌍' }
    ],
    PODCASTS: [
        { name: 'BBC Focus on Africa', url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss', icon: '🎙️' },
        { name: 'BBC Global News', url: 'https://podcasts.files.bbci.co.uk/p02nrsln.rss', icon: '🌐' },
        { name: 'NPR News Now', url: 'https://feeds.npr.org/500005/podcast.xml', icon: '🎧' },
        { name: 'The Bugle', url: 'https://feeds.acast.com/public/shows/the-bugle', icon: '🎺' }
    ]
};

export default function NewsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'africa' | 'podcasts'>('all');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = useAudioStore();

    useEffect(() => {
        setSearchQuery('');
        fetchInitialNews();
    }, [activeTab]);

    const fetchInitialNews = async (query: string = '') => {
        setLoading(true);
        try {
            let feedsToFetch: any[] = [];

            if (query) {
                // Multi-Source Global Search for maximum robustness
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
                    feedsToFetch = FEED_SOURCES.ARTICLES.slice(0, 10);
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
                                description: item.description?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
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
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) {
                fetchInitialNews(searchQuery);
            } else if (searchQuery.length === 0) {
                fetchInitialNews();
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const displayedNews = searchQuery
        ? news // Don't filter results that the API already searched for us
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
        const title = item.title;
        const text = `Check out this news on UniLink: ${item.title}`;

        if (Capacitor.isNativePlatform()) {
            // Use native share if available
            try {
                // @ts-ignore
                await navigator.share({ title, text, url });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            // Fallback for web
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
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 pb-24">
            {/* Glass Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-zinc-400" />
                    </button>

                    <h1 className="text-xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">
                        Global <span className="text-emerald-600">Feed</span>
                    </h1>

                    <div className="w-10"></div> {/* Spacer for symmetry */}
                </div>

                {/* Robust Google-like Search Bar */}
                <div className="max-w-7xl mx-auto px-4 pb-4">
                    <div className="relative group max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search news, topics, and events worldwide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchInitialNews(searchQuery)}
                            className="w-full h-14 pl-6 pr-32 bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-lg shadow-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full transition-colors text-slate-400"
                                >
                                    <ArrowLeft className="w-4 h-4 rotate-45" />
                                </button>
                            )}
                            <button
                                onClick={() => fetchInitialNews(searchQuery)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>
                        </div>
                    </div>

                    {!searchQuery && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 self-center">Trending:</span>
                            {['Bitcoin', 'Tech Layoffs', 'Nigeria Elections', 'AI Revolution', 'Champions League', 'Grammys', 'Inflation', 'Climate Change'].map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        fetchInitialNews(topic);
                                    }}
                                    className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3 py-1 rounded-full hover:border-emerald-500 transition-colors"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Pills */}
                <div className="max-w-7xl mx-auto px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'Latest', icon: Newspaper },
                        { id: 'africa', label: 'Africa', icon: TrendingUp },
                        { id: 'podcasts', label: 'Podcasts', icon: Mic2 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:border-emerald-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {searchQuery && (
                    <div className="mb-8 pl-1">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                            Search results for: <span className="text-emerald-600 dark:text-emerald-400">"{searchQuery}"</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Found highly relevant stories from global sources</p>
                    </div>
                )}

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                                <div className="w-full md:w-48 h-48 bg-slate-100 dark:bg-zinc-800 rounded-3xl shrink-0" />
                                <div className="flex-1 space-y-4">
                                    <div className="h-4 w-1/4 bg-slate-100 dark:bg-zinc-800 rounded" />
                                    <div className="h-8 w-full bg-slate-100 dark:bg-zinc-800 rounded" />
                                    <div className="h-16 w-full bg-slate-100 dark:bg-zinc-800 rounded" />
                                </div>
                            </div>
                        ))
                    ) : displayedNews.length > 0 ? (
                        displayedNews.map((item) => (
                            <article
                                key={item.id}
                                className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-5 md:p-6 border border-slate-100 dark:border-zinc-800/50 hover:border-emerald-300 dark:hover:border-emerald-900/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col md:flex-row gap-6 relative"
                            >
                                {/* Media Container */}
                                <div className="relative w-full md:w-56 shrink-0 aspect-[16/10] md:aspect-square rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {item.type === 'podcast' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <button
                                                onClick={() => toggleAudio(item)}
                                                className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
                                            >
                                                {currentTrack?.audioUrl === item.audioUrl && isPlaying ? <Volume2 className="w-7 h-7 animate-pulse" /> : <Play className="w-7 h-7 fill-white translate-x-0.5" />}
                                            </button>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {item.source}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {item.pubDate}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {item.type === 'podcast' ? 'Podcast' : 'Article'}
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {item.title}
                                    </h2>

                                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 font-medium">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-3 mt-auto">
                                        <button
                                            onClick={() => openInAppBrowser(item.link)}
                                            className="inline-flex items-center gap-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold px-5 py-3 rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 group/btn"
                                        >
                                            Read More
                                            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                        </button>

                                        <button
                                            onClick={() => navigate('/app/communities')}
                                            className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-xs font-bold px-5 py-3 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Discuss
                                        </button>

                                        <button
                                            onClick={() => handleShare(item)}
                                            className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-2xl hover:text-emerald-600 transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>

                                        <button className="p-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-2xl hover:text-emerald-600 transition-colors">
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Custom Audio Player UI if playing */}
                            </article>
                        ))
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center gap-6 max-w-sm mx-auto">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-400">
                                <Search className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">No matches found</h3>
                                <p className="text-sm text-slate-500 font-medium">We couldn't find any news for <span className="text-emerald-600">"{searchQuery}"</span></p>
                            </div>
                            <ul className="text-left text-xs text-slate-500 space-y-2 font-medium bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl w-full">
                                <li className="flex gap-2"><span>•</span> Check your spelling</li>
                                <li className="flex gap-2"><span>•</span> Use more general keywords</li>
                                <li className="flex gap-2"><span>•</span> Try searching for a specific topic</li>
                            </ul>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Attribution */}
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                        Powered by Africanews, BBC Africa, Pulse & more
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                        Feeds are updated in real-time. Audio streams may require stable internet. Content belong to their respective publishers.
                    </p>
                </div>
            </main>
        </div>
    );
}
