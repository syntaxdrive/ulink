import { create } from 'zustand';

interface StudyRoom {
    id: string;
    creator_id: string;
    name: string;
    subject: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    participant_count?: number;
    is_private?: boolean;
    allow_drawing?: boolean;
}

interface StudyRoomStore {
    rooms: StudyRoom[];
    lastFetched: number;
    setRooms: (rooms: StudyRoom[]) => void;
    needsRefresh: () => boolean;
}

export const useStudyRoomStore = create<StudyRoomStore>((set, get) => ({
    rooms: [],
    lastFetched: 0,
    setRooms: (rooms) => set({ rooms, lastFetched: Date.now() }),
    needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 5, // 5 minute cache
}));
