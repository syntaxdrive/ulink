import { FeedPost, FeedAuthor } from './feedService';
import { supabase } from '../lib/supabase';

export interface RssSourceConfig {
  hubId: string;
  author: FeedAuthor;
  feedUrl: string;
  category: string;
}

export const CURATED_HUB_PROFILES: Record<string, FeedAuthor> = {
  unilink_academy: {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'UniLink Academy 🎓',
    username: 'unilink_academy',
    avatar_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
    university: 'University of Ibadan',
    headline: 'Visual Math, Calculus & Study Hacks',
  },
  tech_scholars: {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Tech Scholars UI 💻',
    username: 'tech_scholars',
    avatar_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
    university: 'University of Ibadan',
    headline: 'Student Developers & Software Engineering',
  },
  campus_pulse: {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Campus Pulse 🇳🇬',
    username: 'campus_pulse',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
    university: 'University of Lagos',
    headline: 'Relatable Student Life & Campus Banter',
  },
  career_launch: {
    id: 'a1000000-0000-0000-0000-000000000004',
    name: 'Career Launchpad 🚀',
    username: 'career_launch',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
    university: 'Obafemi Awolowo University',
    headline: 'Internships, CV Masterclasses & Fellowships',
  },
  creative_commons_sci: {
    id: 'a1000000-0000-0000-0000-000000000005',
    name: 'Minute Science & Tech 🔬',
    username: 'creative_commons_sci',
    avatar_url: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?auto=format&fit=crop&w=400&q=80',
    is_verified: true,
    university: 'Ahmadu Bello University',
    headline: 'Open-Access Science & Engineering Visuals',
  },
};

/**
 * Free online RSS / JSON Feed Integrator
 * Fetches real, legal, copyright-free educational and tech content without any API keys.
 */
export const RssFeedService = {
  /**
   * Fetch live articles from free public Dev.to & Open RSS endpoints
   */
  async fetchLiveHubPosts(): Promise<FeedPost[]> {
    const posts: FeedPost[] = [];

    const endpoints = [
      {
        hubKey: 'tech_scholars',
        url: 'https://dev.to/api/articles?tag=programming&top=1&per_page=3',
      },
      {
        hubKey: 'unilink_academy',
        url: 'https://dev.to/api/articles?tag=productivity&top=1&per_page=3',
      },
      {
        hubKey: 'career_launch',
        url: 'https://dev.to/api/articles?tag=career&top=1&per_page=3',
      },
      {
        hubKey: 'creative_commons_sci',
        url: 'https://dev.to/api/articles?tag=ai&top=1&per_page=2',
      },
      {
        hubKey: 'campus_pulse',
        url: 'https://dev.to/api/articles?tag=discuss&top=1&per_page=2',
      },
    ];

    await Promise.allSettled(
      endpoints.map(async ({ hubKey, url }) => {
        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'UniLinkApp/1.0' } });
          if (!res.ok) return;
          const data = await res.json();
          if (!Array.isArray(data)) return;

          const author = CURATED_HUB_PROFILES[hubKey];
          if (!author) return;

          data.forEach((item: any) => {
            const cleanTitle = (item.title || '').trim();
            const cleanDesc = (item.description || '').trim();
            const tags = Array.isArray(item.tag_list)
              ? item.tag_list.map((t: string) => `#${t}`).join(' ')
              : '';

            const content = `${cleanTitle}\n\n${cleanDesc}\n\n${tags}`;
            const imageUrl =
              item.cover_image ||
              item.social_image ||
              (item.user && item.user.profile_image) ||
              null;

            posts.push({
              id: `rss_${hubKey}_${item.id}`,
              author_id: author.id,
              content,
              image_url: imageUrl,
              video_url: null,
              likes_count: 50 + (item.positive_reactions_count || 10) * 8,
              comments_count: 5 + (item.comments_count || 2) * 3,
              created_at: item.published_at || new Date().toISOString(),
              author,
            });
          });
        } catch (err) {
          console.warn(`Error fetching RSS feed for ${hubKey}:`, err);
        }
      })
    );

    return posts;
  },

  /**
   * Optionally sync fetched RSS items directly into Supabase database
   */
  async syncRssPostsToSupabase(): Promise<number> {
    try {
      const livePosts = await this.fetchLiveHubPosts();
      if (!livePosts.length) return 0;

      let insertedCount = 0;
      for (const p of livePosts) {
        const { error } = await supabase.from('posts').upsert(
          {
            id: p.id,
            author_id: p.author_id,
            content: p.content,
            image_url: p.image_url,
            video_url: p.video_url,
            likes_count: p.likes_count,
            comments_count: p.comments_count,
            created_at: p.created_at,
            updated_at: p.created_at,
          },
          { onConflict: 'id' }
        );

        if (!error) insertedCount++;
      }

      return insertedCount;
    } catch (err) {
      console.warn('Error syncing RSS posts to Supabase:', err);
      return 0;
    }
  },
};
