import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../../../types';
import { useNetworkStore } from '../../../stores/useNetworkStore';

export function useNetwork() {
    const store = useNetworkStore();

    // Hydrate local state from store immediately (instant render on revisit)
    const [suggestions, setSuggestions] = useState<Profile[]>(store.suggestions);
    const [myNetwork, setMyNetwork] = useState<Profile[]>(store.myNetwork);
    const [loading, setLoading] = useState(store.suggestions.length === 0);
    const [connections, setConnections] = useState<Set<string>>(new Set(store.connections));
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set(store.sentRequests));
    const [connecting, setConnecting] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);
    const [userProfile, setUserProfile] = useState<Profile | null>(store.userProfile);

    const fetchNetworkData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Fetch my profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile) setUserProfile(profile as any);

        // 1. Fetch all my connections (accepted & pending)
        const { data: allConnections } = await supabase
            .from('connections')
            .select('id, requester_id, recipient_id, status')
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
        let networkProfiles: Profile[] = [];
        if (connectedProfileIds.length > 0) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .in('id', connectedProfileIds);
            if (data) networkProfiles = data as any;
        }
        setMyNetwork(networkProfiles);

        // 3. Fetch suggestions — limit 500, exclude already-connected
        const excludeIds = new Set([user.id, ...Array.from(connectedIds), ...Array.from(pendingIds)]);
        const { data: allProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .order('created_at', { ascending: false })
            .limit(500);

        let filteredSuggestions: Profile[] = [];
        if (profilesError) {
            console.error('[useNetwork] profiles fetch error:', profilesError);
        } else if (allProfiles) {
            const myUni = profile?.university?.toLowerCase().trim();
            const filtered = allProfiles.filter((p: any) => !excludeIds.has(p.id));
            filtered.sort((a: any, b: any) => {
                const aSameUni = myUni && a.university?.toLowerCase().trim() === myUni ? 0 : 1;
                const bSameUni = myUni && b.university?.toLowerCase().trim() === myUni ? 0 : 1;
                if (aSameUni !== bSameUni) return aSameUni - bSameUni;
                if ((b.gold_verified ? 1 : 0) !== (a.gold_verified ? 1 : 0)) return (b.gold_verified ? 1 : 0) - (a.gold_verified ? 1 : 0);
                if ((b.is_verified ? 1 : 0) !== (a.is_verified ? 1 : 0)) return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0);
                return 0;
            });
            filteredSuggestions = filtered as any;
            setSuggestions(filteredSuggestions);
        }

        // Persist to store
        store.setNetworkData({
            suggestions: filteredSuggestions,
            myNetwork: networkProfiles,
            connections: Array.from(connectedIds),
            sentRequests: Array.from(pendingIds),
            userProfile: profile as any,
        });

        setLoading(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

            if (!error && data) {
                setSearchResults(data);
            } else {
                const q = query.trim().toLowerCase();
                const { data: fallback } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`name.ilike.%${q}%,username.ilike.%${q}%,university.ilike.%${q}%,headline.ilike.%${q}%`)
                    .neq('id', user.id)
                    .limit(50);
                setSearchResults((fallback as any) || []);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const connect = async (targetUserId: string) => {
        setConnecting(targetUserId);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Optimistic update — both local state and store
            setSentRequests(prev => new Set([...prev, targetUserId]));
            store.addSentRequest(targetUserId);

            const { error } = await supabase
                .from('connections')
                .insert({ requester_id: user.id, recipient_id: targetUserId, status: 'pending' });

            if (error) {
                console.error('Error sending connection request:', error);
                alert('Failed to send connection request. Please try again.');
                // Rollback
                setSentRequests(prev => { const s = new Set(prev); s.delete(targetUserId); return s; });
                store.removeSentRequest(targetUserId);
            }
        }
        setConnecting(null);
    };

    useEffect(() => {
        // Use cached data if fresh; otherwise fetch
        if (!store.needsRefresh() && store.suggestions.length > 0) {
            setLoading(false);
            return;
        }
        fetchNetworkData();
    }, [fetchNetworkData, store]);

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
        searching,
        userProfile,
    };
}
