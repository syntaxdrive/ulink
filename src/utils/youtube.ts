/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    // Support various YouTube URL formats:
    // - youtube.com/watch?v=VIDEO_ID
    // - youtu.be/VIDEO_ID
    // - youtube.com/embed/VIDEO_ID
    // - youtube.com/v/VIDEO_ID

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
    const qualityMap = {
        'default': 'default',
        'mq': 'mqdefault',
        'hq': 'hqdefault',
        'sd': 'sddefault',
        'maxres': 'maxresdefault',
    };

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null;
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = false): string {
    const params = new URLSearchParams({
        rel: '0', // Don't show related videos
        modestbranding: '1', // Minimal YouTube branding
        ...(autoplay && { autoplay: '1' }),
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Format duration from seconds to readable format
 */
export function formatCourseDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes}m`;
}

/**
 * Parse ISO 8601 duration (YouTube format) to seconds
 * Example: PT15M30S = 15 minutes 30 seconds
 */
export function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
}
