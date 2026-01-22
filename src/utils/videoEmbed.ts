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
    isVertical?: boolean;
}

/**
 * Extract YouTube video ID from various URL formats
 */
const getYouTubeId = (url: string): { id: string, isShorts: boolean } | null => {
    const shortsPattern = /youtube\.com\/shorts\/([^&\n?#]+)/;
    const shortsMatch = url.match(shortsPattern);
    if (shortsMatch) return { id: shortsMatch[1], isShorts: true };

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return { id: match[1], isShorts: false };
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
    const youtubeData = getYouTubeId(text);
    if (youtubeData) {
        return {
            platform: 'youtube',
            videoId: youtubeData.id,
            embedUrl: `https://www.youtube.com/embed/${youtubeData.id}`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeData.id}/maxresdefault.jpg`,
            isVertical: youtubeData.isShorts
        };
    }

    // TikTok
    const tiktokId = getTikTokId(text);
    if (tiktokId) {
        return {
            platform: 'tiktok',
            videoId: tiktokId,
            embedUrl: `https://www.tiktok.com/embed/v2/${tiktokId}`,
            isVertical: true
        };
    }

    // Instagram
    const instagramId = getInstagramId(text);
    if (instagramId) {
        const isReel = text.includes('/reel/');
        return {
            platform: 'instagram',
            videoId: instagramId,
            embedUrl: `https://www.instagram.com/p/${instagramId}/embed`,
            isVertical: isReel
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
