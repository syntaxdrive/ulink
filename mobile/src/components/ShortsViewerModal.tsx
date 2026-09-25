import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Bookmark,
  Plus,
  SlidersHorizontal,
  Music,
  CheckCircle2,
  X,
  Play,
  Pause,
  Users,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { FeedService, FeedPost } from '../services/feedService';
import { SharePostModal } from './SharePostModal';
import { extractYouTubeId, cleanVideoUrlsFromText, isDirectVideoUrl } from '../utils/videoUtils';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { audioService } from '../services/audioService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const WebViewComponent = WebView as any;

interface ShortsViewerModalProps {
  visible: boolean;
  initialPostId: string | null;
  posts: FeedPost[];
  userId: string | null;
  onClose: () => void;
  onLikeToggle: (postId: string) => void;
  onOpenComments: (postId: string) => void;
}

interface ShortItemProps {
  item: FeedPost;
  itemHeight: number;
  isCurrent: boolean;
  onLikeToggle: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onShare: (post: FeedPost) => void;
}

const ShortItem: React.FC<ShortItemProps> = ({
  item,
  itemHeight,
  isCurrent,
  onLikeToggle,
  onOpenComments,
  onShare,
}) => {
  const orig = item.original_post;
  const videoSource = (item.video_url || orig?.video_url || '').trim();
  const rawContent = item.content || orig?.content || '';
  const isDirect = isDirectVideoUrl(videoSource);
  const youtubeId = isDirect ? null : (extractYouTubeId(videoSource) || extractYouTubeId(rawContent));
  const cleanCaption = youtubeId ? cleanVideoUrlsFromText(rawContent) : rawContent;
  const displayAuthor = orig && !item.content ? (orig.author || item.author) : item.author;

  // Resolve cover image for instant rendering before video loads
  const coverUrl =
    item.image_url ||
    (item.image_urls && item.image_urls[0]) ||
    orig?.image_url ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showIndicator, setShowIndicator] = useState<boolean>(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const webViewRef = useRef<any>(null);
  const indicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spinning disc animation for background audio
  const discSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isCurrent && !isPaused && !hasError) {
      anim = Animated.loop(
        Animated.timing(discSpin, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      discSpin.stopAnimation();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isCurrent, isPaused, hasError]);

  const discRotate = discSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Auto-play when active, pause when scrolled away
  useEffect(() => {
    if (!isCurrent) {
      setIsPaused(true);
      setIsLoaded(false);
      setHasError(false);
      if (youtubeId) {
        webViewRef.current?.injectJavaScript?.(
          `try { if (player && player.pauseVideo) player.pauseVideo(); } catch(e){} true;`
        );
      } else {
        webViewRef.current?.injectJavaScript?.(
          `try { var v = document.getElementById('shortVideo'); if(v) { v.pause(); v.currentTime = 0; } } catch(e){} true;`
        );
      }
    } else {
      setIsPaused(false);
      if (youtubeId) {
        webViewRef.current?.injectJavaScript?.(
          `try { if (player && player.playVideo) player.playVideo(); } catch(e){} true;`
        );
      } else {
        webViewRef.current?.injectJavaScript?.(
          `try { var v = document.getElementById('shortVideo'); if(v) v.play().catch(function(){}); } catch(e){} true;`
        );
      }
    }
  }, [isCurrent, youtubeId]);

  const togglePlayPause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);

    setShowIndicator(true);
    if (indicatorTimer.current) clearTimeout(indicatorTimer.current);
    indicatorTimer.current = setTimeout(() => setShowIndicator(false), 900);

    if (youtubeId) {
      const script = nextPaused
        ? `try { if (player && player.pauseVideo) player.pauseVideo(); } catch(e){} true;`
        : `try { if (player && player.playVideo) player.playVideo(); } catch(e){} true;`;
      webViewRef.current?.injectJavaScript?.(script);
    } else {
      const script = `try { var v = document.getElementById('shortVideo'); if(v) { if (${nextPaused}) v.pause(); else v.play(); } } catch(e){} true;`;
      webViewRef.current?.injectJavaScript?.(script);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'single_tap') {
        togglePlayPause();
      } else if (data.type === 'video_ready') {
        setIsLoaded(true);
        setHasError(false);
      } else if (data.type === 'video_error') {
        setHasError(true);
        setIsLoaded(true);
      }
    } catch {}
  };

  const embedHtml = youtubeId
    ? `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
            .yt-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            iframe, #player { width: 100%; height: 100%; border: 0; }
          </style>
        </head>
        <body>
          <div class="yt-wrapper">
            <div id="player"></div>
          </div>
          <script>
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            var player;
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                width: '100%',
                height: '100%',
                videoId: '${youtubeId}',
                playerVars: {
                  autoplay: 1,
                  playsinline: 1,
                  controls: 1,
                  rel: 0,
                  loop: 1,
                  playlist: '${youtubeId}',
                  modestbranding: 1,
                  fs: 0
                },
                events: {
                  onReady: function(event) {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_ready' }));
                    }
                    event.target.playVideo();
                  },
                  onError: function(event) {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_error', code: event.data }));
                    }
                  }
                }
              });
            }

            document.addEventListener('touchend', function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'single_tap' }));
              }
            });
          </script>
        </body>
      </html>
    `
    : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
            video { width: 100%; height: 100%; object-fit: cover; }
          </style>
        </head>
        <body>
          <video
            id="shortVideo"
            src="${videoSource}"
            poster="${coverUrl || ''}"
            playsinline
            webkit-playsinline
            loop
            preload="auto"
          ></video>
          <script>
            var v = document.getElementById('shortVideo');
            var isCurrentActive = ${isCurrent ? 'true' : 'false'};
            var hasStarted = false;
            function markReady() {
              if (!hasStarted) {
                hasStarted = true;
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_ready' }));
                }
                if (isCurrentActive) {
                  v.play().catch(function(){});
                } else {
                  v.pause();
                }
              }
            }
            v.addEventListener('canplay', markReady);
            v.addEventListener('loadeddata', markReady);
            v.addEventListener('playing', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_ready' }));
              }
            });
            v.addEventListener('error', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'video_error' }));
              }
            });

            document.addEventListener('touchend', function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'single_tap' }));
              }
            });
          </script>
        </body>
      </html>
    `;

  const webViewSource = {
    html: embedHtml,
    baseUrl: 'https://www.youtube.com',
  };

  return (
    <View style={[styles.pageContainer, { height: itemHeight, width: screenWidth }]}>
      {/* ── 1. Instant Cover Image Layer (0ms initial display) ──────── */}
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderBlack} />
      )}

      {/* ── 2. Fullscreen Video Background ──────────────────────────── */}
      {isCurrent && (
        <WebViewComponent
          ref={webViewRef}
          style={[styles.webView, { opacity: isLoaded && !hasError ? 1 : 0.01 }]}
          source={webViewSource}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          scalesPageToFit
          scrollEnabled={false}
          onLoadEnd={() => setIsLoaded(true)}
          onMessage={handleMessage}
          mixedContentMode="always"
        />
      )}

      {/* ── 3. YouTube / Video Error Fallback Overlay ────────────────── */}
      {hasError && (
        <View style={styles.videoErrorCard}>
          <Text style={styles.videoErrorTitle}>Direct Stream Unavailable</Text>
          <Text style={styles.videoErrorSub}>
            This creator restricted in-app mobile embedding.
          </Text>
          {youtubeId && (
            <TouchableOpacity
              style={styles.openExternalBtn}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`)}
              activeOpacity={0.85}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openExternalBtnText}>Watch on YouTube</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Buffering Indicator on Slow Network */}
      {!isLoaded && isCurrent && !hasError && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {/* 1-Click Play / Pause Overlay Touch Layer */}
      <TouchableOpacity
        style={styles.touchOverlay}
        activeOpacity={1}
        onPress={togglePlayPause}
      />

      {/* Centered Play / Pause Indicator */}
      {(showIndicator || isPaused) && (
        <View style={styles.centeredIndicatorWrap} pointerEvents="none">
          <View style={styles.centeredIndicatorCircle}>
            {isPaused ? (
              <Play size={36} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
            ) : (
              <Pause size={36} color="#ffffff" fill="#ffffff" />
            )}
          </View>
        </View>
      )}

      {/* ── RIGHT FLOATING ACTIONS STACK (Instagram Reels Style) ────── */}
      <View style={styles.rightActionsColumn}>
        {/* Like */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onLikeToggle(item.id)}
          activeOpacity={0.8}
        >
          <Heart
            size={28}
            color="#FFFFFF"
            fill={item.user_has_liked ? '#EF4444' : 'none'}
          />
          <Text style={styles.actionCountText}>
            {item.likes_count > 0 ? (item.likes_count > 999 ? `${(item.likes_count / 1000).toFixed(1)}K` : item.likes_count) : 'Likes'}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onOpenComments(item.id)}
          activeOpacity={0.8}
        >
          <MessageCircle size={28} color="#FFFFFF" />
          <Text style={styles.actionCountText}>
            {item.comments_count > 0 ? item.comments_count : 'Comment'}
          </Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare(item)}
          activeOpacity={0.8}
        >
          <Repeat2 size={28} color="#FFFFFF" />
          <Text style={styles.actionCountText}>Share</Text>
        </TouchableOpacity>

        {/* Send / DM */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare(item)}
          activeOpacity={0.8}
        >
          <Send size={26} color="#FFFFFF" />
          <Text style={styles.actionCountText}>DM</Text>
        </TouchableOpacity>

        {/* Bookmark / Save */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            const nextSaved = !isSaved;
            setIsSaved(nextSaved);
            const uid = useAuthStore.getState().userId;
            if (uid) {
              await FeedService.toggleBookmark(item, uid, isSaved);
            }
          }}
          activeOpacity={0.8}
        >
          <Bookmark
            size={26}
            color={isSaved ? '#10B981' : '#FFFFFF'}
            fill={isSaved ? '#10B981' : 'none'}
          />
          <Text style={styles.actionCountText}>Save</Text>
        </TouchableOpacity>

        {/* Spinning Vinyl Music Disc */}
        <TouchableOpacity style={styles.spinningDiscContainer} activeOpacity={0.8}>
          <Animated.View style={[styles.discOuterRing, { transform: [{ rotate: discRotate }] }]}>
            {displayAuthor?.avatar_url ? (
              <Image source={{ uri: displayAuthor.avatar_url }} style={styles.discImage} />
            ) : (
              <View style={styles.discPlaceholder}>
                <Music size={14} color="#FFFFFF" />
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM CREATOR & CAPTION OVERLAY ───────────────────────── */}
      <View style={styles.bottomInfoOverlay}>
        {/* Creator Info Row */}
        <View style={styles.creatorRow}>
          {displayAuthor?.avatar_url ? (
            <Image source={{ uri: displayAuthor.avatar_url }} style={styles.authorAvatar} />
          ) : (
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorInitial}>
                {(displayAuthor?.name || displayAuthor?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.authorUsername} numberOfLines={1}>
            @{displayAuthor?.username || 'student'}
          </Text>

          {displayAuthor?.is_verified && (
            <CheckCircle2 size={13} color="#3B82F6" fill="#3B82F6" style={{ marginLeft: 3 }} />
          )}

          {/* Follow Button */}
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={styles.followBtnText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {cleanCaption ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}
            style={styles.captionContainer}
          >
            <Text
              style={styles.captionText}
              numberOfLines={isCaptionExpanded ? undefined : 2}
            >
              {cleanCaption}
            </Text>
            {!isCaptionExpanded && cleanCaption.length > 80 && (
              <Text style={styles.moreText}>...more</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Audio Ticker */}
        <View style={styles.audioTickerRow}>
          <Music size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.audioTickerText} numberOfLines={1}>
            {displayAuthor?.name || displayAuthor?.username || 'Creator'} • Original Audio ♫
          </Text>
        </View>
      </View>
    </View>
  );
};

export const ShortsViewerModal: React.FC<ShortsViewerModalProps> = ({
  visible,
  initialPostId,
  posts,
  userId,
  onClose,
  onLikeToggle,
  onOpenComments,
}) => {
  const [activeTab, setActiveTab] = useState<'reels' | 'friends'>('reels');
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Fetch connections and follows for current user
  useEffect(() => {
    if (!visible || !userId) return;

    const fetchFriendIds = async () => {
      try {
        setLoadingFriends(true);
        const [followsRes, connsRes] = await Promise.allSettled([
          supabase.from('follows').select('following_id').eq('follower_id', userId),
          supabase
            .from('connections')
            .select('requester_id, recipient_id')
            .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
            .eq('status', 'accepted'),
        ]);

        const ids = new Set<string>([userId]);

        if (followsRes.status === 'fulfilled' && followsRes.value.data) {
          followsRes.value.data.forEach((f: any) => {
            if (f.following_id) ids.add(f.following_id);
          });
        }

        if (connsRes.status === 'fulfilled' && connsRes.value.data) {
          connsRes.value.data.forEach((c: any) => {
            if (c.requester_id === userId && c.recipient_id) ids.add(c.recipient_id);
            else if (c.requester_id) ids.add(c.requester_id);
          });
        }

        setFriendIds(ids);
      } catch (err) {
        console.warn('Error fetching friends for shorts:', err);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriendIds();
  }, [visible, userId]);

  // Auto-pause podcast playback when Reels/Shorts viewer is opened, and resume when closed
  const podcastPausedByShortsRef = useRef(false);
  useEffect(() => {
    if (visible) {
      const audioState = audioService.getState();
      if (audioState.isPlaying) {
        podcastPausedByShortsRef.current = true;
        audioService.pause();
      }
    } else {
      if (podcastPausedByShortsRef.current) {
        podcastPausedByShortsRef.current = false;
        audioService.resume();
      }
    }
  }, [visible]);

  const allShorts = useMemo(() => {
    return posts.filter(
      (p: FeedPost) =>
        p.video_url ||
        p.original_post?.video_url ||
        (p.content && extractYouTubeId(p.content))
    );
  }, [posts]);

  const displayedShorts = useMemo(() => {
    return activeTab === 'friends'
      ? allShorts.filter((p: FeedPost) => {
          const authorId = p.author_id || (p as any).author?.id;
          return authorId ? friendIds.has(authorId) : false;
        })
      : allShorts;
  }, [allShorts, activeTab, friendIds]);

  const hasScrolledToInitialRef = useRef(false);
  const activeShortIdRef = useRef<string | null>(initialPostId);

  const initialIndex = useMemo(() => {
    const idx = displayedShorts.findIndex((p: FeedPost) => p.id === initialPostId);
    return idx >= 0 ? idx : 0;
  }, [displayedShorts, initialPostId]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [viewHeight, setViewHeight] = useState<number>(Dimensions.get('screen').height);
  const flatListRef = useRef<FlatList>(null);

  // Share Post Modal State
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareTargetPost, setShareTargetPost] = useState<FeedPost | null>(null);

  // Scroll to initial post only ONCE when modal transitions to visible
  useEffect(() => {
    if (visible) {
      hasScrolledToInitialRef.current = false;
      const targetId = initialPostId;
      if (targetId) {
        const idx = displayedShorts.findIndex((p: FeedPost) => p.id === targetId);
        if (idx >= 0) {
          setCurrentIndex(idx);
          activeShortIdRef.current = targetId;
          setTimeout(() => {
            if (!hasScrolledToInitialRef.current && flatListRef.current) {
              hasScrolledToInitialRef.current = true;
              flatListRef.current.scrollToIndex({ index: idx, animated: false });
            }
          }, 60);
        }
      }
    } else {
      hasScrolledToInitialRef.current = false;
    }
  }, [visible]);

  // Tab switch
  useEffect(() => {
    if (visible && hasScrolledToInitialRef.current) {
      setCurrentIndex(0);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeTab]);

  const handleShare = (post: FeedPost) => {
    setShareTargetPost(post);
    setShareModalVisible(true);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const newIdx = viewableItems[0].index ?? 0;
      setCurrentIndex(newIdx);
      if (viewableItems[0].item?.id) {
        activeShortIdRef.current = viewableItems[0].item.id;
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      <View
        style={styles.modalRoot}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - viewHeight) > 1) {
            setViewHeight(h);
          }
        }}
      >
        {/* ── TOP HEADER (Reels | Friends with avatar indicator) ──── */}
        <View style={styles.topHeader}>
          {/* Create Reel Plus */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => {}}>
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Center Tabs: Reels | Friends */}
          <View style={styles.headerCenterTabs}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setActiveTab('reels')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'reels' && styles.activeTabText,
                ]}
              >
                Reels
              </Text>
            </TouchableOpacity>

            <Text style={styles.tabDivider}>|</Text>

            <TouchableOpacity
              style={[styles.tabBtn, styles.friendsTabBtn]}
              onPress={() => setActiveTab('friends')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'friends' && styles.activeTabText,
                ]}
              >
                Friends
              </Text>
              <View style={styles.friendsBadgeDot} />
            </TouchableOpacity>
          </View>

          {/* Close Modal Button */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={onClose}>
            <X size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── FULLSCREEN VERTICAL SWIPE LIST OR EMPTY FRIENDS STATE ── */}
        {displayedShorts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Users size={36} color="#3B82F6" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'friends' ? "No Friends' Videos Yet" : "No Campus Reels"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'friends'
                ? 'Videos and clips posted by peers you follow or connect with will show up here.'
                : 'Be the first to share a video or shorts on campus!'}
            </Text>
            {activeTab === 'friends' && (
              <TouchableOpacity
                style={styles.exploreReelsBtn}
                onPress={() => setActiveTab('reels')}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreReelsBtnText}>Explore All Reels</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayedShorts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ShortItem
                item={item}
                itemHeight={viewHeight}
                isCurrent={index === currentIndex}
                onLikeToggle={onLikeToggle}
                onOpenComments={onOpenComments}
                onShare={handleShare}
              />
            )}
            pagingEnabled
            snapToInterval={viewHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
              }, 80);
            }}
            getItemLayout={(_, index) => ({
              length: viewHeight,
              offset: viewHeight * index,
              index,
            })}
            windowSize={3}
            maxToRenderPerBatch={2}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}

        {/* Share Post to DMs / Friends Modal */}
        <SharePostModal
          visible={shareModalVisible}
          post={shareTargetPost}
          onClose={() => setShareModalVisible(false)}
          currentUserId={userId}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24),
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  headerIconBtn: {
    padding: 6,
  },
  headerCenterTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  friendsTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendsBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginLeft: 3,
    marginBottom: 4,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  tabDivider: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
    marginHorizontal: 2,
  },
  pageContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
  },
  placeholderBlack: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  webView: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  centeredIndicatorWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  centeredIndicatorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Right Floating Actions
  rightActionsColumn: {
    position: 'absolute',
    right: 12,
    bottom: 90,
    alignItems: 'center',
    zIndex: 30,
    gap: 16,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  spinningDiscContainer: {
    marginTop: 6,
  },
  discOuterRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  discImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  discPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Creator Info
  bottomInfoOverlay: {
    position: 'absolute',
    left: 14,
    bottom: 40,
    right: 80,
    zIndex: 30,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  authorAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  authorUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  followBtn: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  followingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'transparent',
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  captionContainer: {
    marginBottom: 8,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moreText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  audioTickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioTickerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Friends / Reels Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreReelsBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
  },
  exploreReelsBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Video Error Card Overlay
  videoErrorCard: {
    position: 'absolute',
    top: '38%',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(15, 15, 20, 0.88)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  videoErrorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  videoErrorSub: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 16,
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  openExternalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
