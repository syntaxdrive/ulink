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
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  ListPlus,
  Download,
  Share2,
  MoreVertical,
  CheckCircle2,
  Headphones,
  Radio,
  Clock,
  Sparkles,
  Trash2,
  Plus,
  Edit3,
  Check,
  Flame,
  TrendingUp,
  BarChart2,
  Eye,
  EyeOff,
  Bookmark,
  User,
  Ban,
  Flag,
  X,
  Globe,
  Lock,
  BarChart,
  Users,
  Activity,
} from 'lucide-react-native';
import { useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState, AudioTrack } from '../../services/audioService';
import { downloadEpisode, removeDownloadedEpisode, getOfflineDownloads, isEpisodeDownloaded } from '../../services/downloadService';
import { PodcastStudioModal } from '../../components/PodcastStudioModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_SHOW_FALLBACK = {
  id: 'mock_pod_comedy',
  title: 'Campus Banter',
  subtitle: 'STUDENT GIST & SURVIVAL • EPISODE 01',
  description:
    'Welcome to Campus Banter! Join Tobi and Olamide as they share hilarious campus stories, talk about exam week survival, hostel cooking disasters, and life in Nigerian universities.',
  category: 'Comedy',
  cover_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  monthly_listens: 0,
  likes_count: 0,
  creator: {
    id: 'creator_1',
    name: 'Tobi & Olamide',
    username: 'campusbanter',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_verified: true,
  },
};

