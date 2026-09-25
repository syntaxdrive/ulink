import { create } from 'zustand';
import { type Podcast } from '../types';

interface PodcastStore {
    podcasts: Podcast[];
    lastFetched: number;
    
    setPodcasts: (podcasts: Podcast[]) => void;
    needsRefresh: () => boolean;
}

export const usePodcastStore = create<PodcastStore>((set, get) => ({
    podcasts: [],
    lastFetched: 0,
    
    setPodcasts: (podcasts) => set({ 
        podcasts, 
        lastFetched: Date.now() 
    }),
    
    needsRefresh: () => {
        const state = get();
        if (state.podcasts.length === 0) return true;
        // Refresh every 10 minutes
        return Date.now() - state.lastFetched > 1000 * 60 * 10;
    },
}));
