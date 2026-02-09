export type CourseCategory =
    | 'School'
    | 'Skill'
    | 'Tech'
    | 'Business'
    | 'Creative'
    | 'Language'
    | 'Health'
    | 'Other';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
    id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    video_id: string;
    category: CourseCategory;
    level: CourseLevel;
    author_id: string;
    thumbnail_url: string | null;
    duration: string | null;
    tags: string[] | null;
    views_count: number;
    enrollments_count: number;
    likes_count: number;
    created_at: string;
    updated_at: string;

    // Joined data
    profiles?: {
        id: string;
        name: string;
        avatar_url: string | null;
        university: string | null;
        is_verified: boolean;
    };

    // User interaction states
    user_has_liked?: boolean;
    user_has_enrolled?: boolean;
}

export interface CourseEnrollment {
    id: string;
    course_id: string;
    user_id: string;
    progress: number;
    completed: boolean;
    created_at: string;
}

export interface CourseLike {
    id: string;
    course_id: string;
    user_id: string;
    created_at: string;
}

export interface CourseComment {
    id: string;
    course_id: string;
    author_id: string;
    content: string;
    created_at: string;

    profiles?: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
}

export const COURSE_CATEGORIES: Record<CourseCategory, string> = {
    'School': 'School',
    'Skill': 'Skill',
    'Tech': 'Tech',
    'Business': 'Business',
    'Creative': 'Creative',
    'Language': 'Language',
    'Health': 'Health',
    'Other': 'Other',
};

export const COURSE_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
