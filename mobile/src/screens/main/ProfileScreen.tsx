import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Settings, LogOut, CheckCircle2, Award, BookOpen, Users } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  headline: string | null;
  about: string | null;
  university: string | null;
  avatar_url: string | null;
  background_image_url: string | null;
  is_verified: boolean;
  role: string | null;
  followers_count: number;
  following_count: number;
}

interface UserPost {
  id: string;
  content: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const fetchProfileData = useCallback(async () => {
    try {
      const profileRes = await apiClient.get('/profiles/me');
      if (profileRes.data) {
        setProfile(profileRes.data);

        // Fetch user posts
        try {
          const postsRes = await apiClient.get(`/profiles/${profileRes.data.id}/posts`);
          if (postsRes.data?.posts) {
            setPosts(postsRes.data.posts);
          }
        } catch (postErr) {
          console.warn('Unable to load user posts:', postErr);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Unable to load profile details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of UniLink?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <LogOut color={colors.danger} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Card Header */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {(profile?.name || profile?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.identityContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{profile?.name || profile?.username || 'Student'}</Text>
                {profile?.is_verified && (
                  <CheckCircle2 size={16} color={colors.primary} style={styles.verifiedBadge} />
                )}
              </View>
              <Text style={styles.usernameText}>@{profile?.username || 'student'}</Text>
              {profile?.university && (
                <View style={styles.universityBadge}>
                  <BookOpen size={12} color={colors.primary} />
                  <Text style={styles.universityText}>{profile.university}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Headline / Bio */}
          {profile?.headline ? (
            <Text style={styles.headlineText}>{profile.headline}</Text>
          ) : null}

          {profile?.about ? <Text style={styles.aboutText}>{profile.about}</Text> : null}

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile?.followers_count ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile?.following_count ?? 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* User Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Your Posts ({posts.length})</Text>

          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Share thoughts, project updates, or course notes with your university campus.
              </Text>
            </View>
          ) : (
            <View style={styles.postsGrid}>
              {posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  {post.image_url ? (
                    <Image source={{ uri: post.image_url }} style={styles.postCardImage} />
                  ) : (
                    <View style={styles.textPostCard}>
                      <Text numberOfLines={4} style={styles.postCardText}>
                        {post.content || 'Untitled Post'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.postCardFooter}>
                    <Text style={styles.postCardStat}>❤️ {post.likes_count}</Text>
                    <Text style={styles.postCardStat}>💬 {post.comments_count}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  iconButton: {
    padding: 6,
  },
  card: {
    margin: 16,
    padding: 18,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '700',
  },
  identityContainer: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  usernameText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  universityText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 4,
  },
  headlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  aboutText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postCard: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  postCardImage: {
    width: '100%',
    height: cardWidth - 36,
  },
  textPostCard: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
  },
  postCardText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  postCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postCardStat: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
