import { create } from 'zustand';

export interface Track {
    id: string;
    title: string;
    audioUrl: string;
    source: string;
    thumbnail?: string;
    // Optional podcast-specific metadata
    episodeId?: string;
    podcastId?: string;
}

interface AudioState {
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    isExpanded: boolean;
    queue: Track[];
    queueIndex: number;

    // Existing actions (unchanged — NewsPage uses these exact signatures)
    playTrack: (track: Track) => void;
    pauseTrack: () => void;
    resumeTrack: () => void;
    stopTrack: () => void;
    setVolume: (volume: number) => void;

    // New actions
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    toggleExpanded: () => void;
    setExpanded: (expanded: boolean) => void;
    /** Set a playlist and immediately play the track at `index`. */
    setQueue: (tracks: Track[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isExpanded: false,
    queue: [],
    queueIndex: 0,

    // Existing — kept exactly compatible
    playTrack: (track) => set({
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        queue: [],
        queueIndex: 0,
    }),
    pauseTrack: () => set({ isPlaying: false }),
    resumeTrack: () => set({ isPlaying: true }),
    stopTrack: () => set({
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isExpanded: false,
        queue: [],
        queueIndex: 0,
    }),
    setVolume: (volume) => set({ volume }),

    // New
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
    setExpanded: (expanded) => set({ isExpanded: expanded }),

    setQueue: (tracks, index) => {
        if (!tracks.length) return;
        const track = tracks[index];
        if (!track) return;
        set({
            queue: tracks,
            queueIndex: index,
            currentTrack: track,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
        });
    },

    playNext: () => {
        const { queue, queueIndex } = get();
        const next = queueIndex + 1;
        if (next < queue.length) {
            set({ queueIndex: next, currentTrack: queue[next], isPlaying: true, currentTime: 0, duration: 0 });
        }
    },

    playPrevious: () => {
        const { queue, queueIndex, currentTime } = get();
        // If >3 s into the track, restart it; otherwise skip back
        if (currentTime > 3) {
            set({ currentTime: 0 });
            return;
        }
        const prev = queueIndex - 1;
        if (prev >= 0) {
            set({ queueIndex: prev, currentTrack: queue[prev], isPlaying: true, currentTime: 0, duration: 0 });
        }
    },
}));
