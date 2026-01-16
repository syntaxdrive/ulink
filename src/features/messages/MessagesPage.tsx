import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';

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
        deleteMessage
    } = useChat();

    const [searchParams] = useSearchParams();
    const initialChatId = searchParams.get('chat');

    // Handle Deep Linking to Chat
    useEffect(() => {
        if (initialChatId && conversations.length > 0 && !activeChat) {
            const target = conversations.find(c => c.id === initialChatId);
            if (target) setActiveChat(target);
        }
    }, [initialChatId, conversations, activeChat, setActiveChat]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-[64px] md:top-0 left-0 md:left-[280px] right-0 bottom-[60px] md:bottom-0 bg-white z-20 flex">
            {/* Sidebar: Visible on mobile if no active chat, always on desktop */}
            <ChatSidebar
                conversations={conversations}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                unreadCounts={unreadCounts}
                onlineUsers={onlineUsers}
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
                <div className={`flex-1 flex-col items-center justify-center text-stone-400 bg-stone-50/50 hidden md:flex`}>
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 opacity-20" />
                    </div>
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
}
