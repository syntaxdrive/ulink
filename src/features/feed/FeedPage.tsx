import { useState, useEffect, useMemo } from 'react';
import { Search, UserRound, Globe, Zap, Trophy, Users, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CreatePost from './components/CreatePost';
import PostItem from './components/PostItem';
import SuggestedConnections from './components/SuggestedConnections';
import WelcomeMessage from './components/WelcomeMessage';
import EmptyFeedState from './components/EmptyFeedState';
import { FeedLoadingState } from './components/PostSkeleton';
import { useFeed } from './hooks/useFeed';
import { useSponsoredPosts } from '../../hooks/useSponsoredPosts';
import SponsoredPostItem from './components/SponsoredPostItem';
import ProfileCompletionBanner from './components/ProfileCompletionBanner';

// Live activity messages that rotate in the ticker
const ACTIVITY_LINES = [
    '🔥 Someone just liked a trending post',
    '💬 New comment on a popular discussion',
    '🚀 A student shared an exciting opportunity',
    '🎓 New academic resource posted',
    '⚡ Campus challenge is heating up — join now!',
    '🏆 Leaderboard update — check your rank!',
    '📢 New community post in your network',
    '🤝 Someone connected with you on campus',
];

function LiveTicker({ postCount }: { postCount: number }) {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(i => (i + 1) % ACTIVITY_LINES.length);
                setVisible(true);
            }, 300);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl px-3 py-2 overflow-hidden">
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Live</span>
            </div>
            <p
                className={`text-xs text-emerald-800 dark:text-emerald-300 truncate transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
            >
                {ACTIVITY_LINES[idx]}
            </p>
            {postCount > 0 && (
                <span className="flex-shrink-0 ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                    {postCount} posts
                </span>
            )}
        </div>
    );
}

export default function FeedPage() {
    const navigate = useNavigate();
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
    const [peopleResults, setPeopleResults] = useState<any[]>([]);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = () => setActiveMenuPostId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Load some recently active users for sidebar
    useEffect(() => {
        supabase
            .from('profiles')
            .select('id, name, username, avatar_url, role')
            .order('updated_at', { ascending: false })
            .limit(5)
            .then(({ data }) => setActiveUsers(data || []));
    }, []);

    // Server-side Search Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            searchPosts(searchQuery);
            if (searchQuery.trim().length >= 2) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, name, username, avatar_url, headline, university, role, is_verified')
                    .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`)
                    .limit(4);
                setPeopleResults(data || []);
            } else {
                setPeopleResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleMenu = (postId: string) => {
        setActiveMenuPostId(prev => (prev === postId ? null : postId));
    };

    // Hashtag Logic
    const trendingTags = posts.reduce((acc, post) => {
        const tags = (post.content || '').match(/#[a-z0-9_]+/gi) || [];
        tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(trendingTags)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([tag]) => tag);

    // Smart slider positions
    const sliderPositions = useMemo(() => {
        const positions = new Set<number>();
        posts.forEach((post, index) => {
            if (!post.id) return;
            const hash = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const interval = 5 + (hash % 3);
            if ((index + 1) % interval === 0 && index < posts.length - 1) {
                positions.add(index);
            }
        });
        return positions;
    }, [posts]);

    const quickNavItems = [
        { to: '/app/network', icon: Users, label: 'Network', color: 'blue' },
        { to: '/app/communities', icon: Globe, label: 'Communities', color: 'purple' },
        { to: '/app/challenge', icon: Zap, label: 'Challenge', color: 'yellow' },
        { to: '/app/leaderboard', icon: Trophy, label: 'Leaderboard', color: 'orange' },
    ];

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="h-9 bg-stone-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
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
                <div className="lg:col-span-8 space-y-3">

                    {/* Search Bar */}
                    <div className="sticky top-4 z-30 mb-1 px-4 lg:px-0">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-stone-200/60 dark:border-zinc-800/60 rounded-xl text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 shadow-sm transition-all"
                                placeholder="Search posts, people, topics…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Quick Nav Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 px-4 lg:px-0">
                        {quickNavItems.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${isActive
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'
                                        : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400'
                                    }`
                                }
                            >
                                <Icon className="w-3 h-3" />
                                {label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Live Activity Ticker */}
                    {!searchQuery && (
                        <div className="px-4 lg:px-0">
                            <LiveTicker postCount={posts.length} />
                        </div>
                    )}

                    {/* Welcome / Streak Card */}
                    {currentUserProfile && (
                        <div className="px-4 lg:px-0">
                            <WelcomeMessage userName={currentUserProfile.name.split(' ')[0]} />
                        </div>
                    )}

                    {/* Profile Completion Reminder */}
                    {currentUserProfile && (
                        <div className="px-4 lg:px-0">
                            <ProfileCompletionBanner profile={currentUserProfile} />
                        </div>
                    )}

                    {/* Create Post */}
                    {currentUserId && (
                        <div className="mb-1">
                            <CreatePost onCreate={createPost} user={currentUserProfile} />
                        </div>
                    )}

                    {/* People Search Results */}
                    {searchQuery.trim().length >= 2 && peopleResults.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-4 pt-3 pb-1">
                                <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <UserRound className="w-3.5 h-3.5" /> People
                                </p>
                            </div>
                            {peopleResults.map(person => (
                                <button
                                    key={person.id}
                                    onClick={() => navigate(`/app/profile/${person.username || person.id}`)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <img
                                        src={person.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                                        alt={person.name}
                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate">{person.name}</p>
                                        <p className="text-xs text-stone-400 dark:text-zinc-500 truncate">{person.headline || person.university || person.role}</p>
                                    </div>
                                    {person.is_verified && <span className="text-emerald-500 text-xs font-bold">✓ Verified</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Feed Posts */}
                    <div className="space-y-2">
                        {posts.length === 0 ? (
                            searchQuery ? (
                                <div className="text-center py-12 bg-white dark:bg-zinc-900 border-y border-stone-200/80 dark:border-zinc-800 rounded-2xl">
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
                                // Stagger animation delay for the first 8 posts
                                const animDelay = index < 8 ? `${index * 60}ms` : '0ms';

                                return (
                                    <div
                                        key={post.id}
                                        style={{ animationDelay: animDelay, animationFillMode: 'both' }}
                                        className="animate-[feedIn_0.4s_ease_forwards]"
                                    >
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
                                            <div className="my-4 animate-[feedIn_0.5s_ease_forwards]">
                                                <SponsoredPostItem post={sponsoredPost} />
                                            </div>
                                        )}

                                        {/* Suggested Connections */}
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

                {/* Sidebar Column */}
                <div className="hidden lg:block lg:col-span-4 sticky top-4 space-y-4">

                    {/* Who's Active Now */}
                    {activeUsers.length > 0 && (
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-stone-200/50 dark:border-zinc-700/50">
                            <h3 className="font-bold text-sm text-stone-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Active on campus
                            </h3>
                            <div className="space-y-2.5">
                                {activeUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => navigate(`/app/profile/${user.username || user.id}`)}
                                        className="w-full flex items-center gap-3 group hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-xl p-2 -mx-2 transition-colors"
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                        </div>
                                        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                            {user.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending Topics */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-stone-200/50 dark:border-zinc-700/50">
                        <h3 className="font-bold text-sm text-stone-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                            Trending topics
                        </h3>
                        <div className="space-y-1">
                            {sortedTags.length === 0 ? (
                                <p className="text-stone-400 dark:text-zinc-500 text-sm py-2">No trends yet — start a hashtag!</p>
                            ) : (
                                sortedTags.map((tag, i) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="w-full flex items-center justify-between group p-2 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-stone-300 dark:text-zinc-600 w-4 text-right">{i + 1}</span>
                                            <span className="font-semibold text-sm text-stone-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {tag}
                                            </span>
                                        </div>
                                        <span className="text-xs text-stone-400 dark:text-zinc-600 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                                            {trendingTags[tag]}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions CTA */}
                    <div className="relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-stone-200/50 dark:border-zinc-800/50 rounded-2xl p-5 shadow-xl shadow-stone-200/20 dark:shadow-black/20">
                        {/* Highlights */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                            <span className="font-extrabold text-sm text-stone-900 dark:text-zinc-100 uppercase tracking-wider">Campus Challenge</span>
                        </div>
                        <p className="relative text-stone-600 dark:text-zinc-400 text-xs leading-relaxed font-medium mb-4">
                            Earn points, climb the leaderboard, and win prizes. New challenge every week!
                        </p>
                        <NavLink
                            to="/app/challenge"
                            className="relative inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            Join Challenge
                        </NavLink>
                    </div>

                    {/* Footer */}
                    <div className="text-xs text-stone-400 dark:text-zinc-500 px-2 leading-relaxed">
                        &copy; 2025 UniLink Nigeria &bull;{' '}
                        <span className="hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer">Privacy</span> &bull;{' '}
                        <span className="hover:text-stone-600 dark:hover:text-zinc-400 cursor-pointer">Terms</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
