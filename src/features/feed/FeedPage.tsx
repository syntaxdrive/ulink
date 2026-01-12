import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Post, Comment } from '../../types';
import { Loader2, Send, Image as ImageIcon, Heart, MessageCircle, Share2, MoreHorizontal, Smile, Search, BadgeCheck, X } from 'lucide-react';

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Comment state
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        fetchPosts();

        // Fetch current user profile for optimistic updates
        const fetchMe = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setCurrentUserProfile(data);
            }
        };
        fetchMe();

        const channel = supabase
            .channel('public:posts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                (payload) => {
                    fetchSinglePost(payload.new.id);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'likes' },
                (payload: any) => {
                    const postId = payload.new?.post_id || payload.old?.post_id;
                    if (postId) fetchSinglePost(postId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchPosts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (*),
                likes (user_id),
                comments (id)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            const formattedPosts = data.map((post: any) => ({
                ...post,
                likes_count: post.likes ? post.likes.length : 0,
                comments_count: post.comments ? post.comments.length : 0,
                user_has_liked: post.likes ? post.likes.some((like: any) => like.user_id === user.id) : false
            }));
            setPosts(formattedPosts);
        }
        setLoading(false);
    };

    const fetchSinglePost = async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (*),
                likes (user_id),
                comments (id)
            `)
            .eq('id', postId)
            .single();

        if (data) {
            const newPost = {
                ...data,
                likes_count: data.likes ? data.likes.length : 0,
                comments_count: data.comments ? data.comments.length : 0,
                user_has_liked: user ? data.likes.some((like: any) => like.user_id === user.id) : false
            };
            setPosts((prev) => {
                if (prev.some(p => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
            });
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !imageFile) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let imageUrl = null;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `posts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                alert('Failed to upload image.');
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            imageUrl = publicUrl;
        }

        // Optimistic Post
        const tempId = `temp-${Date.now()}`;
        const optimisticPost: any = {
            id: tempId,
            content: content,
            image_url: imageUrl || (imagePreview), // Use preview for immediate feedback
            created_at: new Date().toISOString(),
            author_id: user.id,
            likes_count: 0,
            comments_count: 0,
            user_has_liked: false,
            profiles: currentUserProfile || {
                id: user.id,
                name: 'You',
                role: 'user',
                avatar_url: null
            }
        };

        setPosts(prev => [optimisticPost, ...prev]);
        setContent('');
        clearImage();

        const { data, error } = await supabase
            .from('posts')
            .insert({
                author_id: user.id,
                content: optimisticPost.content,
                image_url: imageUrl
            })
            .select(`
                *,
                profiles:author_id (*),
                likes (user_id),
                comments (id)
            `)
            .single();

        if (error) {
            console.error('Error creating post:', error);
            setPosts(prev => prev.filter(p => p.id !== tempId));
            alert('Failed to post. Please try again.');
            setContent(optimisticPost.content);
        } else if (data) {
            // Replace optimistic post with real one
            const realPost = {
                ...data,
                likes_count: 0,
                comments_count: 0,
                user_has_liked: false,
                profiles: optimisticPost.profiles
            };
            setPosts(prev => prev.map(p => p.id === tempId ? realPost : p));
        }
    };

    const toggleLike = async (post: Post) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic Update
        const isLiked = post.user_has_liked;
        const newLikeCount = isLiked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1;

        setPosts(prev => prev.map(p =>
            p.id === post.id
                ? { ...p, user_has_liked: !isLiked, likes_count: newLikeCount }
                : p
        ));

        if (isLiked) {
            await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
        } else {
            await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
        }
    };

    const toggleComments = async (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
            fetchComments(postId);
        }
    };

    const fetchComments = async (postId: string) => {
        setLoadingComments(true);
        const { data } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:author_id (*)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (data) {
            setComments(prev => ({ ...prev, [postId]: data }));
        }
        setLoadingComments(false);
    };

    const handlePostComment = async (postId: string) => {
        if (!commentText.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticComment: any = {
            id: tempId,
            post_id: postId,
            author_id: user.id,
            content: commentText,
            created_at: new Date().toISOString(),
            profiles: currentUserProfile || {
                id: user.id,
                name: 'You',
                role: 'user',
                avatar_url: null
            }
        };

        // Optimistic Update
        setComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] || []), optimisticComment]
        }));
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        ));
        setCommentText('');

        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_id: user.id,
                content: optimisticComment.content
            })
            .select(`*, profiles:author_id (*)`)
            .single();

        if (error) {
            console.error('Error posting comment:', error);
            // Revert
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId].filter(c => c.id !== tempId)
            }));
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comments_count: (p.comments_count || 0) - 1 } : p
            ));
            alert('Failed to comment. Please try again.');
            setCommentText(optimisticComment.content);
        } else if (data) {
            // Replace temp with real
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId].map(c => c.id === tempId ? data : c)
            }));
        }
    };

    const copyLink = (postId: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        alert('Link copied to clipboard!');
    };

    // Filter posts
    const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const renderContent = (text: string) => {
        return text.split(/(#[a-z0-9_]+)/gi).map((part, i) => {
            if (part.match(/^#[a-z0-9_]+$/i)) {
                return (
                    <span
                        key={i}
                        className="text-emerald-600 font-bold cursor-pointer hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery(part);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

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

                    {/* Create Post Card */}
                    <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <textarea
                                className="w-full bg-stone-50/50 rounded-2xl p-4 text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all resize-none text-lg font-medium"
                                placeholder="What's on your mind? #Hashtags"
                                rows={2}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative inline-block mt-2">
                                    <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover border border-stone-200" />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute -top-2 -right-2 bg-stone-900 text-white rounded-full p-1 shadow-md hover:bg-stone-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center px-1">
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <button type="button" onClick={handleImageClick} className={`p-2 rounded-xl transition-all ${imageFile ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!content.trim() && !imageFile}
                                    className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {(searchQuery ? filteredPosts : posts).map((post) => (
                            <article key={post.id} className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-stone-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <Link to={`/app/profile/${post.author_id}`} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 ring-2 ring-white shadow-sm">
                                            <img
                                                src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}&background=random`}
                                                alt={post.profiles?.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 leading-tight flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                                                {post.profiles?.name}
                                                {post.profiles?.is_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />}
                                            </h3>
                                            <p className="text-xs font-medium text-stone-400">
                                                {post.profiles?.role === 'org' ? 'Organization' : post.profiles?.university}
                                                {' • '}
                                                {formatTimeAgo(post.created_at)}
                                            </p>
                                        </div>
                                    </Link>
                                    <button className="text-stone-300 hover:text-stone-600 transition-colors p-2 rounded-xl hover:bg-stone-50">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content with Hashtags */}
                                <div className="text-stone-600 leading-relaxed mb-6 font-medium text-[15px] whitespace-pre-wrap">
                                    {renderContent(post.content)}
                                </div>

                                {/* Post Image */}
                                {post.image_url && (
                                    <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                                        <img src={post.image_url} alt="Post content" className="w-full max-h-[500px] object-cover" />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-6 pt-4 border-t border-stone-50">
                                    <button
                                        onClick={() => toggleLike(post)}
                                        className={`flex items-center gap-2 group transition-all ${post.user_has_liked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                                    >
                                        <div className={`p-2 rounded-xl group-hover:bg-red-50 transition-colors ${post.user_has_liked ? 'bg-red-50' : ''}`}>
                                            <Heart className={`w-5 h-5 transition-transform group-active:scale-75 ${post.user_has_liked ? 'fill-current' : ''}`} />
                                        </div>
                                        <span className={`text-sm font-semibold ${post.user_has_liked ? 'text-red-600' : 'hidden group-hover:block transition-all'}`}>
                                            {post.likes_count || 0}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center gap-2 group text-stone-400 hover:text-blue-500 transition-all"
                                    >
                                        <div className="p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold hidden group-hover:block transition-all">
                                            {post.comments_count || 0}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => copyLink(post.id)}
                                        className="flex items-center gap-2 group text-stone-400 hover:text-emerald-500 transition-all ml-auto"
                                    >
                                        <div className="p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPostId === post.id && (
                                    <div className="mt-6 pt-6 border-t border-dashed border-stone-100 animate-in slide-in-from-top-2">
                                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {loadingComments ? (
                                                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-stone-300" /></div>
                                            ) : (
                                                (comments[post.id] || []).length === 0 ? (
                                                    <p className="text-center text-xs text-stone-400 py-2">No comments yet. Be the first!</p>
                                                ) : (
                                                    (comments[post.id] || []).map(comment => (
                                                        <div key={comment.id} className="flex gap-3 text-sm">
                                                            <img src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=random`} className="w-8 h-8 rounded-full bg-stone-100" />
                                                            <div className="bg-stone-50 rounded-2xl rounded-tl-sm p-3 px-4 flex-1">
                                                                <p className="font-bold text-stone-900 text-xs mb-0.5">{comment.profiles?.name}</p>
                                                                <p className="text-stone-600">{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                            )}
                                        </div>

                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                                            />
                                            <button
                                                onClick={() => handlePostComment(post.id)}
                                                disabled={!commentText.trim()}
                                                className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
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
