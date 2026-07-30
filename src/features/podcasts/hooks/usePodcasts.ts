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
        .order('followers_count', { ascending: false })
        .limit(50);

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as Podcast[]) ?? [];
}

export async function fetchMyPodcasts(userIdParam?: string): Promise<Podcast[]> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) return [];

    const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('creator_id', uid)
        .limit(50);

    if (error) throw error;
    return (data as unknown as Podcast[]) ?? [];
}

export async function fetchEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .eq('is_published', true)
        .order('episode_number', { ascending: true, nullsFirst: false })
        .limit(100);

    if (error) throw error;
    return (data as unknown as PodcastEpisode[]) ?? [];
}

export async function fetchMyEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('episode_number', { ascending: true, nullsFirst: false })
        .limit(100);

    if (error) throw error;
    return (data as unknown as PodcastEpisode[]) ?? [];
}

export async function fetchIsFollowing(podcastId: string, userIdParam?: string): Promise<boolean> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) return false;

    const { data } = await supabase
        .from('podcast_follows')
        .select('podcast_id')
        .eq('podcast_id', podcastId)
        .eq('user_id', uid)
        .maybeSingle();

    return !!data;
}

export async function applyForPodcast(
    input: {
        title: string;
        description: string;
        category: string;
        cover_url?: string;
    },
    userIdParam?: string
): Promise<Podcast> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('podcasts')
        .insert({ ...input, creator_id: uid })
        .select('*')
        .single();

    if (error) throw error;
    return data as unknown as Podcast;
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
        .select('*')
        .single();

    if (error) throw error;
    return data as unknown as PodcastEpisode;
}

export async function followPodcast(podcastId: string, userIdParam?: string): Promise<void> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .insert({ podcast_id: podcastId, user_id: uid });

    if (error && error.code !== '23505') throw error;
}

export async function unfollowPodcast(podcastId: string, userIdParam?: string): Promise<void> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcast_follows')
        .delete()
        .eq('podcast_id', podcastId)
        .eq('user_id', uid);

    if (error) throw error;
}

export async function incrementEpisodePlay(episodeId: string): Promise<void> {
    await supabase.rpc('increment_episode_plays', { p_episode_id: episodeId });
}

export async function deletePodcast(podcastId: string, userIdParam?: string): Promise<void> {
    let uid = userIdParam;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId)
        .eq('creator_id', uid);

    if (error) throw error;
}

export async function deletePodcastEpisode(episodeId: string, _userIdParam?: string): Promise<void> {
    const { error } = await supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', episodeId);

    if (error) throw error;
}
