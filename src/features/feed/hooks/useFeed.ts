import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Post, Comment } from '../../../types';
import { useFeedStore } from '../../../stores/useFeedStore';

export function useFeed() {
    // 1. Use Global Store
    const { posts, setPosts, addPost, updatePost, removePost, needsRefresh } = useFeedStore();

    const [loading, setLoading] = useState(true);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Comment State (Still local as it's ephemeral UI state)
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                // Background fetch profile
                supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
                    if (data) setCurrentUserProfile(data);
                });
            }

            // 80/20 Rule: Check if we need to fetch
            if (needsRefresh() || posts.length === 0) {
                await fetchPosts(user?.id);
            } else {
                setLoading(false); // Use cached data
            }
        };
        init();

        // Realtime Subscription
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                fetchSinglePost(payload.new.id);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
                removePost(payload.old.id);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                if (postId) fetchSinglePost(postId);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload: any) => {
                const postId = payload.new?.post_id || payload.old?.post_id;
                if (postId) fetchSinglePost(postId);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // Empty dependency array = mount once

    const fetchPosts = async (userId?: string) => {
        setLoading(true);

        const { data, error } = await supabase
            .from('posts')
            .select(`
            *,
            profiles:author_id (*),
            likes (user_id),
            comments (id)
        `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // VIP Users List
            const VIP_EMAILS = ['oyasordaniel@gmail.com', 'akeledivine1@gmail.com'];

            let formatted = data.map((post: any) => ({
                ...post,
                likes_count: post.likes ? post.likes.length : 0,
                comments_count: post.comments ? post.comments.length : 0,
                user_has_liked: userId ? post.likes.some((like: any) => like.user_id === userId) : false,
                // Helper for sorting
                is_vip: VIP_EMAILS.includes(post.profiles?.email)
            }));

            // SMART ALGORITHM: Boost VIP posts from the last 24 hours to the top
            const ONE_DAY = 24 * 60 * 60 * 1000;
            formatted.sort((a: any, b: any) => {
                const now = Date.now();
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                const aIsRecent = (now - aTime) < ONE_DAY;
                const bIsRecent = (now - bTime) < ONE_DAY;

                // If both are recent VIPs or neither, maintain chronological order (bTime - aTime)
                // If A is recent VIP and B is not, A comes first
                if (a.is_vip && aIsRecent && (!b.is_vip || !bIsRecent)) return -1;
                if (b.is_vip && bIsRecent && (!a.is_vip || !aIsRecent)) return 1;

                return bTime - aTime;
            });

            setPosts(formatted);
        }
        setLoading(false);
    };

    const fetchSinglePost = async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
            .from('posts')
            .select(`*, profiles:author_id (*), likes (user_id), comments (id)`)
            .eq('id', postId)
            .single();

        if (data) {
            const newPost = {
                ...data,
                likes_count: data.likes ? data.likes.length : 0,
                comments_count: data.comments ? data.comments.length : 0,
                user_has_liked: user ? data.likes.some((like: any) => like.user_id === user.id) : false
            };

            // Smart Update: If exists update, else add
            const exists = posts.some(p => p.id === newPost.id);
            if (exists) {
                updatePost(newPost);
            } else {
                addPost(newPost);
            }
        }
    };

    const createPost = async (content: string, imageFile: File | null) => {
        if (!content.trim() && !imageFile) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let imageUrl = null;
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `posts/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, imageFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
            imageUrl = publicUrl;
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({ author_id: user.id, content: content, image_url: imageUrl })
            .select(`*, profiles:author_id (*), likes (user_id), comments (id)`)
            .single();

        if (error) throw error;
        if (data) {
            const newPost = {
                ...data,
                likes_count: 0,
                comments_count: 0,
                user_has_liked: false,
                profiles: currentUserProfile || { id: user.id, name: 'You' }
            };
            addPost(newPost);
        }
    };

    const deletePost = async (postId: string) => {
        removePost(postId); // Optimistic UI
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            console.error('Error deleting post:', error);
            // Ideally revert here, but for now we rely on re-fetch on error
        }
    };

    const toggleLike = async (post: Post) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isLiked = post.user_has_liked;
        const newLikeCount = isLiked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1;

        // Optimistic Store Update
        updatePost({
            ...post,
            user_has_liked: !isLiked,
            likes_count: newLikeCount
        });

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
            if (!comments[postId]) { // Only fetch if not already loaded
                setLoadingComments(true);
                const { data } = await supabase
                    .from('comments')
                    .select(`*, profiles:author_id (*)`)
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });
                if (data) setComments(prev => ({ ...prev, [postId]: data }));
                setLoadingComments(false);
            }
        }
    };

    const postComment = async (postId: string, content: string) => {
        if (!content.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticComment: any = {
            id: tempId,
            post_id: postId,
            author_id: user.id,
            content: content,
            created_at: new Date().toISOString(),
            profiles: currentUserProfile || { id: user.id, name: 'You' }
        };

        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), optimisticComment] }));

        // Update comment count in store
        const post = posts.find(p => p.id === postId);
        if (post) {
            updatePost({ ...post, comments_count: (post.comments_count || 0) + 1 });
        }

        const { data, error } = await supabase
            .from('comments')
            .insert({ post_id: postId, author_id: user.id, content: content })
            .select(`*, profiles:author_id (*)`)
            .single();

        if (error) {
            setComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== tempId) }));
            if (post) updatePost({ ...post, comments_count: (post.comments_count || 0) - 1 });
            throw error;
        }

        if (data) {
            setComments(prev => ({ ...prev, [postId]: prev[postId].map(c => c.id === tempId ? data : c) }));
        }
    };

    const reportPost = async (postId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const { error } = await supabase.from('reports').insert({
                reporter_id: user.id,
                target_id: postId,
                type: 'post',
                reason: 'Inappropriate Content',
                status: 'pending'
            });

            if (error) throw error;
            alert('Post reported. Thank you for helping keep UniLink safe.');
        } catch (error) {
            console.error('Error reporting post:', error);
            alert('Failed to report post. Please try again.');
        }
    };

    return {
        posts,
        loading,
        currentUserId,
        createPost,
        deletePost,
        toggleLike,
        toggleComments,
        activeCommentPostId,
        comments,
        loadingComments,
        postComment,
        reportPost
    };
}
