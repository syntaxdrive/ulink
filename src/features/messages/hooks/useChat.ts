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
        const { data, error } = await supabase.rpc('get_sorted_conversations', { current_user_id: myId });

        if (error) {
            console.error('Error fetching conversations:', error);
            return;
        }

        if (data) {
            setConversations(data);
        }
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
                    fetchConversations(userId);
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
                                const tempMatch = prev.find(m =>
                                    m.id.startsWith('temp-') && (
                                        (m.audio_url && m.audio_url === newMsg.audio_url) ||
                                        (!m.audio_url && m.content === newMsg.content)
                                    )
                                );
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

    const sendMessage = async (content: string, imageUrl: string | null = null, replyTo?: Message, audioUrl: string | null = null) => {
        if (!activeChat || !userId) return;

        let finalContent = content;
        if (replyTo) {
            let contentToQuote = replyTo.content;

            // Prevent nested/triple quotes: If the message we're replying to is already a quote,
            // extract only the actual message text (the part after the quote).
            if (contentToQuote.startsWith('> ') && contentToQuote.includes('\n\n')) {
                const splitIndex = contentToQuote.indexOf('\n\n');
                if (splitIndex !== -1) {
                    contentToQuote = contentToQuote.substring(splitIndex + 2);
                }
            }

            finalContent = `> ${contentToQuote.substring(0, 50)}${contentToQuote.length > 50 ? '...' : ''}\n\n${content}`;
        }

        const tempMsg: any = {
            id: 'temp-' + Date.now(),
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent || (audioUrl ? 'Voice Message' : ''),
            created_at: new Date().toISOString(),
            image_url: imageUrl,
            audio_url: audioUrl
        };

        setMessages((prev) => [...prev, tempMsg]);

        const { error } = await supabase.from('messages').insert({
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent || (audioUrl ? 'Voice Message' : ''),
            image_url: imageUrl,
            audio_url: audioUrl
        });

        if (error) {
            console.error('Error sending message:', error);
            // Ideally rollback or show error
        } else {
            fetchConversations(userId);
        }
    };

    const deleteMessage = async (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        const { error } = await supabase.from('messages').delete().eq('id', messageId);
        if (error) {
            console.error('Error deleting message:', error);
            // Revert? For now, we assume success or refresh
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
        sendMessage,
        deleteMessage
    };
}
