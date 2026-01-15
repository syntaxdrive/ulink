import { create } from 'zustand';
import { type Post } from '../types';

interface FeedStore {
    posts: Post[];
    lastFetched: number;
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    updatePost: (post: Post) => void;
    removePost: (postId: string) => void;
    needsRefresh: () => boolean;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
    posts: [],
    lastFetched: 0,
    setPosts: (posts) => set({ posts, lastFetched: Date.now() }),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    updatePost: (updated) => set((state) => ({
        posts: state.posts.map((p) => (p.id === updated.id ? updated : p)),
    })),
    removePost: (postId) => set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
    })),
    // 80/20 Rule: Only refresh if data is older than 5 minutes
    needsRefresh: () => Date.now() - get().lastFetched > 1000 * 60 * 5,
}));
