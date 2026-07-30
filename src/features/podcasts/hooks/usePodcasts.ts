import { supabase } from '../../../lib/supabase';
import type { Podcast, PodcastEpisode } from '../../../types';

// ✅ All select('*') replaced with specific column lists to reduce egress bandwidth

export async function fetchPodcasts(category?: string): Promise<Podcast[]> {
    let query = supabase
        .from('podcasts')
        .select(`
            id, title, description, category, cover_url, followers_count, status, creator_id,
            creator:profiles!creator_id (id, name, username, avatar_url, is_verified)
        `)
        .eq('status', 'approved')
        .order('followers_count', { ascending: false })
        .limit(50);

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function fetchMyPodcasts(userId: string): Promise<Podcast[]> {
    // ✅ Accepts userId as parameter — no getUser() call needed
    if (!userId) return [];

    const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, description, category, cover_url, followers_count, status, creator_id')
        .eq('creator_id', userId)
        .limit(50);

    if (error) throw error;
    return data ?? [];
}

export async function fetchEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('id, podcast_id, title, description, audio_url, cover_url, duration_seconds, episode_number, plays_count, is_published, created_at')
        .eq('podcast_id', podcastId)
        .eq('is_published', true)
        .order('episode_number', { ascending: true, nullsFirst: false })
        .limit(100);

    if (error) throw error;
    return data ?? [];
}

export async function fetchMyEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('id, podcast_id, title, description, audio_url, cover_url, duration_seconds, episode_number, plays_count, is_published, created_at')
        .eq('podcast_id', podcastId)
        .order('episode_number', { ascending: true, nullsFirst: false })
        .limit(100);

    if (error) throw error;
    return data ?? [];
}

export async function fetchIsFollowing(podcastId: string, userId: string): Promise<boolean> {
    // ✅ Accepts userId as parameter — no getUser() call needed
    if (!userId) return false;

    const { data } = await supabase
        .from('podcast_follows')
        .select('podcast_id')
        .eq('podcast_id', podcastId)
        .eq('user_id', userId)
        .maybeSingle();

    return !!data;
}

export async function applyForPodcast(
    userId: string,
    input: {
        title: string;
        description: string;
        category: string;
        cover_url?: string;
    }
): Promise<Podcast> {
    // ✅ Accepts userId as parameter — no getUser() call needed
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('podcasts')
        .insert({ ...input, creator_id: userId })
        .select('id, title, description, category, cover_url, followers_count, status, creator_id')
        .single();

    if (error) throw error;
    return data;
}

export async function uploadEpisode(
    podcastId: string,
    input: {
        title: string;
        description?: string;
        audio_url: string;
        cover_url?: string;
        duration_seconds: number;
        episode_number?: number;
    }
): Promise<PodcastEpisode> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .insert({ podcast_id: podcastId, ...input })
        .select('id, podcast_id, title, description, audio_url, cover_url, duration_seconds, episode_number, plays_count, is_published, created_at')
        .single();

    if (error) throw error;
    return data;
}

export async function followPodcast(podcastId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .insert({ podcast_id: podcastId, user_id: userId });

    // 23505 = unique_violation — already following, treat as success
    if (error && error.code !== '23505') throw error;
}

export async function unfollowPodcast(podcastId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .delete()
        .eq('podcast_id', podcastId)
        .eq('user_id', userId);

    if (error) throw error;
}

export async function incrementEpisodePlay(episodeId: string): Promise<void> {
    await supabase.rpc('increment_episode_plays', { p_episode_id: episodeId });
}

export async function deletePodcast(podcastId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId)
        .eq('creator_id', userId); // Security: only creator can delete

    if (error) throw error;
}

export async function deletePodcastEpisode(episodeId: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', episodeId);

    if (error) throw error;
}
