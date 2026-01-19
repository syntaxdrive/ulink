
import { create } from 'zustand';

interface VideoState {
    playingId: string | null;
    setPlayingId: (id: string | null) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    playingId: null,
    setPlayingId: (id) => set({ playingId: id }),
}));
