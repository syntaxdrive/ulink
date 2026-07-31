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
} from 'react-native';
import { Heart, MessageCircle, Share2, CheckCircle2, BookOpen } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');

interface FeedPost {
  id: string;
  content: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    university: string | null;
  };
}

export default function FeedScreen({ navigation }: any) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const response = await apiClient.get('/feed');
      if (response.data?.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.warn('Error fetching feed:', error);
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
      // Optimistic update
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

              {/* Post Image */}
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

                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={20} color={colors.textSecondary} />
                  <Text style={styles.actionCount}>{post.comments_count}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Share2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    marginBottom: 0,
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
    height: width, // Full width square image
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
});
