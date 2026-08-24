import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Share,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  CheckCircle2,
  Send,
  X,
  Radio,
  Mic2,
  MoreVertical,
  Trash2,
  Users,
  Play,
  Pause,
  Headphones,
  Search,
  Compass,
  MessageSquare,
  HelpCircle,
  BookOpen,
  ChartBar,
  Flag,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, useTheme } from '../../theme/colors';
import { apiClient } from '../../api/client';

import { FeedService, FeedPost, CommentItem } from '../../services/feedService';
import { FormattedText } from '../../components/FormattedText';
import { AutoHeightImage } from '../../components/AutoHeightImage';
import { VideoPlayer } from '../../components/VideoPlayer';
import { ShortsViewerModal } from '../../components/ShortsViewerModal';
import { ReportModal } from '../../components/ReportModal';
import { SocialSourceBadge } from '../../components/SocialSourceBadge';
import { PollCard } from '../../components/PollCard';
import { SpotifyAudioPlayer } from '../../components/SpotifyAudioPlayer';
import { extractYouTubeId, cleanVideoUrlsFromText } from '../../utils/videoUtils';
import { supabase } from '../../lib/supabase';
import { audioService, PlaybackState } from '../../services/audioService';
import { postPublishService, PublishState } from '../../services/postPublishService';

const { width } = Dimensions.get('window');

interface PodcastStory {
  id: string;
  title: string;
  coverUrl: string | null;
  creatorName: string;
  latestEpisodeTitle: string;
}

interface FeedEpisode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number;
  plays_count: number;
  created_at: string;
  podcast?: {
    id: string;
    title: string;
    cover_url: string | null;
    creator?: {
      name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  };
}

