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

/**
 * Super lightweight browser-side YouTube transcript fetcher.
 * Bypasses CORS using reliable public proxies to download the hidden timedtext XML.
 */
export async function extractYouTubeTranscript(videoId: string): Promise<string | null> {
    try {
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];
        
        let html = '';
        const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        for (const proxy of proxies) {
            try {
                const res = await fetch(proxy + encodeURIComponent(targetUrl), {
                    headers: { 'Accept-Language': 'en-US,en;q=0.9' }
                });
                if (res.ok) {
                    html = await res.text();
                    if (html.includes('captionTracks')) break;
                }
            } catch (e) {
                // Ignore and try next proxy
            }
        }

        if (!html) return null;

        const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
        if (!captionsMatch || !captionsMatch[1]) return null;
        
        const tracks = JSON.parse(captionsMatch[1]);
        const track = tracks.find((t: any) => t.languageCode === 'en' || t.name?.simpleText?.includes('English')) || tracks[0];
        
        if (!track || !track.baseUrl) return null;
        
        // Fetch the raw XML transcript
        const xmlResponse = await fetch(track.baseUrl);
        if (!xmlResponse.ok) return null;
        
        const xmlText = await xmlResponse.text();
        const textMatches = xmlText.match(/<text[^>]*>(.*?)<\/text>/gi);
        if (!textMatches) return null;
        
        const transcript = textMatches.map(t => {
            const inner = t.match(/>(.*?)<\/text>/i);
            if (!inner) return '';
            return inner[1]
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<[^>]+>/g, '');
        }).join(' ');
        
        return transcript.replace(/\s+/g, ' ').slice(0, 150000).trim();
    } catch (err) {
        console.error('YouTube transcript extraction failed:', err);
        return null;
    }
}
