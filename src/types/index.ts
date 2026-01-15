export interface Experience {
    title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    current?: boolean;
    description?: string;
}

export interface Certificate {
    id: string;
    user_id: string;
    title: string;
    issuing_org: string;
    issue_date?: string;
    credential_url?: string;
    credential_id?: string;
}

export interface Profile {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'org';
    university?: string;
    avatar_url?: string;
    headline?: string;
    location?: string;
    about?: string;
    skills?: string[];
    experience?: Experience[];
    certificates?: Certificate[];
    connections_count?: number;
    website?: string;
    github_url?: string;
    linkedin_url?: string;
    projects?: Project[];
    is_verified?: boolean;
    is_admin?: boolean;
    gold_verified?: boolean; // Computed from gold_verified_users table
    created_at: string;
}

export interface Project {
    title: string;
    description: string;
    link?: string;
    image_url?: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author?: Profile;
    profiles?: Profile; // For join
}

export interface Like {
    id: string;
    post_id: string;
    user_id: string;
}

export interface Post {
    id: string;
    author_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    profiles?: Profile; // Joined data
    // Client-side computed fields
    likes_count?: number;
    comments_count?: number;
    user_has_liked?: boolean;
}

export interface Connection {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted';
    created_at: string;
    requester?: Profile;
    recipient?: Profile;
}

export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    read_at?: string;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    type: 'Internship' | 'Entry Level' | 'Full Time';
    description?: string;
    application_link?: string;
    created_at: string;
    creator_id?: string;
}
