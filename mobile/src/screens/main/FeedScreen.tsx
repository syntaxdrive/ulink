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
import { WebView } from 'react-native-webview';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Bookmark,
  CheckCircle2,
  X,
  Mic2,
  MoreVertical,
  Play,
  Pause,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Film,
  Volume2,
  VolumeX,
  Radio,
  Headphones,
  Compass,
  ArrowRight,
  Trash2,
  Edit3,
  Flag,
  User,
  Ban,
  Pin,
  Quote,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/colors';
import { FeedService, FeedPost, CommentItem } from '../../services/feedService';
import { RssFeedService } from '../../services/rssFeedService';
import { ShortsViewerModal } from '../../components/ShortsViewerModal';
import { ReportModal } from '../../components/ReportModal';
import { SharePostModal } from '../../components/SharePostModal';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { extractYouTubeId, isDirectVideoUrl } from '../../utils/videoUtils';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { audioService, PlaybackState } from '../../services/audioService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WebViewComponent = WebView as any;

// Dimensions:
// Portrait videos (Shorts / Reels) = Almost 9:16 (~9:15 ratio)
const PORTRAIT_VIDEO_HEIGHT = SCREEN_WIDTH * 1.5;
// Landscape widescreen videos = Natural 16:9 ratio
const LANDSCAPE_VIDEO_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);
// Portrait standard images = 4:5 ratio
const IMAGE_PORTRAIT_HEIGHT = SCREEN_WIDTH * 1.25;

interface PodcastStoryBubble {
  id: string;
  title: string;
  creatorName: string;
  coverUrl: string;
  isHost?: boolean;
  ringColor?: string;
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
  if (!dateStr) return 'just now';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  } catch {
    return 'just now';
  }
}

// ── FAST INLINE AUTOPLAY FEED VIDEO COMPONENT (WITH INSTANT COVER IMAGE) ──
interface InlineFeedVideoProps {
  videoUrl: string;
  content?: string | null;
  posterUrl?: string | null;
  isVisible: boolean;
  onOpenFullscreen: () => void;
}

