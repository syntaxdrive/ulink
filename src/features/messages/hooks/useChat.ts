import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Profile, Message } from '../../../types';
import { useChatStore } from '../../../stores/useChatStore';
import { useAuth } from '../../../contexts/AuthContext';

// Helper for persistent "Delete for me" storage
const getDeletedForMeSet = (uid: string | null): Set<string> => {
    if (!uid) return new Set();
    try {
        const raw = localStorage.getItem(`ulink_deleted_for_me_${uid}`);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const addDeletedForMe = (uid: string | null, messageId: string) => {
    if (!uid) return;
    try {
        const set = getDeletedForMeSet(uid);
        set.add(messageId);
        localStorage.setItem(`ulink_deleted_for_me_${uid}`, JSON.stringify(Array.from(set)));
    } catch (e) {
        console.error('Failed to save deleted for me:', e);
    }
};

export function useChat() {
    const { userId: authUserId } = useAuth();
    const {
        conversations,
        setConversations: storeSetConversations,
        messages: storeMessages,
        setMessages: storeSetMessages,
        activeChatId,
        setActiveChatId,
        unreadCounts,
        setUnreadCount,
        clearUnread
    } = useChatStore();

    const [activeChat, setActiveChatState] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>(authUserId);
    const [onlineUsers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Sync activeChat state with store's activeChatId (filtering out deleted for me)
    useEffect(() => {
        if (!activeChatId) {
            setActiveChatState(null);
            setMessages([]);
        } else {
            const conv = conversations.find(c => c.id === activeChatId);
            if (conv) setActiveChatState(conv);
            const rawMsgs = storeMessages[activeChatId] || [];
            const deletedSet = getDeletedForMeSet(authUserId);
            setMessages(rawMsgs.filter(m => !deletedSet.has(m.id)));
        }
    }, [activeChatId, conversations, storeMessages, authUserId]);

    const setActiveChat = useCallback((chat: Profile | null) => {
        setActiveChatId(chat?.id || null);
    }, [setActiveChatId]);

    const activeChatRef = useRef<Profile | null>(null);

    const fetchUnreadCounts = useCallback(async (myId: string) => {
        const { data: unreadData } = await supabase.rpc('fetch_unread_counts', { current_user_id: myId });
        if (unreadData) {
            unreadData.forEach((item: any) => {
                setUnreadCount(item.sender_id, parseInt(item.unread_count, 10) || 0);
            });
        }
    }, [setUnreadCount]);

    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat) {
            clearUnread(activeChat.id);
        }
    }, [activeChat]);

    const fetchConversations = useCallback(async (myId: string, isSilent = false) => {
        const cacheExists = useChatStore.getState().conversations.length > 0;
        if (!isSilent && !cacheExists) setLoading(true);

        const { data, error } = await supabase.rpc('get_sorted_conversations', { current_user_id: myId });

        if (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
            return;
        }

        if (data) {
            storeSetConversations(data);
        }
        setLoading(false);
    }, [storeSetConversations]);

    const markAsRead = useCallback(async (senderId: string) => {
        if (!userId) return;

        const chatId = senderId;
        const currentMsgs = useChatStore.getState().messages[chatId] || [];
        storeSetMessages(chatId, currentMsgs.map(m =>
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

        clearUnread(senderId);
    }, [userId, storeSetMessages, clearUnread]);

    useEffect(() => {
        if (!authUserId) {
            setLoading(false);
            return;
        }
        setUserId(authUserId);
        fetchConversations(authUserId);
        fetchUnreadCounts(authUserId);
    }, [authUserId, fetchConversations, fetchUnreadCounts]);

    // Active Chat Messages & Realtime Subscription
    useEffect(() => {
        if (!activeChat || !userId) return;

        const fetchMessages = async () => {
            const chatId = activeChat.id;
            const cache = useChatStore.getState().messages[chatId];

            if (!cache || cache.length === 0) {
                const { data } = await supabase
                    .from('messages')
                    .select('id, sender_id, recipient_id, content, image_url, audio_url, created_at, read_at')
                    .or(`and(sender_id.eq.${userId},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${userId})`)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (data) {
                    const deletedSet = getDeletedForMeSet(userId);
                    const filtered = data.filter((m: Message) => !deletedSet.has(m.id));
                    storeSetMessages(chatId, filtered);
                }
            }
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
                        const deletedSet = getDeletedForMeSet(userId);
                        if (deletedSet.has(newMsg.id)) return;

                        setMessages((prev) => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;

                            let next: Message[];
                            const realFromMe = newMsg.sender_id === userId;
                            if (realFromMe) {
                                const tempMatch = prev.find(m =>
                                    m.id.startsWith('temp-') && (
                                        (m.audio_url && m.audio_url === newMsg.audio_url) ||
                                        (!m.audio_url && m.content === newMsg.content)
                                    )
                                );
                                if (tempMatch) {
                                    next = prev.map(m => m.id === tempMatch.id ? newMsg : m);
                                } else {
                                    next = [...prev, newMsg];
                                }
                            } else {
                                if (newMsg.sender_id === activeChat.id) {
                                    markAsRead(activeChat.id);
                                }
                                next = [...prev, newMsg];
                            }

                            storeSetMessages(activeChat.id, next);
                            return next;
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
                        setMessages((prev) => {
                            const next = prev.map(m => m.id === updatedMsg.id ? updatedMsg : m);
                            storeSetMessages(activeChat.id, next);
                            return next;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            if (channel) {
                channel.unsubscribe();
                supabase.removeChannel(channel);
            }
        };
    }, [activeChat, userId, markAsRead]);

    const sendMessage = async (content: string, imageUrl: string | null = null, replyTo?: Message, audioUrl: string | null = null) => {
        if (!activeChat || !userId) return;

        let finalContent = content;
        if (replyTo) {
            let contentToQuote = replyTo.content;

            if (contentToQuote.startsWith('> ') && contentToQuote.includes('\n\n')) {
                const splitIndex = contentToQuote.indexOf('\n\n');
                if (splitIndex !== -1) {
                    contentToQuote = contentToQuote.substring(splitIndex + 2);
                }
            }

            finalContent = `> ${contentToQuote.substring(0, 50)}${contentToQuote.length > 50 ? '...' : ''}\n\n${content}`;
        }

        const chatId = activeChat.id;
        const tempMsg: any = {
            id: 'temp-' + Date.now(),
            sender_id: userId,
            recipient_id: chatId,
            content: finalContent || (audioUrl ? 'Voice Message' : ''),
            created_at: new Date().toISOString(),
            image_url: imageUrl,
            audio_url: audioUrl
        };

        setMessages((prev) => {
            const next = [...prev, tempMsg];
            storeSetMessages(chatId, next);
            return next;
        });

        const { data: inserted, error } = await supabase.from('messages').insert({
            sender_id: userId,
            recipient_id: chatId,
            content: finalContent || (audioUrl ? 'Voice Message' : ''),
            image_url: imageUrl,
            audio_url: audioUrl
        }).select('id, sender_id, recipient_id, content, image_url, audio_url, created_at, read_at').single();

        if (error) {
            console.error('Error sending message:', error);
            setMessages(prev => {
                const next = prev.filter(m => m.id !== tempMsg.id);
                storeSetMessages(chatId, next);
                return next;
            });
            throw error;
        } else {
            if (inserted) {
                setMessages(prev => {
                    const next = prev.map(m => m.id === tempMsg.id ? inserted as Message : m);
                    storeSetMessages(chatId, next);
                    return next;
                });
            }
            fetchConversations(userId);
        }
    };

    // ✅ Supports both 'me' (delete for me only) and 'everyone' (delete for everyone)
    const deleteMessage = async (messageId: string, mode: 'me' | 'everyone' = 'me') => {
        if (!userId) return;

        if (mode === 'me') {
            addDeletedForMe(userId, messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
            if (activeChat) {
                const currentMsgs = useChatStore.getState().messages[activeChat.id] || [];
                storeSetMessages(activeChat.id, currentMsgs.filter(m => m.id !== messageId));
            }
        } else {
            // Delete for everyone — update message content in DB
            const patch = { content: 'This message was deleted', image_url: undefined, audio_url: undefined };
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...patch } : m));
            if (activeChat) {
                const currentMsgs = useChatStore.getState().messages[activeChat.id] || [];
                storeSetMessages(activeChat.id, currentMsgs.map(m => m.id === messageId ? { ...m, ...patch } : m));
            }

            const { error } = await supabase
                .from('messages')
                .update({
                    content: 'This message was deleted',
                    image_url: null,
                    audio_url: null
                })
                .eq('id', messageId);

            if (error) {
                console.error('Error deleting message for everyone:', error);
            }
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
        deleteMessage,
        setConversations: storeSetConversations
    };
}
