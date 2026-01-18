import { useState, useEffect, useRef } from 'react';
import { Loader2, GraduationCap, ChevronDown, Search, X } from 'lucide-react';
import { fetchEducationalVideos, formatDuration, formatViewCount, type YouTubeVideo, CATEGORIES, type Category } from '../../services/youtube';
import { detectVideoEmbed } from '../../utils/videoEmbed';
import VideoEmbed from '../../components/VideoEmbed';
import { useUIStore } from '../../stores/useUIStore';

export default function LearnPage() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>();
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setImmersive } = useUIStore();

    // Auto-hide UI Logic
    useEffect(() => {
        setImmersive(false);
        let timer: ReturnType<typeof setTimeout>;

        const hideUI = () => setImmersive(true);
        const showUI = () => {
            setImmersive(false);
            clearTimeout(timer);
            timer = setTimeout(hideUI, 3500); // 3.5s delay
        };

        showUI();

        const container = containerRef.current;
        if (container) container.addEventListener('scroll', showUI);
        window.addEventListener('click', showUI);
        window.addEventListener('keydown', showUI);

        // Listen for touches too
        window.addEventListener('touchstart', showUI);

        return () => {
            clearTimeout(timer);
            setImmersive(false);
            if (container) container.removeEventListener('scroll', showUI);
            window.removeEventListener('click', showUI);
            window.removeEventListener('keydown', showUI);
            window.removeEventListener('touchstart', showUI);
        };
    }, []);

    // Fetch initial videos when category or search changes
    useEffect(() => {
        loadVideos();
    }, [selectedCategory, activeSearch]);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const { videos: newVideos, nextPageToken: token } = await fetchEducationalVideos(
                selectedCategory,
                undefined,
                20,
                activeSearch || undefined
            );
            setVideos(newVideos);
            setNextPageToken(token);
            setCurrentIndex(0); // Reset scroll position
            scrollToIndex(0);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreVideos = async () => {
        if (loadingMore || !nextPageToken) return;

        try {
            setLoadingMore(true);
            const { videos: newVideos, nextPageToken: token } = await fetchEducationalVideos(
                selectedCategory,
                nextPageToken,
                20,
                activeSearch || undefined
            );
            setVideos(prev => [...prev, ...newVideos]);
            setNextPageToken(token);
        } catch (error) {
            console.error('Error loading more videos:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Load more when near the end
    useEffect(() => {
        if (currentIndex >= videos.length - 3) {
            loadMoreVideos();
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                scrollToNext();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                scrollToPrevious();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, videos.length]);

    const scrollToNext = () => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex(prev => prev + 1);
            scrollToIndex(currentIndex + 1);
        }
    };

    const scrollToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            scrollToIndex(currentIndex - 1);
        }
    };

    const scrollToIndex = (index: number) => {
        const element = document.getElementById(`video-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Intersection Observer to track current video
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        setCurrentIndex(index);
                    }
                });
            },
            {
                threshold: [0.5],
                rootMargin: '0px'
            }
        );

        const videoElements = document.querySelectorAll('[data-video-item]');
        videoElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [videos]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white text-lg">Loading educational content...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        >
            {/* Header with Categories */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-4 pb-8 pointer-events-none">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="flex items-center justify-between text-white mb-4 px-4 pointer-events-auto">
                        {!isSearchOpen ? (
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-6 h-6" />
                                <h1 className="text-xl font-bold">Learn</h1>
                            </div>
                        ) : (
                            <div className="flex-1 mr-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setActiveSearch(searchQuery);
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                    placeholder="Search..."
                                    className="w-full bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (isSearchOpen && searchQuery) {
                                    // Search confirmed via icon click
                                    setActiveSearch(searchQuery);
                                    setIsSearchOpen(false);
                                } else {
                                    setIsSearchOpen(!isSearchOpen);
                                }
                            }}
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Category Chips */}
                    <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar pointer-events-auto">
                        {(Object.keys(CATEGORIES) as Category[]).map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setActiveSearch(''); // Clear search when picking category
                                    setSearchQuery('');
                                }}
                                className={`
                                px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                ${selectedCategory === category
                                        ? 'bg-white text-black scale-105'
                                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}
                            `}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Hint */}
            {currentIndex === 0 && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 animate-bounce">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <ChevronDown className="w-6 h-6 text-white" />
                    </div>
                </div>
            )}

            {/* Videos */}
            {videos.map((video, index) => {
                const videoEmbed = detectVideoEmbed(video.videoUrl);

                return (
                    <div
                        key={video.id}
                        id={`video-${index}`}
                        data-index={index}
                        data-video-item
                        className="h-[100dvh] w-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden"
                    >
                        {/* Video Player */}
                        <div className="w-full h-full scale-[1.25] relative">
                            {videoEmbed && (
                                <VideoEmbed
                                    embed={videoEmbed}
                                    originalUrl={video.videoUrl}
                                    variant="full"
                                    onPlay={() => setImmersive(true)}
                                    onPause={() => setImmersive(false)}
                                    onEnded={() => setImmersive(false)}
                                    defaultMuted={false}
                                />
                            )}

                            {/* Branding Blockers */}
                            <div className="absolute bottom-0 right-0 w-32 h-20 bg-black/80 backdrop-blur-xl rounded-tl-3xl pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none" />
                        </div>

                        {/* Video Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pb-24 pointer-events-none">
                            <div className="w-full pointer-events-auto">
                                <h2 className="text-white text-xl font-bold mb-2 line-clamp-2">
                                    {video.title}
                                </h2>
                                <div className="flex items-center gap-4 text-white/80 text-sm">
                                    <span className="font-medium">{video.channelTitle}</span>
                                    <span>•</span>
                                    <span>{formatViewCount(video.viewCount)}</span>
                                    <span>•</span>
                                    <span>{formatDuration(video.duration)}</span>
                                </div>
                            </div>
                        </div>


                    </div>
                );
            })}

            {/* Loading More */}
            {loadingMore && (
                <div className="h-screen snap-start snap-always flex items-center justify-center bg-black">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                        <p className="text-white text-lg">Loading more videos...</p>
                    </div>
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
