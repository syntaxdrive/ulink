/**
 * YouTube Data API Service
 * Fetches educational videos for the Learn page
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    viewCount: string;
    publishedAt: string;
}

/**
 * Categories for fine-tuning
 */
export const CATEGORIES = {
    'All': [],
    'Career & Internships': [
        'internship tips nigeria', 'resume hacks', 'job interview tips', 'career advice for students',
        'linkedin profile tips', 'how to get internship lagos', 'networking hacks', 'nysc tips'
    ],
    'Tech Skills': [
        'excel tips and tricks', 'coding tips', 'web development shorts', 'python tricks',
        'tech tools for productivity', 'nigerian tech community'
    ],
    'AI & Future Tools': [
        'chatgpt tips', 'midjourney tutorial', 'ai tools for students', 'productivity ai',
        'future of work', 'ai for coding'
    ],
    'Freelance & Hustle': [
        'freelancing tips nigeria', 'upwork guide for beginners', 'how to make money online nigeria student',
        'side hustle nigeria', 'personal branding tips', 'fiverr tips'
    ],
    'Design & Portfolio': [
        'design portfolio tips', 'figma tips', 'graphic design hacks', 'ui ux design tips',
        'creative portfolio examples'
    ],
    'Study & Exams': [
        'exam study hacks', 'jamb preparation tips', 'waec study tips', 'university life nigeria',
        'productivity tips for students', 'focus tips', 'first class degree tips'
    ],
    'Soft Skills': [
        'public speaking tips', 'leadership skills', 'confidence hacks', 'communication skills',
        'presentation tips'
    ],
    'Business & Finance': [
        'business ideas nigeria student', 'student finance tips', 'startup advice nigeria',
        'investing for students nigeria', 'personal finance for students', 'marketing tips'
    ],
    'Student Wellbeing': [
        'student mental health', 'burnout tips', 'university life balance', 'stress management tips',
        'student motivation'
    ]
};

export type Category = keyof typeof CATEGORIES;

/**
 * Get a random topic based on category
 */
const getRandomTopic = (category: Category = 'All') => {
    let topics: string[] = [];

    if (category === 'All') {
        // Combine all topics
        Object.values(CATEGORIES).forEach(t => topics.push(...t));
    } else {
        topics = CATEGORIES[category] || [];
    }

    // Fallback if empty
    if (topics.length === 0) topics = CATEGORIES['Career & Internships'];

    return topics[Math.floor(Math.random() * topics.length)];
};

/**
 * Fetch educational videos from YouTube
 */
