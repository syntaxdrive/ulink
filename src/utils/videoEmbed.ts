import { extractYouTubeId } from './youtube';

export interface VideoEmbed {
    type: 'youtube';
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

    return null;
}

/**
 * Remove video link from content
 */
export function removeVideoLink(content: string, embed: VideoEmbed): string {
    if (!content || !embed) return content;

    // Remove YouTube URLs
    return content
        .replace(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s]*/g, '')
        .trim();
}
