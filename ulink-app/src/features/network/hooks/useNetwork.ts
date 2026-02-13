import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase';

export interface Profile {
    id: string;
    name: string;
    university: string | null;
    role: string;
    avatar_url: string | null;
    headline?: string;
    is_verified: boolean;
    gold_verified: boolean;
    location?: string;
    score?: number;
    posts_count?: number;
    comments_count?: number;
}

export function useNetwork() {
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [myNetwork, setMyNetwork] = useState<Profile[]>([]);
    const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [connections, setConnections] = useState<Set<string>>(new Set());
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [receivedRequests, setReceivedRequests] = useState<Profile[]>([]);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [accepting, setAccepting] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            // Using standard Supabase query to avoid extra SQL functions for Leaderboard
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    posts:posts(count),
                    comments:comments(count)
                `)
                .limit(200);

            if (data && !error) {
                const rankedProfiles = data.map((profile: any) => {
                    // Safe access to counts
                    const postsCount = profile.posts?.[0]?.count || 0;
                    const commentsCount = profile.comments?.[0]?.count || 0;
                    const score = (postsCount * 10) + (commentsCount * 5);
                    return {
                        ...profile,
                        posts_count: postsCount,
                        comments_count: commentsCount,
                        score
                    };
                });

                // Sort by score
                rankedProfiles.sort((a: any, b: any) => b.score - a.score);
                setLeaderboard(rankedProfiles);
            } else if (error) {
                console.error('Error fetching leaderboard:', error);
            }
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const fetchNetworkData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch my profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setUserProfile(profile);

        // 1. Fetch all my connections
        const { data: allConnections } = await supabase
            .from('connections')
            .select('*')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        const connectedIds = new Set<string>();
        const pendingIds = new Set<string>();
        const connectedProfileIds: string[] = [];
        const incomingRequesterIds: string[] = [];

        if (allConnections) {
            allConnections.forEach((conn: any) => {
                const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
                if (conn.status === 'accepted') {
                    connectedIds.add(otherId);
                    connectedProfileIds.push(otherId);
                } else if (conn.requester_id === user.id && conn.status === 'pending') {
                    pendingIds.add(otherId);
                } else if (conn.recipient_id === user.id && conn.status === 'pending') {
                    incomingRequesterIds.push(conn.requester_id);
                }
            });
        }

        setConnections(connectedIds);
        setSentRequests(pendingIds);

        // 2. Fetch Profiles (My Network & Requests)
        const allProfileIdsToFetch = [...new Set([...connectedProfileIds, ...incomingRequesterIds])];
        if (allProfileIdsToFetch.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', allProfileIdsToFetch);

            if (profiles) {
                const myNet = profiles.filter(p => connectedIds.has(p.id));
                const received = profiles.filter(p => incomingRequesterIds.includes(p.id));
                setMyNetwork(myNet);
                setReceivedRequests(received);
            }
        } else {
            setMyNetwork([]);
            setReceivedRequests([]);
        }

        // 3. Fetch Suggestions (Using Web App Logic/RPC)
        try {
            const { data: suggestionData, error } = await supabase.rpc('get_suggested_connections', {
                current_user_id: user.id
            });

            if (!error && suggestionData) {
                const filtered = suggestionData.filter((p: Profile) =>
                    !connectedIds.has(p.id) &&
                    !pendingIds.has(p.id) &&
                    !incomingRequesterIds.includes(p.id)
                );
                setSuggestions(filtered);
            } else {
                // Fallback to basic query if RPC missing
                const { data: randomProfiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user.id)
                    .limit(20);

                if (randomProfiles) {
                    const filtered = randomProfiles.filter((p: any) =>
                        !connectedIds.has(p.id) &&
                        !pendingIds.has(p.id) &&
                        !incomingRequesterIds.includes(p.id)
                    );
                    setSuggestions(filtered);
                }
            }
        } catch (e) {
            console.error('Suggestions fetch error:', e);
        }

        setLoading(false);
    }, []);

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Use RPC to match Web App functionality
            const { data, error } = await supabase.rpc('search_all_users', {
                current_user_id: user.id,
                search_query: query.trim()
            });

            if (data && !error) {
                setSearchResults(data);
            } else {
                // Fallback
                console.warn('RPC search_all_users failed, falling back to simple query');
                const { data: simpleData } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user.id)
                    .ilike('name', `%${query}%`)
                    .limit(20);
                setSearchResults(simpleData || []);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const connect = async (targetUserId: string) => {
        setConnecting(targetUserId);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Optimistic Update
            setSentRequests(prev => {
                const newSet = new Set(prev);
                newSet.add(targetUserId);
                return newSet;
            });

            const { error } = await supabase
                .from('connections')
                .insert({
                    requester_id: user.id,
                    recipient_id: targetUserId,
                    status: 'pending'
                });

            if (error) {
                console.error('Error sending connection request:', error);

                // Rollback
                setSentRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(targetUserId);
                    return newSet;
                });
            }
        }
        setConnecting(null);
    };

    const acceptRequest = async (requesterId: string) => {
        setAccepting(requesterId);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('connections')
                .update({ status: 'accepted' })
                .eq('requester_id', requesterId)
                .eq('recipient_id', user.id);

            if (!error) {
                // Update local state - Move from Received to My Network
                const profile = receivedRequests.find(p => p.id === requesterId);

                setReceivedRequests(prev => prev.filter(p => p.id !== requesterId));

                if (profile) {
                    setMyNetwork(prev => [...prev, profile]);
                    setConnections(prev => new Set(prev).add(requesterId));
                }
            } else {
                console.error('Error accepting request:', error);
            }
        }
        setAccepting(null);
    };

    const rejectRequest = async (requesterId: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('connections')
                .delete()
                .eq('requester_id', requesterId)
                .eq('recipient_id', user.id);

            if (!error) {
                setReceivedRequests(prev => prev.filter(p => p.id !== requesterId));
            } else {
                console.error('Error rejecting request:', error);
            }
        }
    };

    useEffect(() => {
        fetchNetworkData();
    }, [fetchNetworkData]);

    return {
        suggestions,
        myNetwork,
        leaderboard,
        receivedRequests,
        loading,
        loadingLeaderboard,
        fetchLeaderboard,
        fetchNetworkData,
        connections,
        sentRequests,
        connecting,
        accepting,
        acceptRequest,
        rejectRequest,
        connect,
        searchUsers,
        searchResults,
        searching,
        userProfile
    };
}
