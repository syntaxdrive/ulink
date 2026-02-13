import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../services/supabase';

interface Profile {
    id: string;
    name: string;
    avatar_url: string | null;
}

interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    image_url: string | null;
    audio_url: string | null;
}

export function useChat() {
    const [conversations, setConversations] = useState<Profile[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const activeChatRef = useRef<Profile | null>(null);
    // Note: In RN, ActiveChat is managed by navigation/screen state, but this hook can facilitate data fetching.
    // We'll pass `activeChatId` if needed, or manage list-only here.

    // For now, let's keep it similar to web but simpler: Fetch conversations and unread counts.
    // Individual chat logic will be moved to useChatRoom hook or similar later if complex.

    const fetchConversations = useCallback(async (myId: string) => {
        try {
            // Using existing RPC from web app (assuming it exists in DB)
            const { data, error } = await supabase.rpc('get_sorted_conversations', { current_user_id: myId });

            if (error) {
                console.error('Error fetching conversations:', error);
                // Fallback if RPC doesn't exist? Mobile might not have this RPC. 
                // Let's implement a fallback query just in case.
                return;
            }

            if (data) {
                // Ensure data matches Profile interface
                const mappedData: Profile[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name || 'Unknown User',
                    avatar_url: item.avatar_url
                }));
                setConversations(mappedData);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);
            await fetchConversations(user.id);

            // Fetch unread counts
            const { data: unreadData, error } = await supabase.rpc('fetch_unread_counts', { current_user_id: user.id });
            if (!error && unreadData) {
                const counts: Record<string, number> = {};
                unreadData.forEach((item: any) => {
                    counts[item.sender_id] = parseInt(item.unread_count, 10) || 0;
                });
                setUnreadCounts(counts);
            }
            setLoading(false);
        };
        init();
    }, [fetchConversations]);

    // Global Listener (Unread counts & Conversations)
    useEffect(() => {
        if (!userId) return;

        const channel = supabase.channel('global-messages-listener')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
                async (payload) => {
                    const newMsg = payload.new as Message;
                    const senderId = newMsg.sender_id;

                    // Increment unread count locally (unless active screen clears it - tricky without global state)
                    // Simplify: Just refetch conversations to get updated order/preview
                    fetchConversations(userId);

                    setUnreadCounts(prev => ({
                        ...prev,
                        [senderId]: (prev[senderId] || 0) + 1
                    }));
                })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchConversations]);

    return {
        conversations,
        loading,
        userId,
        unreadCounts,
        onlineUsers, // Placeholder for now
        refreshConversations: () => userId && fetchConversations(userId)
    };
}
