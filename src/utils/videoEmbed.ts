/**
 * Video Link Embedding Utility
 * Detects video links and returns embed information
 * Supports: YouTube, TikTok, Instagram, Vimeo, Twitter/X
 */

export interface VideoEmbed {
    platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'twitter' | null;
    videoId: string;
    embedUrl: string;
    thumbnailUrl?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
const getYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

/**
 * Extract TikTok video ID from URL
 */
const getTikTokId = (url: string): string | null => {
    const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    return match ? match[1] : null;
};

/**
 * Extract Instagram Reel ID from URL
 */
const getInstagramId = (url: string): string | null => {
    const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
};

/**
 * Extract Vimeo video ID from URL
 */
const getVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
};

/**
 * Extract Twitter/X video ID from URL
 */
const getTwitterId = (url: string): string | null => {
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
};

/**
 * Detect video link in text and return embed information
 */
export const detectVideoEmbed = (text: string): VideoEmbed | null => {
    if (!text) return null;

    // YouTube
    const youtubeId = getYouTubeId(text);
    if (youtubeId) {
        return {
            platform: 'youtube',
            videoId: youtubeId,
            embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        };
    }

    // TikTok
    const tiktokId = getTikTokId(text);
    if (tiktokId) {
        return {
            platform: 'tiktok',
            videoId: tiktokId,
            embedUrl: `https://www.tiktok.com/embed/v2/${tiktokId}`,
        };
    }

    // Instagram
    const instagramId = getInstagramId(text);
    if (instagramId) {
        return {
            platform: 'instagram',
            videoId: instagramId,
            embedUrl: `https://www.instagram.com/p/${instagramId}/embed`,
        };
    }

    // Vimeo
    const vimeoId = getVimeoId(text);
    if (vimeoId) {
        return {
            platform: 'vimeo',
            videoId: vimeoId,
            embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        };
    }

    // Twitter/X
    const twitterId = getTwitterId(text);
    if (twitterId) {
        return {
            platform: 'twitter',
            videoId: twitterId,
            embedUrl: text, // Twitter uses the full URL
        };
    }

    return null;
};

/**
 * Check if text contains a video link
 */
export const hasVideoLink = (text: string): boolean => {
    return detectVideoEmbed(text) !== null;
};

/**
 * Remove video link from text (to avoid showing URL twice)
 */
export const removeVideoLink = (text: string, videoEmbed: VideoEmbed): string => {
    if (!videoEmbed) return text;

    const patterns = [
        /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)[\w-]+(?:[^\s]*)?/gi,
        /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+(?:[^\s]*)?/gi,
        /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+(?:[^\s]*)?/gi,
        /https?:\/\/(?:www\.)?vimeo\.com\/\d+(?:[^\s]*)?/gi,
        /https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+(?:[^\s]*)?/gi,
    ];

    let result = text;
    for (const pattern of patterns) {
        result = result.replace(pattern, '').trim();
    }

    return result;
};
