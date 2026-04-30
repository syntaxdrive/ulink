import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

export default function MessagesPage() {
    const {
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
        setConversations
    } = useChat();

    const [searchParams] = useSearchParams();
    const initialChatId = searchParams.get('chat');

    const initialMessage = searchParams.get('text');
    const [activeTab, setActiveTab] = useState<'all' | 'market'>('all');
    const lastProcessedRef = useRef<string | null>(null);
    const lastDeepLinkRef = useRef<string | null>(null);

    // Auto-switch to Marketplace tab if we have a market message
    useEffect(() => {
        if (initialMessage?.includes('🛒')) {
            setActiveTab('market');
        }
    }, [initialMessage]);

    // Handle Deep Linking to Chat
    useEffect(() => {
        const handleDeepLink = async () => {
            if (!initialChatId || conversations.length === 0 || lastDeepLinkRef.current === initialChatId) return;
            lastDeepLinkRef.current = initialChatId;

            // 1. Try to find in existing conversations
            let target = conversations.find(c => c.id === initialChatId);

            // 2. If not found, fetch the profile (new chat)
            if (!target) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', initialChatId)
                    .single();
                
                if (profile) {
                    target = profile as Profile;
                    // Add to store so ChatSidebar can show it
                    setConversations([target, ...conversations]);
                }
            }

            if (target) setActiveChat(target);
        };

        handleDeepLink();
    }, [initialChatId, conversations, activeChat, setActiveChat, setConversations]);

    // Handle Pre-filled Message (Marketplace)
    useEffect(() => {
        // We only send if we have a message and a chat, and haven't processed THIS message/chat combo yet
        const messageKey = `${initialChatId}-${initialMessage}`;
        
        if (activeChat && userId && initialMessage && lastProcessedRef.current !== messageKey) {
            lastProcessedRef.current = messageKey;
            sendMessage(initialMessage);
            // Completely clear URL to prevent "stickiness" and resending
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [activeChat, userId, initialMessage, sendMessage]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-[64px] md:top-0 left-0 md:left-[280px] right-0 bottom-[60px] md:bottom-0 bg-white dark:bg-black z-20 flex">
            {/* Sidebar: Visible on mobile if no active chat, always on desktop */}
            <ChatSidebar
                conversations={conversations}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                unreadCounts={unreadCounts}
                onlineUsers={onlineUsers}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Chat Window or Empty State */}
            {activeChat ? (
                <div className="flex-1 flex flex-col h-full w-full md:w-auto">
                    <ChatWindow
                        activeChat={activeChat}
                        messages={messages}
                        userId={userId}
                        onlineUsers={onlineUsers}
                        onBack={() => setActiveChat(null)}
                        onSendMessage={sendMessage}
                        onDeleteMessage={deleteMessage}
                    />
                </div>
            ) : (
                <div className={`flex-1 flex-col items-center justify-center text-stone-400 dark:text-zinc-600 bg-stone-50/50 dark:bg-zinc-950/50 hidden md:flex`}>
                    <div className="w-16 h-16 bg-stone-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 opacity-20 dark:opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
}