export const fetchEducationalVideos = async (
    category: Category = 'All',
    pageToken?: string,
    maxResults: number = 20,
    searchQuery?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> => {
    try {
        let query;

        if (searchQuery) {
            // Smart Search: Enforce academic/career context
            const context = '(study OR university OR internship OR career OR skills OR tutorial OR "how to" OR tips OR advice)';
            const exclusions = '-gameplay -fortnite -minecraft -roblox -funny -prank -music -song -reaction -dance';
            query = `${searchQuery} ${context} #shorts ${exclusions}`;
        } else {

            const topic = getRandomTopic(category);

            // Localization Strategy: 60% Nigerian Context / 40% Global
            // This ensures "a pinch" of foreign content but focuses on Nigeria
            const isNigerianContext = Math.random() > 0.4;
            const geoContext = isNigerianContext ? '(Nigeria OR "Nigerian student" OR Lagos OR "African tech" OR NYSC OR JAMB OR "University of Lagos" OR Unilag OR Covenant University)' : '';

            // Default Topic Search
            query = `${topic} ${geoContext} (tips OR guide OR hacks OR advice OR tutorial) #shorts -gameplay -fortnite -minecraft -roblox -funny -prank`;
        }

        const params = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            videoDuration: 'short', // API filter for < 4 mins
            videoEmbeddable: 'true',
            maxResults: maxResults.toString(),
            order: 'relevance',
            relevanceLanguage: 'en',
            safeSearch: 'strict',
            key: YOUTUBE_API_KEY
        });

        if (pageToken) {
            params.append('pageToken', pageToken);
        }

        const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch videos from YouTube');
        }

        const data = await response.json();

        // Get video details (duration, views, etc.)
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
            `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );

        const detailsData = await detailsResponse.json();

        const videos: YouTubeVideo[] = data.items.map((item: any, index: number) => {
            const details = detailsData.items[index];

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                duration: details?.contentDetails?.duration || 'PT0S',
                viewCount: details?.statistics?.viewCount || '0',
                publishedAt: item.snippet.publishedAt
            };
        }).filter((video: YouTubeVideo) => {
            // 1. REJECT BANNED KEYWORDS (Content Filtering)
            const lowerTitle = video.title.toLowerCase();
            const rejectWords = [
                'gameplay', 'gaming', 'funny', 'comedy', 'prank', 'skit',
                'music video', 'remix', 'fortnite', 'minecraft', 'roblox',
                'meme', 'compilation', 'moments', 'fail', 'gta', 'cod',
                'call of duty', 'ps5', 'xbox', 'playstation', 'stream',
                'live', 'reaction', 'challenge', 'tiktok', 'hero',
                'movie', 'trailer', 'vlog', 'entertainment'
            ];

            if (rejectWords.some(word => lowerTitle.includes(word))) {
                return false;
            }

            // 2. STRICT DURATION FILTER: Only allow videos <= 60 seconds
            const duration = video.duration;

            // Reject hours
            if (duration.includes('H')) return false;

            // Reject if minutes > 1 (e.g. PT2M)
            // Accept PT1M (60s exact) or PTxxS
            const matchMin = duration.match(/PT(\d+)M/);
            if (matchMin) {
                const minutes = parseInt(matchMin[1]);
                if (minutes > 1) return false;
                // If exactly 1 min, allow only if no seconds (PT1M) or 0S
                if (minutes === 1 && duration.includes('S') && !duration.includes('0S')) {
                    return false;
                }
            }

            return true;
        });

        return {
            videos,
            nextPageToken: data.nextPageToken
        };
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);

        // Return fallback curated videos if API fails
        return {
            videos: getFallbackVideos(),
            nextPageToken: undefined
        };
    }
};

/**
 * Fallback curated videos (in case API fails or no API key)
 */
const getFallbackVideos = (): YouTubeVideo[] => {
    return [
        {
            id: 'Tn6-PIqc4UM',
            title: 'React in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://img.youtube.com/vi/Tn6-PIqc4UM/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
            duration: 'PT2M30S',
            viewCount: '1000000',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'Mus_vwhTCq0',
            title: 'JavaScript Pro Tips - Code This, Not That',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://img.youtube.com/vi/Mus_vwhTCq0/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=Mus_vwhTCq0',
            duration: 'PT8M15S',
            viewCount: '2000000',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'uuOXPWCh-6o',
            title: 'CSS Grid in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://img.youtube.com/vi/uuOXPWCh-6o/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=uuOXPWCh-6o',
            duration: 'PT2M45S',
            viewCount: '800000',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'hwP7WQkmECE',
            title: 'Git Explained in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://img.youtube.com/vi/hwP7WQkmECE/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=hwP7WQkmECE',
            duration: 'PT2M20S',
            viewCount: '1500000',
            publishedAt: new Date().toISOString()
        },
        {
            id: 'zQnBQ4tB3ZA',
            title: 'TypeScript in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://img.youtube.com/vi/zQnBQ4tB3ZA/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA',
            duration: 'PT2M35S',
            viewCount: '1200000',
            publishedAt: new Date().toISOString()
        }
    ];
};

/**
 * Format duration from ISO 8601 to readable format
 */
export const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '0').replace('S', '');

    if (hours) {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

/**
 * Format view count to readable format
 */
export const formatViewCount = (count: string): string => {
    const num = parseInt(count);
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M views`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
};
