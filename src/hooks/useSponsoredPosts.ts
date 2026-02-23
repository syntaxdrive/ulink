import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SponsoredPost, CreateSponsoredPostData, UpdateSponsoredPostData } from '../types/sponsored';

export function useSponsoredPosts() {
    const [posts, setPosts] = useState<SponsoredPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('sponsored_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err: any) {
            console.error('Error fetching sponsored posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (postData: CreateSponsoredPostData) => {
        try {
            const { data, error } = await supabase
                .from('sponsored_posts')
                .insert([{
                    ...postData,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                }])
                .select()
                .single();

            if (error) throw error;

            // Refresh list
            await fetchPosts();
            return data;
        } catch (err: any) {
            console.error('Error creating sponsored post:', err);
            throw err;
        }
    };

    const updatePost = async (id: string, updates: UpdateSponsoredPostData) => {
        try {
            const { error } = await supabase
                .from('sponsored_posts')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (err: any) {
            console.error('Error updating sponsored post:', err);
            throw err;
        }
    };

    const deletePost = async (id: string) => {
        try {
            const { error } = await supabase
                .from('sponsored_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting sponsored post:', err);
            throw err;
        }
    };

    const trackImpression = async (postId: string) => {
        try {
            await supabase.rpc('increment_sponsored_post_impression', { post_id: postId });

            // Optionally track detailed impression
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('sponsored_post_impressions').insert({
                    sponsored_post_id: postId,
                    user_id: user.id
                });
            }
        } catch (err) {
            console.error('Error tracking impression:', err);
        }
    };

    const trackClick = async (postId: string) => {
        try {
            await supabase.rpc('increment_sponsored_post_click', { post_id: postId });

            // Track click in impressions table if needed
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('sponsored_post_impressions')
                    .update({ clicked: true, clicked_at: new Date().toISOString() })
                    .eq('sponsored_post_id', postId)
                    .eq('user_id', user.id);
            }
        } catch (err) {
            console.error('Error tracking click:', err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return {
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
        trackImpression,
        trackClick
    };
}
