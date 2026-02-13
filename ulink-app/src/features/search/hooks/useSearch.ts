import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../features/auth/AuthContext';
import { Alert } from 'react-native';

export const useSearch = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'users' | 'posts'>('users');

    const searchUsers = async (searchTerm: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('name', `%${searchTerm}%`)
            .limit(20);

        if (error) throw error;
        return data || [];
    };

    const searchPosts = async (searchTerm: string) => {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (id, name, avatar_url, email),
                likes (user_id),
                comments (id)
            `)
            .ilike('content', `%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Transform data similar to useFeed
        return data.map(post => ({
            ...post,
            likes_count: post.likes ? post.likes.length : 0,
            comments_count: post.comments ? post.comments.length : 0,
            user_has_liked: user ? post.likes.some((l: any) => l.user_id === user.id) : false,
        }));
    };

    const performSearch = useCallback(async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            let data = [];
            if (type === 'users') {
                data = await searchUsers(query);
            } else {
                data = await searchPosts(query);
            }
            setResults(data);
        } catch (error: any) {
            console.error('Search error:', error);
            // Alert.alert('Error', 'Failed to search');
        } finally {
            setLoading(false);
        }
    }, [query, type]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query, performSearch]);

    return {
        query,
        setQuery,
        results,
        loading,
        type,
        setType
    };
};
