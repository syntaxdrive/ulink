import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Heart,
  MessageCircle,
  Share2,
  X,
  Film,
  CheckCircle2,
  Repeat2,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { FeedPost } from '../services/feedService';
import { extractYouTubeId, cleanVideoUrlsFromText } from '../utils/videoUtils';

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

export const ShortsViewerModal: React.FC<ShortsViewerModalProps> = ({
  visible,
  initialPostId,
  posts,
  userId,
  onClose,
  onLikeToggle,
  onOpenComments,
}) => {
  // Filter all posts that have a video or YouTube embed (including reshared/reposted posts)
  const videoPosts = posts.filter(
    (p) =>
      !!p.video_url ||
      !!extractYouTubeId(p.content || '') ||
      !!p.original_post?.video_url ||
      !!extractYouTubeId(p.original_post?.content || '')
  );

  const initialIndex = Math.max(
    0,
    videoPosts.findIndex((p) => p.id === initialPostId)
  );

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  useEffect(() => {
    if (visible && initialPostId) {
      const idx = Math.max(
        0,
        videoPosts.findIndex((p) => p.id === initialPostId)
      );
      setActiveIndex(idx);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: false });
      }, 50);
    }
  }, [visible, initialPostId]);

  const handleShare = async (post: FeedPost) => {
    try {
      const message = `Check out this campus video on UniLink:\n"${post.content || post.original_post?.content || ''}"\nhttps://ulink.ng/post/${post.id}`;
      await Share.share({ message });
    } catch {
      // Ignore
    }
  };

  const renderItem = ({ item, index }: { item: FeedPost; index: number }) => {
    const isCurrent = index === activeIndex && visible;
    const orig = item.original_post;
    const videoSource = (item.video_url || orig?.video_url || '').trim();
    const rawContent = item.content || orig?.content || '';
    const youtubeId = extractYouTubeId(videoSource) || extractYouTubeId(rawContent);
    const cleanCaption = youtubeId ? cleanVideoUrlsFromText(rawContent) : rawContent;
    const displayAuthor = orig && !item.content ? (orig.author || item.author) : item.author;

    const embedHtml = youtubeId
      ? `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
              body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe
              src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&controls=1&rel=0&modestbranding=1&fs=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen>
            </iframe>
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
              body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
              video { width: 100%; height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <video
              src="${videoSource}"
              controls
              autoplay
              playsinline
              webkit-playsinline
              loop
            ></video>
          </body>
        </html>
      `;

    return (
      <View style={styles.pageContainer}>
        {/* Fullscreen Video */}
        {isCurrent ? (
          <WebViewComponent
            style={styles.webView}
            source={{ html: embedHtml }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.placeholderBlack} />
        )}

        {/* Top Repost Badge */}
        {orig && (
          <View style={styles.repostTopBadge}>
            <Repeat2 size={12} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.repostTopText}>
              Reposted by @{item.author?.username || 'student'}
            </Text>
          </View>
        )}

        {/* Right Floating Actions */}
        <View style={styles.rightActionsColumn}>
          {/* Like */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onLikeToggle(item.id)}
          >
            <View style={[styles.actionIconWrap, item.user_has_liked && styles.likedIconWrap]}>
              <Heart
                size={24}
                color={item.user_has_liked ? '#ffffff' : '#ffffff'}
                fill={item.user_has_liked ? '#EF4444' : 'none'}
              />
            </View>
            <Text style={styles.actionCountText}>{item.likes_count}</Text>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenComments(item.id)}
          >
            <View style={styles.actionIconWrap}>
              <MessageCircle size={24} color="#ffffff" />
            </View>
            <Text style={styles.actionCountText}>{item.comments_count}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleShare(item)}
          >
            <View style={styles.actionIconWrap}>
              <Share2 size={22} color="#ffffff" />
            </View>
            <Text style={styles.actionCountText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Overlay: Creator & Caption */}
        <View style={styles.bottomOverlay}>
          <View style={styles.creatorRow}>
            {displayAuthor?.avatar_url ? (
              <Image source={{ uri: displayAuthor.avatar_url }} style={styles.creatorAvatar} />
            ) : (
              <View style={styles.creatorAvatarPlaceholder}>
                <Text style={styles.creatorInitial}>
                  {(displayAuthor?.name || displayAuthor?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.creatorMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.creatorName}>
                  {displayAuthor?.name || displayAuthor?.username || 'Campus Student'}
                </Text>
                {displayAuthor?.is_verified && (
                  <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.creatorHandle}>
                @{displayAuthor?.username || 'student'}
              </Text>
            </View>
          </View>

          {cleanCaption ? (
            <Text style={styles.captionText} numberOfLines={3}>
              {cleanCaption}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Close Button */}
        <TouchableOpacity style={styles.topCloseBtn} onPress={onClose}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Shorts Tag Header */}
        <View style={styles.shortsHeaderBadge}>
          <Film size={14} color="#ffffff" />
          <Text style={styles.shortsHeaderTitle}>Campus Shorts</Text>
        </View>

        {videoPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos found in feed.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={videoPosts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={screenHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: screenHeight,
              offset: screenHeight * index,
              index,
            })}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pageContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
    backgroundColor: '#000000',
  },
  webView: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
  },
  placeholderBlack: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 18,
    zIndex: 99,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortsHeaderBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 18,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  shortsHeaderTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  repostTopBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 84,
    left: 18,
    zIndex: 90,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  repostTopText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  rightActionsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 90,
    zIndex: 90,
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  likedIconWrap: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
  },
  actionCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 76,
    zIndex: 90,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  creatorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  creatorInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  creatorMeta: {
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  creatorHandle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  captionText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 15,
  },
});
