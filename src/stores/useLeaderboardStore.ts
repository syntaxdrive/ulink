import { create } from 'zustand';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    headline: string | null;
    points: number;
    is_verified: boolean;
    gold_verified: boolean;
}

interface UserRank {
    rank: number;
    total_users: number;
    points: number;
}

interface LeaderboardStore {
    leaderboard: LeaderboardEntry[];
    userRank: UserRank | null;
    currentUserId: string | null;
    lastFetched: number;

    setLeaderboardData: (data: {
        leaderboard: LeaderboardEntry[];
        userRank: UserRank | null;
        currentUserId: string | null;
    }) => void;
    needsRefresh: () => boolean;
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
    leaderboard: [],
    userRank: null,
    currentUserId: null,
    lastFetched: 0,

    setLeaderboardData: (data) => set({
        ...data,
        lastFetched: Date.now(),
    }),

    needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 5, // 5-min TTL
}));
