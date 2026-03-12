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

    const [userProfile, setUserProfile] = useState<Profile | null>(null);

    const fetchNetworkData = useCallback(async () => {
        setLoading(true);
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
        if (connectedProfileIds.length > 0) {
            const { data: networkProfiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', connectedProfileIds);

            if (networkProfiles) setMyNetwork(networkProfiles as any);
        } else {
            setMyNetwork([]);
        }

        // 3. Fetch candidate profiles for suggestions — select(*) guarantees
        //    success even if optional columns (points, gold_verified) don't exist.
        const excludeIds = new Set([user.id, ...Array.from(connectedIds), ...Array.from(pendingIds)]);

        const { data: allProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .order('created_at', { ascending: false })
            .limit(500);

        if (profilesError) {
            console.error('[useNetwork] profiles fetch error:', profilesError);
            setSuggestions([]);
        } else if (allProfiles) {
            const myUni = profile?.university?.toLowerCase().trim();
            const filtered = allProfiles.filter((p: any) => !excludeIds.has(p.id));
            // Sort: same university first, then gold verified, then verified
            filtered.sort((a: any, b: any) => {
                const aUni = a.university?.toLowerCase().trim();
                const bUni = b.university?.toLowerCase().trim();
                const aSameUni = myUni && aUni === myUni ? 0 : 1;
                const bSameUni = myUni && bUni === myUni ? 0 : 1;
                if (aSameUni !== bSameUni) return aSameUni - bSameUni;
                if ((b.gold_verified ? 1 : 0) !== (a.gold_verified ? 1 : 0)) return (b.gold_verified ? 1 : 0) - (a.gold_verified ? 1 : 0);
                if ((b.is_verified ? 1 : 0) !== (a.is_verified ? 1 : 0)) return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0);
                return 0;
            });
            setSuggestions(filtered as any);
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
            // Try the RPC first
            const { data, error } = await supabase.rpc('search_all_users', {
                current_user_id: user.id,
                search_query: query.trim()
            });

            if (!error && data) {
                setSearchResults(data);
            } else {
                // Fallback: direct ilike query
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
        searching,
        userProfile
    };
}
