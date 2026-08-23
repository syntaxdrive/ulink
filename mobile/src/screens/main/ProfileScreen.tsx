import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  LogOut,
  CheckCircle2,
  BookOpen,
  Users,
  Edit3,
  X,
  Check,
  Globe,
  MapPin,
  Trash2,
  Shield,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  email?: string;
  headline: string | null;
  about: string | null;
  university: string | null;
  location: string | null;
  skills: string | string[] | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  avatar_url: string | null;
  background_image_url: string | null;
  is_verified: boolean;
  is_admin?: boolean;
  role: string | null;
  followers_count: number;
  following_count: number;
  points?: number;
}

interface UserPost {
  id: string;
  content: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function ProfileScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    headline: '',
    about: '',
    university: '',
    location: '',
    skills: '',
    website_url: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    avatar_url: '',
  });

  const fetchProfileData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id;

      if (currentUid) {
        // 1. Fetch profile from Supabase
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUid)
          .single();

        if (profData && !profError) {
          setProfile(profData as UserProfile);
        }

        // 2. Fetch posts from Supabase
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, content, image_url, likes_count, comments_count, created_at')
          .eq('author_id', currentUid)
          .order('created_at', { ascending: false });

        if (postsData) {
          setPosts(postsData as UserPost[]);
        }
      }
    } catch (error: any) {
      console.warn('Error fetching profile:', error);
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

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name || '',
      username: profile.username || '',
      headline: profile.headline || '',
      about: profile.about || '',
      university: profile.university || '',
      location: profile.location || '',
      skills: Array.isArray(profile.skills)
        ? profile.skills.join(', ')
        : (profile.skills as string) || '',
      website_url: profile.website_url || '',
      github_url: profile.github_url || '',
      linkedin_url: profile.linkedin_url || '',
      twitter_url: profile.twitter_url || '',
      avatar_url: profile.avatar_url || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);

    try {
      const updates = {
        name: editForm.name.trim() || null,
        username: editForm.username.trim() || null,
        headline: editForm.headline.trim() || null,
        about: editForm.about.trim() || null,
        university: editForm.university.trim() || null,
        location: editForm.location.trim() || null,
        skills: editForm.skills
          ? editForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        website_url: editForm.website_url.trim() || null,
        github_url: editForm.github_url.trim() || null,
        linkedin_url: editForm.linkedin_url.trim() || null,
        twitter_url: editForm.twitter_url.trim() || null,
        avatar_url: editForm.avatar_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      // Optimistic update
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setIsEditModalOpen(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      console.warn('Error saving profile:', err);
      Alert.alert('Error', err.message || 'Could not save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to permanently delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!profile?.id) return;
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          try {
            await Promise.allSettled([
              supabase.from('likes').delete().eq('post_id', postId),
              supabase.from('comments').delete().eq('post_id', postId),
            ]);
            await supabase.from('posts').delete().eq('id', postId).eq('author_id', profile.id);
          } catch {
            Alert.alert('Error', 'Could not delete post.');
            fetchProfileData();
          }
        },
      },
    ]);
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

          {/* Location & Links */}
          {profile?.location ? (
            <View style={styles.metaInfoRow}>
              <MapPin size={13} color={colors.textSecondary} />
              <Text style={styles.metaInfoText}>{profile.location}</Text>
            </View>
          ) : null}

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

          {/* Admin Dashboard Entry (Visible ONLY to Staff / Admins) */}
          {profile?.is_admin && (
            <TouchableOpacity
              style={styles.adminPanelBtn}
              onPress={() => navigation?.navigate('Admin')}
              activeOpacity={0.85}
            >
              <View style={styles.adminPanelLeft}>
                <View style={styles.adminShieldCircle}>
                  <Shield size={16} color="#000000" />
                </View>
                <View>
                  <Text style={styles.adminPanelTitle}>Admin Control Center</Text>
                  <Text style={styles.adminPanelSubtitle}>Manage students, badges & reports</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#000000" />
            </TouchableOpacity>
          )}

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: isDark ? '#27272A' : '#F3F4F6', borderColor: colors.border }]}
            onPress={handleOpenEdit}
          >
            <Edit3 size={15} color={colors.text} style={{ marginRight: 6 }} />
            <Text style={[styles.editProfileBtnText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Theme Mode Switcher (Light / Dark) */}
          <TouchableOpacity
            style={[styles.themeToggleCard, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB', borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <View style={styles.themeToggleLeft}>
              {isDark ? (
                <Moon size={18} color="#10B981" />
              ) : (
                <Sun size={18} color="#F59E0B" />
              )}
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.themeToggleTitle, { color: colors.text }]}>
                  {isDark ? 'Dark Theme' : 'Light Theme'}
                </Text>
                <Text style={[styles.themeToggleSubtitle, { color: colors.textSecondary }]}>
                  Tap to switch to {isDark ? 'Light' : 'Dark'} mode
                </Text>
              </View>
            </View>
            <View style={[styles.themePill, { backgroundColor: isDark ? '#064E3B' : '#E5E7EB' }]}>
              <Text style={[styles.themePillText, { color: isDark ? '#10B981' : '#374151' }]}>
                {isDark ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </View>
          </TouchableOpacity>
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
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={styles.postCardMeta}>❤️ {post.likes_count}</Text>
                      <Text style={styles.postCardMeta}>💬 {post.comments_count}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.postDeleteBtn}
                      onPress={() => handleDeletePost(post.id)}
                    >
                      <Trash2 size={13} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={[styles.saveBtn, savingProfile && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar Preview & URL */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Avatar Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.avatar_url}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, avatar_url: val }))}
                  autoCapitalize="none"
                />
              </View>

              {/* Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.name}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, name: val }))}
                />
              </View>

              {/* Username */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Username</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="username"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.username}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, username: val }))}
                  autoCapitalize="none"
                />
              </View>

              {/* Headline */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Headline / Major</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Computer Science '27 | AI Enthusiast"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.headline}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, headline: val }))}
                />
              </View>

              {/* University */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>University / College</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. University of Lagos (UNILAG)"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.university}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, university: val }))}
                />
              </View>

              {/* Location */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Lagos, Nigeria"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.location}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, location: val }))}
                />
              </View>

              {/* About / Bio */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>About You</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Tell campus about your interests, passions, and goals..."
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.about}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, about: val }))}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Skills */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Skills (comma separated)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Python, UI/UX, Public Speaking"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.skills}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, skills: val }))}
                />
              </View>

              {/* Links */}
              <View style={styles.linksHeaderRow}>
                <Globe size={14} color={colors.primary} />
                <Text style={styles.linksHeaderText}>Social & Portfolio Links</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Website / Portfolio</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://yourportfolio.com"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.website_url}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, website_url: val }))}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>GitHub</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://github.com/username"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.github_url}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, github_url: val }))}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>LinkedIn</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://linkedin.com/in/username"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.linkedin_url}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, linkedin_url: val }))}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Twitter / X</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://twitter.com/username"
                  placeholderTextColor={colors.textSecondary}
                  value={editForm.twitter_url}
                  onChangeText={(val) => setEditForm((prev) => ({ ...prev, twitter_url: val }))}
                  autoCapitalize="none"
                />
              </View>
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  identityContainer: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  verifiedBadge: {
    marginLeft: 4,
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
    gap: 4,
  },
  universityText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  headlineText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  metaInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  adminPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  adminPanelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminShieldCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminPanelTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  adminPanelSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    marginTop: 14,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  themeToggleSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  postsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  postCard: {
    width: cardWidth,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  postCardImage: {
    width: '100%',
    height: 120,
  },
  textPostCard: {
    width: '100%',
    height: 120,
    padding: 12,
    justifyContent: 'center',
  },
  postCardText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  postCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postCardMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  postDeleteBtn: {
    padding: 4,
  },

  // Modal Styles
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
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  formScroll: {
    padding: 18,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
  },
  formTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  linksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  linksHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
