import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Profile, Message } from '../../../types';

export function useChat() {
    const [conversations, setConversations] = useState<Profile[]>([]);
    const [activeChat, setActiveChat] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const activeChatRef = useRef<Profile | null>(null);

    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat) {
            // clear unread for this chat
            setUnreadCounts(prev => {
                if (!prev[activeChat.id]) return prev;
                const newCounts = { ...prev };
                delete newCounts[activeChat.id];
                return newCounts;
            });
        }
    }, [activeChat]);

    const fetchConversations = useCallback(async (myId: string) => {
        const { data: connections } = await supabase
            .from('connections')
            .select(`
                requester_id,
                recipient_id,
                requester:profiles!requester_id(*),
                recipient:profiles!recipient_id(*)
            `)
            .eq('status', 'accepted')
            .or(`requester_id.eq.${myId},recipient_id.eq.${myId}`);

        if (!connections) return;

        const profiles = connections.map((conn: any) => {
            if (conn.requester_id === myId) return conn.recipient;
            return conn.requester;
        });

        const uniqueProfiles = profiles.filter((profile: Profile, index: number, self: Profile[]) =>
            index === self.findIndex((p) => p.id === profile.id)
        );
        setConversations(uniqueProfiles);
    }, []);

    const markAsRead = useCallback(async (senderId: string) => {
        if (!userId) return;

        setMessages(prev => prev.map(m =>
            (m.sender_id === senderId && !m.read_at)
                ? { ...m, read_at: new Date().toISOString() }
                : m
        ));

        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('sender_id', senderId)
            .eq('recipient_id', userId)
            .is('read_at', null);

        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[senderId];
            return newCounts;
        });
    }, [userId]);

    // Initial load
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);
            await fetchConversations(user.id);

            const { data: unreadData } = await supabase.rpc('fetch_unread_counts', { current_user_id: user.id });
            if (unreadData) {
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

    // Global Listener (Unread counts & Presence)
    useEffect(() => {
        if (!userId) return;

        const channel = supabase.channel('global-messages-listener')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
                async (payload) => {
                    const newMsg = payload.new as Message;
                    const senderId = newMsg.sender_id;

                    if (activeChatRef.current?.id !== senderId) {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [senderId]: (prev[senderId] || 0) + 1
                        }));
                    }
                })
            .subscribe();

        const presence = supabase.channel('global-presence');
        presence
            .on('presence', { event: 'sync' }, () => {
                const state = presence.presenceState();
                const ids = new Set<string>();
                for (const key in state) {
                    state[key].forEach((p: any) => {
                        if (p.user_id) ids.add(p.user_id);
                    });
                }
                setOnlineUsers(ids);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presence.track({ user_id: userId, online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
            presence.untrack().then(() => supabase.removeChannel(presence));
        };
    }, [userId]);

    // Active Chat Messages & Subscription
    useEffect(() => {
        if (!activeChat || !userId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${userId})`)
                .order('created_at', { ascending: true });

            setMessages(data || []);
            markAsRead(activeChat.id);
        };
        fetchMessages();

        const channel = supabase
            .channel(`chat:${activeChat.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    if (
                        (newMsg.sender_id === activeChat.id && newMsg.recipient_id === userId) ||
                        (newMsg.sender_id === userId && newMsg.recipient_id === activeChat.id)
                    ) {
                        setMessages((prev) => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            const realFromMe = newMsg.sender_id === userId;
                            if (realFromMe) {
                                const tempMatch = prev.find(m => m.id.startsWith('temp-') && m.content === newMsg.content);
                                if (tempMatch) {
                                    return prev.map(m => m.id === tempMatch.id ? newMsg : m);
                                }
                            }
                            if (newMsg.sender_id === activeChat.id) {
                                markAsRead(activeChat.id);
                            }
                            return [...prev, newMsg];
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                (payload) => {
                    const updatedMsg = payload.new as Message;
                    if (
                        (updatedMsg.sender_id === activeChat.id && updatedMsg.recipient_id === userId) ||
                        (updatedMsg.sender_id === userId && updatedMsg.recipient_id === activeChat.id)
                    ) {
                        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeChat, userId, markAsRead]);

    const sendMessage = async (content: string, imageUrl: string | null = null, replyTo?: Message) => {
        if (!activeChat || !userId) return;

        let finalContent = content;
        if (replyTo) {
            finalContent = `> ${replyTo.content.substring(0, 50)}${replyTo.content.length > 50 ? '...' : ''}\n\n${content}`;
        }

        const tempMsg: any = {
            id: 'temp-' + Date.now(),
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent,
            created_at: new Date().toISOString(),
            image_url: imageUrl
        };

        setMessages((prev) => [...prev, tempMsg]);

        const { error } = await supabase.from('messages').insert({
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent,
            image_url: imageUrl
        });

        if (error) {
            console.error('Error sending message:', error);
            // Ideally rollback or show error
        }
    };

    return {
        conversations,
        activeChat,
        setActiveChat,
        messages,
        loading,
        userId,
        onlineUsers,
        unreadCounts,
        sendMessage
    };
}
