import { create } from 'zustand';

interface Track {
    id: string;
    title: string;
    audioUrl: string;
    source: string;
    thumbnail?: string;
}

interface AudioState {
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    playTrack: (track: Track) => void;
    pauseTrack: () => void;
    resumeTrack: () => void;
    stopTrack: () => void;
    setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
    currentTrack: null,
    isPlaying: false,
    volume: 1,
    playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
    pauseTrack: () => set({ isPlaying: false }),
    resumeTrack: () => set({ isPlaying: true }),
    stopTrack: () => set({ currentTrack: null, isPlaying: false }),
    setVolume: (volume) => set({ volume }),
}));
