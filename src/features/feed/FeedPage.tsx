import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import CreatePost from './components/CreatePost';
import PostItem from './components/PostItem';
import SuggestedConnections from './components/SuggestedConnections';
import WelcomeMessage from './components/WelcomeMessage';
import EmptyFeedState from './components/EmptyFeedState';
import { FeedLoadingState } from './components/PostSkeleton';
import { useFeed } from './hooks/useFeed';
import { useSponsoredPosts } from '../../hooks/useSponsoredPosts';
import SponsoredPostItem from './components/SponsoredPostItem';

export default function FeedPage() {
    const {
        posts,
        loading,
        currentUserId,
        createPost,
        deletePost,
        toggleLike,
        toggleRepost,
        toggleComments,
        activeCommentPostId,
        comments,
        loadingComments,
        postComment,
        deleteComment,
        reportPost,
        votePoll,
        searchPosts,
        currentUserProfile
    } = useFeed();

    const { posts: sponsoredPosts } = useSponsoredPosts();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = () => setActiveMenuPostId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Server-side Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            searchPosts(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleMenu = (postId: string) => {
        setActiveMenuPostId(prev => (prev === postId ? null : postId));
    };

    // Hashtag Logic (calculated from currently loaded posts for now)
    const trendingTags = posts.reduce((acc, post) => {
        const tags = (post.content || '').match(/#[a-z0-9_]+/gi) || [];
        tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(trendingTags)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

    // Calculate which posts should show the slider after them
    // Smart algorithm: Show slider every 5-7 posts (randomized but deterministic)
    const sliderPositions = useMemo(() => {
        const positions = new Set<number>();
        posts.forEach((post, index) => {
            // Create deterministic but varied intervals (5-7 posts)
            if (!post.id) return;
            const hash = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const interval = 5 + (hash % 3); // Results in 5, 6, or 7
            if ((index + 1) % interval === 0 && index < posts.length - 1) {
                positions.add(index);
            }
        });
        return positions;
    }, [posts]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="sticky top-4 z-30">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl text-stone-900 placeholder:text-stone-400 shadow-sm"
                                    placeholder="Search posts or people..."
                                    disabled
                                />
                            </div>
                        </div>
                        <FeedLoadingState />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Main Feed Column */}
                <div className="lg:col-span-8 space-y-0">

                    {/* Search Bar */}
                    <div className="sticky top-4 z-30 mb-4 px-4 lg:px-0">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400 dark:text-zinc-600" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-2.5 bg-stone-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-stone-200/50 dark:border-zinc-800/50 rounded-lg text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-500 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                placeholder="Search posts (content)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Welcome Message */}
                    {currentUserProfile && (
                        <div className="px-4 lg:px-0 mb-4">
                            <WelcomeMessage userName={currentUserProfile.name.split(' ')[0]} />
                        </div>
                    )}

                    {/* Create Post */}
                    <div className="mb-2">
                        <CreatePost onCreate={createPost} user={currentUserProfile} />
                    </div>

                    {/* Feed */}
                    <div className="space-y-2">
                        {posts.length === 0 ? (
                            searchQuery ? (
                                <div className="text-center py-12 bg-white dark:bg-zinc-900 border-y border-stone-200/80 dark:border-zinc-800">
                                    <p className="text-stone-500 dark:text-zinc-500 mb-2">No posts found for "{searchQuery}"</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-emerald-600 dark:text-emerald-500 font-medium hover:underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            ) : (
                                <EmptyFeedState onCreatePost={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
                            )
                        ) : (
                            posts.map((post, index) => {
                                const showSponsored = (index + 1) % 8 === 0 && sponsoredPosts.length > 0;
                                const sponsoredPost = showSponsored ? sponsoredPosts[Math.floor(index / 8) % sponsoredPosts.length] : null;

                                return (
                                    <div key={post.id}>
                                        <PostItem
                                            post={post}
                                            currentUserId={currentUserId}
                                            isActiveCommentSection={activeCommentPostId === post.id}
                                            isActiveMenu={activeMenuPostId === post.id}
                                            comments={comments[post.id] || []}
                                            loadingComments={loadingComments && activeCommentPostId === post.id}
                                            onDelete={deletePost}
                                            onLike={toggleLike}
                                            onRepost={toggleRepost}
                                            onToggleComments={toggleComments}
                                            onToggleMenu={toggleMenu}
                                            onPostComment={postComment}
                                            onSearchTag={setSearchQuery}
                                            onReport={reportPost}
                                            onDeleteComment={deleteComment}
                                            onVotePoll={votePoll}
                                        />

                                        {/* Sponsored Post Injection */}
                                        {sponsoredPost && (
                                            <div className="my-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <SponsoredPostItem post={sponsoredPost} />
                                            </div>
                                        )}

                                        {/* Conditionally render SuggestedConnections */}
                                        {!searchQuery && sliderPositions.has(index) && !showSponsored && (
                                            <div className="my-4">
                                                <SuggestedConnections />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Column (Trending) */}
                <div className="hidden lg:block lg:col-span-4 sticky top-4 space-y-6">

                    {/* Trending Card */}
                    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-200/50 dark:border-zinc-700/50">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                            <span className="text-xl font-display text-emerald-600 dark:text-emerald-500">#</span> Trending Topics
                        </h3>
                        <div className="space-y-3">
                            {sortedTags.length === 0 ? (
                                <p className="text-stone-400 dark:text-zinc-500 text-sm">No trends yet.</p>
                            ) : (
                                sortedTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="w-full flex items-center justify-between group p-2 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                        <span className="font-medium text-stone-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                            {tag}
                                        </span>
                                        <span className="text-xs font-bold text-stone-300 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded-full group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                            {trendingTags[tag]} posts
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer / Links */}
                    <div className="text-xs text-stone-400 dark:text-zinc-500 px-4 leading-relaxed">
                        &copy; 2024 UniLink Inc. <br />
                        <span className="hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer">Privacy</span> &bull;
                        <span className="hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer ml-1">Terms</span> &bull;
                        <span className="hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer ml-1">Cookies</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
