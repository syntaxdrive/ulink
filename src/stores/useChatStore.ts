import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Profile, type Message } from '../types';

interface ChatStore {
    conversations: Profile[];
    messages: Record<string, Message[]>; // Keyed by chat partner ID
    activeChatId: string | null;
    unreadCounts: Record<string, number>;

    lastFetched: number;
    setConversations: (convs: Profile[]) => void;
    setMessages: (chatId: string, msgs: Message[]) => void;
    addMessage: (chatId: string, msg: Message) => void;
    setActiveChatId: (id: string | null) => void;
    setUnreadCount: (chatId: string, count: number) => void;
    incrementUnread: (chatId: string) => void;
    clearUnread: (chatId: string) => void;
    needsRefresh: () => boolean;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeChatId: null,
            unreadCounts: {},
            lastFetched: 0,

            setConversations: (convs) => set({ 
                conversations: convs, 
                lastFetched: Date.now() 
            }),
            setMessages: (chatId, msgs) => set((state) => ({
                messages: { ...state.messages, [chatId]: msgs }
            })),
            addMessage: (chatId, msg) => set((state) => ({
                messages: {
                    ...state.messages,
                    [chatId]: [...(state.messages[chatId] || []), msg]
                }
            })),
            setActiveChatId: (id) => set({ activeChatId: id }),
            setUnreadCount: (chatId, count) => set((state) => ({
                unreadCounts: { ...state.unreadCounts, [chatId]: count }
            })),
            incrementUnread: (chatId) => set((state) => ({
                unreadCounts: { ...state.unreadCounts, [chatId]: (state.unreadCounts[chatId] || 0) + 1 }
            })),
            clearUnread: (chatId) => set((state) => {
                const newCounts = { ...state.unreadCounts };
                delete newCounts[chatId];
                return { unreadCounts: newCounts };
            }),
            needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 10,
        }),
        {
            name: 'ulink-chat-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                conversations: state.conversations.slice(0, 20),
                messages: Object.fromEntries(
                    Object.entries(state.messages).map(([id, msgs]) => [id, msgs.slice(-20)])
                ),
                unreadCounts: state.unreadCounts
            }),
        }
    )
);
