import { create } from 'zustand';
import { type Profile, type Message } from '../types';

interface ChatStore {
    conversations: Profile[];
    messages: Record<string, Message[]>; // Keyed by chat partner ID
    activeChatId: string | null;
    unreadCounts: Record<string, number>;

    setConversations: (convs: Profile[]) => void;
    setMessages: (chatId: string, msgs: Message[]) => void;
    addMessage: (chatId: string, msg: Message) => void;
    setActiveChatId: (id: string | null) => void;
    setUnreadCount: (chatId: string, count: number) => void;
    incrementUnread: (chatId: string) => void;
    clearUnread: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    conversations: [],
    messages: {},
    activeChatId: null,
    unreadCounts: {},

    setConversations: (convs) => set({ conversations: convs }),
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
    })
}));