const InlineFeedVideo: React.FC<InlineFeedVideoProps> = ({
  videoUrl,
  content,
  posterUrl,
  isVisible,
  onOpenFullscreen,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const webViewRef = useRef<any>(null);

  const isDirect = isDirectVideoUrl(videoUrl);
  const youtubeId = isDirect ? null : (extractYouTubeId(videoUrl) || extractYouTubeId(content || ''));
  const isYoutubeShorts = (videoUrl || '').includes('/shorts/') || (content || '').includes('/shorts/');

  // Effective cover image thumbnail
  const effectiveCover =
    posterUrl ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

  // Initial guess: if it's YouTube standard (not shorts) -> landscape (16:9), otherwise portrait (~9:16)
  const [isLandscape, setIsLandscape] = useState<boolean>(!!youtubeId && !isYoutubeShorts);
  const [customHeight, setCustomHeight] = useState<number>(
    youtubeId && !isYoutubeShorts ? LANDSCAPE_VIDEO_HEIGHT : PORTRAIT_VIDEO_HEIGHT
  );

  // Auto-play on scroll into view & auto-pause when scrolled away
  useEffect(() => {
    if (isVisible) {
      if (youtubeId) {
        webViewRef.current?.injectJavaScript?.(
          `try { var iframes = document.getElementsByTagName('iframe'); for(var i=0; i<iframes.length; i++) iframes[i].contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*'); } catch(e){} true;`
        );
      } else {
        webViewRef.current?.injectJavaScript?.(
          `try { var v = document.getElementById('feedVideo'); if(v) { v.play().catch(function(){}); } } catch(e){} true;`
        );
      }
    } else {
      if (youtubeId) {
        webViewRef.current?.injectJavaScript?.(
          `try { var iframes = document.getElementsByTagName('iframe'); for(var i=0; i<iframes.length; i++) iframes[i].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch(e){} true;`
        );
      } else {
        webViewRef.current?.injectJavaScript?.(
          `try { var v = document.getElementById('feedVideo'); if(v) { v.pause(); v.currentTime = 0; } } catch(e){} true;`
        );
      }
    }
  }, [isVisible, youtubeId]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (youtubeId) {
      const func = nextMuted ? 'mute' : 'unMute';
      webViewRef.current?.injectJavaScript?.(
        `try { var iframes = document.getElementsByTagName('iframe'); for(var i=0; i<iframes.length; i++) iframes[i].contentWindow.postMessage('{"event":"command","func":"${func}","args":""}', '*'); } catch(e){} true;`
      );
    } else {
      webViewRef.current?.injectJavaScript?.(
        `try { var v = document.getElementById('feedVideo'); if(v) { v.muted = ${nextMuted}; } } catch(e){} true;`
      );
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'video_dimensions' && data.width > 0 && data.height > 0) {
        const isVideoWide = data.width > data.height;
        setIsLandscape(isVideoWide);
        if (isVideoWide) {
          const calculated = Math.min(LANDSCAPE_VIDEO_HEIGHT, Math.round(SCREEN_WIDTH / (data.width / data.height)));
          setCustomHeight(calculated);
        } else {
          setCustomHeight(PORTRAIT_VIDEO_HEIGHT);
        }
      } else if (data.type === 'video_ready') {
        setIsLoaded(true);
      }
    } catch {}
  };

  // If YouTube is detected, show a clean, high-res preview card with Play button instead of broken iframes
  if (youtubeId) {
    return (
      <TouchableOpacity
        style={[styles.inlineVideoContainer, { height: customHeight }]}
        activeOpacity={0.9}
        onPress={onOpenFullscreen}
      >
        {effectiveCover ? (
          <Image
            source={{ uri: effectiveCover }}
            style={[StyleSheet.absoluteFill, { width: SCREEN_WIDTH, height: customHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#18181B' }]} />
        )}

        <View style={styles.youtubeOverlayBackdrop}>
          <View style={styles.youtubePlayIconCircle}>
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
          </View>
          <Text style={styles.youtubeWatchPrompt}>Watch Video</Text>
        </View>

        {!isLandscape && (
          <View style={styles.reelsBadgePill} pointerEvents="none">
            <Film size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.reelsBadgeText}>Reels</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
          body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          video { width: 100%; height: 100%; object-fit: ${isLandscape ? 'contain' : 'cover'}; }
        </style>
      </head>
      <body>
        <video
          id="feedVideo"
          src="${videoUrl}"
          poster="${effectiveCover || ''}"
          playsinline
          webkit-playsinline
          loop
          preload="auto"
        ></video>
        <script>
          var v = document.getElementById('feedVideo');
          var isInitiallyVisible = ${isVisible ? 'true' : 'false'};
          var hasStarted = false;
          function markReady() {
            if (!hasStarted) {
              hasStarted = true;
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_ready' }));
              }
              if (isInitiallyVisible) {
                v.play().catch(function(){});
              } else {
                v.pause();
              }
            }
          }
          function notifyDims() {
            if (v.videoWidth && v.videoHeight && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'video_dimensions',
                width: v.videoWidth,
                height: v.videoHeight
              }));
            }
          }
          v.addEventListener('loadedmetadata', function() {
            notifyDims();
            markReady();
          });
          v.addEventListener('canplay', markReady);
          v.addEventListener('loadeddata', markReady);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.inlineVideoContainer, { height: customHeight }]}>
      {/* ── 1. Instant Cover Image (0ms perceptual load) ───────────── */}
      {effectiveCover ? (
        <Image
          source={{ uri: effectiveCover }}
          style={[StyleSheet.absoluteFill, { width: SCREEN_WIDTH, height: customHeight }]}
          resizeMode={isLandscape ? 'contain' : 'cover'}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
      )}

      {/* ── 2. Fullscreen / Inline Web Video Player ─────────────────── */}
      <WebViewComponent
        ref={webViewRef}
        style={[
          styles.inlineVideoWebView,
          { height: customHeight, opacity: isLoaded ? 1 : 0.01 },
        ]}
        source={{ html: embedHtml }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        mixedContentMode="always"
        onMessage={handleMessage}
      />

      {/* Buffering Indicator over cover image if loading takes a moment */}
      {!isLoaded && isVisible && (
        <View style={styles.inlineBufferingBox} pointerEvents="none">
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}

      {/* Tap Overlay to open Fullscreen */}
      <TouchableOpacity
        style={styles.inlineVideoTouchOverlay}
        activeOpacity={1}
        onPress={onOpenFullscreen}
      />

      {/* Reels Badge (shown for portrait reels) */}
      {!isLandscape && (
        <View style={styles.reelsBadgePill} pointerEvents="none">
          <Film size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.reelsBadgeText}>Reels</Text>
        </View>
      )}

      {/* Sound Mute / Unmute Button */}
      <TouchableOpacity
        style={styles.soundButtonBadge}
        activeOpacity={0.8}
        onPress={toggleMute}
      >
        {isMuted ? (
          <VolumeX size={14} color="#FFFFFF" />
        ) : (
          <Volume2 size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Relatable student mock posts featuring genuine campus experiences
const MOCK_FALLBACK_POSTS: FeedPost[] = [
  {
    id: 'mock_video_reel_1',
    content: 'first day back in lecture halls and the heat already humbled everyone 😭 8am class is not for the weak',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    likes_count: 531,
    comments_count: 47,
    created_at: new Date().toISOString(),
    author: {
      id: 'a1000000-0000-0000-0000-000000000003',
      name: 'Tobi Bakare',
      username: 'tobi_baks',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      is_verified: true,
      university: 'UNILAG',
      headline: 'Computer Science · Year 3',
    },
  },
  {
    id: 'curated_short_1',
    content: 'if you are currently taking calculus or engineering maths, do not cram formulas. understand the rate of change intuition first. saved my entire semester 🙏',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    likes_count: 342,
    comments_count: 38,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    user_has_liked: true,
    author: {
      id: 'a1000000-0000-0000-0000-000000000001',
      name: 'Amaka Johnson',
      username: 'amaka_j',
      avatar_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80',
      is_verified: true,
      university: 'University of Ibadan',
      headline: 'Economics · UI',
    },
  },
  {
    id: 'curated_short_2',
    content: 'please stop deleting and re-cloning your git repo whenever there is a merge conflict 😂 accept incoming changes or keep both, that is literally all',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    likes_count: 218,
    comments_count: 29,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    author: {
      id: 'a1000000-0000-0000-0000-000000000002',
      name: 'Chidi Okeke',
      username: 'chidi.codes',
      avatar_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=200&q=80',
      is_verified: true,
      university: 'UNN',
      headline: 'Software Engineering',
    },
  },
  {
    id: 'curated_short_3',
    content: 'hostel cooking during exam season is just pure survival mode 😂 noodles plus egg holding down the entire semester fr',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    likes_count: 412,
    comments_count: 53,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: {
      id: 'a1000000-0000-0000-0000-000000000003',
      name: 'Favour Adeyemi',
      username: 'favour_ade',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      is_verified: true,
      university: 'OAU Ife',
      headline: 'Law · 300L',
    },
  },
  {
    id: 'curated_short_4',
    content: 'interview tip: when they ask "tell me about yourself", do not recite your entire CV line by line. focus on what you are doing now, why this role fits, and where you want to grow. keep it simple and confident.',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    likes_count: 189,
    comments_count: 24,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: {
      id: 'a1000000-0000-0000-0000-000000000004',
      name: 'Kenechukwu',
      username: 'kene_unilag',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      is_verified: true,
      university: 'UNILAG',
      headline: 'Finance & Accounting',
    },
  },
];

// Top Campus Podcasts Stories (with vibrant rings & microphone badges)
const TOP_PODCAST_STORIES: PodcastStoryBubble[] = [
  {
    id: 'host_podcast',
    title: 'Host Show',
    creatorName: 'You',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isHost: true,
    ringColor: '#9CA3AF',
  },
  {
    id: 'pod_healthy_life',
    title: 'Healthy Life',
    creatorName: 'Dr. Tolu',
    coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80',
    ringColor: '#10B981',
  },
  {
    id: 'pod_comedy_lessons',
    title: 'Comedy Lessons',
    creatorName: 'Thomas Larson',
    coverUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=300&q=80',
    ringColor: '#F59E0B',
  },
  {
    id: 'pod_tech_talk',
    title: 'UI Tech Talks',
    creatorName: 'Dev Club',
    coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80',
    ringColor: '#3B82F6',
  },
  {
    id: 'pod_campus_banter',
    title: 'Campus Banter',
    creatorName: 'Olamide',
    coverUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    ringColor: '#EC4899',
  },
  {
    id: 'pod_money_wealth',
    title: 'Student Hustle',
    creatorName: 'Kene & Favour',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    ringColor: '#8B5CF6',
  },
];

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastStoryBubble[]>(TOP_PODCAST_STORIES);
  const [podcastEpisodes, setPodcastEpisodes] = useState<FeedEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const authUserId = useAuthStore((s) => s.userId);
  const [userId, setUserId] = useState<string | null>(authUserId || null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  // Repost & Quote Modal State
  const [repostMenuVisible, setRepostMenuVisible] = useState(false);
  const [repostTargetPost, setRepostTargetPost] = useState<FeedPost | null>(null);
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [quoteComment, setQuoteComment] = useState('');
  const [reposting, setReposting] = useState(false);

  // Visible Post ID for Autoplay Tracking
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);

  // Audio Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  // Comments modal state
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<CommentItem | null>(null);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const commentInputRef = useRef<TextInput>(null);

  // Post Action Sheet & Management State
  const [postActionSheetVisible, setPostActionSheetVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  // Edit Post Modal State
  const [editPostModalVisible, setEditPostModalVisible] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [savingPostEdit, setSavingPostEdit] = useState(false);

  // Report Modal State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportedPostId, setReportedPostId] = useState<string | null>(null);

  // Shorts fullscreen modal state
  const [shortsModalVisible, setShortsModalVisible] = useState(false);
  const [activeShortsPostId, setActiveShortsPostId] = useState<string | null>(null);

  // Share Post to DMs / Friends Modal
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareTargetPost, setShareTargetPost] = useState<FeedPost | null>(null);

  const podcastPausedByFeedVideoRef = useRef<boolean>(false);
  const podcastPausedByShortsRef = useRef<boolean>(false);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const topVisible = viewableItems[0]?.item;
      if (topVisible && topVisible.type === 'post') {
        const postData = topVisible.data;
        setVisiblePostId(postData.id);

        const isVideo = Boolean(
          postData.video_url ||
          postData.original_post?.video_url ||
          (postData.content && extractYouTubeId(postData.content))
        );

        if (isVideo) {
          const audioState = audioService.getState();
          if (audioState.isPlaying) {
            podcastPausedByFeedVideoRef.current = true;
            audioService.pause();
          }
        } else {
          if (podcastPausedByFeedVideoRef.current) {
            podcastPausedByFeedVideoRef.current = false;
            audioService.resume();
          }
        }
      } else {
        if (podcastPausedByFeedVideoRef.current) {
          podcastPausedByFeedVideoRef.current = false;
          audioService.resume();
        }
      }
    }
  }).current;

  const handleOpenShorts = (postId: string) => {
    const audioState = audioService.getState();
    if (audioState.isPlaying) {
      podcastPausedByShortsRef.current = true;
      audioService.pause();
    }
    setActiveShortsPostId(postId);
    setShortsModalVisible(true);
  };

  const handleCloseShorts = () => {
    setShortsModalVisible(false);
    setActiveShortsPostId(null);
    if (podcastPausedByShortsRef.current) {
      podcastPausedByShortsRef.current = false;
      audioService.resume();
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id || useAuthStore.getState().userId;
      if (uid) {
        setUserId(uid);
        const bookmarked = await FeedService.getSavedPostIds(uid);
        setSavedPosts(bookmarked);
      }
    });
  }, []);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    try {
      const [feedPosts, dbPodcasts, episodesRes] = await Promise.allSettled([
        FeedService.getFeed(userId, 100, isRefresh),
        supabase
          .from('podcasts')
          .select('id, title, cover_url, creator:profiles!creator_id(name, username, avatar_url)')
          .limit(8),
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
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      let loadedPosts: FeedPost[] = [];
      if (feedPosts.status === 'fulfilled' && feedPosts.value && feedPosts.value.length > 0) {
        loadedPosts = [...feedPosts.value];
      } else {
        loadedPosts = [...MOCK_FALLBACK_POSTS];
      }

      // Fetch fresh live open RSS / Hub articles in background if feed has few items
      try {
        const liveRss = await RssFeedService.fetchLiveHubPosts();
        if (liveRss.length > 0) {
          loadedPosts = [...loadedPosts, ...liveRss];
        }
      } catch (rssErr) {
        console.warn('Live RSS blending skipped:', rssErr);
      }

      // Strict Deduplication by ID & Normalized Content/Caption
      const seenIds = new Set<string>();
      const seenContent = new Set<string>();
      const cleanPosts: FeedPost[] = [];

      for (const p of loadedPosts) {
        if (!p || !p.id) continue;
        const norm = (p.content || '').trim().toLowerCase().slice(0, 60);
        if (seenIds.has(p.id)) continue;
        if (norm && seenContent.has(norm)) continue;

        seenIds.add(p.id);
        if (norm) seenContent.add(norm);
        cleanPosts.push(p);
      }

      setPosts(cleanPosts);
      if (cleanPosts.length > 0 && !visiblePostId) {
        setVisiblePostId(cleanPosts[0].id);
      }

      // Populate Podcast Stories Strip
      if (dbPodcasts.status === 'fulfilled' && dbPodcasts.value?.data && dbPodcasts.value.data.length > 0) {
        const ringColors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];
        const mapped: PodcastStoryBubble[] = [
          TOP_PODCAST_STORIES[0], // Host podcast button
          ...(dbPodcasts.value.data as any[]).map((p, idx) => ({
            id: p.id,
            title: p.title || 'Podcast',
            creatorName: p.creator?.name || p.creator?.username || 'Creator',
            coverUrl: p.cover_url || TOP_PODCAST_STORIES[(idx % (TOP_PODCAST_STORIES.length - 1)) + 1].coverUrl,
            ringColor: ringColors[idx % ringColors.length],
          })),
        ];
        setPodcasts(mapped);
      } else {
        setPodcasts(TOP_PODCAST_STORIES);
      }

      if (episodesRes.status === 'fulfilled' && episodesRes.value?.data) {
        setPodcastEpisodes((episodesRes.value.data as any[]) || []);
      }
    } catch (error) {
      console.warn('Error fetching feed data, using fallback:', error);
      setPosts(MOCK_FALLBACK_POSTS);
      setPodcasts(TOP_PODCAST_STORIES);
      setVisiblePostId(MOCK_FALLBACK_POSTS[0].id);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, visiblePostId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const unsubAudio = audioService.subscribe(setPlaybackState);
    return () => {
      unsubAudio();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed(true);
  };

  const handleLike = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLiked = !!targetPost.user_has_liked;
    const newLiked = !currentLiked;
    const newLikesCount = Math.max(0, targetPost.likes_count + (newLiked ? 1 : -1));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, user_has_liked: newLiked, likes_count: newLikesCount }
          : p
      )
    );

    if (userId) {
      FeedService.toggleLike(postId, userId, currentLiked).catch(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, user_has_liked: currentLiked, likes_count: targetPost.likes_count }
              : p
          )
        );
      });
    }
  };

  const toggleSavePost = async (postOrId: string | FeedPost) => {
    const postId = typeof postOrId === 'string' ? postOrId : postOrId?.id;
    if (!postId) return;
    const currentUid = userId || useAuthStore.getState().userId;
    const isCurrentlySaved = savedPosts.has(postId);

    // Optimistic UI toggle
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(postId);
      else next.add(postId);
      return next;
    });

    const fullPost = typeof postOrId === 'object' ? postOrId : posts.find((p) => p.id === postId);

    if (currentUid) {
      try {
        await FeedService.toggleBookmark(fullPost || postId, currentUid, isCurrentlySaved);
      } catch (err) {
        console.warn('Error toggling bookmark:', err);
      }
    }
  };

  const handleOpenRepostMenu = (post: FeedPost) => {
    setRepostTargetPost(post);
    setRepostMenuVisible(true);
  };

  const handleInstantRepost = async () => {
    if (!repostTargetPost) return;
    const currentUid = userId || useAuthStore.getState().userId;
    if (!currentUid) {
      setRepostMenuVisible(false);
      Alert.alert('Sign In Required', 'Please sign in to repost to your campus feed.');
      return;
    }

    setRepostMenuVisible(false);
    const target = repostTargetPost;
    const success = await FeedService.repost(target.id, currentUid);
    if (success) {
      Alert.alert('Reposted 🎉', 'Post shared to your campus feed!');
      fetchFeed();
    } else {
      Alert.alert('Notice', 'Could not complete repost. Please try again.');
    }
  };

  const handleOpenQuoteModal = () => {
    setRepostMenuVisible(false);
    setQuoteComment('');
    setQuoteModalVisible(true);
  };

  const handleSubmitQuoteRepost = async () => {
    if (!repostTargetPost) return;
    const currentUid = userId || useAuthStore.getState().userId;
    if (!currentUid) {
      setQuoteModalVisible(false);
      Alert.alert('Sign In Required', 'Please sign in to repost.');
      return;
    }

    setReposting(true);
    try {
      const success = await FeedService.repost(repostTargetPost.id, currentUid, quoteComment);
      if (success) {
        setQuoteModalVisible(false);
        setQuoteComment('');
        Alert.alert('Quote Repost Live 🎉', 'Your quoted post is now on the campus feed!');
        fetchFeed();
      } else {
        Alert.alert('Error', 'Could not post quote repost.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not post quote repost.');
    } finally {
      setReposting(false);
    }
  };

  const handleShare = (post: FeedPost) => {
    setShareTargetPost(post);
    setShareModalVisible(true);
  };

  const openCommentsModal = async (postId: string) => {
    setActivePostId(postId);
    setCommentsModalVisible(true);
    setLoadingComments(true);
    setReplyingToComment(null);
    try {
      const currentUid = userId || useAuthStore.getState().userId;
      const fetched = await FeedService.getComments(postId, currentUid);
      setComments(fetched);
      setLikedCommentIds(new Set(fetched.filter((c) => c.user_has_liked).map((c) => c.id)));
    } catch {
      setComments([]);
      setLikedCommentIds(new Set());
    } finally {
      setLoadingComments(false);
    }
  };

  const handleStartReply = (comment: CommentItem) => {
    setReplyingToComment(comment);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  const handleToggleLikeComment = async (comment: CommentItem) => {
    const currentUid = userId || useAuthStore.getState().userId;
    if (!currentUid) return;

    const isCurrentlyLiked = likedCommentIds.has(comment.id);
    const newLiked = !isCurrentlyLiked;

    // Optimistic UI update
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(comment.id);
      else next.add(comment.id);
      return next;
    });

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === comment.id) {
          const currentCount = c.likes_count || 0;
          return {
            ...c,
            likes_count: newLiked ? currentCount + 1 : Math.max(0, currentCount - 1),
            user_has_liked: newLiked,
          };
        }
        return c;
      })
    );

    try {
      await FeedService.toggleLikeComment(comment.id, currentUid, isCurrentlyLiked);
    } catch (e) {
      console.warn('Error liking comment:', e);
    }
  };

  const handleAddComment = async () => {
    const currentUid = userId || useAuthStore.getState().userId;
    if (!activePostId || !newComment.trim() || !currentUid) return;
    const content = newComment.trim();
    const parentId = replyingToComment?.id || null;
    const replyToUsername = replyingToComment?.author?.username || replyingToComment?.author?.name || null;

    setNewComment('');
    setReplyingToComment(null);
    setSubmittingComment(true);

    try {
      const added = await FeedService.addComment(activePostId, currentUid, content, parentId, replyToUsername);
      if (added) {
        setComments((prev) => [...prev, added]);
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

  // ── Post Three-Dot Menu & Management Handlers ────────────────────────────
  const handleOpenPostActionSheet = (post: FeedPost) => {
    setSelectedPost(post);
    setPostActionSheetVisible(true);
  };

  const handleOpenEditPost = () => {
    if (!selectedPost) return;
    setPostActionSheetVisible(false);
    setEditPostContent(selectedPost.content || '');
    setEditPostModalVisible(true);
  };

  const handleSavePostEdit = async () => {
    if (!selectedPost || !editPostContent.trim()) return;
    try {
      setSavingPostEdit(true);
      if (!selectedPost.id.startsWith('mock_')) {
        await supabase
          .from('posts')
          .update({ content: editPostContent.trim() })
          .eq('id', selectedPost.id);
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, content: editPostContent.trim() } : p
        )
      );
      setEditPostModalVisible(false);
      Alert.alert('Updated ✏️', 'Your post has been updated.');
    } catch {
      Alert.alert('Error', 'Could not update post.');
    } finally {
      setSavingPostEdit(false);
    }
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    setPostActionSheetVisible(false);
    Alert.alert('Delete Post?', 'Are you sure you want to permanently delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!selectedPost.id.startsWith('mock_')) {
              await supabase.from('posts').delete().eq('id', selectedPost.id);
            }
            setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
            Alert.alert('Deleted 🗑️', 'Your post has been deleted.');
          } catch {
            Alert.alert('Error', 'Could not delete post.');
          }
        },
      },
    ]);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('comments').delete().eq('id', commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            if (activePostId) {
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === activePostId
                    ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
                    : p
                )
              );
            }
          } catch {}
        },
      },
    ]);
  };

  // Build Interleaved Items
  const feedItems: FeedItem[] = [];
  posts.forEach((p, idx) => {
    feedItems.push({ type: 'post', data: p });
    if ((idx + 1) % 3 === 0 && podcastEpisodes[Math.floor(idx / 3)]) {
      feedItems.push({ type: 'podcast', data: podcastEpisodes[Math.floor(idx / 3)] });
    }
  });

  // ── Render Top Podcast Stories Strip (with Explore More Button) ───────────
  const renderPodcastStoriesHeader = () => (
    <View style={styles.storiesContainer}>
      {/* Podcast Section Title & Explore More Button Row */}
      <View style={styles.podcastSectionHeader}>
        <View style={styles.podcastHeaderLeft}>
          <Radio size={14} color="#10B981" />
          <Text style={[styles.podcastSectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Campus Podcasts
          </Text>
        </View>

        <TouchableOpacity
          style={styles.exploreMoreBtn}
          onPress={() => navigation.navigate('Podcasts' as never)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.exploreMoreText}>Explore more</Text>
          <ArrowRight size={13} color="#3B82F6" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {podcasts.map((pod) => (
          <TouchableOpacity
            key={pod.id}
            style={styles.storyBubble}
            activeOpacity={0.8}
            onPress={() => {
              if (pod.isHost) {
                navigation.navigate('Podcasts' as never);
              } else {
                navigation.navigate('Podcast' as never, { podcastId: pod.id } as never);
              }
            }}
          >
            {/* Podcast Avatar Ring */}
            <View
              style={[
                styles.storyRing,
                { borderColor: pod.ringColor || '#10B981' },
                pod.isHost && styles.selfStoryRing,
              ]}
            >
              <Image source={{ uri: pod.coverUrl }} style={styles.storyImage} />

              {/* Host Plus Badge or Microphone Audio Badge */}
              {pod.isHost ? (
                <View style={styles.storyAddBadge}>
                  <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={[styles.podcastMicBadge, { backgroundColor: pod.ringColor || '#10B981' }]}>
                  <Mic2 size={9} color="#000000" strokeWidth={2.5} />
                </View>
              )}
            </View>

            <Text
              style={[styles.storyNameText, { color: isDark ? '#FFFFFF' : '#000000' }]}
              numberOfLines={1}
            >
              {pod.title}
            </Text>
          </TouchableOpacity>
        ))}

        {/* ── End Carousel Item: Explore More Podcasts Card ─────────── */}
        <TouchableOpacity
          style={styles.storyBubble}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Podcasts' as never)}
        >
          <View style={[styles.storyRing, styles.exploreMoreCircle, { borderColor: isDark ? '#2E2E38' : '#E5E7EB' }]}>
            <Compass size={22} color="#3B82F6" />
          </View>
          <Text style={[styles.storyNameText, { color: '#3B82F6', fontWeight: '700' }]} numberOfLines={1}>
            Explore all
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ── Render Instagram-Style Post Card (with dynamic video dimensions) ──────
  const renderPost = (post: FeedPost) => {
    const isLiked = !!post.user_has_liked;
    const isSaved = savedPosts.has(post.id);
    const rawVideoSource = post.video_url || post.original_post?.video_url;
    const isVideoPost = !!rawVideoSource || !!extractYouTubeId(post.content || '');
    const mediaUrl = post.video_url || (post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : post.image_url);
    const isThisPostVisible = visiblePostId === post.id;
    const isQuoteRepost = post.is_repost && !!post.original_post;
    const isInstantRepost = post.is_repost && !post.repost_comment && !post.content && !!post.original_post;

    return (
      <View
        key={post.id}
        style={[
          styles.postCard,
          { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderBottomColor: isDark ? '#1C1C1E' : '#F3F4F6' },
        ]}
      >
        {/* Instant Repost Banner */}
        {post.is_repost && (
          <View style={styles.repostTopBanner}>
            <Repeat2 size={13} color="#10B981" />
            <Text style={[styles.repostTopBannerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {' '}{post.author?.name || 'Student'} reposted
            </Text>
          </View>
        )}

        {/* Post Header */}
        <View style={styles.postHeaderRow}>
          <TouchableOpacity
            style={styles.postAuthorTouchable}
            activeOpacity={0.8}
            onPress={() => {
              if (post.author?.id) {
                navigation.navigate('Profile' as never, { userId: post.author.id } as never);
              }
            }}
          >
            <View style={styles.postAuthorAvatarRing}>
              {post.author?.avatar_url ? (
                <Image source={{ uri: post.author.avatar_url }} style={styles.postAuthorAvatar} />
              ) : (
                <View style={[styles.postAuthorAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(post.author?.name || post.author?.username || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.postAuthorMeta}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorName, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                  {post.author?.name || post.author?.username || 'Campus Student'}
                </Text>
                {post.author?.is_verified && (
                  <VerifiedBadge size={14} />
                )}
              </View>
              {post.author?.headline ? (
                <Text style={[styles.authorHeadline, { color: isDark ? '#A1A1AA' : '#4B5563' }]} numberOfLines={1}>
                  {post.author.headline}
                </Text>
              ) : null}
              <Text style={[styles.authorSub, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
                {post.author?.university || `@${post.author?.username || 'student'}`} • {formatRelativeTime(post.created_at)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreIconBtn}
            onPress={() => handleOpenPostActionSheet(post)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={18} color={isDark ? '#8E8E93' : '#8E8E93'} />
          </TouchableOpacity>
        </View>

        {/* Post Text Content / Quote Commentary */}
        {post.content ? (
          <View style={styles.postTextContainer}>
            <Text style={[styles.postText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {post.content}
            </Text>
          </View>
        ) : null}

        {/* ── Quoted Post Embedded Card (for Quote Reposts) ── */}
        {isQuoteRepost && post.original_post && (
          <TouchableOpacity
            style={[
              styles.quotedPostCard,
              {
                backgroundColor: isDark ? '#141417' : '#F9FAFB',
                borderColor: isDark ? '#27272A' : '#E5E7EB',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (post.original_post?.author?.id) {
                navigation.navigate('Profile' as never, { userId: post.original_post.author.id } as never);
              }
            }}
          >
            <View style={styles.quotedAuthorRow}>
              {post.original_post.author?.avatar_url ? (
                <Image source={{ uri: post.original_post.author.avatar_url }} style={styles.quotedAvatar} />
              ) : (
                <View style={[styles.quotedAvatar, styles.avatarPlaceholder, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.avatarInitial}>
                    {(post.original_post.author?.name || post.original_post.author?.username || 'U')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.quotedAuthorName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                {post.original_post.author?.name || 'Student'}
              </Text>
              {post.original_post.author?.is_verified && <VerifiedBadge size={12} />}
              <Text style={[styles.quotedAuthorSub, { color: isDark ? '#71717A' : '#9CA3AF' }]} numberOfLines={1}>
                @{post.original_post.author?.username || 'student'}
              </Text>
            </View>
            {post.original_post.content ? (
              <Text style={[styles.quotedContentText, { color: isDark ? '#E4E4E7' : '#374151' }]} numberOfLines={3}>
                {post.original_post.content}
              </Text>
            ) : null}
            {(post.original_post.image_url || (post.original_post.image_urls && post.original_post.image_urls.length > 0)) ? (
              <Image
                source={{ uri: post.original_post.image_urls?.[0] || post.original_post.image_url || '' }}
                style={styles.quotedMediaThumbnail}
                resizeMode="cover"
              />
            ) : null}
          </TouchableOpacity>
        )}

        {/* ── Post Media: Autoplay Video (Landscape or Portrait ~9:16) ─── */}
        {!isQuoteRepost && isVideoPost ? (
          <InlineFeedVideo
            videoUrl={rawVideoSource || ''}
            content={post.content}
            posterUrl={post.image_url}
            isVisible={isThisPostVisible}
            onOpenFullscreen={() => handleOpenShorts(post.id)}
          />
        ) : !isQuoteRepost && mediaUrl ? (
          <TouchableOpacity activeOpacity={0.95} style={styles.imageMediaContainer}>
            <Image source={{ uri: mediaUrl }} style={styles.postPortraitImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : null}

        {/* ── Action Buttons Bar ───────────────────────────────────── */}
        <View style={styles.postActionsBar}>
          <View style={styles.leftActionsGroup}>
            {/* Like */}
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleLike(post.id)}
              activeOpacity={0.7}
            >
              <Heart
                size={24}
                color={isLiked ? '#EF4444' : (isDark ? '#FFFFFF' : '#000000')}
                fill={isLiked ? '#EF4444' : 'none'}
              />
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => openCommentsModal(post.id)}
              activeOpacity={0.7}
            >
              <MessageCircle size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>

            {/* Repost (Instant or Quote) */}
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleOpenRepostMenu(post)}
              activeOpacity={0.7}
            >
              <Repeat2
                size={24}
                color={post.is_repost ? '#10B981' : (isDark ? '#FFFFFF' : '#000000')}
              />
            </TouchableOpacity>

            {/* Direct Message / Share */}
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleShare(post)}
              activeOpacity={0.7}
            >
              <Send size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Bookmark / Save */}
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => toggleSavePost(post)}
            activeOpacity={0.7}
          >
            <Bookmark
              size={24}
              color={isSaved ? '#10B981' : (isDark ? '#FFFFFF' : '#000000')}
              fill={isSaved ? '#10B981' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Likes Count Row */}
        <View style={styles.likesCountRow}>
          <Text style={[styles.likesCountText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {post.likes_count > 0
              ? `${post.likes_count.toLocaleString()} likes`
              : 'Be the first to like this'}
          </Text>
        </View>

        {/* Comments Snippet */}
        {post.comments_count > 0 && (
          <TouchableOpacity
            style={styles.viewCommentsRow}
            onPress={() => openCommentsModal(post.id)}
          >
            <Text style={styles.viewCommentsText}>
              View all {post.comments_count} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Render In-Feed Podcast Card ───────────────────────────────────────────
  const renderPodcastEpisode = (ep: FeedEpisode) => {
    const isPlaying = playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

    return (
      <View
        key={`pod_${ep.id}`}
        style={[
          styles.podcastFeedCard,
          { backgroundColor: isDark ? '#14141A' : '#F9F9FB', borderColor: isDark ? '#242430' : '#E5E7EB' },
        ]}
      >
        <View style={styles.podCardHeader}>
          <View style={styles.podTagPill}>
            <Mic2 size={11} color="#000000" />
            <Text style={styles.podTagText}>CAMPUS PODCAST</Text>
          </View>
          <Text style={styles.podDurationText}>
            {Math.floor((ep.duration_seconds || 600) / 60)} min
          </Text>
        </View>

        <TouchableOpacity
          style={styles.podBodyRow}
          activeOpacity={0.88}
          onPress={() => {
            if (ep.audio_url) {
              if (isPlaying) {
                audioService.pause();
              } else {
                audioService.playTrack({
                  id: ep.id,
                  uri: ep.audio_url,
                  title: ep.title,
                  hostName: ep.podcast?.creator?.name || ep.podcast?.title || 'Campus Creator',
                  coverUrl: ep.cover_url || ep.podcast?.cover_url || undefined,
                  podcastId: ep.podcast?.id,
                  durationSeconds: ep.duration_seconds,
                });
              }
            }
          }}
        >
          <Image
            source={{ uri: ep.cover_url || ep.podcast?.cover_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }}
            style={styles.podCoverImage}
          />

          <View style={styles.podMetaCol}>
            <Text style={[styles.podTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
              {ep.title}
            </Text>
            <Text style={styles.podCreatorText} numberOfLines={1}>
              {ep.podcast?.title || 'UniLink Audio'}
            </Text>
          </View>

          <View style={[styles.podPlayCircle, isPlaying && styles.podPlayCircleActive]}>
            {isPlaying ? (
              <Pause size={16} color="#000000" fill="#000000" />
            ) : (
              <Play size={16} color="#000000" fill="#000000" style={{ marginLeft: 2 }} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <View style={[styles.topHeader, { borderBottomColor: isDark ? '#1C1C1E' : '#F3F4F6' }]}>
        <TouchableOpacity style={styles.logoRow} activeOpacity={0.8}>
          <Text style={[styles.logoText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            UniLink
          </Text>
          <ChevronDown size={18} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View style={styles.topHeaderIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Search size={22} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Bell size={22} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Messages' as never)}
          >
            <Send size={22} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerLoadingBox}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item, index) =>
            item.type === 'post' ? item.data.id : `pod_${item.data.id}_${index}`
          }
          ListHeaderComponent={renderPodcastStoriesHeader}
          renderItem={({ item }) =>
            item.type === 'post' ? renderPost(item.data) : renderPodcastEpisode(item.data)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
        />
      )}

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#1F1F23' : '#E5E7EB' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={() => setCommentsModalVisible(false)}>
              <X size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          {loadingComments ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              renderItem={({ item }) => {
                const currentUid = userId || useAuthStore.getState().userId;
                const isMyComment = (item.author as any)?.id === currentUid || (item as any)?.author_id === currentUid;
                const isLiked = likedCommentIds.has(item.id) || !!item.user_has_liked;
                const isReply = Boolean(item.parent_id);

                return (
                  <View
                    style={[
                      styles.commentRow,
                      isReply && {
                        marginLeft: 28,
                        borderLeftWidth: 2,
                        borderLeftColor: isDark ? '#27272A' : '#E5E7EB',
                        paddingLeft: 10,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri:
                          item.author.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                      }}
                      style={[styles.commentAvatar, isReply && { width: 28, height: 28, borderRadius: 14 }]}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={[styles.commentAuthor, { color: isDark ? '#FFFFFF' : '#000000', fontWeight: '700' }]}>
                          {item.author.name || item.author.username || 'Student'}
                        </Text>
                        {item.author.is_verified && (
                          <VerifiedBadge size={12} isGold={false} />
                        )}
                        {item.reply_to_username && (
                          <Text style={{ fontSize: 12, color: '#3B82F6', marginLeft: 4, fontWeight: '600' }}>
                            @{item.reply_to_username}
                          </Text>
                        )}
                      </View>

                      <Text style={[styles.commentBody, { color: isDark ? '#E4E4E7' : '#1F2937', marginTop: 3 }]}>
                        {item.content}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 16 }}>
                        <TouchableOpacity
                          onPress={() => handleStartReply(item)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>
                            Reply
                          </Text>
                        </TouchableOpacity>

                        {isMyComment && (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(item.id)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '500' }}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Like Comment Heart Button */}
                    <TouchableOpacity
                      style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 4 }}
                      onPress={() => handleToggleLikeComment(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={16}
                        color={isLiked ? '#EF4444' : (isDark ? '#71717A' : '#9CA3AF')}
                        fill={isLiked ? '#EF4444' : 'transparent'}
                      />
                      {(item.likes_count || 0) > 0 && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: isLiked ? '#EF4444' : (isDark ? '#71717A' : '#9CA3AF'),
                            marginTop: 2,
                            fontWeight: '600',
                          }}
                        >
                          {item.likes_count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            {/* Replying Banner */}
            {replyingToComment && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: isDark ? '#181822' : '#EFF6FF',
                  borderLeftWidth: 3,
                  borderLeftColor: '#3B82F6',
                }}
              >
                <Text style={{ fontSize: 13, color: isDark ? '#93C5FD' : '#1D4ED8' }}>
                  Replying to <Text style={{ fontWeight: '700' }}>@{replyingToComment.author?.username || replyingToComment.author?.name || 'student'}</Text>
                </Text>
                <TouchableOpacity onPress={handleCancelReply} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={isDark ? '#93C5FD' : '#1D4ED8'} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.commentInputBar, { backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }]}>
              <TextInput
                ref={commentInputRef}
                style={[styles.commentTextInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder={replyingToComment ? `Reply to @${replyingToComment.author?.username || 'student'}...` : "Add a comment..."}
                placeholderTextColor="#8E8E93"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={submittingComment || !newComment.trim()}
              >
                <Text style={{ color: newComment.trim() ? '#3B82F6' : '#8E8E93', fontWeight: '700' }}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Post Action Sheet Modal (Creator Edit/Delete vs Listener Options) ── */}
      <Modal
        visible={postActionSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPostActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetBackdrop}
          activeOpacity={1}
          onPress={() => setPostActionSheetVisible(false)}
        >
          <View style={[styles.actionSheetContent, { backgroundColor: isDark ? '#161620' : '#FFFFFF' }]}>
            <View style={styles.actionSheetHandle} />

            {selectedPost && (
              <View style={styles.sheetHeaderRow}>
                <Image
                  source={{ uri: selectedPost.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
                  style={styles.sheetAuthorAvatar}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.sheetAuthorName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                    {selectedPost.author?.name || selectedPost.author?.username || 'Student Post'}
                  </Text>
                  <Text style={styles.sheetPostSnippet} numberOfLines={1}>
                    {selectedPost.content || 'Media post'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sheetDivider} />

            {/* If Current User is Post Author */}
            {selectedPost?.author?.id === userId || (selectedPost as any)?.author_id === userId ? (
              <>
                <View style={styles.sheetRoleHeader}>
                  <Text style={styles.sheetRoleHeaderText}>YOUR POST CONTROLS</Text>
                </View>

                {/* Edit Post */}
                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={handleOpenEditPost}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Edit3 size={18} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Edit Post
                    </Text>
                    <Text style={styles.sheetOptionSub}>Update caption or content</Text>
                  </View>
                </TouchableOpacity>

                {/* Delete Post */}
                <TouchableOpacity
                  style={[styles.sheetOptionRow, { marginTop: 4 }]}
                  onPress={handleDeletePost}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Trash2 size={18} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetOptionTitle, { color: '#EF4444' }]}>
                      Delete Post
                    </Text>
                    <Text style={styles.sheetOptionSub}>Permanently remove from campus feed</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* General Viewer Options */}
                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    if (selectedPost) toggleSavePost(selectedPost.id);
                    setPostActionSheetVisible(false);
                  }}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: isDark ? '#222230' : '#F3F4F6' }]}>
                    <Bookmark size={18} color={selectedPost && savedPosts.has(selectedPost.id) ? '#10B981' : (isDark ? '#FFFFFF' : '#111827')} />
                  </View>
                  <Text style={[styles.sheetOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {selectedPost && savedPosts.has(selectedPost.id) ? 'Saved in Bookmarks' : 'Save / Bookmark Post'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    if (selectedPost) handleShare(selectedPost);
                    setPostActionSheetVisible(false);
                  }}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: isDark ? '#222230' : '#F3F4F6' }]}>
                    <Send size={18} color={isDark ? '#FFFFFF' : '#111827'} />
                  </View>
                  <Text style={[styles.sheetOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Share Post
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    setPostActionSheetVisible(false);
                    if (selectedPost?.author?.id) {
                      navigation.navigate('Profile' as never, { userId: selectedPost.author.id } as never);
                    }
                  }}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: isDark ? '#222230' : '#F3F4F6' }]}>
                    <User size={18} color={isDark ? '#FFFFFF' : '#111827'} />
                  </View>
                  <Text style={[styles.sheetOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    View Author Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    if (selectedPost) {
                      setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
                      setPostActionSheetVisible(false);
                      Alert.alert('Post Hidden', 'We will tune your campus feed recommendations.');
                    }
                  }}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: isDark ? '#222230' : '#F3F4F6' }]}>
                    <Ban size={18} color="#9CA3AF" />
                  </View>
                  <Text style={[styles.sheetOptionTitle, { color: '#9CA3AF' }]}>
                    Not Interested
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    if (selectedPost) {
                      setReportedPostId(selectedPost.id);
                      setPostActionSheetVisible(false);
                      setReportModalVisible(true);
                    }
                  }}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Flag size={18} color="#EF4444" />
                  </View>
                  <Text style={[styles.sheetOptionTitle, { color: '#EF4444' }]}>
                    Report Post
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: isDark ? '#222230' : '#F3F4F6' }]}
              onPress={() => setPostActionSheetVisible(false)}
            >
              <Text style={[styles.sheetCloseBtnText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Edit Post Modal ─────────────────────────────────────────── */}
      <Modal
        visible={editPostModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditPostModalVisible(false)}
      >
        <View style={styles.actionSheetBackdrop}>
          <SafeAreaView style={[styles.editModalSheet, { backgroundColor: isDark ? '#14141B' : '#FFFFFF' }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Edit Post
              </Text>
              <TouchableOpacity onPress={() => setEditPostModalVisible(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.editPostTextInput, { color: isDark ? '#FFFFFF' : '#111827', backgroundColor: isDark ? '#1E1E28' : '#F3F4F6' }]}
              placeholder="Edit your post caption..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={5}
              value={editPostContent}
              onChangeText={setEditPostContent}
            />

            <TouchableOpacity
              style={styles.saveEditPostBtn}
              onPress={handleSavePostEdit}
              disabled={savingPostEdit || !editPostContent.trim()}
            >
              {savingPostEdit ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveEditPostBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        targetUserId={selectedPost?.author?.id || 'unknown'}
        targetUserName={selectedPost?.author?.name || 'Student'}
        targetPostId={reportedPostId || undefined}
        onClose={() => {
          setReportModalVisible(false);
          setReportedPostId(null);
        }}
      />

      {/* Fullscreen Shorts/Reels Modal */}
      <ShortsViewerModal
        visible={shortsModalVisible}
        initialPostId={activeShortsPostId}
        posts={posts}
        userId={userId}
        onClose={handleCloseShorts}
        onLikeToggle={handleLike}
        onOpenComments={openCommentsModal}
      />

      {/* ── Repost Action Sheet Modal ─────────────────────────────── */}
      <Modal
        visible={repostMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepostMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setRepostMenuVisible(false)}
        >
          <View style={[styles.repostSheetContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? '#27272A' : '#E5E7EB' }]}>
            <View style={[styles.sheetDragHandle, { backgroundColor: isDark ? '#3F3F46' : '#E5E7EB' }]} />
            
            <Text style={[styles.repostSheetHeaderTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Share on UniLink
            </Text>

            {/* Option 1: Instant Repost */}
            <TouchableOpacity
              style={[styles.repostOptionRow, { borderBottomColor: isDark ? '#27272A' : '#F3F4F6' }]}
              onPress={handleInstantRepost}
              activeOpacity={0.7}
            >
              <View style={[styles.repostOptionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Repeat2 size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.repostOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Instant Repost
                </Text>
                <Text style={[styles.repostOptionSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Instantly reshare this post to your campus feed
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Quote & Repost */}
            <TouchableOpacity
              style={styles.repostOptionRow}
              onPress={handleOpenQuoteModal}
              activeOpacity={0.7}
            >
              <View style={[styles.repostOptionIconBox, { backgroundColor: isDark ? '#27272A' : '#F3F4F6' }]}>
                <Quote size={18} color={isDark ? '#FFFFFF' : '#111827'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.repostOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Quote & Repost
                </Text>
                <Text style={[styles.repostOptionSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Add your thoughts or commentary before reposting
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Quote Repost Composer Modal ────────────────────────────── */}
      <Modal
        visible={quoteModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setQuoteModalVisible(false)}
      >
        <SafeAreaView style={[styles.quoteModalSafeArea, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View style={[styles.quoteModalHeader, { borderBottomColor: isDark ? '#1F1F23' : '#E5E7EB' }]}>
              <TouchableOpacity
                style={styles.quoteModalCloseBtn}
                onPress={() => setQuoteModalVisible(false)}
              >
                <X size={22} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
              <Text style={[styles.quoteModalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>Quote Post</Text>
              <TouchableOpacity
                style={[styles.quoteSubmitBtn, (!quoteComment.trim() || reposting) && { opacity: 0.5 }]}
                onPress={handleSubmitQuoteRepost}
                disabled={!quoteComment.trim() || reposting}
              >
                {reposting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.quoteSubmitBtnText}>Repost</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.quoteModalContent} keyboardShouldPersistTaps="handled">
              {/* Comment Input */}
              <TextInput
                style={[styles.quoteTextInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Add your thoughts or commentary..."
                placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                value={quoteComment}
                onChangeText={setQuoteComment}
                multiline
                autoFocus
              />

              {/* Embedded Target Post Preview Card */}
              {repostTargetPost && (
                <View style={[styles.quotePreviewCard, { backgroundColor: isDark ? '#18181B' : '#F9FAFB', borderColor: isDark ? '#27272A' : '#E5E7EB' }]}>
                  <View style={styles.quotePreviewHeader}>
                    {repostTargetPost.author?.avatar_url ? (
                      <Image source={{ uri: repostTargetPost.author.avatar_url }} style={styles.quotePreviewAvatar} />
                    ) : (
                      <View style={[styles.quotePreviewAvatar, styles.avatarPlaceholder, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.avatarInitial}>
                          {(repostTargetPost.author?.name || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.quotePreviewName, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                      {repostTargetPost.author?.name || 'Student'}
                    </Text>
                    <Text style={[styles.quotePreviewHandle, { color: isDark ? '#71717A' : '#9CA3AF' }]}>
                      @{repostTargetPost.author?.username || 'student'}
                    </Text>
                  </View>
                  {repostTargetPost.content ? (
                    <Text style={[styles.quotePreviewContent, { color: isDark ? '#E4E4E7' : '#374151' }]} numberOfLines={4}>
                      {repostTargetPost.content}
                    </Text>
                  ) : null}
                  {(repostTargetPost.image_url || (repostTargetPost.image_urls && repostTargetPost.image_urls.length > 0)) ? (
                    <Image
                      source={{ uri: repostTargetPost.image_urls?.[0] || repostTargetPost.image_url || '' }}
                      style={styles.quotePreviewImage}
                    />
                  ) : null}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Share to DMs / Friends Modal ────────────────────────────── */}
      <SharePostModal
        visible={shareModalVisible}
        post={shareTargetPost}
        onClose={() => setShareModalVisible(false)}
        currentUserId={userId}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  topHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  storiesContainer: {
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  podcastSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  podcastHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  podcastSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  exploreMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreMoreText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  storiesScroll: {
    paddingHorizontal: 14,
    gap: 14,
  },
  storyBubble: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selfStoryRing: {
    borderColor: '#9CA3AF',
  },
  exploreMoreCircle: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  storyImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  podcastMicBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  storyNameText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  postCard: {
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  postAuthorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAuthorAvatarRing: {
    position: 'relative',
  },
  postAuthorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  postAuthorMeta: {
    marginLeft: 10,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  authorHeadline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  authorSub: {
    fontSize: 11,
    marginTop: 1,
  },
  moreIconBtn: {
    padding: 6,
  },
  postTextContainer: {
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Dynamic Video Player
  inlineVideoContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  inlineVideoWebView: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000000',
  },
  inlineBufferingBox: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inlineVideoTouchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    zIndex: 10,
  },
  reelsBadgePill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },
  reelsBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  soundButtonBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },

  // Image Media
  imageMediaContainer: {
    width: SCREEN_WIDTH,
  },
  postPortraitImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_PORTRAIT_HEIGHT,
  },

  postActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  leftActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconButton: {
    padding: 4,
  },
  likesCountRow: {
    paddingHorizontal: 14,
    marginTop: 6,
  },
  likesCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  viewCommentsRow: {
    paddingHorizontal: 14,
    marginTop: 4,
  },
  viewCommentsText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },

  // Podcast Card in Feed
  podcastFeedCard: {
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  podCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  podTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  podTagText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  podDurationText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  podBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podCoverImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  podMetaCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  podTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  podCreatorText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  podPlayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podPlayCircleActive: {
    backgroundColor: '#34D399',
  },

  centerLoadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Comments Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
  },
  commentBody: {
    fontSize: 13,
    marginTop: 2,
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 22,
  },
  commentTextInput: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
  },

  // Action Sheet Styles
  actionSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  actionSheetContent: {
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
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetAuthorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sheetAuthorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  sheetPostSnippet: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#262634',
    marginVertical: 14,
  },
  sheetRoleHeader: {
    marginBottom: 8,
  },
  sheetRoleHeaderText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  sheetOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetOptionSub: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  sheetCloseBtn: {
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  sheetCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Edit Modal Styles
  editModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.75,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262634',
    marginBottom: 16,
  },
  editModalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  editPostTextInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveEditPostBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveEditPostBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // YouTube Video Preview Card
  youtubeOverlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubePlayIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 8,
  },
  youtubeWatchPrompt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Repost Banner
  repostTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  repostTopBannerText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Quoted Post Card
  quotedPostCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quotedAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quotedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  quotedAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },
  quotedAuthorSub: {
    fontSize: 12,
  },
  quotedContentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  quotedMediaThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 8,
  },

  // Repost Action Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  repostSheetContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
  },
  sheetDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  repostSheetHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  repostOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  repostOptionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  repostOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  repostOptionSub: {
    fontSize: 12,
  },

  // Quote Repost Modal
  quoteModalSafeArea: {
    flex: 1,
  },
  quoteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quoteModalCloseBtn: {
    padding: 4,
  },
  quoteModalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  quoteSubmitBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  quoteSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  quoteModalContent: {
    padding: 16,
  },
  quoteTextInput: {
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  quotePreviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  quotePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotePreviewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  quotePreviewName: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  quotePreviewHandle: {
    fontSize: 13,
  },
  quotePreviewContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  quotePreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
});
