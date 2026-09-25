export interface SponsoredPost {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    organization_id: string;
    content: string;
    media_url: string | null;
    media_type: 'image' | 'video' | null;
    cta_text: string;
    cta_url: string | null;
    target_audience: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    priority: number;
    impressions: number;
    clicks: number;
    max_impressions: number | null;
    max_clicks: number | null;

    // Joined organization profile
    organization?: {
        id: string;
        name: string;
        avatar_url: string | null;
        username: string | null;
        is_verified: boolean;
        gold_verified: boolean;
    };
}

export interface CreateSponsoredPostData {
    organization_id: string;
    content: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    cta_text?: string;
    cta_url?: string;
    target_audience?: string;
    start_date?: string;
    end_date?: string;
    priority?: number;
    max_impressions?: number;
    max_clicks?: number;
}

export interface UpdateSponsoredPostData extends Partial<CreateSponsoredPostData> {
    is_active?: boolean;
}