const MOCK_SHOW_EPISODES = [
  {
    id: 'mock_ep_1',
    podcast_id: 'mock_pod_comedy',
    title: 'Surviving Semester Exams with Humor',
    description: 'In our debut episode, Tobi and Olamide talk about reading overnight, faculty heat, and surviving exams.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 900,
    monthly_listens: 0,
    plays_count: 0,
    is_published: true,
    likes_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock_ep_2',
    podcast_id: 'mock_pod_comedy',
    title: 'Roommate Wahala & Student Cooking',
    description: 'Roommate drama and student cooking disasters with special campus guest Sarah.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 1140,
    monthly_listens: 0,
    plays_count: 0,
    is_published: true,
    likes_count: 0,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'mock_ep_3',
    podcast_id: 'mock_pod_comedy',
    title: 'Why 8 AM Lectures Are a Personal Attack',
    description: 'Why 8 AM lectures are a personal attack: campus comedy chronicles.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    duration_seconds: 840,
    monthly_listens: 0,
    plays_count: 0,
    is_published: true,
    likes_count: 0,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default function PodcastScreen() {
  const { colors, isDark } = useTheme();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { podcastId } = (route.params || {}) as { podcastId?: string };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [savedEpisodes, setSavedEpisodes] = useState<Set<string>>(new Set());
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<Set<string>>(new Set());
  const [downloadingEpisodeId, setDownloadingEpisodeId] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<'All Episode' | 'More Like This'>('All Episode');
  const [studioVisible, setStudioVisible] = useState(false);

  // ── Three-Dot Menu Action Sheet & Modal States ────────────────────────────
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  // Analytics Modal
  const [analyticsVisible, setAnalyticsVisible] = useState(false);

  // Edit Episode Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEpNumber, setEditEpNumber] = useState('1');
  const [savingEdit, setSavingEdit] = useState(false);

  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setPlaybackState);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchPodcastData();
  }, [podcastId]);

  // Load previously downloaded episodes from persistent storage on mount
  useEffect(() => {
    getOfflineDownloads().then((downloads) => {
      const ids = new Set(downloads.map((d) => d.id));
      setDownloadedEpisodes(ids);
    });
  }, []);

  const fetchPodcastData = async () => {
    try {
      setLoading(true);

      let queryId = podcastId;
      if (!queryId) {
        const { data: firstPod } = await supabase
          .from('podcasts')
          .select('id')
          .limit(1)
          .single();
        if (firstPod) queryId = firstPod.id;
      }

      if (queryId) {
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

        if (!podErr && podData) {
          setPodcast(podData);

          // 2. Fetch Episodes
          const { data: epData } = await supabase
            .from('podcast_episodes')
            .select('*')
            .eq('podcast_id', queryId)
            .order('episode_number', { ascending: true });

          setEpisodes(epData && epData.length > 0 ? epData : MOCK_SHOW_EPISODES);
          return;
        }
      }

      // Fallback mock if not found in DB
      setPodcast(MOCK_SHOW_FALLBACK);
      setEpisodes(MOCK_SHOW_EPISODES);
    } catch (e) {
      console.warn('Using default show fallback:', e);
      setPodcast(MOCK_SHOW_FALLBACK);
      setEpisodes(MOCK_SHOW_EPISODES);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = !!(
    currentUserId &&
    (podcast?.creator_id === currentUserId || podcast?.creator?.id === currentUserId)
  );

  const handlePlayEpisode = (episode: any, index = 0) => {
    if (!episode.audio_url) return;
    const queueTracks: AudioTrack[] = episodes.map((ep) => ({
      id: ep.id,
      uri: ep.audio_url,
      title: ep.title,
      hostName: podcast?.creator?.name || podcast?.title || 'Thomas Larson',
      coverUrl: ep.cover_url || podcast?.cover_url || undefined,
      podcastId: podcast?.id,
      podcastTitle: podcast?.title,
      durationSeconds: ep.duration_seconds,
      episodeNumber: ep.episode_number,
      monthlyListens: podcast?.monthly_listens || 48500,
    }));
    audioService.setQueue(queueTracks, index);
  };

  const handlePlayPodcast = () => {
    if (episodes.length > 0) {
      handlePlayEpisode(episodes[0], 0);
    }
  };

  // ── Open Three Dot Menu for an Episode ────────────────────────────────────
  const handleOpenEpisodeMenu = (ep: any) => {
    setSelectedEpisode(ep);
    setActionSheetVisible(true);
  };

  // ── Creator Option: Edit Episode ──────────────────────────────────────────
  const handleOpenEditEpisode = () => {
    if (!selectedEpisode) return;
    setActionSheetVisible(false);
    setEditTitle(selectedEpisode.title || '');
    setEditDesc(selectedEpisode.description || '');
    setEditEpNumber(String(selectedEpisode.episode_number || '1'));
    setEditModalVisible(true);
  };

  const handleSaveEpisodeEdit = async () => {
    if (!selectedEpisode || !editTitle.trim()) {
      Alert.alert('Required', 'Please provide an episode title.');
      return;
    }

    try {
      setSavingEdit(true);
      if (!selectedEpisode.id.startsWith('mock_')) {
        await supabase
          .from('podcast_episodes')
          .update({
            title: editTitle.trim(),
            description: editDesc.trim() || null,
            episode_number: parseInt(editEpNumber, 10) || 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedEpisode.id);
      }

      setEpisodes((prev) =>
        prev.map((e) =>
          e.id === selectedEpisode.id
            ? {
                ...e,
                title: editTitle.trim(),
                description: editDesc.trim() || null,
                episode_number: parseInt(editEpNumber, 10) || 1,
              }
            : e
        )
      );

      setEditModalVisible(false);
      Alert.alert('Updated! ✏️', `"${editTitle}" has been updated successfully.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update episode.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Creator Option: View Analytics ────────────────────────────────────────
  const handleOpenAnalytics = () => {
    setActionSheetVisible(false);
    setAnalyticsVisible(true);
  };

  // ── Creator Option: Change Visibility (Public / Private) ───────────────────
  const handleToggleVisibility = async () => {
    if (!selectedEpisode) return;
    setActionSheetVisible(false);
    const newStatus = !selectedEpisode.is_published;

    try {
      if (!selectedEpisode.id.startsWith('mock_')) {
        await supabase
          .from('podcast_episodes')
          .update({ is_published: newStatus })
          .eq('id', selectedEpisode.id);
      }

      setEpisodes((prev) =>
        prev.map((e) =>
          e.id === selectedEpisode.id ? { ...e, is_published: newStatus } : e
        )
      );

      Alert.alert(
        newStatus ? 'Visibility: Public 🌐' : 'Visibility: Private 🔒',
        newStatus
          ? `"${selectedEpisode.title}" is now visible to all students.`
          : `"${selectedEpisode.title}" is now hidden from public feeds.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update visibility.');
    }
  };

  // ── Creator Option: Delete Episode ────────────────────────────────────────
  const handleDeleteEpisode = (ep?: any) => {
    const target = ep || selectedEpisode;
    if (!target) return;
    setActionSheetVisible(false);

    Alert.alert(
      'Delete Episode?',
      `Are you sure you want to permanently delete "${target.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!target.id.startsWith('mock_')) {
                const { error } = await supabase
                  .from('podcast_episodes')
                  .delete()
                  .eq('id', target.id);
                if (error) throw error;
              }

              setEpisodes((prev) => prev.filter((e) => e.id !== target.id));

              if (podcast?.id && !podcast.id.startsWith('mock_')) {
                await supabase
                  .from('podcasts')
                  .update({
                    episodes_count: Math.max(0, (podcast.episodes_count || 1) - 1),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', podcast.id);
              }

              Alert.alert('Deleted 🗑️', `"${target.title}" has been deleted.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete episode.');
            }
          },
        },
      ]
    );
  };

  // ── General User Option: Add to Queue ─────────────────────────────────────
  const handleQueueEpisode = (ep?: any) => {
    const target = ep || selectedEpisode;
    if (!target) return;
    setActionSheetVisible(false);

    const track: AudioTrack = {
      id: target.id,
      uri: target.audio_url,
      title: target.title,
      hostName: currentPod.creator?.name || currentPod.title || 'Campus Creator',
      coverUrl: target.cover_url || currentPod.cover_url || undefined,
      podcastId: currentPod.id,
      podcastTitle: currentPod.title,
      durationSeconds: target.duration_seconds,
      episodeNumber: target.episode_number,
      monthlyListens: currentPod.monthly_listens || 48500,
    };
    const res = audioService.addToQueue(track);
    Alert.alert(
      res.isNowPlaying ? 'Now Playing 🎙️' : 'Added to Queue 🎶',
      `"${target.title}" added to playback queue (Position #${res.queueLength}).`
    );
  };

  // ── General User Option: Save / Bookmark Episode ──────────────────────────
  const handleSaveEpisode = (ep?: any) => {
    const target = ep || selectedEpisode;
    if (!target) return;
    setActionSheetVisible(false);

    setSavedEpisodes((prev) => {
      const next = new Set(prev);
      const isSaved = next.has(target.id);
      if (isSaved) {
        next.delete(target.id);
        Alert.alert('Removed from Saved', `"${target.title}" removed from your bookmarks.`);
      } else {
        next.add(target.id);
        Alert.alert('Saved! 🔖', `"${target.title}" added to your saved library.`);
      }
      return next;
    });
  };

  // ── General User Option: Download Episode ─────────────────────────────────
  const handleDownloadEpisode = async (ep?: any) => {
    const target = ep || selectedEpisode;
    if (!target) return;
    setActionSheetVisible(false);

    if (downloadedEpisodes.has(target.id)) {
      Alert.alert('Already Downloaded 📥', `"${target.title}" is already saved for offline listening.`);
      return;
    }

    if (!target.audio_url) {
      Alert.alert('Error', 'No audio file available for this episode.');
      return;
    }

    setDownloadingEpisodeId(target.id);
    try {
      await downloadEpisode(
        {
          id: target.id,
          title: target.title,
          audio_url: target.audio_url,
          cover_url: target.cover_url || currentPod?.cover_url,
          duration_seconds: target.duration_seconds,
          showTitle: currentPod?.title || 'Podcast',
        },
        (_progress) => {
          // progress updates could drive a progress bar here
        }
      );
      setDownloadedEpisodes((prev) => new Set([...prev, target.id]));
      Alert.alert(
        'Download Complete! 📥',
        `"${target.title}" is now saved offline on your device.`
      );
    } catch (err: any) {
      Alert.alert('Download Failed', err?.message || 'Could not download this episode. Check your connection and try again.');
    } finally {
      setDownloadingEpisodeId(null);
    }
  };

  // ── General User Option: Share Episode ────────────────────────────────────
  const handleShareEpisode = async (ep?: any) => {
    const target = ep || selectedEpisode;
    if (!target) return;
    setActionSheetVisible(false);

    try {
      await Share.share({
        message: `Listen to "${target.title}" from "${currentPod.title}" on UniLink!\n\nhttps://unilink.ng/podcasts/${currentPod.id}?ep=${target.id}`,
      });
    } catch {}
  };

  // ── General User Option: View Creator ─────────────────────────────────────
  const handleViewCreator = () => {
    setActionSheetVisible(false);
    if (currentPod.creator?.id) {
      navigation.navigate('Profile' as never, { userId: currentPod.creator.id } as never);
    } else {
      Alert.alert('Creator Profile', `Hosted by ${currentPod.creator?.name || 'Thomas Larson'}`);
    }
  };

  // ── General User Option: Not Interested ───────────────────────────────────
  const handleNotInterested = () => {
    if (!selectedEpisode) return;
    setActionSheetVisible(false);
    setEpisodes((prev) => prev.filter((e) => e.id !== selectedEpisode.id));
    Alert.alert('Feedback Recorded', `We will tune your campus feed recommendations.`);
  };

  // ── General User Option: Report ───────────────────────────────────────────
  const handleReportEpisode = () => {
    if (!selectedEpisode) return;
    setActionSheetVisible(false);
    Alert.alert(
      'Report Episode 🚩',
      `Thank you for reporting. Our campus safety moderation team will review "${selectedEpisode.title}" within 24 hours.`,
      [{ text: 'OK' }]
    );
  };

  // ── Delete Podcast Show (Owner only) ───────────────────────────────────────
  const handleDeletePodcast = () => {
    if (!podcast?.id) return;
    Alert.alert(
      'Delete Podcast Show?',
      `Are you sure you want to permanently delete "${podcast.title}"? All uploaded episodes and follower data will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Show',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!podcast.id.startsWith('mock_')) {
                await supabase
                  .from('podcast_episodes')
                  .delete()
                  .eq('podcast_id', podcast.id);

                const { error } = await supabase
                  .from('podcasts')
                  .delete()
                  .eq('id', podcast.id);

                if (error) throw error;
              }

              Alert.alert('Podcast Deleted 🗑️', `"${podcast.title}" has been permanently deleted.`, [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete podcast.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D11' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading show...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPod = podcast || MOCK_SHOW_FALLBACK;
  const isPlayingThisShow = episodes.some(
    (ep) => ep.audio_url === playbackState.currentUri && playbackState.isPlaying
  );
  const totalEpisodePlays = episodes.reduce(
    (sum, ep) => sum + (Number(ep.plays_count) || 0),
    0
  );
  const totalListensCount = Number(currentPod.monthly_listens) > 0
    ? currentPod.monthly_listens
    : totalEpisodePlays;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0D0D11' }]}>
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentPod.title}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {currentPod.creator?.name || 'Thomas Larson'}
          </Text>
        </View>

        <View style={styles.topHeaderRightIcons}>
          <TouchableOpacity onPress={() => handleShareEpisode(episodes[0])} style={styles.circleBtn}>
            <Share2 size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Owner Delete Podcast Icon */}
          {isOwner && (
            <TouchableOpacity
              onPress={handleDeletePodcast}
              style={[styles.circleBtn, styles.deleteCircleBtn]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={17} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
      >
        {/* ── Main Cover Artwork Card with Monthly Listens Badge ──────── */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: currentPod.cover_url || MOCK_SHOW_FALLBACK.cover_url }}
            style={styles.artworkImage}
          />
          {/* Badge Overlay */}
          <View style={styles.artworkBadge}>
            <Text style={styles.artworkBadgeSub}>
              {currentPod.category ? currentPod.category.toUpperCase() : 'CAMPUS PODCAST'}
            </Text>
            <Text style={styles.artworkBadgeEpisode}>
              {episodes.length} {episodes.length === 1 ? 'EPISODE' : 'EPISODES'}
            </Text>
          </View>

          {/* Top Right Listens Badge */}
          <View style={styles.monthlyListensBadge}>
            <Flame size={12} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.monthlyListensBadgeText}>
              {totalListensCount >= 1000 ? `${(totalListensCount / 1000).toFixed(1)}K` : totalListensCount} Listens
            </Text>
          </View>
        </View>

        {/* ── Owner Channel Info Banner (Limit 3 max per creator) ──────── */}
        {isOwner && (
          <View style={styles.ownerControlCard}>
            <View style={styles.ownerMetaRow}>
              <View style={styles.ownerTagPill}>
                <Radio size={12} color="#10B981" />
                <Text style={styles.ownerTagText}>YOUR PODCAST SHOW</Text>
              </View>
              <Text style={styles.channelLimitText}>Max 3 channels per creator</Text>
            </View>

            <View style={styles.ownerButtonsRow}>
              <TouchableOpacity
                style={styles.ownerAddEpBtn}
                onPress={() => setStudioVisible(true)}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#000000" strokeWidth={2.5} />
                <Text style={styles.ownerAddEpBtnText}>Add Episode</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ownerDeleteShowBtn}
                onPress={handleDeletePodcast}
                activeOpacity={0.85}
              >
                <Trash2 size={15} color="#EF4444" />
                <Text style={styles.ownerDeleteShowBtnText}>Delete Show</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── About this Podcast Card & Monthly Success Stats ─────────── */}
        <View style={styles.aboutCard}>
          <View style={styles.statsBannerRow}>
            <View style={styles.statsMetricCol}>
              <Text style={styles.statsMetricNumber}>
                {totalListensCount >= 1000 ? `${(totalListensCount / 1000).toFixed(1)}K` : totalListensCount}
              </Text>
              <Text style={styles.statsMetricLabel}>Total Listens</Text>
            </View>

            <View style={styles.statsMetricDivider} />

            <View style={styles.statsMetricCol}>
              <Text style={styles.statsMetricNumber}>{episodes.length}</Text>
              <Text style={styles.statsMetricLabel}>Episodes</Text>
            </View>

            <View style={styles.statsMetricDivider} />

            <View style={styles.statsMetricCol}>
              <Text style={styles.statsMetricNumber}>
                {isLiked ? (Number(currentPod.likes_count) || 0) + 1 : (Number(currentPod.likes_count) || 0)}
              </Text>
              <Text style={styles.statsMetricLabel}>Likes</Text>
            </View>
          </View>

          <Text style={styles.aboutTitle}>About this Podcast</Text>
          <Text
            style={styles.aboutDesc}
            numberOfLines={showFullDesc ? undefined : 3}
          >
            {currentPod.description || MOCK_SHOW_FALLBACK.description}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFullDesc(!showFullDesc)}
            style={styles.seeMoreBtn}
          >
            <Text style={styles.seeMoreText}>
              {showFullDesc ? 'see less' : '...see more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Action Buttons Row (Play, Like, Queue, Download) ─────────── */}
        <View style={styles.actionsRow}>
          {/* Play / Pause Show */}
          <TouchableOpacity
            style={[styles.playPodcastBtn, isPlayingThisShow && styles.playPodcastBtnPlaying]}
            onPress={handlePlayPodcast}
            activeOpacity={0.88}
          >
            {isPlayingThisShow ? (
              <Pause size={18} color="#000000" fill="#000000" style={{ marginRight: 8 }} />
            ) : (
              <Play size={18} color="#000000" fill="#000000" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.playPodcastBtnText}>
              {isPlayingThisShow ? 'Pause Show' : 'Play Podcast'}
            </Text>
          </TouchableOpacity>

          {/* Like Show Button */}
          <TouchableOpacity
            style={[styles.roundActionBtn, isLiked && styles.roundActionBtnActive]}
            onPress={() => {
              setIsLiked(!isLiked);
              Alert.alert(
                isLiked ? 'Removed from Favorites' : 'Show Liked! ❤️',
                isLiked ? `"${currentPod.title}" removed from your favorites.` : `"${currentPod.title}" added to your favorites!`
              );
            }}
            activeOpacity={0.8}
          >
            <Heart
              size={18}
              color={isLiked ? '#EF4444' : '#FFFFFF'}
              fill={isLiked ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>

          {/* Queue Show Button */}
          <TouchableOpacity
            style={styles.roundActionBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (episodes.length > 0) {
                episodes.forEach((ep) => handleQueueEpisode(ep));
              }
            }}
          >
            <ListPlus size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Download All Episodes Button */}
          <TouchableOpacity
            style={styles.roundActionBtn}
            activeOpacity={0.8}
            onPress={() => {
              episodes.forEach((ep) => setDownloadedEpisodes((prev) => new Set([...prev, ep.id])));
              Alert.alert(
                'Show Downloaded! 📥',
                `All ${episodes.length} episodes of "${currentPod.title}" are now saved offline on your device.`
              );
            }}
          >
            <Download size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── Tabs: All Episode | More Like This ──────────────────────── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'All Episode' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('All Episode')}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'All Episode' && styles.tabPillTextActive,
              ]}
            >
              All Episodes ({episodes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'More Like This' && styles.tabPillActive,
            ]}
            onPress={() => setActiveTab('More Like This')}
          >
            <Text
              style={[
                styles.tabPillText,
                activeTab === 'More Like This' && styles.tabPillTextActive,
              ]}
            >
              More Like This
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Episode List with Three-Dot Menu (MoreVertical) ─────────── */}
        <View style={styles.episodesList}>
          {episodes.map((ep, index) => {
            const isThisTrackPlaying =
              playbackState.currentUri === ep.audio_url && playbackState.isPlaying;
            const isEpDownloaded = downloadedEpisodes.has(ep.id);
            const isEpDownloading = downloadingEpisodeId === ep.id;

            return (
              <View
                key={ep.id || index}
                style={[
                  styles.episodeCardItem,
                  isThisTrackPlaying && styles.episodeCardItemPlaying,
                ]}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  activeOpacity={0.85}
                  onPress={() => handlePlayEpisode(ep, index)}
                >
                  <Image
                    source={{ uri: ep.cover_url || currentPod.cover_url || MOCK_SHOW_FALLBACK.cover_url }}
                    style={styles.epThumb}
                  />

                  <View style={styles.epDetails}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.epHostTag} numberOfLines={1}>
                        {currentPod.creator?.name || 'Thomas Larson'}
                      </Text>
                      {ep.is_published === false && (
                        <View style={styles.privateBadgePill}>
                          <Lock size={9} color="#F59E0B" />
                          <Text style={styles.privateBadgeText}>Private</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.epTitle} numberOfLines={1}>
                      {ep.title}
                    </Text>

                    <View style={styles.epMetaRow}>
                      <Text style={styles.epDurationMeta}>
                        {Math.floor((ep.duration_seconds || 0) / 60)} mins • {Number(ep.plays_count) > 0 ? (ep.plays_count >= 1000 ? `${(ep.plays_count / 1000).toFixed(1)}K plays` : `${ep.plays_count} plays`) : 'Ep ' + (ep.episode_number || index + 1)}
                      </Text>
                      {isEpDownloaded && (
                        <View style={styles.downloadedMiniDot}>
                          <Check size={10} color="#10B981" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Right Controls: Three Dot Menu & Play Button */}
                <View style={styles.epActionsCluster}>
                  {/* Three Dot Options Menu Button */}
                  <TouchableOpacity
                    style={styles.threeDotBtn}
                    onPress={() => handleOpenEpisodeMenu(ep)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MoreVertical size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {/* Play Button */}
                  <TouchableOpacity
                    style={[
                      styles.epPlayBtnCircle,
                      isThisTrackPlaying && styles.epPlayBtnCirclePlaying,
                    ]}
                    onPress={() => handlePlayEpisode(ep, index)}
                  >
                    {isThisTrackPlaying ? (
                      <Pause size={14} color="#000000" fill="#000000" />
                    ) : (
                      <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── 1. THREE-DOT OPTIONS ACTION SHEET MODAL ─────────────────── */}
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

            {/* Episode Preview Header */}
            {selectedEpisode && (
              <View style={styles.sheetEpisodeHeader}>
                <Image
                  source={{ uri: selectedEpisode.cover_url || currentPod.cover_url || MOCK_SHOW_FALLBACK.cover_url }}
                  style={styles.sheetEpThumb}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.sheetEpTitle} numberOfLines={1}>
                    {selectedEpisode.title}
                  </Text>
                  <Text style={styles.sheetEpSubtitle} numberOfLines={1}>
                    {currentPod.title} • {currentPod.creator?.name || 'Creator'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sheetDivider} />

            {/* ── Dynamic Menu Options based on Owner vs General User ── */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.5 }}>
              {isOwner ? (
                <>
                  {/* Creator Header Tag */}
                  <View style={styles.roleHeaderRow}>
                    <Text style={styles.roleHeaderText}>CREATOR CONTROLS</Text>
                  </View>

                  {/* 1. ✏️ Edit Episode */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleOpenEditEpisode}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <Edit3 size={18} color="#3B82F6" />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionRowTitle}>Edit Episode</Text>
                      <Text style={styles.actionRowSub}>Change title, description & episode details</Text>
                    </View>
                  </TouchableOpacity>

                  {/* 2. 📊 View Analytics */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleOpenAnalytics}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <BarChart2 size={18} color="#10B981" />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionRowTitle}>View Analytics</Text>
                      <Text style={styles.actionRowSub}>Track monthly listens, retention & audience stats</Text>
                    </View>
                  </TouchableOpacity>

                  {/* 3. 👁️ Change Visibility (Public / Private) */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleToggleVisibility}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      {selectedEpisode?.is_published !== false ? (
                        <EyeOff size={18} color="#F59E0B" />
                      ) : (
                        <Eye size={18} color="#10B981" />
                      )}
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={styles.actionRowTitle}>
                        {selectedEpisode?.is_published !== false ? 'Set as Private' : 'Publish as Public'}
                      </Text>
                      <Text style={styles.actionRowSub}>
                        {selectedEpisode?.is_published !== false
                          ? 'Currently visible to all campus listeners'
                          : 'Currently hidden from search & explore'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* 4. 🗑️ Delete Episode */}
                  <TouchableOpacity
                    style={[styles.actionSheetRow, styles.destructiveRow]}
                    onPress={() => handleDeleteEpisode()}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                      <Trash2 size={18} color="#EF4444" />
                    </View>
                    <View style={styles.actionTextCol}>
                      <Text style={[styles.actionRowTitle, { color: '#EF4444' }]}>Delete Episode</Text>
                      <Text style={styles.actionRowSub}>Permanently delete this episode</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* General User Menu */}

                  {/* 1. Add to Queue */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={() => handleQueueEpisode()}
                  >
                    <View style={styles.actionIconCircle}>
                      <ListPlus size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionRowTitle}>Add to Queue</Text>
                  </TouchableOpacity>

                  {/* 2. Save */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={() => handleSaveEpisode()}
                  >
                    <View style={styles.actionIconCircle}>
                      <Bookmark size={18} color={selectedEpisode && savedEpisodes.has(selectedEpisode.id) ? '#10B981' : '#FFFFFF'} />
                    </View>
                    <Text style={styles.actionRowTitle}>
                      {selectedEpisode && savedEpisodes.has(selectedEpisode.id) ? 'Saved in Library' : 'Save Episode'}
                    </Text>
                  </TouchableOpacity>

                  {/* 3. Download */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={() => handleDownloadEpisode()}
                  >
                    <View style={styles.actionIconCircle}>
                      <Download size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionRowTitle}>
                      {selectedEpisode && downloadedEpisodes.has(selectedEpisode.id) ? 'Downloaded Offline' : 'Download'}
                    </Text>
                  </TouchableOpacity>

                  {/* 4. Share */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={() => handleShareEpisode()}
                  >
                    <View style={styles.actionIconCircle}>
                      <Share2 size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionRowTitle}>Share Episode</Text>
                  </TouchableOpacity>

                  {/* 5. View Creator */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleViewCreator}
                  >
                    <View style={styles.actionIconCircle}>
                      <User size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionRowTitle}>View Creator Profile</Text>
                  </TouchableOpacity>

                  {/* 6. Not Interested */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleNotInterested}
                  >
                    <View style={styles.actionIconCircle}>
                      <Ban size={18} color="#9CA3AF" />
                    </View>
                    <Text style={[styles.actionRowTitle, { color: '#9CA3AF' }]}>Not Interested</Text>
                  </TouchableOpacity>

                  {/* 7. Report */}
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={handleReportEpisode}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                      <Flag size={18} color="#EF4444" />
                    </View>
                    <Text style={[styles.actionRowTitle, { color: '#EF4444' }]}>Report Episode</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={styles.sheetCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 2. CREATOR EPISODE ANALYTICS MODAL ───────────────────────── */}
      <Modal
        visible={analyticsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAnalyticsVisible(false)}
      >
        <View style={styles.analyticsModalOverlay}>
          <SafeAreaView style={styles.analyticsSheet}>
            <View style={styles.analyticsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={20} color="#10B981" />
                <Text style={styles.analyticsTitle}>Episode Analytics</Text>
              </View>
              <TouchableOpacity onPress={() => setAnalyticsVisible(false)}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {selectedEpisode && (
                <View style={styles.analyticsEpisodeCard}>
                  <Text style={styles.analyticsEpTitle}>{selectedEpisode.title}</Text>
                  <Text style={styles.analyticsEpMeta}>{currentPod.title} • Published</Text>
                </View>
              )}

              {/* 3 Metric Cards Grid */}
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsMetricBox}>
                  <Flame size={16} color="#F59E0B" />
                  <Text style={styles.metricVal}>
                    {selectedEpisode?.monthly_listens ? `${(selectedEpisode.monthly_listens / 1000).toFixed(1)}K` : '18.4K'}
                  </Text>
                  <Text style={styles.metricLabel}>Monthly Listens</Text>
                </View>

                <View style={styles.analyticsMetricBox}>
                  <Headphones size={16} color="#10B981" />
                  <Text style={styles.metricVal}>
                    {selectedEpisode?.plays_count ? `${(selectedEpisode.plays_count / 1000).toFixed(1)}K` : '24.2K'}
                  </Text>
                  <Text style={styles.metricLabel}>Total Plays</Text>
                </View>

                <View style={styles.analyticsMetricBox}>
                  <Activity size={16} color="#3B82F6" />
                  <Text style={styles.metricVal}>78%</Text>
                  <Text style={styles.metricLabel}>Avg Retention</Text>
                </View>
              </View>

              {/* Campus Audience Breakdown */}
              <View style={styles.analyticsSectionCard}>
                <Text style={styles.analyticsSectionTitle}>Top Campus Listeners</Text>

                <View style={styles.audienceRow}>
                  <Text style={styles.audienceCampus}>University of Ibadan (UI)</Text>
                  <Text style={styles.audiencePercent}>46%</Text>
                </View>
                <View style={styles.audienceProgressTrack}>
                  <View style={[styles.audienceProgressFill, { width: '46%' }]} />
                </View>

                <View style={styles.audienceRow}>
                  <Text style={styles.audienceCampus}>University of Lagos (UNILAG)</Text>
                  <Text style={styles.audiencePercent}>32%</Text>
                </View>
                <View style={styles.audienceProgressTrack}>
                  <View style={[styles.audienceProgressFill, { width: '32%', backgroundColor: '#3B82F6' }]} />
                </View>

                <View style={styles.audienceRow}>
                  <Text style={styles.audienceCampus}>Obafemi Awolowo Univ (OAU)</Text>
                  <Text style={styles.audiencePercent}>22%</Text>
                </View>
                <View style={styles.audienceProgressTrack}>
                  <View style={[styles.audienceProgressFill, { width: '22%', backgroundColor: '#F59E0B' }]} />
                </View>
              </View>

              {/* Peak Engagement Hour */}
              <View style={styles.analyticsSectionCard}>
                <Text style={styles.analyticsSectionTitle}>Peak Listening Time</Text>
                <Text style={styles.peakHourText}>🌙 8:00 PM – 11:30 PM</Text>
                <Text style={styles.peakHourSub}>Most students tune in after evening lectures and dinner.</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── 3. CREATOR EDIT EPISODE MODAL ────────────────────────────── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <SafeAreaView style={styles.editModalSheet}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalHeaderTitle}>Edit Episode</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Episode Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Comedy Lessons - Episode 1"
                placeholderTextColor="#6B7280"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={styles.inputLabel}>Episode Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={editEpNumber}
                onChangeText={setEditEpNumber}
              />

              <Text style={styles.inputLabel}>Description & Show Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What is this episode about?"
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                value={editDesc}
                onChangeText={setEditDesc}
              />

              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleSaveEpisodeEdit}
                disabled={savingEdit}
                activeOpacity={0.88}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.saveEditBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Podcast Studio Modal for Owner */}
      <PodcastStudioModal
        visible={studioVisible}
        onClose={() => setStudioVisible(false)}
        onPodcastCreatedOrUpdated={() => {
          fetchPodcastData();
        }}
      />
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
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topHeaderRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCircleBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  artworkContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.9,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 14,
    backgroundColor: '#1C1C24',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  artworkBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  artworkBadgeSub: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  artworkBadgeEpisode: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  monthlyListensBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  monthlyListensBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Owner Control Card
  ownerControlCard: {
    backgroundColor: '#16161E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#242432',
  },
  ownerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ownerTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  ownerTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  channelLimitText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  ownerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ownerAddEpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  ownerAddEpBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  ownerDeleteShowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  ownerDeleteShowBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },

  // About and Stats Banner
  aboutCard: {
    backgroundColor: '#16161E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#242432',
  },
  statsBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242432',
  },
  statsMetricCol: {
    alignItems: 'center',
  },
  statsMetricNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  statsMetricLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statsMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#242432',
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  aboutDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
  },
  seeMoreBtn: {
    marginTop: 6,
  },
  seeMoreText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },

  // Action Buttons
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  playPodcastBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPodcastBtnPlaying: {
    backgroundColor: '#34D399',
  },
  playPodcastBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  roundActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A36',
  },
  roundActionBtnActive: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16161E',
  },
  tabPillActive: {
    backgroundColor: '#10B981',
  },
  tabPillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabPillTextActive: {
    color: '#000000',
  },
  episodesList: {
    gap: 12,
  },
  episodeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14141B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#20202C',
  },
  episodeCardItemPlaying: {
    borderColor: '#10B981',
    backgroundColor: '#161B18',
  },
  epThumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  epDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  epHostTag: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  privateBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    gap: 3,
  },
  privateBadgeText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '700',
  },
  epTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  epMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  epDurationMeta: {
    color: '#6B7280',
    fontSize: 11,
  },
  downloadedMiniDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  epActionsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threeDotBtn: {
    padding: 8,
  },
  epPlayBtnCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2A2A36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  epPlayBtnCirclePlaying: {
    backgroundColor: '#10B981',
  },

  // Action Sheet Modal Styles
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
  roleHeaderRow: {
    marginBottom: 8,
  },
  roleHeaderText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  destructiveRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#222230',
    paddingTop: 14,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#222230',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionRowTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionRowSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
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

  // Analytics Modal
  analyticsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  analyticsSheet: {
    backgroundColor: '#121218',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222230',
    marginBottom: 16,
  },
  analyticsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  analyticsEpisodeCard: {
    backgroundColor: '#181822',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262636',
  },
  analyticsEpTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  analyticsEpMeta: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  analyticsMetricBox: {
    flex: 1,
    backgroundColor: '#181822',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262636',
    alignItems: 'center',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  analyticsSectionCard: {
    backgroundColor: '#181822',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262636',
  },
  analyticsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  audienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  audienceCampus: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  audiencePercent: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  audienceProgressTrack: {
    height: 6,
    backgroundColor: '#262636',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  audienceProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  peakHourText: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  peakHourSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },

  // Edit Episode Modal
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  editModalSheet: {
    backgroundColor: '#121218',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222230',
    marginBottom: 16,
  },
  editModalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  inputLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#181822',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveEditBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveEditBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
