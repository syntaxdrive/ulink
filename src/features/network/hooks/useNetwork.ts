import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../../../types';

export function useNetwork() {
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [myNetwork, setMyNetwork] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<Set<string>>(new Set());
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [connecting, setConnecting] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);

    const fetchNetworkData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch all my connections (accepted & pending)
        const { data: allConnections } = await supabase
            .from('connections')
            .select('*')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        const connectedIds = new Set<string>();
        const pendingIds = new Set<string>();
        const connectedProfileIds: string[] = [];

        if (allConnections) {
            allConnections.forEach((conn: any) => {
                const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;

                if (conn.status === 'accepted') {
                    connectedIds.add(otherId);
                    connectedProfileIds.push(otherId);
                } else if (conn.requester_id === user.id) {
                    pendingIds.add(otherId);
                }
            });
        }

        setConnections(connectedIds);
        setSentRequests(pendingIds);

        // 2. Fetch "My Network" Profiles
        if (connectedProfileIds.length > 0) {
            const { data: networkProfiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', connectedProfileIds);

            if (networkProfiles) setMyNetwork(networkProfiles);
        } else {
            setMyNetwork([]);
        }

        // 3. Fetch "Suggestions" (Grow) - Using Smart Algorithm
        const { data: suggestionData } = await supabase.rpc('get_suggested_connections', {
            current_user_id: user.id
        });

        if (suggestionData) {
            setSuggestions(suggestionData);
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
            const { data, error } = await supabase.rpc('search_all_users', {
                current_user_id: user.id,
                search_query: query.trim()
            });

            if (error) {
                console.error('Search error:', error);
                // Fallback to client-side search if function doesn't exist yet
                const allProfiles = [...suggestions, ...myNetwork];
                const filtered = allProfiles.filter(profile =>
                    (profile.name || '').toLowerCase().includes(query.toLowerCase()) ||
                    (profile.university && profile.university.toLowerCase().includes(query.toLowerCase())) ||
                    (profile.headline && profile.headline.toLowerCase().includes(query.toLowerCase()))
                );
                setSearchResults(filtered);
            } else if (data) {
                setSearchResults(data);
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
                alert('Failed to send connection request. Please try again.');
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

    useEffect(() => {
        fetchNetworkData();
    }, [fetchNetworkData]);

    return {
        suggestions,
        myNetwork,
        loading,
        connections,
        sentRequests,
        connecting,
        connect,
        searchUsers,
        searchResults,
        searching
    };
}
