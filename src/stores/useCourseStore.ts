import { create } from 'zustand';
import type { Course } from '../types/courses';

interface CourseStore {
    courses: Course[];
    lastFetched: number;
    lastCategory: string | null; // Track which category was cached

    setCourses: (courses: Course[], category?: string | null) => void;
    updateCourse: (courseId: string, patch: Partial<Course>) => void;
    removeCourse: (courseId: string) => void;
    needsRefresh: (category?: string | null) => boolean;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
    courses: [],
    lastFetched: 0,
    lastCategory: null,

    setCourses: (courses, category = null) =>
        set({ courses, lastFetched: Date.now(), lastCategory: category ?? null }),

    updateCourse: (courseId, patch) =>
        set((state) => ({
            courses: state.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)),
        })),

    removeCourse: (courseId) =>
        set((state) => ({
            courses: state.courses.filter((c) => c.id !== courseId),
        })),

    needsRefresh: (category = null) => {
        const state = get();
        if (state.lastCategory !== (category ?? null)) return true; // Category changed
        return Date.now() - state.lastFetched > 1000 * 60 * 5; // 5-min TTL
    },
}));
