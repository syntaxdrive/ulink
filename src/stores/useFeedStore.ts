import { create } from 'zustand';
import { type Post, type Comment } from '../types';

interface FeedStore {
    posts: Post[];
    lastFetched: number;
    currentFeedId: string | null; // null for global, or communityId
    commentsCache: Record<string, Comment[]>;
    
    setPosts: (posts: Post[], feedId?: string | null) => void;
    addPost: (post: Post) => void;
    updatePost: (post: Post) => void;
    removePost: (postId: string) => void;
    needsRefresh: (feedId?: string | null) => boolean;
    setCommentsCache: (updater: (prev: Record<string, Comment[]>) => Record<string, Comment[]>) => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
    posts: [],
    lastFetched: 0,
    currentFeedId: null,
    commentsCache: {},
    
    setPosts: (posts, feedId = null) => set({ posts, lastFetched: Date.now(), currentFeedId: feedId }),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    updatePost: (updated) => set((state) => ({
        posts: state.posts.map((p) => (p.id === updated.id ? updated : p)),
    })),
    removePost: (postId) => set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
    })),
    needsRefresh: (feedId = null) => {
        const state = get();
        if (state.currentFeedId !== feedId) return true; // Context changed
        return Date.now() - state.lastFetched > 1000 * 60 * 5;
    },
    setCommentsCache: (updater) => set((state) => ({
        commentsCache: updater(state.commentsCache)
    })),
}));
