import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { type Profile } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

export function useFollow(profileId: string) {
    // ✅ Auth from context — replaces getSession() call on every mount
    const { userId: authUserId } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        fetchFollowStatus();
        fetchCounts();
        // ✅ Removed 60s polling interval — counts update optimistically on toggle
    }, [profileId, authUserId]);

    const fetchFollowStatus = async () => {
        try {
            if (!authUserId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('follows')
                .select('id').limit(1)
                .eq('follower_id', authUserId)
                .eq('following_id', profileId)
                .maybeSingle();

            if (error) throw error;
            setIsFollowing(!!data);
        } catch (error) {
            console.error('Error fetching follow status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const [{ count: fc }, { count: fgc }] = await Promise.all([
                // Followers: people who follow this profile
                supabase.from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', profileId),
                // Following: people this profile follows
                supabase.from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', profileId),
            ]);

            setFollowersCount(fc || 0);
            setFollowingCount(fgc || 0);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const toggleFollow = async () => {
        if (!authUserId || authUserId === profileId) return;

        const previousState = isFollowing;
        // Optimistic update
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', authUserId)
                    .eq('following_id', profileId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('follows')
                    .insert({ follower_id: authUserId, following_id: profileId });

                if (error) throw error;
            }
        } catch (error: any) {
            console.error('Error toggling follow:', error);
            // Revert on error
            setIsFollowing(previousState);
            setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);

            if (error.code === '23514') {
                alert('You cannot follow yourself');
            } else {
                alert('Failed to update follow status');
            }
        }
    };

    return {
        isFollowing,
        loading,
        followersCount,
        followingCount,
        toggleFollow,
        canFollow: authUserId && authUserId !== profileId
    };
}

// Hook to get followers list
export function useFollowers(userId: string) {
    const [followers, setFollowers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowers();
    }, [userId]);

    const fetchFollowers = async () => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select(`
                    follower_id,
                    created_at,
                    follower:profiles!follower_id(id, name, username, avatar_url, is_verified, university, role)
                `)
                .eq('following_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setFollowers((data?.map(f => f.follower).filter(Boolean) || []) as unknown as Profile[]);
        } catch (error) {
            console.error('Error fetching followers:', error);
        } finally {
            setLoading(false);
        }
    };

    return { followers, loading, refresh: fetchFollowers };
}

// Hook to get following list
export function useFollowing(userId: string) {
    const [following, setFollowing] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowing();
    }, [userId]);

    const fetchFollowing = async () => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select(`
                    following_id,
                    created_at,
                    following:profiles!following_id(id, name, username, avatar_url, is_verified, university, role)
                `)
                .eq('follower_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setFollowing((data?.map(f => f.following).filter(Boolean) || []) as unknown as Profile[]);
        } catch (error) {
            console.error('Error fetching following:', error);
        } finally {
            setLoading(false);
        }
    };

    return { following, loading, refresh: fetchFollowing };
}

// Hook to get suggested follows
export function useSuggestedFollows(limit: number = 5) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId: authUserId } = useAuth();

    useEffect(() => {
        fetchSuggestions();
    }, [limit, authUserId]);

    const fetchSuggestions = async () => {
        try {
            if (!authUserId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .rpc('get_suggested_follows', {
                    user_id_param: authUserId,
                    limit_count: limit
                });

            if (error) throw error;
            setSuggestions(data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    return { suggestions, loading, refresh: fetchSuggestions };
}
