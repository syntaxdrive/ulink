import { supabase } from '../../../lib/supabase';
import type { Podcast, PodcastEpisode } from '../../../types';

export async function fetchPodcasts(category?: string): Promise<Podcast[]> {
    let query = supabase
        .from('podcasts')
        .select(`
            *,
            creator:profiles!creator_id (id, name, username, avatar_url, is_verified)
        `)
        .eq('status', 'approved')
        .order('followers_count', { ascending: false });

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function fetchMyPodcast(): Promise<Podcast | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('creator_id', user.id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function fetchEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .eq('is_published', true)
        .order('episode_number', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data ?? [];
}

export async function fetchMyEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('episode_number', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data ?? [];
}

export async function fetchIsFollowing(podcastId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('podcast_follows')
        .select('podcast_id')
        .eq('podcast_id', podcastId)
        .eq('user_id', user.id)
        .maybeSingle();

    return !!data;
}

export async function applyForPodcast(input: {
    title: string;
    description: string;
    category: string;
    cover_url?: string;
}): Promise<Podcast> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('podcasts')
        .insert({ ...input, creator_id: user.id })
        .select()
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
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function followPodcast(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .insert({ podcast_id: podcastId, user_id: user.id });

    // 23505 = unique_violation — already following, treat as success
    if (error && error.code !== '23505') throw error;
}

export async function unfollowPodcast(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .delete()
        .eq('podcast_id', podcastId)
        .eq('user_id', user.id);

    if (error) throw error;
}

export async function incrementEpisodePlay(episodeId: string): Promise<void> {
    await supabase.rpc('increment_episode_plays', { p_episode_id: episodeId });
}
