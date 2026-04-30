import { create } from 'zustand';

interface NewsItem {
    id: string;
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
    description: string;
    source: string;
    type: 'article' | 'video' | 'podcast';
    audioUrl?: string;
    author?: string;
}

interface NewsStore {
    news: Record<string, NewsItem[]>; // Keyed by tab (all, africa, podcasts)
    lastFetched: Record<string, number>;
    
    setNews: (tab: string, news: NewsItem[]) => void;
    needsRefresh: (tab: string) => boolean;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
    news: {},
    lastFetched: {},
    
    setNews: (tab, news) => set((state) => ({
        news: { ...state.news, [tab]: news },
        lastFetched: { ...state.lastFetched, [tab]: Date.now() }
    })),
    
    needsRefresh: (tab) => {
        const state = get();
        if (!state.news[tab]) return true;
        // Refresh every 15 minutes for news
        return Date.now() - (state.lastFetched[tab] || 0) > 1000 * 60 * 15;
    },
}));
