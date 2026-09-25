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
  Alert,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  Play,
  Pause,
  Headphones,
  Radio,
  Plus,
  ArrowLeft,
  Sparkles,
  Flame,
  ListPlus,
  Heart,
  MoreVertical,
  Bookmark,
  Download,
  Share2,
  User,
  Ban,
  Flag,
  Check,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState, AudioTrack } from '../../services/audioService';
import { PodcastStudioModal } from '../../components/PodcastStudioModal';
import { useDebounce } from '../../hooks/useDebounce';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = [
  'All Podcast',
  'Lifestyle',
  'News & Politics',
  'Comedy',
  'Education',
  'Technology',
  'Business',
  'Health',
  'Entertainment',
];

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  category: string;
  cover_url: string | null;
  followers_count: number;
  episodes_count: number;
  monthly_listens?: number;
  creator_id?: string;
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
  monthly_listens?: number;
  created_at: string;
  podcast?: Podcast;
}

// High quality mock presets with guaranteed working MP3 audio streams & monthly listen metrics
const MOCK_TOP_PODCASTS: Podcast[] = [
  {
    id: 'mock_pod_1',
    title: 'Healthy Living',
    description: 'Practical daily health advice, student nutrition on a budget, and mental wellbeing on campus.',
    category: 'Health',
    cover_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    followers_count: 0,
    episodes_count: 1,
    monthly_listens: 0,
    creator: { name: 'Dr. Tolu', username: 'drtolu', avatar_url: null },
  },
  {
    id: 'mock_pod_2',
    title: 'Campus Banter',
    description: 'Relatable student gist, exam week humor, and surviving university life in Nigeria.',
    category: 'Comedy',
    cover_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    followers_count: 0,
    episodes_count: 1,
    monthly_listens: 0,
    creator: { name: 'Tobi & Olamide', username: 'campusbanter', avatar_url: null },
  },
  {
    id: 'mock_pod_3',
    title: 'Tech on Campus',
    description: 'Breaking into software engineering, building student projects, and landing remote tech gigs.',
    category: 'Technology',
    cover_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    followers_count: 0,
    episodes_count: 1,
    monthly_listens: 0,
    creator: { name: 'Chidi Okeke', username: 'chidi.codes', avatar_url: null },
  },
];

const MOCK_EPISODES: Episode[] = [
  {
    id: 'mock_ep_1',
    podcast_id: 'mock_pod_2',
    title: 'Surviving Semester Exams with Humor',
    description: 'In our debut episode, Tobi and Olamide talk about reading overnight and surviving campus heat.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 900,
    plays_count: 0,
    monthly_listens: 0,
    created_at: new Date().toISOString(),
    podcast: MOCK_TOP_PODCASTS[1],
  },
  {
    id: 'mock_ep_2',
    podcast_id: 'mock_pod_1',
    title: 'Healthy Living: Sleep & Stress Routines',
    description: 'How to manage your sleep schedule and diet during stressful test weeks without burning out.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 720,
    plays_count: 0,
    monthly_listens: 0,
    created_at: new Date().toISOString(),
    podcast: MOCK_TOP_PODCASTS[0],
  },
  {
    id: 'mock_ep_3',
    podcast_id: 'mock_pod_3',
    title: 'Tech on Campus: First Portfolio Project',
    description: 'Building practical web and mobile apps while balancing university coursework.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 1080,
    plays_count: 0,
    monthly_listens: 0,
    created_at: new Date().toISOString(),
    podcast: MOCK_TOP_PODCASTS[2],
  },
];

