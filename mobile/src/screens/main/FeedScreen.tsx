import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  CheckCircle2,
  X,
  Send,
  Radio,
  Volume2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');

interface PodcastStory {
  id: string;
  title: string;
  coverUrl: string | null;
  creatorName: string;
  latestEpisodeTitle: string;
  latestEpisodeAudioUrl: string | null;
}

interface FeedPost {
  id: string;
  content: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
  is_repost?: boolean;
  repost_comment?: string | null;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    university: string | null;
  };
}

interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}


export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Comments modal state
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const [feedRes, podcastRes] = await Promise.allSettled([
        apiClient.get('/feed'),
        apiClient.get('/feed/podcasts'),
      ]);

      if (feedRes.status === 'fulfilled' && feedRes.value.data?.posts) {
        setPosts(feedRes.value.data.posts);
      }
      if (podcastRes.status === 'fulfilled' && Array.isArray(podcastRes.value.data)) {
        setPodcasts(podcastRes.value.data);
      }
    } catch (error) {
      console.warn('Error fetching feed data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const handleLike = async (postId: string) => {
    try {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const hasLiked = post.user_has_liked;
            return {
              ...post,
              user_has_liked: !hasLiked,
              likes_count: hasLiked ? post.likes_count - 1 : post.likes_count + 1,
            };
          }
          return post;
        })
      );
      await apiClient.post(`/posts/${postId}/like`);
    } catch (error) {
      console.warn('Error liking post:', error);
    }
  };

  const handleRepost = async (postId: string) => {
    Alert.alert('Repost to Feed', 'Would you like to share this post on your campus profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Repost',
        onPress: async () => {
          try {
            await apiClient.post(`/posts/${postId}/repost`);
            Alert.alert('Reposted!', 'Post shared to campus feed.');
            fetchFeed();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Unable to repost.');
          }
        },
      },
    ]);
  };

  const handleShare = async (post: any) => {
    try {
      const message = `Check out this post on UniLink by @${post.author?.username || 'student'}:\n\n"${post.content || ''}"`;
      await Share.share({
        message,
        title: 'Share Post',
      });
    } catch (error: any) {
      console.warn('Error sharing post:', error.message);
    }
  };

  const openCommentsModal = async (postId: string) => {
    setActivePostId(postId);
    setLoadingComments(true);
    try {
      const res = await apiClient.get(`/posts/${postId}/comments`);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.warn('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!activePostId || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/posts/${activePostId}/comments`, {
        content: newComment.trim(),
      });

      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
        setNewComment('');
        setPosts((prev) =>
          prev.map((p) => (p.id === activePostId ? { ...p, comments_count: p.comments_count + 1 } : p))
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.headerTitle}>UniLink</Text>
          <View style={styles.activeBadgeDot} />
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.navigate('Messages')}>
          <MessageCircle color={colors.text} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Top Podcast Stories Bar */}
        <View style={styles.podcastStoriesContainer}>
          <Text style={styles.storiesHeaderTitle}>Campus Audio & Podcasts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.podcastList}>
            {podcasts.length === 0 ? (
              <View style={styles.storyBubbleItem}>
                <View style={styles.storyAvatarPlaceholder}>
                  <Radio size={20} color={colors.primary} />
                </View>
                <Text style={styles.storyTitleText} numberOfLines={1}>
                  Campus Voice
                </Text>
              </View>
            ) : (
              podcasts.map((pod) => (
                <TouchableOpacity
                  key={pod.id}
                  style={styles.storyBubbleItem}
                  onPress={() => navigation.navigate('Podcast' as never, { podcastId: pod.id } as never)}
                >
                  <View style={styles.storyAvatarBorder}>
                    {pod.coverUrl ? (
                      <Image source={{ uri: pod.coverUrl }} style={styles.storyAvatarImage} />
                    ) : (
                      <View style={styles.storyAvatarPlaceholder}>
                        <Radio size={18} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.playIconBadge}>
                      <Volume2 size={10} color={colors.background} />
                    </View>
                  </View>
                  <Text style={styles.storyTitleText} numberOfLines={1}>
                    {pod.title}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Feed Posts */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first student to publish a post on campus!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Repost Badge */}
              {post.is_repost && (
                <View style={styles.repostHeaderBadge}>
                  <Repeat2 size={13} color={colors.primary} />
                  <Text style={styles.repostHeaderText}>Reposted on Campus Feed</Text>
                </View>
              )}

              {/* Post Header */}
              <View style={styles.postHeader}>
                {post.author.avatar_url ? (
                  <Image source={{ uri: post.author.avatar_url }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Text style={styles.authorAvatarInitials}>
                      {(post.author.name || post.author.username || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.authorDetails}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>
                      {post.author.name || post.author.username || 'Campus Student'}
                    </Text>
                    {post.author.is_verified && (
                      <CheckCircle2 size={14} color={colors.primary} style={styles.verifiedIcon} />
                    )}
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.usernameText}>@{post.author.username || 'student'}</Text>
                    {post.author.university && (
                      <>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.universityText}>{post.author.university}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Post Content */}
              {post.content ? <Text style={styles.postContent}>{post.content}</Text> : null}

              {/* Post Image (Full Width) */}
              {post.image_url ? (
                <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
              ) : null}

              {/* Action Bar */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
                  <Heart
                    size={20}
                    color={post.user_has_liked ? colors.danger : colors.textSecondary}
                    fill={post.user_has_liked ? colors.danger : 'none'}
                  />
                  <Text style={[styles.actionCount, post.user_has_liked && styles.likedCount]}>
                    {post.likes_count}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => openCommentsModal(post.id)}>
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
          ))
        )}
      </ScrollView>

      {/* Comments Bottom Sheet / Modal */}
      <Modal
        visible={!!activePostId}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setActivePostId(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setActivePostId(null)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingComments ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptySubtitle}>Be the first to share your thoughts!</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    {item.author.avatar_url ? (
                      <Image source={{ uri: item.author.avatar_url }} style={styles.commentAvatar} />
                    ) : (
                      <View style={styles.commentAvatarPlaceholder}>
                        <Text style={styles.commentAvatarInitials}>
                          {(item.author.name || item.author.username || 'C')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.commentContentBox}>
                      <Text style={styles.commentAuthorName}>
                        {item.author.name || item.author.username || 'Student'}
                      </Text>
                      <Text style={styles.commentText}>{item.content}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(item.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}

            {/* Comment Input Bar */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                style={[styles.sendCommentBtn, submittingComment && styles.sendBtnDisabled]}
                onPress={handleAddComment}
                disabled={submittingComment}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  activeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginLeft: 4,
    marginBottom: 10,
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  podcastStoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  storiesHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  podcastList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyBubbleItem: {
    alignItems: 'center',
    width: 72,
  },
  storyAvatarBorder: {
    position: 'relative',
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  storyAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  storyAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 3,
  },
  storyTitleText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    margin: 16,
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  postCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  repostHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  repostHeaderText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  authorAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarInitials: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  authorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  usernameText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },
  universityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: width,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  likedCount: {
    color: colors.danger,
  },

  // Modal / Comments Sheet Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  sendCommentBtn: {
    backgroundColor: colors.text,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
