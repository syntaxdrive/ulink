import { useEffect, useState } from 'react';
import { ExternalLink, Flame, Newspaper } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
    description: string;
}

export default function NewsSlider() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('Tech');

    const CATEGORIES = [
        { name: 'Tech', url: 'https://techcrunch.com/feed/' },
        { name: 'Economics', url: 'https://www.economist.com/finance-and-economics/rss.xml' }, // The Economist Finance & Economics
        { name: 'Engineering', url: 'https://spectrum.ieee.org/feeds/feed.rss' }, // IEEE Spectrum
        { name: 'Campus', url: 'https://www.theguardian.com/education/students/rss' } // The Guardian Students
    ];

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                // Find the selected feed URL
                const selectedFeed = CATEGORIES.find(c => c.name === activeCategory)?.url || CATEGORIES[0].url;
                // We use rss2json to bypass CORS and parse XML easily
                const feedUrl = encodeURIComponent(selectedFeed);
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}&api_key=`);
                const data = await response.json();

                if (data.status === 'ok') {
                    // Extract first 5 real articles with images
                    const validItems = data.items
                        .filter((item: any) => item.title && item.link) // Basic check
                        .slice(0, 10);

                    // Mapped to our interface
                    const items: NewsItem[] = validItems.map((item: any) => {
                        // Attempt to extract an image from description or enclosure
                        let image = item.thumbnail || item.enclosure?.link;
                        if (!image) {
                            const imgMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
                            if (imgMatch) image = imgMatch[1];
                        }

                        // Fallback image
                        if (!image) {
                            image = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                        }

                        // Clean HTML tags from description
                        let cleanDesc = item.description?.replace(/<[^>]*>?/gm, '').trim() || '';
                        if (cleanDesc.length > 80) cleanDesc = cleanDesc.substring(0, 80) + '...';

                        return {
                            title: item.title,
                            link: item.link,
                            thumbnail: image,
                            pubDate: new Date(item.pubDate).toLocaleDateString(),
                            description: cleanDesc
                        };
                    });

                    setNews(items.slice(0, 6)); // Top 6
                }
            } catch (error) {
                console.error('Failed to fetch news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeCategory]);

    if (loading) {
        return (
            <div className="w-full overflow-hidden px-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Newspaper className="w-5 h-5 text-stone-400" />
                    <h3 className="font-bold text-stone-500">Tech & Campus News</h3>
                </div>
                <div className="flex gap-4 overflow-x-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[280px] h-36 bg-stone-100 dark:bg-zinc-800 rounded-2xl animate-pulse flex-shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-4 group relative">
            <div className="px-4 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
                        <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-[15px] text-stone-800 dark:text-zinc-200">
                        Top Stories
                    </h3>
                </div>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    Curated
                </span>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mb-3 pb-1">
                {CATEGORIES.map(category => (
                    <button
                        key={category.name}
                        onClick={() => setActiveCategory(category.name)}
                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${activeCategory === category.name
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-emerald-300'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex gap-4 overflow-x-hidden px-4 pb-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[260px] md:min-w-[300px] h-48 bg-stone-100 dark:bg-zinc-800 rounded-2xl animate-pulse flex-shrink-0" />
                    ))}
                </div>
            ) : news.length === 0 ? (
                <div className="px-4 pb-2 text-sm text-stone-500 text-center">No news found for this category.</div>
            ) : (
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2 snap-x snap-mandatory">
                    {news.map((item, id) => (
                        <a
                            key={id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative min-w-[260px] max-w-[260px] md:min-w-[300px] md:max-w-[300px] h-48 rounded-2xl overflow-hidden snap-center flex-shrink-0 flex flex-col justify-end group/card text-left transition-transform active:scale-95 border border-stone-200/50 dark:border-zinc-800/50 shadow-sm"
                        >
                            {/* Background Image */}
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            {/* Content */}
                            <div className="relative z-10 p-4">
                                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-1.5 block">
                                    {item.pubDate}
                                </span>
                                <h4 className="text-white font-bold text-sm leading-tight mb-1.5 line-clamp-2 shadow-black drop-shadow-md">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium opacity-80 group-hover/card:text-emerald-300 transition-colors">
                                    Read article <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>
                    ))}

                    {/* spacer for end padding in flex layout */}
                    <div className="min-w-[1px] flex-shrink-0" />
                </div>
            )}
        </div>
    );
}
