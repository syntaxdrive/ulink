import { create } from 'zustand';
import { type Community } from '../types';

interface CommunitiesStore {
    communities: Community[];
    lastFetched: number;
    
    setCommunities: (communities: Community[]) => void;
    needsRefresh: () => boolean;
}

export const useCommunitiesStore = create<CommunitiesStore>((set, get) => ({
    communities: [],
    lastFetched: 0,
    
    setCommunities: (communities) => set({ 
        communities, 
        lastFetched: Date.now() 
    }),
    
    needsRefresh: () => {
        const state = get();
        if (state.communities.length === 0) return true;
        // Refresh every 10 minutes
        return Date.now() - state.lastFetched > 1000 * 60 * 10;
    },
}));
