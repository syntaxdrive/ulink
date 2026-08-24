import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  Mic2,
  Play,
  Pause,
  Headphones,
  Users,
  TrendingUp,
  Radio,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState, AudioTrack } from '../../services/audioService';
import { SpotifyAudioPlayer } from '../../components/SpotifyAudioPlayer';
import { PodcastStudioModal } from '../../components/PodcastStudioModal';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Health',
  'Comedy',
  'Arts',
  'Other',
];

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  category: string;
  cover_url: string | null;
  followers_count: number;
  episodes_count: number;
  creator_id: string;
  creator?: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number;
  plays_count: number;
  created_at: string;
  podcast?: Podcast;
}

export default function PodcastsScreen() {
  const navigation = useNavigation<any>();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studioVisible, setStudioVisible] = useState(false);

  // Active track info & playback state
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setPlaybackState);
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchPodcastsData = useCallback(async () => {
    try {
      // 1. Fetch Podcasts from Supabase
      // 1. Fetch Podcasts from Supabase (Only approved valid podcasts like THE BLISSFUL CAST)
      const { data: podData, error: podErr } = await supabase
        .from('podcasts')
        .select(`
          *,
          creator:profiles!creator_id(
            name,
            username,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .ilike('title', '%BLISSFUL%')
        .order('followers_count', { ascending: false });

      if (podErr) throw podErr;

      // 2. Fetch Recent Published Episodes with valid audio URLs
      const { data: epData } = await supabase
        .from('podcast_episodes')
        .select(`
          *,
          podcast:podcasts!inner(
            id,
            title,
            cover_url,
            category
          )
        `)
        .eq('is_published', true)
        .ilike('podcast.title', '%BLISSFUL%')
        .not('audio_url', 'is', null)
        .order('episode_number', { ascending: true });

      setPodcasts((podData as Podcast[]) || []);
      setEpisodes((epData as Episode[]) || []);
    } catch (err) {
      console.warn('Error fetching podcasts from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcastsData();
  }, [fetchPodcastsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcastsData();
  };

  const handlePlayEpisode = async (episode: Episode, index = 0) => {
    setCurrentEpisode(episode);
    if (episode.audio_url) {
      const queueTracks: AudioTrack[] = episodes.map((ep) => ({
        id: ep.id,
        uri: ep.audio_url,
        title: ep.title,
        hostName: ep.podcast?.title || 'UniLink Podcast',
        coverUrl: ep.cover_url || ep.podcast?.cover_url || undefined,
        podcastId: ep.podcast_id,
        podcastTitle: ep.podcast?.title || 'Campus Podcast',
        durationSeconds: ep.duration_seconds,
      }));
      audioService.setQueue(queueTracks, index);
    }
  };

  // Filter podcasts
  const filteredPodcasts = podcasts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPodcast = podcasts.length > 0 ? podcasts[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Mic2 size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Campus Podcasts</Text>
        </View>
        <TouchableOpacity
          style={styles.studioHeaderBtn}
          onPress={() => setStudioVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={14} color="#000000" style={{ marginRight: 3 }} />
          <Text style={styles.studioHeaderBtnText}>Studio</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search podcasts, shows, episodes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus podcasts...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, currentEpisode && { paddingBottom: 110 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Featured Hero Banner */}
          {featuredPodcast && selectedCategory === 'All' && !searchQuery ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.heroCard}
              onPress={() =>
                navigation.navigate('Podcast' as never, { podcastId: featuredPodcast.id } as never)
              }
            >
              {featuredPodcast.cover_url ? (
                <Image source={{ uri: featuredPodcast.cover_url }} style={styles.heroBgImage} blurRadius={10} />
              ) : null}
              <View style={styles.heroOverlay} />

              <View style={styles.heroContent}>
                <View style={styles.featuredBadge}>
                  <Radio size={12} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.featuredBadgeText}>FEATURED SHOW</Text>
                </View>

                <View style={styles.heroRow}>
                  {featuredPodcast.cover_url ? (
                    <Image source={{ uri: featuredPodcast.cover_url }} style={styles.heroCover} />
                  ) : (
                    <View style={[styles.heroCover, styles.placeholderCover]}>
                      <Mic2 size={32} color={colors.primary} />
                    </View>
                  )}

                  <View style={styles.heroMeta}>
                    <Text style={styles.heroCategory}>{featuredPodcast.category}</Text>
                    <Text style={styles.heroTitle} numberOfLines={2}>
                      {featuredPodcast.title}
                    </Text>
                    <Text style={styles.heroCreator}>
                      By {featuredPodcast.creator?.name || 'Campus Creator'}
                    </Text>
                    <View style={styles.heroStats}>
                      <Users size={14} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.heroStatText}>{featuredPodcast.followers_count || 0} followers</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Top Shows Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'Top Campus Shows' : `${selectedCategory} Shows`}
            </Text>
            <Text style={styles.sectionSubtitle}>{filteredPodcasts.length} shows</Text>
          </View>

          {filteredPodcasts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Radio size={40} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No podcasts in this category</Text>
              <Text style={styles.emptySub}>Check back soon for new student episodes!</Text>
            </View>
          ) : (
            <View style={styles.podcastsGrid}>
              {filteredPodcasts.map((pod) => (
                <TouchableOpacity
                  key={pod.id}
                  style={styles.podcastCard}
                  onPress={() =>
                    navigation.navigate('Podcast' as never, { podcastId: pod.id } as never)
                  }
                >
                  {pod.cover_url ? (
                    <Image source={{ uri: pod.cover_url }} style={styles.podCover} />
                  ) : (
                    <View style={[styles.podCover, styles.placeholderCover]}>
                      <Mic2 size={24} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.podDetails}>
                    <Text style={styles.podCategory}>{pod.category}</Text>
                    <Text style={styles.podTitle} numberOfLines={1}>
                      {pod.title}
                    </Text>
                    <Text style={styles.podCreator} numberOfLines={1}>
                      {pod.creator?.name || 'Student Creator'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recent Episodes Section */}
          {episodes.length > 0 ? (
            <View style={styles.episodesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Episodes</Text>
                <TrendingUp size={16} color={colors.primary} />
              </View>

              {episodes.map((ep, index) => {
                const isThisPlaying =
                  playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

                return (
                  <TouchableOpacity
                    key={ep.id}
                    style={[styles.episodeItem, currentEpisode?.id === ep.id && styles.episodeItemActive]}
                    onPress={() => handlePlayEpisode(ep, index)}
                  >
                    <View style={styles.epPlayCircle}>
                      {isThisPlaying ? (
                        <Pause size={18} color={colors.primary} />
                      ) : (
                        <Play size={18} color={colors.primary} style={{ marginLeft: 2 }} />
                      )}
                    </View>

                    <View style={styles.epInfo}>
                      <Text style={styles.epTitle} numberOfLines={1}>
                        {ep.title}
                      </Text>
                      <Text style={styles.epShowName} numberOfLines={1}>
                        {ep.podcast?.title || 'Campus Podcast'}
                      </Text>
                    </View>

                    <View style={styles.epMeta}>
                      <Text style={styles.epDuration}>
                        {Math.floor((ep.duration_seconds || 180) / 60)} min
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Creator Podcast Studio Modal */}
      <PodcastStudioModal
        visible={studioVisible}
        onClose={() => setStudioVisible(false)}
        onPodcastCreatedOrUpdated={fetchPodcastsData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  studioHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  studioHeaderBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    height: 190,
    position: 'relative',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceElevated,
  },
  heroBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  heroContent: {
    padding: 16,
    zIndex: 10,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCover: {
    width: 80,
    height: 80,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  heroMeta: {
    flex: 1,
  },
  heroCategory: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  heroCreator: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  heroStatText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  podcastsGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  podcastCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  podCover: {
    width: '100%',
    height: (screenWidth - 44) / 2 - 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  podDetails: {
    marginTop: 8,
  },
  podCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  podTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  podCreator: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  episodesSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  episodeItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  epPlayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  epInfo: {
    flex: 1,
  },
  epTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  epShowName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  epMeta: {
    marginLeft: 8,
  },
  epDuration: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 16,
    right: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  miniCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  miniShow: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  miniPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
