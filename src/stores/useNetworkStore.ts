import { create } from 'zustand';
import type { Profile } from '../types';

interface NetworkStore {
    suggestions: Profile[];
    myNetwork: Profile[];
    connections: string[];      // IDs of accepted connections
    sentRequests: string[];     // IDs of pending sent requests
    userProfile: Profile | null;
    lastFetched: number;

    setNetworkData: (data: {
        suggestions: Profile[];
        myNetwork: Profile[];
        connections: string[];
        sentRequests: string[];
        userProfile: Profile | null;
    }) => void;
    addSentRequest: (id: string) => void;
    removeSentRequest: (id: string) => void;
    addConnection: (id: string) => void;
    needsRefresh: () => boolean;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
    suggestions: [],
    myNetwork: [],
    connections: [],
    sentRequests: [],
    userProfile: null,
    lastFetched: 0,

    setNetworkData: (data) => set({
        ...data,
        lastFetched: Date.now(),
    }),

    addSentRequest: (id) => set((state) => ({
        sentRequests: [...state.sentRequests, id],
    })),

    removeSentRequest: (id) => set((state) => ({
        sentRequests: state.sentRequests.filter((r) => r !== id),
    })),

    addConnection: (id) => set((state) => ({
        connections: [...state.connections, id],
        sentRequests: state.sentRequests.filter((r) => r !== id),
    })),

    needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 5, // 5-min TTL
}));
