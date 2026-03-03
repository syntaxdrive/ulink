import { type Profile } from '../types';

export interface CompletionCheck {
    label: string;
    completed: boolean;
    weight: number;
}

export const calculateProfileCompletion = (profile: Partial<Profile> | any) => {
    if (!profile) return { checks: [], percentage: 0 };

    const hasSocials = !!(
        profile.linkedin_url ||
        profile.github_url ||
        profile.twitter_url ||
        profile.instagram_url ||
        profile.facebook_url ||
        profile.website_url ||
        profile.youtube_url ||
        profile.tiktok_url ||
        profile.whatsapp_url
    );

    const checks: CompletionCheck[] = [
        { label: 'Profile Photo', completed: !!profile.avatar_url, weight: 12.5 },
        { label: 'Cover Photo', completed: !!profile.background_image_url, weight: 12.5 },
        { label: 'Headline', completed: !!profile.headline && profile.headline.length >= 5, weight: 12.5 },
        { label: 'Bio / About', completed: !!profile.about && profile.about.length >= 20, weight: 12.5 },
        { label: 'Location', completed: !!profile.location, weight: 12.5 },
        { label: profile.role === 'org' ? 'Industry' : 'University', completed: profile.role === 'org' ? !!profile.industry : !!profile.university, weight: 12.5 },
        { label: 'Skills', completed: !!profile.skills && profile.skills.length >= 1, weight: 12.5 },
        { label: 'Social Links', completed: hasSocials, weight: 12.5 },
    ];

    const completedWeight = checks.filter(c => c.completed).reduce((sum, check) => sum + check.weight, 0);
    const percentage = Math.round(completedWeight);

    return { checks, percentage };
};
