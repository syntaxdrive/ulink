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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Rewind,
  Volume2,
  Mic2,
  Headphones,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState } from '../../services/audioService';

const { width: screenWidth } = Dimensions.get('window');

export default function PodcastScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { podcastId } = (route.params || {}) as { podcastId?: string };

  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<any>(null);

  // Audio Playback State from audioService
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    isLoading: false,
    currentUri: null,
  });

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

      if (epData && epData.length > 0) {
        setActiveEpisode(epData[0]);
      }
    } catch (e) {
      console.warn('Error loading podcast from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!activeEpisode?.audio_url) return;
    await audioService.togglePlay(activeEpisode.audio_url);
  };

  const handlePlayEpisode = async (episode: any) => {
    setActiveEpisode(episode);
    if (episode.audio_url) {
      await audioService.play(episode.audio_url);
    }
  };

  const handleSkip = (seconds: number) => {
    audioService.skip(seconds);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCurrentPlaying =
    activeEpisode &&
    playbackState.currentUri === activeEpisode.audio_url &&
    playbackState.isPlaying;

  const currentDuration =
    playbackState.durationMillis > 0
      ? playbackState.durationMillis
      : (activeEpisode?.duration_seconds || 180) * 1000;

  const progressPercent = Math.min(
    100,
    currentDuration > 0 ? (playbackState.positionMillis / currentDuration) * 100 : 0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading show...</Text>
      </SafeAreaView>
    );
  }

  if (!podcast) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Podcast not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Volume2 size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {podcast.cover_url ? (
            <Image source={{ uri: podcast.cover_url }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholderArtwork]}>
              <Mic2 size={64} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.podcastTitle}>{podcast.title}</Text>
          <View style={styles.creatorRow}>
            <Text style={styles.creatorName}>
              By {podcast.creator?.name || 'Campus Creator'}
            </Text>
            {podcast.creator?.is_verified && (
              <CheckCircle2 size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {activeEpisode ? activeEpisode.title : 'Select an episode'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(playbackState.positionMillis)}</Text>
            <Text style={styles.timeText}>{formatTime(currentDuration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleSkip(-15)}>
            <Rewind size={30} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={handlePlayPause}
            disabled={playbackState.isLoading}
          >
            {playbackState.isLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : isCurrentPlaying ? (
              <Pause size={34} color={colors.background} fill={colors.background} />
            ) : (
              <Play size={34} color={colors.background} fill={colors.background} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => handleSkip(15)}>
            <FastForward size={30} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Episodes List */}
        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>All Episodes ({episodes.length})</Text>
          {episodes.length === 0 ? (
            <View style={styles.emptyEpisodesBox}>
              <Headphones size={32} color={colors.textSecondary} />
              <Text style={styles.emptyEpisodesText}>No episodes uploaded yet.</Text>
            </View>
          ) : (
            episodes.map((epi) => {
              const isThisTrackPlaying =
                playbackState.currentUri === epi.audio_url && playbackState.isPlaying;
              const isSelected = activeEpisode?.id === epi.id;

              return (
                <TouchableOpacity
                  key={epi.id}
                  style={[styles.episodeCard, isSelected && styles.activeEpisodeCard]}
                  onPress={() => handlePlayEpisode(epi)}
                >
                  <View style={styles.episodePlayIcon}>
                    {isThisTrackPlaying ? (
                      <Pause size={16} color={colors.primary} />
                    ) : (
                      <Play size={16} color={colors.textSecondary} />
                    )}
                  </View>
                  <View style={styles.episodeInfo}>
                    <Text style={styles.epiTitle} numberOfLines={1}>
                      {epi.title}
                    </Text>
                    <Text style={styles.epiDuration}>
                      {Math.floor((epi.duration_seconds || 180) / 60)} mins ·{' '}
                      {new Date(epi.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 5,
  },
  actionBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  artwork: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  placeholderArtwork: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  podcastTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  episodeTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    paddingHorizontal: 25,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginBottom: 32,
  },
  controlBtn: {
    padding: 10,
  },
  playBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  episodesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  activeEpisodeCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  episodePlayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  episodeInfo: {
    flex: 1,
  },
  epiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  epiDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyEpisodesBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyEpisodesText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
