import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { type Profile } from '../../../types';

export function useFollow(profileId: string) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchFollowStatus();
        fetchCounts();

        // Subscribe to real-time updates for followers (people following this profile)
        const followersChannel = supabase
            .channel(`followers:${profileId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'follows',
                    filter: `following_id=eq.${profileId}`
                },
                () => {
                    fetchCounts();
                    fetchFollowStatus();
                }
            )
            .subscribe();

        // Subscribe to real-time updates for following (people this profile follows)
        const followingChannel = supabase
            .channel(`following:${profileId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'follows',
                    filter: `follower_id=eq.${profileId}`
                },
                () => {
                    fetchCounts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(followersChannel);
            supabase.removeChannel(followingChannel);
        };
    }, [profileId]);

    const fetchFollowStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            setCurrentUserId(user.id);

            // Check if current user follows this profile
            const { data, error } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
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
            // Get followers count - people who follow this profile
            const { count: followersCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', profileId);

            // Get following count - people this profile follows
            const { count: followingCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', profileId);

            setFollowersCount(followersCount || 0);
            setFollowingCount(followingCount || 0);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const toggleFollow = async () => {
        if (!currentUserId || currentUserId === profileId) return;

        const previousState = isFollowing;
        setIsFollowing(!isFollowing);

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUserId)
                    .eq('following_id', profileId);

                if (error) throw error;
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentUserId,
                        following_id: profileId
                    });

                if (error) throw error;
            }

            // Refresh counts
            await fetchCounts();
        } catch (error: any) {
            console.error('Error toggling follow:', error);
            setIsFollowing(previousState); // Revert on error

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
        canFollow: currentUserId && currentUserId !== profileId
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
                    follower:profiles!follower_id(*)
                `)
                .eq('following_id', userId)
                .order('created_at', { ascending: false });

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
                    following:profiles!following_id(*)
                `)
                .eq('follower_id', userId)
                .order('created_at', { ascending: false });

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

    useEffect(() => {
        fetchSuggestions();
    }, [limit]);

    const fetchSuggestions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .rpc('get_suggested_follows', {
                    user_id_param: user.id,
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
