import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Play,
  Pause,
  Mic2,
  Headphones,
  CheckCircle2,
  Share2,
  Users,
  Shuffle,
  Clock,
  Radio,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState, AudioTrack } from '../../services/audioService';
import { SpotifyAudioPlayer } from '../../components/SpotifyAudioPlayer';

const { width: screenWidth } = Dimensions.get('window');

export default function PodcastScreen() {
  const { colors, isDark } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { podcastId } = (route.params || {}) as { podcastId?: string };

  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setPlaybackState);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchPodcastData();
  }, [podcastId]);

  const fetchPodcastData = async () => {
    try {
      setLoading(true);

      let queryId = podcastId;
      if (!queryId) {
        const { data: firstPod } = await supabase
          .from('podcasts')
          .select('id')
          .eq('status', 'approved')
          .limit(1)
          .single();
        if (firstPod) queryId = firstPod.id;
      }

      if (!queryId) return;

      // 1. Fetch Podcast & Creator from Supabase
      const { data: podData, error: podErr } = await supabase
        .from('podcasts')
        .select(`
          *,
          creator:profiles!creator_id(
            id,
            name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .eq('id', queryId)
        .single();

      if (podErr) throw podErr;

      // 2. Fetch Episodes
      const { data: epData, error: epErr } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', queryId)
        .eq('is_published', true)
        .order('episode_number', { ascending: false });

      if (epErr) throw epErr;

      setPodcast(podData);
      setEpisodes(epData || []);
    } catch (e) {
      console.warn('Error loading podcast from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayEpisode = (episode: any, index = 0) => {
    if (!episode.audio_url) return;
    const queueTracks: AudioTrack[] = episodes.map((ep) => ({
      id: ep.id,
      uri: ep.audio_url,
      title: ep.title,
      hostName: podcast?.creator?.name || podcast?.title || 'Campus Host',
      coverUrl: ep.cover_url || podcast?.cover_url || undefined,
      podcastId: podcast?.id,
      podcastTitle: podcast?.title,
      durationSeconds: ep.duration_seconds,
      episodeNumber: ep.episode_number,
    }));
    audioService.setQueue(queueTracks, index);
  };

  const handlePlayAll = () => {
    if (episodes.length > 0) {
      handlePlayEpisode(episodes[0], 0);
    }
  };

  const handleShuffle = () => {
    if (episodes.length > 0) {
      const randomIndex = Math.floor(Math.random() * episodes.length);
      handlePlayEpisode(episodes[randomIndex], randomIndex);
    }
  };

  const handleSharePodcast = async () => {
    if (!podcast) return;
    try {
      await Share.share({
        message: `Listen to "${podcast.title}" by ${podcast.creator?.name || 'UniLink'} on UniLink Campus Audio!\n\nhttps://unilink.ng/podcasts/${podcast.id}`,
      });
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading podcast show...</Text>
      </SafeAreaView>
    );
  }

  if (!podcast) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Podcast not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {podcast.title}
        </Text>
        <TouchableOpacity onPress={handleSharePodcast} style={styles.actionBtn}>
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Show Artwork & Meta Banner */}
        <View style={styles.showHero}>
          {podcast.cover_url ? (
            <Image source={{ uri: podcast.cover_url }} style={styles.showCover} />
          ) : (
            <View style={[styles.showCover, styles.placeholderCover]}>
              <Mic2 size={54} color={colors.primary} />
            </View>
          )}

          <View style={styles.showCategoryPill}>
            <Text style={styles.showCategoryText}>{podcast.category || 'Podcast'}</Text>
          </View>

          <Text style={[styles.showTitle, { color: colors.text }]}>{podcast.title}</Text>

          <View style={styles.creatorRow}>
            {podcast.creator?.avatar_url ? (
              <Image source={{ uri: podcast.creator.avatar_url }} style={styles.creatorAvatar} />
            ) : (
              <View style={[styles.creatorAvatar, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                  {(podcast.creator?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.creatorName, { color: colors.textSecondary }]}>
              {podcast.creator?.name || 'Campus Creator'}
            </Text>
            {podcast.creator?.is_verified && (
              <CheckCircle2 size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
            <Text style={[styles.followerDot, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.followerCount, { color: colors.textSecondary }]}>
              {podcast.followers_count || 0} followers
            </Text>
          </View>

          {podcast.description ? (
            <Text style={[styles.showDescription, { color: colors.textSecondary }]}>
              {podcast.description}
            </Text>
          ) : null}

          {/* Spotify Action Buttons (Play All & Shuffle) */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll} activeOpacity={0.85}>
              <Play size={18} color="#000000" fill="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.playAllBtnText}>Play Latest</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle} activeOpacity={0.85}>
              <Shuffle size={18} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.shuffleBtnText, { color: colors.text }]}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Episodes Section */}
        <View style={styles.episodesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Episodes ({episodes.length})
          </Text>

          {episodes.length === 0 ? (
            <View style={styles.emptyEpisodesBox}>
              <Headphones size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyEpisodesTitle, { color: colors.text }]}>No episodes yet</Text>
              <Text style={[styles.emptyEpisodesSub, { color: colors.textSecondary }]}>
                Stay tuned! New episodes from this creator will appear here.
              </Text>
            </View>
          ) : (
            episodes.map((epi, index) => {
              const isThisTrackPlaying =
                playbackState.currentUri === epi.audio_url && playbackState.isPlaying;

              return (
                <TouchableOpacity
                  key={epi.id}
                  style={[
                    styles.episodeCard,
                    {
                      backgroundColor: isThisTrackPlaying
                        ? isDark
                          ? 'rgba(16, 185, 129, 0.12)'
                          : '#ECFDF5'
                        : isDark
                        ? '#1C1C1E'
                        : '#FFFFFF',
                      borderColor: isThisTrackPlaying ? '#10B981' : colors.border,
                    },
                  ]}
                  onPress={() => handlePlayEpisode(epi, index)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.episodePlayIcon, isThisTrackPlaying && { backgroundColor: '#10B981' }]}>
                    {isThisTrackPlaying ? (
                      <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <Play size={16} color={colors.primary} fill={colors.primary} style={{ marginLeft: 2 }} />
                    )}
                  </View>

                  <View style={styles.episodeInfo}>
                    <Text style={[styles.epiTitle, { color: colors.text }]} numberOfLines={1}>
                      {epi.title}
                    </Text>
                    {epi.description ? (
                      <Text style={[styles.epiDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                        {epi.description}
                      </Text>
                    ) : null}
                    <View style={styles.epiMetaRow}>
                      <Clock size={11} color={colors.textTertiary} style={{ marginRight: 3 }} />
                      <Text style={[styles.epiDuration, { color: colors.textSecondary }]}>
                        {Math.floor((epi.duration_seconds || 180) / 60)} mins ·{' '}
                        {new Date(epi.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Global Spotify Audio Player */}
      <SpotifyAudioPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  showHero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  showCover: {
    width: 170,
    height: 170,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  placeholderCover: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showCategoryPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 14,
  },
  showCategoryText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  showTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: -0.4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  followerDot: {
    marginHorizontal: 6,
  },
  followerCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  showDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  playAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  playAllBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  shuffleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  episodesSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyEpisodesBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEpisodesTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyEpisodesSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  episodePlayIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  epiTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  epiDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  epiMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  epiDuration: {
    fontSize: 11,
    fontWeight: '500',
  },
});
