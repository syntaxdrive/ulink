import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceListing } from '../types';

interface MarketplaceState {
    listings: MarketplaceListing[];
    lastFetched: number | null;
    setListings: (listings: MarketplaceListing[]) => void;
    addListing: (listing: MarketplaceListing) => void;
    updateListing: (id: string, patch: Partial<MarketplaceListing>) => void;
    removeListing: (id: string) => void;
    needsRefresh: () => boolean;
}

export const useMarketplaceStore = create<MarketplaceState>()(
    persist(
        (set, get) => ({
            listings: [],
            lastFetched: null,
            setListings: (listings) => set({ listings, lastFetched: Date.now() }),
            addListing: (listing) => set((state) => ({ 
                listings: [listing, ...state.listings] 
            })),
            updateListing: (id, patch) => set((state) => ({
                listings: state.listings.map((l) => l.id === id ? { ...l, ...patch } : l)
            })),
            removeListing: (id) => set((state) => ({
                listings: state.listings.filter((l) => l.id !== id)
            })),
            needsRefresh: () => {
                const { lastFetched } = get();
                if (!lastFetched) return true;
                return Date.now() - lastFetched > 1000 * 60 * 5; // 5 minutes TTL
            },
        }),
        {
            name: 'ulink-marketplace-storage',
        }
    )
);
