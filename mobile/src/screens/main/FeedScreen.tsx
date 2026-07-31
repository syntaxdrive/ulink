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
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Send } from 'lucide-react-native';
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

const MOCK_STORIES = [
  { id: '1', author: 'Your Story', isUser: true },
  { id: '2', author: 'alex_j', isUser: false },
  { id: '3', author: 'sarah_w', isUser: false },
  { id: '4', author: 'cs_squad', isUser: false },
  { id: '5', author: 'uni_news', isUser: false },
];

export default function FeedScreen() {
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
      console.log('Using initial feed layout:', error);
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
      console.log('Error liking post:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Instagram-Style Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UniLink</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Heart color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MessageCircle color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Instagram-Style Stories Row */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesList}>
            {MOCK_STORIES.map((story) => (
              <View key={story.id} style={styles.storyItem}>
                <View style={[styles.storyAvatar, story.isUser ? styles.storyAvatarUser : styles.storyAvatarOther]}>
                  {story.isUser && (
                    <View style={styles.storyAddBadge}>
                      <Text style={styles.storyAddText}>+</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storyText} numberOfLines={1}>
                  {story.author}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        )}

        {/* Post List */}
        {!loading && posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Follow people to see their posts!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postContainer}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                  {post.author.avatar_url ? (
                    <Image source={{ uri: post.author.avatar_url }} style={styles.avatarSmallImage} />
                  ) : (
                    <View style={styles.avatarSmall} />
                  )}
                  <View>
                    <Text style={styles.postAuthor}>
                      {post.author.username || post.author.name || 'Student'}
                    </Text>
                    {post.author.university && (
                      <Text style={styles.postUniversity}>{post.author.university}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity>
                  <MoreHorizontal color={colors.text} size={20} />
                </TouchableOpacity>
              </View>

              {/* Post Image (if present) */}
              {post.image_url ? (
                <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
              ) : null}

              {/* Action Buttons Row */}
              <View style={styles.postActions}>
                <View style={styles.postActionsLeft}>
                  <TouchableOpacity style={styles.actionIcon} onPress={() => handleLike(post.id)}>
                    <Heart
                      color={post.user_has_liked ? '#FF3B30' : colors.text}
                      fill={post.user_has_liked ? '#FF3B30' : 'none'}
                      size={24}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon}>
                    <MessageCircle color={colors.text} size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIcon}>
                    <Send color={colors.text} size={24} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Bookmark color={colors.text} size={24} />
                </TouchableOpacity>
              </View>

              {/* Post Details (Likes, Caption, Comments count) */}
              <View style={styles.postDetails}>
                <Text style={styles.likesText}>{post.likes_count} likes</Text>

                {post.content && (
                  <View style={styles.captionContainer}>
                    <Text style={styles.captionText}>
                      <Text style={styles.captionAuthor}>
                        {post.author.username || post.author.name || 'Student'}{' '}
                      </Text>
                      {post.content}
                    </Text>
                  </View>
                )}

                {post.comments_count > 0 && (
                  <Text style={styles.commentsText}>
                    View all {post.comments_count} comments
                  </Text>
                )}

                <Text style={styles.timeText}>
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  storiesContainer: {
    paddingVertical: 12,
  },
  storiesList: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 64,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    marginBottom: 4,
    position: 'relative',
  },
  storyAvatarUser: {
    borderWidth: 0,
  },
  storyAvatarOther: {
    borderWidth: 2,
    borderColor: colors.border,
    padding: 2,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAddText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  },
  storyText: {
    fontSize: 12,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  postContainer: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginRight: 10,
  },
  avatarSmallImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  postUniversity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: colors.surface,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  postActionsLeft: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 16,
  },
  postDetails: {
    paddingHorizontal: 12,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  captionAuthor: {
    fontWeight: '600',
    color: colors.text,
  },
  captionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  commentsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