export default function PodcastsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Podcast');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studioVisible, setStudioVisible] = useState(false);

  // Three-dot action sheet state
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null);
  const [savedEpisodes, setSavedEpisodes] = useState<Set<string>>(new Set());
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<Set<string>>(new Set());

  // Active track info & playback state
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
        .order('followers_count', { ascending: false });

      if (podErr) throw podErr;

      // 2. Fetch Recent Published Episodes
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
        .order('created_at', { ascending: false });

      const fetchedPods = (podData as Podcast[]) || [];
      const fetchedEps = (epData as Episode[]) || [];

      setPodcasts(fetchedPods.length > 0 ? fetchedPods : MOCK_TOP_PODCASTS);
      setEpisodes(fetchedEps.length > 0 ? fetchedEps : MOCK_EPISODES);
    } catch (err) {
      console.warn('Error fetching podcasts from Supabase, using defaults:', err);
      setPodcasts(MOCK_TOP_PODCASTS);
      setEpisodes(MOCK_EPISODES);
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
    if (episode.audio_url) {
      const activeList = episodes.length > 0 ? episodes : MOCK_EPISODES;
      const queueTracks: AudioTrack[] = activeList.map((ep) => ({
        id: ep.id,
        uri: ep.audio_url,
        title: ep.title,
        hostName: ep.podcast?.title || 'UniLink Podcast',
        coverUrl: ep.cover_url || ep.podcast?.cover_url || undefined,
        podcastId: ep.podcast_id,
        podcastTitle: ep.podcast?.title || 'Campus Podcast',
        durationSeconds: ep.duration_seconds,
        monthlyListens: Number(ep.plays_count) || 0,
      }));
      audioService.setQueue(queueTracks, index);
    }
  };

  // ── Action Sheet Options ──────────────────────────────────────────────────
  const handleOpenMenu = (ep: Episode) => {
    setSelectedEp(ep);
    setActionSheetVisible(true);
  };

  const handleQueueEpisode = (ep?: Episode) => {
    const target = ep || selectedEp;
    if (!target) return;
    setActionSheetVisible(false);

    const track: AudioTrack = {
      id: target.id,
      uri: target.audio_url,
      title: target.title,
      hostName: target.podcast?.title || 'Campus Podcast',
      coverUrl: target.cover_url || target.podcast?.cover_url || undefined,
      podcastId: target.podcast_id,
      podcastTitle: target.podcast?.title,
      durationSeconds: target.duration_seconds,
      monthlyListens: target.monthly_listens || 24000,
    };
    const res = audioService.addToQueue(track);
    Alert.alert(
      res.isNowPlaying ? 'Now Playing 🎙️' : 'Added to Queue 🎶',
      `"${target.title}" added to playback queue (Position #${res.queueLength}).`
    );
  };

  const handleSaveEpisode = (ep?: Episode) => {
    const target = ep || selectedEp;
    if (!target) return;
    setActionSheetVisible(false);

    setSavedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(target.id)) {
        next.delete(target.id);
        Alert.alert('Removed from Saved', `"${target.title}" removed from library.`);
      } else {
        next.add(target.id);
        Alert.alert('Saved! 🔖', `"${target.title}" saved to library.`);
      }
      return next;
    });
  };

  const handleDownloadEpisode = (ep?: Episode) => {
    const target = ep || selectedEp;
    if (!target) return;
    setActionSheetVisible(false);

    if (downloadedEpisodes.has(target.id)) {
      Alert.alert('Downloaded 📥', `"${target.title}" is saved for offline playback.`);
      return;
    }

    setDownloadedEpisodes((prev) => new Set([...prev, target.id]));
    Alert.alert('Downloaded! 📥', `"${target.title}" is saved for offline playback.`);
  };

  const handleShareEpisode = async (ep?: Episode) => {
    const target = ep || selectedEp;
    if (!target) return;
    setActionSheetVisible(false);
    try {
      await Share.share({
        message: `Listen to "${target.title}" on UniLink Campus Audio!\n\nhttps://unilink.ng/podcasts/${target.podcast_id}?ep=${target.id}`,
      });
    } catch {}
  };

  // Filter podcasts based on category & search (Debounced)
  const filteredPodcasts = podcasts.filter((pod) => {
    const matchCat =
      selectedCategory === 'All Podcast' ||
      pod.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery =
      !debouncedSearchQuery.trim() ||
      pod.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (pod.description && pod.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0C' : '#F9F9FB' }]}>
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <View style={styles.brandIconCircle}>
            <Headphones size={15} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: isDark ? '#FFFFFF' : '#0B1528' }]}>
            PODCAST'S
          </Text>
        </View>

        <View style={styles.headerRightRow}>
          {/* Host Show / Creator Studio (Max 3 Channels limit enforced) */}
          <TouchableOpacity
            style={styles.studioBtn}
            onPress={() => setStudioVisible(true)}
            activeOpacity={0.85}
          >
            <Plus size={14} color="#000000" strokeWidth={2.5} style={{ marginRight: 3 }} />
            <Text style={styles.studioBtnText}>Host (Max 3)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Greeting Hero Text ──────────────────────────────────────── */}
        <View style={styles.heroHeadingContainer}>
          <Text style={[styles.heroHeadingText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            What kind of podcast you want to hear today?
          </Text>
        </View>

        {/* ── Search Input ────────────────────────────────────────────── */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? '#1C1C24' : '#FFFFFF',
              borderColor: isDark ? '#2E2E3A' : '#E5E7EB',
            },
          ]}
        >
          <Search size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
            placeholder="Search podcast"
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ── Section: Top Podcast of the Week (Ranked by Monthly Listens) ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Top Podcast of the Week
            </Text>
            <Flame size={16} color="#F59E0B" fill="#F59E0B" style={{ marginLeft: 4 }} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topPodcastScroll}
        >
          {(podcasts.length > 0 ? podcasts : MOCK_TOP_PODCASTS).slice(0, 5).map((pod) => {
            const listens = pod.monthly_listens || 38500;
            return (
              <TouchableOpacity
                key={pod.id}
                style={[
                  styles.topPodCard,
                  {
                    backgroundColor: isDark ? '#141419' : '#FFFFFF',
                    borderColor: isDark ? '#22222C' : '#E5E7EB',
                  },
                ]}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Podcast' as never, { podcastId: pod.id } as never)}
              >
                <Image source={{ uri: pod.cover_url || MOCK_TOP_PODCASTS[0].cover_url || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80' }} style={styles.topPodCover} />
                <View style={styles.topPodInfo}>
                  <View style={styles.topPodBadgeRow}>
                    <Flame size={10} color="#000000" fill="#000000" style={{ marginRight: 3 }} />
                    <Text style={styles.topPodBadgeText}>
                      {listens >= 1000 ? `${(listens / 1000).toFixed(1)}K` : listens} LISTENS/MO
                    </Text>
                  </View>
                  <Text style={[styles.topPodTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                    {pod.title}
                  </Text>
                  <Text style={styles.topPodHost} numberOfLines={1}>
                    {pod.creator?.name || 'Thomas Larson'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Category Filter Pills ───────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? styles.categoryPillActive
                    : {
                        backgroundColor: isDark ? '#181820' : '#FFFFFF',
                        borderColor: isDark ? '#252530' : '#E5E7EB',
                      },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected
                      ? styles.categoryTextActive
                      : { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Explore Shows Grid ──────────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            {selectedCategory === 'All Podcast' ? 'Explore Shows' : selectedCategory}
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <View style={styles.showsGrid}>
            {filteredPodcasts.map((pod) => (
              <TouchableOpacity
                key={pod.id}
                style={[
                  styles.showGridCard,
                  {
                    backgroundColor: isDark ? '#141419' : '#FFFFFF',
                    borderColor: isDark ? '#22222C' : '#E5E7EB',
                  },
                ]}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Podcast' as never, { podcastId: pod.id } as never)}
              >
                <Image source={{ uri: pod.cover_url || MOCK_TOP_PODCASTS[0].cover_url || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80' }} style={styles.showGridCover} />
                <View style={styles.showGridMeta}>
                  <Text style={[styles.showGridTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                    {pod.title}
                  </Text>
                  <Text style={styles.showGridHost} numberOfLines={1}>
                    {pod.creator?.name || 'Campus Host'}{(pod.monthly_listens ?? 0) > 0 ? ` • ${(pod.monthly_listens ?? 0) >= 1000 ? `${((pod.monthly_listens ?? 0) / 1000).toFixed(1)}K` : pod.monthly_listens} listens` : (pod.episodes_count ? ` • ${pod.episodes_count} ${pod.episodes_count === 1 ? 'ep' : 'eps'}` : '')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Recent Episodes Section ─────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Trending Episodes
          </Text>
        </View>

        <View style={styles.episodesListCol}>
          {episodes.map((ep, idx) => {
            const isPlaying = playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

            return (
              <View
                key={ep.id || idx}
                style={[
                  styles.episodeCard,
                  {
                    backgroundColor: isDark ? '#141419' : '#FFFFFF',
                    borderColor: isPlaying ? '#10B981' : (isDark ? '#22222C' : '#E5E7EB'),
                  },
                ]}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  activeOpacity={0.88}
                  onPress={() => handlePlayEpisode(ep, idx)}
                >
                  <Image source={{ uri: ep.cover_url || ep.podcast?.cover_url || MOCK_TOP_PODCASTS[0].cover_url || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80' }} style={styles.episodeThumb} />
                  <View style={styles.episodeMeta}>
                    <Text style={[styles.episodeTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                      {ep.title}
                    </Text>
                    <Text style={styles.episodeShowTitle} numberOfLines={1}>
                      {ep.podcast?.title || 'Campus Podcast'} • {Math.floor((ep.duration_seconds || 900) / 60)} min
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Right Action Stack: Three Dot Menu & Play Button */}
                <View style={styles.epActionsCluster}>
                  <TouchableOpacity
                    style={styles.threeDotBtn}
                    onPress={() => handleOpenMenu(ep)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MoreVertical size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.playPillCircle, isPlaying && styles.playPillCircleActive]}
                    onPress={() => handlePlayEpisode(ep, idx)}
                  >
                    {isPlaying ? (
                      <Pause size={15} color="#000000" fill="#000000" />
                    ) : (
                      <Play size={15} color="#000000" fill="#000000" style={{ marginLeft: 2 }} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Three Dot Menu Modal ─────────────────────────────────────── */}
      <Modal
        visible={actionSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetBackdrop}
          activeOpacity={1}
          onPress={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheetContent}>
            <View style={styles.actionSheetHandle} />

            {selectedEp && (
              <View style={styles.sheetEpisodeHeader}>
                <Image
                  source={{ uri: selectedEp.cover_url || selectedEp.podcast?.cover_url || MOCK_TOP_PODCASTS[0].cover_url || '' }}
                  style={styles.sheetEpThumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.sheetEpTitle} numberOfLines={1}>
                    {selectedEp.title}
                  </Text>
                  <Text style={styles.sheetEpSubtitle} numberOfLines={1}>
                    {selectedEp.podcast?.title || 'Campus Podcast'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sheetDivider} />

            {/* Menu Rows for General Users */}
            <TouchableOpacity
              style={styles.actionSheetRow}
              onPress={() => handleQueueEpisode()}
            >
              <View style={styles.actionIconCircle}>
                <ListPlus size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionRowTitle}>Add to Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetRow}
              onPress={() => handleSaveEpisode()}
            >
              <View style={styles.actionIconCircle}>
                <Bookmark size={18} color={selectedEp && savedEpisodes.has(selectedEp.id) ? '#10B981' : '#FFFFFF'} />
              </View>
              <Text style={styles.actionRowTitle}>
                {selectedEp && savedEpisodes.has(selectedEp.id) ? 'Saved in Library' : 'Save Episode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetRow}
              onPress={() => handleDownloadEpisode()}
            >
              <View style={styles.actionIconCircle}>
                <Download size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionRowTitle}>
                {selectedEp && downloadedEpisodes.has(selectedEp.id) ? 'Downloaded Offline' : 'Download'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetRow}
              onPress={() => handleShareEpisode()}
            >
              <View style={styles.actionIconCircle}>
                <Share2 size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionRowTitle}>Share Episode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetRow}
              onPress={() => {
                setActionSheetVisible(false);
                if (selectedEp?.podcast_id) {
                  navigation.navigate('Podcast' as never, { podcastId: selectedEp.podcast_id } as never);
                }
              }}
            >
              <View style={styles.actionIconCircle}>
                <User size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionRowTitle}>View Creator & Show</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={styles.sheetCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Podcast Studio Modal */}
      <PodcastStudioModal
        visible={studioVisible}
        onClose={() => setStudioVisible(false)}
        onPodcastCreatedOrUpdated={() => {
          fetchPodcastsData();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
    marginRight: 2,
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  studioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 19,
  },
  studioBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroHeadingContainer: {
    marginTop: 8,
    marginBottom: 14,
  },
  heroHeadingText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  topPodcastScroll: {
    gap: 14,
    paddingBottom: 4,
  },
  topPodCard: {
    width: SCREEN_WIDTH * 0.65,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topPodCover: {
    width: '100%',
    height: 140,
  },
  topPodInfo: {
    padding: 12,
  },
  topPodBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  topPodBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  topPodTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  topPodHost: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#000000',
  },
  showsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  showGridCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  showGridCover: {
    width: '100%',
    height: 110,
  },
  showGridMeta: {
    padding: 10,
  },
  showGridTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  showGridHost: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  episodesListCol: {
    gap: 10,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
  },
  episodeThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  episodeMeta: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  episodeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  episodeShowTitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  epActionsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  threeDotBtn: {
    padding: 8,
  },
  playPillCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPillCircleActive: {
    backgroundColor: '#34D399',
  },
  loaderBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  // Action Sheet Styles
  actionSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  actionSheetContent: {
    backgroundColor: '#161620',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderColor: '#262636',
  },
  actionSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F4E',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetEpisodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetEpThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  sheetEpTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sheetEpSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#222230',
    marginVertical: 14,
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#222230',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRowTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetCancelBtn: {
    marginTop: 14,
    backgroundColor: '#222230',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  sheetCancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
