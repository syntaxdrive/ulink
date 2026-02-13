import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../auth/AuthContext';

export function useFeed() {
    const { session } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:author_id (
                        id,
                        name,
                        avatar_url,
                        email
                    ),
                    likes (user_id),
                    comments (id)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            // Map data to include counts and user interaction status
            const formattedPosts = data.map((post: any) => ({
                ...post,
                likes_count: post.likes ? post.likes.length : 0,
                comments_count: post.comments ? post.comments.length : 0,
                user_has_liked: session?.user ? post.likes.some((l: any) => l.user_id === session.user.id) : false,
            }));

            setPosts(formattedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [session]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const toggleLike = async (post: any) => {
        if (!session?.user) return;

        // Optimistic UI Update
        const isLiked = post.user_has_liked;
        const updatedPosts = posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    user_has_liked: !isLiked,
                    likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
                };
            }
            return p;
        });
        setPosts(updatedPosts);

        try {
            if (isLiked) {
                await supabase.from('likes').delete().match({ post_id: post.id, user_id: session.user.id });
            } else {
                await supabase.from('likes').insert({ post_id: post.id, user_id: session.user.id });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setPosts(posts);
        }
    };

    const createPost = async (content: string) => {
        if (!session?.user || !content.trim()) return false;

        try {
            const { data, error } = await supabase
                .from('posts')
                .insert({
                    author_id: session.user.id,
                    content: content.trim(),
                    community_id: null
                })
                .select('*, profiles:author_id(*)')
                .single();

            if (error) throw error;

            if (data) {
                const newPost = {
                    ...data,
                    likes_count: 0,
                    comments_count: 0,
                    user_has_liked: false
                };
                setPosts([newPost, ...posts]);
                return true;
            }
        } catch (e) {
            console.error('Create post error:', e);
            return false;
        }
    };

    return {
        posts,
        loading,
        refreshing,
        handleRefresh,
        toggleLike,
        createPost
    };
}
