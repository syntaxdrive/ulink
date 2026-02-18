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
    certificate_pdf_url?: string; // PDF certificate upload
}

export interface Profile {
    id: string;
    email: string;
    name: string;
    username?: string;
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
    followers_count?: number;
    following_count?: number;
    website?: string;
    github_url?: string;
    linkedin_url?: string;
    projects?: Project[];
    is_verified?: boolean;
    is_admin?: boolean;
    gold_verified?: boolean; // Computed from gold_verified_users table
    created_at: string;
    background_image_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    website_url?: string;
    facebook_url?: string;
    industry?: string; // For organizations
    resume_url?: string; // Resume PDF URL
    points?: number; // User points for leaderboard
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

export interface Community {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon_url?: string;
    cover_image_url?: string;
    privacy: 'public' | 'private' | 'restricted';
    created_by: string;
    created_at: string;
    updated_at: string;
    members_count?: number; // Computed in UI
    is_member?: boolean; // UI helper
}

export interface CommunityMember {
    id: string;
    community_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
    joined_at: string;
    profile?: Profile; // Joined profile data
}

export interface Post {
    id: string;
    author_id: string;
    content: string | null;
    image_url?: string;
    image_urls?: string[]; // Multiple images support
    video_url?: string; // Video support
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count: number;
    reposts_count?: number; // Count of reposts
    user_has_liked: boolean;
    user_has_reposted?: boolean; // Whether current user has reposted
    profiles?: Profile; // Joined data
    community_id?: string; // Optional link to a community
    community?: Community; // Joined community data

    // Repost fields
    is_repost?: boolean; // Whether this is a repost
    original_post_id?: string; // ID of the original post if this is a repost
    original_post?: Post; // The original post data
    reposted_by?: Profile; // Profile of the person who reposted (for display)
    repost_comment?: string; // User's comment when quote reposting

    // Polls
    poll_options?: string[];
    poll_counts?: number[];
    user_vote?: number | null;
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

export interface Follow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
    follower?: Profile;
    following?: Profile;
}

export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    conversation_id?: string;
    content: string;
    image_url?: string;
    audio_url?: string;
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
    location?: string;
    salary_range?: string;
    deadline?: string;
    logo_url?: string;
    created_at: string;
    creator_id?: string;
    status?: 'active' | 'closed';
}