type FeedItem =
  | { type: 'post'; data: FeedPost }
  | { type: 'podcast'; data: FeedEpisode };

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return '';
  }
}

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastStory[]>([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState<FeedEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Audio Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  // Comments modal state
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Shorts fullscreen modal state
  const [shortsModalVisible, setShortsModalVisible] = useState(false);
  const [activeShortsPostId, setActiveShortsPostId] = useState<string | null>(null);

  // First-time Post Prompt Card
  const [dismissedStarter, setDismissedStarter] = useState(false);

  // Moderation / Report Offence Modal
  const [reportingUser, setReportingUser] = useState<{ id: string; name: string; postId?: string } | null>(null);

  // Autoplay visible video tracking
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const topVisible = viewableItems[0]?.item;
      if (topVisible && topVisible.type === 'post') {
        setVisiblePostId(topVisible.data.id);
      }
    }
  }).current;

  // 1. Fetch User Session
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    loadUser();
  }, []);

  const fetchFeed = useCallback(async () => {
    try {
      const [feedPosts, podcastRes, episodesRes] = await Promise.allSettled([
        FeedService.getFeed(userId),
        apiClient.get('/podcasts?limit=10'),
        supabase
          .from('podcast_episodes')
          .select(`
            id, title, description, audio_url, cover_url, duration_seconds, plays_count, created_at,
            podcast:podcasts!inner(
              id, title, cover_url,
              creator:profiles!creator_id(name, username, avatar_url)
            )
          `)
          .eq('is_published', true)
          .ilike('podcast.title', '%BLISSFUL%')
          .not('audio_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (feedPosts.status === 'fulfilled') {
        setPosts(feedPosts.value);
        if (feedPosts.value.length > 0 && !visiblePostId) {
          setVisiblePostId(feedPosts.value[0].id);
        }
      }

      if (podcastRes.status === 'fulfilled' && podcastRes.value?.data?.podcasts) {
        setPodcasts(podcastRes.value.data.podcasts);
      }

      if (episodesRes.status === 'fulfilled' && episodesRes.value?.data) {
        setPodcastEpisodes((episodesRes.value.data as any[]) || []);
      }
    } catch (error) {
      console.warn('Error fetching feed data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, visiblePostId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // 2. Subscribe to background audio & background post publish state
  useEffect(() => {
    const unsubAudio = audioService.subscribe(setPlaybackState);
    const unsubPublish = postPublishService.subscribe((state: PublishState) => {
      if (state.status === 'success') {
        fetchFeed();
      }
    });
    return () => {
      unsubAudio();
      unsubPublish();
    };
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  // ── Instant Optimistic Liking ─────────────────────────────────────────────
  const handleLike = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLiked = !!targetPost.user_has_liked;
    const newLiked = !currentLiked;
    const newLikesCount = Math.max(0, targetPost.likes_count + (newLiked ? 1 : -1));

    // INSTANT UI UPDATE (0ms delay)
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_has_liked: newLiked,
              likes_count: newLikesCount,
            }
          : p
      )
    );

    // Fire and forget in background
    if (userId) {
      FeedService.toggleLike(postId, userId, currentLiked).catch(() => {
        // Rollback on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  user_has_liked: currentLiked,
                  likes_count: targetPost.likes_count,
                }
              : p
          )
        );
      });
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id || userId;
      if (!currentUid) {
        Alert.alert('Sign In', 'Please sign in to repost to your campus feed.');
        return;
      }
      await FeedService.repost(postId, currentUid);
      Alert.alert('Success', 'Reposted to your campus feed!');
      fetchFeed();
    } catch {
      Alert.alert('Error', 'Could not repost this item.');
    }
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to vote in campus polls.');
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const oldVote = post.user_vote;
          if (oldVote === optionIndex) return post;

          const counts = Array.isArray(post.poll_counts)
            ? [...post.poll_counts]
            : (post.poll_options || []).map(() => 0);

          if (oldVote !== null && oldVote !== undefined) {
            counts[oldVote] = Math.max(0, (counts[oldVote] || 1) - 1);
          }
          counts[optionIndex] = (counts[optionIndex] || 0) + 1;

          return {
            ...post,
            poll_counts: counts,
            user_vote: optionIndex,
          };
        }
        return post;
      })
    );

    await FeedService.votePoll(postId, optionIndex, userId);
  };

  const handleShare = async (post: FeedPost) => {
    try {
      const shareUrl = `https://unilink.ng/post/${post.id}`;
      const mediaUrl = post.video_url || (post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : post.image_url);
      const authorName = post.author?.name || post.author?.username || 'Student';

      let message = '';
      if (post.content) {
        message += `${post.content}\n\n`;
      }
      if (mediaUrl) {
        message += `📸 Media: ${mediaUrl}\n\n`;
      }
      message += `🎓 Shared by ${authorName} on UniLink: ${shareUrl}`;

      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: shareUrl }
          : { message }
      );
    } catch {
      // Ignore
    }
  };

  // ── Comments Handling & Deletion ──────────────────────────────────────────
  const openCommentsModal = async (postId: string) => {
    setActivePostId(postId);
    setCommentsModalVisible(true);
    setLoadingComments(true);
    try {
      const fetched = await FeedService.getComments(postId);
      setComments(fetched);
    } catch (err) {
      console.warn('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!activePostId || !newComment.trim() || !userId) return;

    setSubmittingComment(true);
    const content = newComment.trim();
    setNewComment('');
    try {
      const added = await FeedService.addComment(activePostId, userId, content);
      if (added) {
        setComments((prev) => [added, ...prev]);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === activePostId ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activePostId || !userId) return;

    Alert.alert('Delete Comment', 'Are you sure you want to delete your comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === activePostId
                ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
                : p
            )
          );
          try {
            await FeedService.deleteComment(commentId, activePostId, userId);
          } catch {
            Alert.alert('Error', 'Could not delete comment.');
            openCommentsModal(activePostId);
          }
        },
      },
    ]);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post from campus feed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!userId) return;
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          try {
            await FeedService.deletePost(postId, userId);
          } catch {
            Alert.alert('Error', 'Could not delete post.');
            fetchFeed();
          }
        },
      },
    ]);
  };

  // ── Podcast In-Feed Playback ──────────────────────────────────────────────
  const handleToggleFeedPodcast = (ep: FeedEpisode) => {
    const isThisPlaying =
      playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

    if (isThisPlaying) {
      audioService.pause();
    } else {
      audioService.playTrack({
        id: ep.id,
        uri: ep.audio_url,
        title: ep.title,
        hostName: ep.podcast?.creator?.name || ep.podcast?.title || 'Campus Podcast',
        coverUrl: ep.cover_url || ep.podcast?.cover_url || undefined,
        podcastId: ep.podcast?.id,
        durationSeconds: ep.duration_seconds,
      });
    }
  };

  // ── Build Interleaved Feed ────────────────────────────────────────────────
  const interleavedFeedItems: FeedItem[] = [];
  let epIndex = 0;

  posts.forEach((post, i) => {
    interleavedFeedItems.push({ type: 'post', data: post });
    // Interleave a podcast episode every 4 posts if available
    if ((i + 1) % 4 === 0 && podcastEpisodes.length > epIndex) {
      interleavedFeedItems.push({
        type: 'podcast',
        data: podcastEpisodes[epIndex],
      });
      epIndex++;
    }
  });

  // ── Render Stories Strip ──────────────────────────────────────────────────
  const renderPodcastStories = () => {
    const ringColors = [
      colors.sunYellow,
      colors.lilacDark,
      colors.coralDark,
      colors.primary,
    ];

    return (
      <View style={styles.podcastStoriesContainer}>
        <View style={styles.storiesHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Mic2 size={16} color={colors.primary} />
            <Text style={styles.storiesHeaderTitle}>Campus Podcasts</Text>
          </View>
          <TouchableOpacity onPress={() => navigation?.navigate('Podcasts')}>
            <Text style={styles.seeAllPodcastsText}>Browse all →</Text>
          </TouchableOpacity>
        </View>

        {podcasts && podcasts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.podcastList}
          >
            {podcasts.map((podcast, idx) => {
              const ringColor = ringColors[idx % ringColors.length];
              return (
                <TouchableOpacity
                  key={podcast.id}
                  style={styles.storyBubbleItem}
                  onPress={() => navigation?.navigate('Podcast', { podcastId: podcast.id })}
                >
                  <View style={[styles.storyAvatarBorder, { borderColor: ringColor }]}>
                    {podcast.coverUrl ? (
                      <Image source={{ uri: podcast.coverUrl }} style={styles.storyAvatarImage} />
                    ) : (
                      <View style={styles.storyAvatarPlaceholder}>
                        <Mic2 size={20} color={ringColor} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.storyTitleText} numberOfLines={1}>
                    {podcast.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={styles.emptyPodcastBanner}
            onPress={() => navigation?.navigate('Podcasts')}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.emptyPodcastIconBox}>
                <Mic2 size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyPodcastTitle}>Campus Audio & Podcasts</Text>
                <Text style={styles.emptyPodcastSubtitle}>Listen to student creators and campus radio</Text>
              </View>
              <Text style={styles.emptyPodcastActionText}>Listen →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* First Post Activation Card */}
        {!dismissedStarter && (
          <View style={[styles.starterCard, { backgroundColor: isDark ? '#18181B' : '#ECFDF5', borderColor: colors.primary }]}>
            <View style={styles.starterHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Compass size={16} color={colors.primary} />
                <Text style={[styles.starterTitle, { color: colors.text }]}>
                  Start Your Campus Journey
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDismissedStarter(true)}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.starterSubtitle, { color: colors.textSecondary }]}>
              Connect with classmates across departments. Tap an idea to post:
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.starterChipsScroll}>
              <TouchableOpacity
                style={[styles.starterChip, { backgroundColor: isDark ? '#27272A' : '#FFFFFF', borderColor: colors.border }]}
                onPress={() =>
                  navigation?.navigate('Create', {
                    sharedText: "Hey campus! Excited to connect with fellow students here.",
                  })
                }
              >
                <MessageSquare size={14} color={colors.primary} />
                <Text style={[styles.starterChipText, { color: colors.text }]}>Say Hello</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.starterChip, { backgroundColor: isDark ? '#27272A' : '#FFFFFF', borderColor: colors.border }]}
                onPress={() =>
                  navigation?.navigate('Create', {
                    sharedText: "Question for campus: Anyone taking courses in ",
                  })
                }
              >
                <HelpCircle size={14} color={colors.primary} />
                <Text style={[styles.starterChipText, { color: colors.text }]}>Ask Question</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.starterChip, { backgroundColor: isDark ? '#27272A' : '#FFFFFF', borderColor: colors.border }]}
                onPress={() =>
                  navigation?.navigate('Create', {
                    sharedText: "Campus Poll: What is the most important skill to learn this semester?",
                  })
                }
              >
                <ChartBar size={14} color={colors.primary} />
                <Text style={[styles.starterChipText, { color: colors.text }]}>Create a Poll</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.starterChip, { backgroundColor: isDark ? '#27272A' : '#FFFFFF', borderColor: colors.border }]}
                onPress={() =>
                  navigation?.navigate('Create', {
                    sharedText: "Study Resource: Sharing some key revision notes for upcoming exams:",
                  })
                }
              >
                <BookOpen size={14} color={colors.primary} />
                <Text style={[styles.starterChipText, { color: colors.text }]}>Share Notes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // ── Render Post Card ──────────────────────────────────────────────────────
  const renderPostCard = (post: FeedPost) => {
    const isAuthor = post.author_id === userId || post.author?.id === userId;
    const orig = post.original_post;
    const isRepost = !!post.is_repost || !!orig;

    // Fallback media if repost is directly flattened
    const effectiveVideoUrl = post.video_url || orig?.video_url;
    const effectiveContent = post.content || orig?.content;
    const effectiveImgUrl = post.image_url || orig?.image_url;
    const effectiveImgUrls =
      post.image_urls && post.image_urls.length > 0
        ? post.image_urls
        : orig?.image_urls && orig.image_urls.length > 0
        ? orig.image_urls
        : [];

    return (
      <View key={post.id} style={styles.postCard}>
        {/* Repost Header Banner if repost */}
        {isRepost && (
          <View style={styles.repostBanner}>
            <Repeat2 size={13} color={colors.primary} />
            <Text style={styles.repostBannerText}>
              Reposted by {post.author?.name || `@${post.author?.username || 'student'}`}
            </Text>
          </View>
        )}

        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorTouchArea}
            onPress={() => {
              if (post.author?.id) {
                navigation?.navigate('Profile', { userId: post.author.id });
              }
            }}
          >
            {post.author?.avatar_url ? (
              <Image source={{ uri: post.author.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(post.author?.name || post.author?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.authorMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {post.author?.name || post.author?.username || 'Campus Student'}
                </Text>
                {post.author?.is_verified && (
                  <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                )}
                {post.created_at && (
                  <Text style={[styles.timestampText, { color: colors.textTertiary }]}>
                    {' · '}{formatRelativeTime(post.created_at)}
                  </Text>
                )}
              </View>
              <Text style={styles.authorUsername}>
                @{post.author?.username || 'student'}
              </Text>
            </View>
          </TouchableOpacity>

          {isAuthor ? (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => handleDeletePost(post.id)}
            >
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() =>
                setReportingUser({
                  id: post.author_id || post.author?.id || '',
                  name: post.author?.name || post.author?.username || 'student',
                  postId: post.id,
                })
              }
            >
              <Flag size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Reposter commentary content */}
        {post.content ? (
          <>
            <FormattedText content={post.content} style={styles.postContent} />
            <View style={{ paddingHorizontal: 16 }}>
              <SocialSourceBadge text={post.content || ''} linkUrl={post.video_url || undefined} />
            </View>
          </>
        ) : null}

        {/* If Hydrated Original Post Exists -> Render Embedded Card */}
        {orig ? (
          <View style={styles.originalPostCard}>
            <View style={styles.originalPostHeader}>
              {orig.author?.avatar_url ? (
                <Image source={{ uri: orig.author.avatar_url }} style={styles.origAvatar} />
              ) : (
                <View style={[styles.origAvatar, styles.avatarPlaceholder]}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    {(orig.author?.name || orig.author?.username || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 8, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.origAuthorName} numberOfLines={1}>
                    {orig.author?.name || orig.author?.username || 'Student'}
                  </Text>
                  {orig.author?.is_verified && (
                    <CheckCircle2 size={11} color={colors.primary} style={{ marginLeft: 3 }} />
                  )}
                  {orig.created_at && (
                    <Text style={[styles.origTimestampText, { color: colors.textTertiary }]}>
                      {' · '}{formatRelativeTime(orig.created_at)}
                    </Text>
                  )}
                </View>
                <Text style={styles.origUsername}>@{orig.author?.username || 'student'}</Text>
              </View>
            </View>

            {orig.content ? (
              <>
                <FormattedText content={orig.content} style={styles.origContent} />
                <View style={{ paddingHorizontal: 12 }}>
                  <SocialSourceBadge text={orig.content} linkUrl={orig.video_url || undefined} />
                </View>
              </>
            ) : null}

            {/* Reshared Original Poll */}
            {orig.poll_options && orig.poll_options.length > 0 && (
              <PollCard
                options={orig.poll_options}
                counts={orig.poll_counts}
                userVote={orig.user_vote}
                onVote={(optionIndex) => handleVotePoll(orig.id, optionIndex)}
              />
            )}

            {/* Reshared Original Video */}
            {orig.video_url || extractYouTubeId(orig.content || '') ? (
              <VideoPlayer
                url={orig.video_url}
                content={orig.content}
                isVisibleInViewport={visiblePostId === post.id}
                onDoubleTap={() => {
                  setActiveShortsPostId(post.id);
                  setShortsModalVisible(true);
                }}
              />
            ) : null}

            {/* Reshared Original Images */}
            {orig.image_url ? (
              <AutoHeightImage uri={orig.image_url} />
            ) : null}
            {orig.image_urls && orig.image_urls.length > 0 && !orig.image_url ? (
              orig.image_urls.map((imgUri: string, idx: number) => (
                <AutoHeightImage key={idx} uri={imgUri} />
              ))
            ) : null}
          </View>
        ) : (
          /* Direct Video Player, Images & Poll Rendering */
          <>
            {/* Campus Poll */}
            {post.poll_options && post.poll_options.length > 0 && (
              <PollCard
                options={post.poll_options}
                counts={post.poll_counts}
                userVote={post.user_vote}
                onVote={(optionIndex) => handleVotePoll(post.id, optionIndex)}
              />
            )}

            {effectiveVideoUrl || extractYouTubeId(effectiveContent || '') ? (
              <VideoPlayer
                url={effectiveVideoUrl}
                content={effectiveContent}
                isVisibleInViewport={visiblePostId === post.id}
                onDoubleTap={() => {
                  setActiveShortsPostId(post.id);
                  setShortsModalVisible(true);
                }}
              />
            ) : null}

            {effectiveImgUrl ? (
              <AutoHeightImage uri={effectiveImgUrl} />
            ) : null}
            {effectiveImgUrls.length > 0 && !effectiveImgUrl ? (
              effectiveImgUrls.map((imgUri, idx) => (
                <AutoHeightImage key={idx} uri={imgUri} />
              ))
            ) : null}
          </>
        )}

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <Heart
              size={20}
              color={post.user_has_liked ? colors.danger : colors.textSecondary}
              fill={post.user_has_liked ? colors.danger : 'none'}
            />
            <Text style={[styles.actionCount, post.user_has_liked && styles.likedCount]}>
              {post.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCommentsModal(post.id)}
          >
            <MessageCircle size={20} color={colors.textSecondary} />
            <Text style={styles.actionCount}>{post.comments_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleRepost(post.id)}>
            <Repeat2 size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(post)}>
            <Share2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Render In-Feed Podcast Card ───────────────────────────────────────────
  const renderPodcastCard = (ep: FeedEpisode) => {
    const isPlayingThis =
      playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

    return (
      <View key={`pod_${ep.id}`} style={styles.feedPodcastCard}>
        {/* Podcast Badge Header */}
        <View style={styles.feedPodcastHeader}>
          <View style={styles.podcastTagPill}>
            <Mic2 size={12} color="#000000" />
            <Text style={styles.podcastTagText}>PODCAST EPISODE</Text>
          </View>
          <Text style={styles.feedPodcastDuration}>
            {Math.max(1, Math.round(ep.duration_seconds / 60))} min
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.feedPodcastBody}
          onPress={() => handleToggleFeedPodcast(ep)}
        >
          {/* Cover Art with Play Overlay */}
          <View style={styles.feedPodcastCoverWrap}>
            {ep.cover_url || ep.podcast?.cover_url ? (
              <Image
                source={{ uri: ep.cover_url || ep.podcast?.cover_url || '' }}
                style={styles.feedPodcastCover}
              />
            ) : (
              <View style={styles.feedPodcastPlaceholder}>
                <Mic2 size={26} color={colors.sunYellowDark} />
              </View>
            )}
            <View style={[styles.feedPlayOverlay, isPlayingThis && styles.feedPlayOverlayActive]}>
              {isPlayingThis ? (
                <Pause size={18} color="#ffffff" fill="#ffffff" />
              ) : (
                <Play size={18} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} />
              )}
            </View>
          </View>

          {/* Episode Info */}
          <View style={styles.feedPodcastMeta}>
            <Text style={styles.feedEpisodeTitle} numberOfLines={2}>
              {ep.title}
            </Text>
            <Text style={styles.feedPodcastCreator} numberOfLines={1}>
              by {ep.podcast?.creator?.name || ep.podcast?.title || 'Campus Creator'}
            </Text>
            {ep.description ? (
              <Text style={styles.feedEpisodeDesc} numberOfLines={2}>
                {ep.description}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.headerTitle}>UniLink</Text>
          <View style={styles.activeBadgeDot} />
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation?.navigate('Search')}
          >
            <Search color={colors.text} size={19} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation?.navigate('Messages')}
          >
            <MessageCircle color={colors.text} size={19} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Connecting to campus feed...</Text>
        </View>
      ) : (
        <FlatList
          data={interleavedFeedItems}
          keyExtractor={(item, index) =>
            item.type === 'post' ? item.data.id : `pod_${item.data.id}_${index}`
          }
          ListHeaderComponent={renderPodcastStories}
          renderItem={({ item }) =>
            item.type === 'post' ? renderPostCard(item.data) : renderPodcastCard(item.data)
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        />
      )}

      {/* ── Comments Modal with Delete Ability ───────────────────────── */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
              <TouchableOpacity
                onPress={() => setCommentsModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingComments ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: 40 }}
              />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                renderItem={({ item }) => {
                  const isCommentAuthor =
                    item.author.id === userId || (item as any).author_id === userId;

                  return (
                    <View style={styles.commentItem}>
                      {item.author.avatar_url ? (
                        <Image
                          source={{ uri: item.author.avatar_url }}
                          style={styles.commentAvatar}
                        />
                      ) : (
                        <View style={styles.commentAvatarPlaceholder}>
                          <Text style={styles.commentAvatarInitials}>
                            {(item.author.name || item.author.username || 'C')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.commentContentBox}>
                        <View style={styles.commentHeaderRow}>
                          <Text style={styles.commentAuthorName}>
                            {item.author.name || item.author.username || 'Student'}
                          </Text>
                          {isCommentAuthor && (
                            <TouchableOpacity
                              style={styles.deleteCommentBtn}
                              onPress={() => handleDeleteComment(item.id)}
                            >
                              <Trash2 size={13} color={colors.danger} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {item.content ? (
                          <Text style={styles.commentText}>{item.content}</Text>
                        ) : null}

                        <Text style={styles.commentTime}>
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}

            {/* Comment Input Bar */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                style={[
                  styles.sendCommentBtn,
                  submittingComment && styles.sendBtnDisabled,
                ]}
                onPress={handleAddComment}
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Send size={16} color={colors.background} />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Fullscreen Shorts Viewer */}
      <ShortsViewerModal
        visible={shortsModalVisible}
        initialPostId={activeShortsPostId}
        posts={posts}
        userId={userId}
        onClose={() => setShortsModalVisible(false)}
        onLikeToggle={handleLike}
        onOpenComments={openCommentsModal}
      />

      {/* Moderation / Report Offence Modal */}
      {reportingUser && (
        <ReportModal
          visible={!!reportingUser}
          targetUserId={reportingUser.id}
          targetUserName={reportingUser.name}
          targetPostId={reportingUser.postId}
          onClose={() => setReportingUser(null)}
        />
      )}
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  activeBadgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.sunYellow,
    borderWidth: 1.5,
    borderColor: '#000000',
    marginLeft: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  commBtnTint: {
    backgroundColor: colors.coralLight,
    borderColor: colors.coral,
  },
  podcastBtnTint: {
    backgroundColor: colors.sunYellowLight,
    borderColor: colors.sunYellow,
  },
  msgBtnTint: {
    backgroundColor: colors.lilacLight,
    borderColor: colors.lilac,
  },
  uniTagBadge: {
    backgroundColor: colors.lilacLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  uniTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.lilacDark,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  podcastStoriesContainer: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storiesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  storiesHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  seeAllPodcastsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  podcastList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyBubbleItem: {
    alignItems: 'center',
    width: 72,
  },
  storyAvatarBorder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  storyAvatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  storyTitleText: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },

  // Empty Podcast Banner
  emptyPodcastBanner: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#064E3B',
  },
  emptyPodcastIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPodcastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyPodcastSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 1,
  },
  emptyPodcastActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },

  // First Post Starter Card Styles
  starterCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
  },
  starterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  starterTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  starterSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  starterChipsScroll: {
    flexDirection: 'row',
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    gap: 6,
  },
  starterChipEmoji: {
    fontSize: 14,
  },
  starterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  postCard: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  authorTouchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moreBtn: {
    padding: 6,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  authorMeta: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  origTimestampText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  authorUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  postContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  likedCount: {
    color: colors.danger,
    fontWeight: '700',
  },

  // In-Feed Podcast Card
  feedPodcastCard: {
    backgroundColor: '#FFFBEB', // Light warm sunshine
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.sunYellow,
  },
  feedPodcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  podcastTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sunYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  podcastTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  feedPodcastDuration: {
    fontSize: 11,
    color: colors.sunYellowDark,
    fontWeight: '700',
  },
  feedPodcastBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedPodcastCoverWrap: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedPodcastCover: {
    width: 60,
    height: 60,
  },
  feedPodcastPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.sunYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedPlayOverlayActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  feedPodcastMeta: {
    flex: 1,
    marginLeft: 12,
  },
  feedEpisodeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 18,
  },
  feedPodcastCreator: {
    fontSize: 12,
    color: colors.sunYellowDark,
    fontWeight: '600',
    marginTop: 2,
  },
  feedEpisodeDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
    lineHeight: 15,
  },

  // Comments Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarInitials: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  commentContentBox: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: colors.surfaceElevated,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  deleteCommentBtn: {
    padding: 2,
  },
  commentText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },

  // Repost / Reshared Card Styles
  repostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  repostBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPostCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    paddingBottom: 6,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  origAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  origAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  origUsername: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  origContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});
