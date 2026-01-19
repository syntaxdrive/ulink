import { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import CreatePost from './components/CreatePost';
import PostItem from './components/PostItem';
import { useFeed } from './hooks/useFeed';

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
        currentUserProfile
    } = useFeed();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = () => setActiveMenuPostId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const toggleMenu = (postId: string) => {
        setActiveMenuPostId(prev => (prev === postId ? null : postId));
    };

    // Filter posts
    const isHashtagSearch = searchQuery.startsWith('#');
    const filteredPosts = posts.filter(post => {
        if (isHashtagSearch) {
            // Strict hashtag match
            const regex = new RegExp(`${searchQuery}\\b`, 'i');
            return regex.test(post.content);
        }
        return (
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }).sort((a, b) => {
        if (isHashtagSearch) {
            // Engagement First Sorting for Hashtags
            return (b.likes_count || 0) - (a.likes_count || 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0; // Default order (chronological, handled by hook)
    });

    // Hashtag Logic
    const trendingTags = posts.reduce((acc, post) => {
        const tags = post.content.match(/#[a-z0-9_]+/gi) || [];
        tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(trendingTags)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Feed Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Search Bar */}
                    <div className="sticky top-4 z-30">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 shadow-sm transition-all"
                                placeholder="Search posts or people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Create Post */}
                    <CreatePost onCreate={createPost} user={currentUserProfile} />

                    {/* Feed */}
                    <div className="space-y-6">
                        {(searchQuery ? filteredPosts : posts).map((post) => (
                            <PostItem
                                key={post.id}
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
                        ))}
                    </div>
                </div>

                {/* Sidebar Column (Trending) */}
                <div className="hidden lg:block lg:col-span-4 sticky top-4 space-y-6">

                    {/* Trending Card */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-stone-200/50">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl font-display text-emerald-600">#</span> Trending Topics
                        </h3>
                        <div className="space-y-3">
                            {sortedTags.length === 0 ? (
                                <p className="text-stone-400 text-sm">No trends yet.</p>
                            ) : (
                                sortedTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="w-full flex items-center justify-between group p-2 hover:bg-stone-50 rounded-xl transition-colors"
                                    >
                                        <span className="font-medium text-stone-600 group-hover:text-emerald-600 transition-colors">
                                            {tag}
                                        </span>
                                        <span className="text-xs font-bold text-stone-300 bg-stone-100 px-2 py-1 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                            {trendingTags[tag]} posts
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer / Links */}
                    <div className="text-xs text-stone-400 px-4 leading-relaxed">
                        &copy; 2024 UniLink Inc. <br />
                        <span className="hover:text-stone-600 cursor-pointer">Privacy</span> &bull;
                        <span className="hover:text-stone-600 cursor-pointer ml-1">Terms</span> &bull;
                        <span className="hover:text-stone-600 cursor-pointer ml-1">Cookies</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
