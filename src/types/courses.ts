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
export type CourseContentType = 'video' | 'document' | 'both';

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

    // Document fields (optional — course may be video-only)
    document_url: string | null;
    document_name: string | null;
    document_size: number | null;
    document_type: string | null;
    content_type: CourseContentType;

    // Joined data
    profiles?: {
        id: string;
        name: string;
        username: string | null;
        avatar_url: string | null;
        university: string | null;
        is_verified: boolean;
    };

    // User interaction states
    user_has_liked?: boolean;
    user_has_enrolled?: boolean;

    // Attached documents (joined when needed)
    course_documents?: CourseDocument[];
}

export interface CourseDocument {
    id: string;
    course_id: string;
    uploader_id: string;
    name: string;
    storage_path: string;
    public_url: string;
    file_type: string;
    file_size: number;
    downloads_count: number;
    created_at: string;
}

export interface UserDocumentDownload {
    id: string;
    user_id: string;
    document_id: string;
    downloaded_at: string;
    course_documents?: CourseDocument & {
        courses?: Pick<Course, 'id' | 'title' | 'category'>;
    };
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
        username: string | null;
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

// Accepted document MIME types
export const ACCEPTED_DOC_TYPES: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/plain': 'TXT',
};

// Map file extension → MIME type (fallback when file.type is empty, e.g. on iOS/Android)
export const EXTENSION_TO_MIME: Record<string, string> = {
    pdf:  'application/pdf',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt:  'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls:  'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt:  'text/plain',
};

/** Resolves the effective MIME type of a file, falling back to extension when file.type is empty */
export function resolveDocMimeType(file: File): string {
    if (file.type && ACCEPTED_DOC_TYPES[file.type]) return file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return EXTENSION_TO_MIME[ext] ?? file.type ?? '';
}

/** accept string for <input type="file"> that works on both desktop and mobile */
export const ACCEPTED_DOC_ATTR =
    '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,' +
    Object.keys(ACCEPTED_DOC_TYPES).join(',');

export const MAX_DOC_SIZE_MB = 25;
export const MAX_DOC_SIZE_BYTES = MAX_DOC_SIZE_MB * 1024 * 1024;

export function getDocIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📈';
    return '📃';
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
