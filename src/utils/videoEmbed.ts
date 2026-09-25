import { extractYouTubeId } from './youtube';

export interface VideoEmbed {
    type: 'youtube' | 'instagram';
    id: string;
    url: string;
}

/**
 * Detect video embed links in content
 */
export function detectVideoEmbed(content: string): VideoEmbed | null {
    if (!content) return null;

    // Extract YouTube links
    const youtubeId = extractYouTubeId(content);
    if (youtubeId) {
        return {
            type: 'youtube',
            id: youtubeId,
            url: `https://www.youtube.com/watch?v=${youtubeId}`
        };
    }

    // Extract Instagram links (Posts, Reels, TV)
    const instagramMatch = content.match(/https?:\/\/(www\.)?instagram\.com\/(p|reels|tv)\/([a-zA-Z0-9_-]+)/i);
    if (instagramMatch && instagramMatch[3]) {
        return {
            type: 'instagram',
            id: instagramMatch[3],
            url: instagramMatch[0]
        };
    }

    return null;
}

/**
 * Remove video link from content
 */
export function removeVideoLink(content: string, embed: VideoEmbed): string {
    if (!content || !embed) return content;

    // Remove YouTube URLs
    let newContent = content.replace(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s]*/gi, '');

    // Remove Instagram URLs
    newContent = newContent.replace(/https?:\/\/(www\.)?instagram\.com\/(p|reels|tv)\/([a-zA-Z0-9_-]+)[^\s]*/gi, '');

    return newContent.trim();
}
