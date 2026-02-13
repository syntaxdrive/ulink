import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabase';

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

export function useChatMessages(chatId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const markAsRead = async (senderId: string, currentUserId: string) => {
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('sender_id', senderId)
            .eq('recipient_id', currentUserId)
            .is('read_at', null);
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch initial messages
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},recipient_id.eq.${chatId}),and(sender_id.eq.${chatId},recipient_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            setMessages(data || []);
            setLoading(false);

            if (data && data.length > 0) {
                markAsRead(chatId, user.id);
            }
        };
        init();
    }, [chatId]);

    // Subscription
    useEffect(() => {
        if (!userId || !chatId) return;

        const channel = supabase
            .channel(`chat:${chatId}_${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    // Check if this message belongs to this conversation
                    if (
                        (newMsg.sender_id === chatId && newMsg.recipient_id === userId) ||
                        (newMsg.sender_id === userId && newMsg.recipient_id === chatId)
                    ) {
                        setMessages((prev) => {
                            // Deduplicate
                            if (prev.some(m => m.id === newMsg.id)) return prev;

                            // Remove optimistic message if this is the real one (hard to match without temp ID, 
                            // but usually we rely on the sendMessage function to replace it. 
                            // However, if it comes from another device, just append.)

                            const updated = [...prev, newMsg];
                            // Ensure sorted order
                            return updated.sort((a, b) =>
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                        });

                        // Mark as read if it's an incoming message
                        if (newMsg.sender_id === chatId) {
                            markAsRead(chatId, userId);
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log('Subscribed to chat changes');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, userId]);

    const sendMessage = async (content: string) => {
        if (!userId) return;

        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            sender_id: userId,
            recipient_id: chatId,
            content,
            created_at: new Date().toISOString(),
            read_at: null,
            image_url: null,
            audio_url: null
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const { error, data } = await supabase.from('messages').insert({
            sender_id: userId,
            recipient_id: chatId,
            content
        }).select().single();

        if (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)); // Rollback
        } else if (data) {
            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }
    };

    return {
        messages,
        loading,
        userId,
        sendMessage
    };
}
