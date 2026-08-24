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
  Share,
  Linking,
  FlatList,
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
  ChevronLeft,
  Flag,
  Moon,
  Sun,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Share2,
  Sparkles,
  Link2,
  Clock,
  ExternalLink,
  GraduationCap,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ReportModal } from '../../components/ReportModal';

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

interface MiniStudent {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  is_verified: boolean;
  headline: string | null;
}

export default function ProfileScreen({ navigation, route }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const routeUserId = route?.params?.userId;
  const isOwnProfile = !routeUserId || routeUserId === currentUserId;

  // Social Interaction States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Connection State: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Followers / Following Modal State
  const [socialModalType, setSocialModalType] = useState<'followers' | 'following' | null>(null);
  const [socialList, setSocialList] = useState<MiniStudent[]>([]);
  const [socialListLoading, setSocialListLoading] = useState(false);

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
      if (currentUid) setCurrentUserId(currentUid);

      const targetUid = routeUserId || currentUid;

      if (currentUid && currentUid !== targetUid) {
        // Fetch current user's profile for mutual university comparison
        const { data: myData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUid)
          .single();
        if (myData) setCurrentUserProfile(myData as UserProfile);
      }

      if (targetUid) {
        // 1. Fetch profile from Supabase
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUid)
          .single();

        if (profData && !profError) {
          const userProf = profData as UserProfile;
          setProfile(userProf);
          setFollowersCount(userProf.followers_count ?? 0);
          setFollowingCount(userProf.following_count ?? 0);
        }

        // 2. Fetch live follow counts & status if viewing another user
        if (currentUid && targetUid !== currentUid) {
          const [followCheck, connCheck, { count: fc }, { count: fgc }] = await Promise.all([
            supabase
              .from('follows')
              .select('id')
              .eq('follower_id', currentUid)
              .eq('following_id', targetUid)
              .maybeSingle(),
            supabase
              .from('connections')
              .select('id, requester_id, recipient_id, status')
              .or(`and(requester_id.eq.${currentUid},recipient_id.eq.${targetUid}),and(requester_id.eq.${targetUid},recipient_id.eq.${currentUid})`)
              .maybeSingle(),
            supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('following_id', targetUid),
            supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('follower_id', targetUid),
          ]);

          setIsFollowing(!!followCheck.data);
          if (fc !== null) setFollowersCount(fc);
          if (fgc !== null) setFollowingCount(fgc);

          if (connCheck.data) {
            const conn = connCheck.data;
            if (conn.status === 'accepted') {
              setConnectionStatus('accepted');
            } else if (conn.requester_id === currentUid) {
              setConnectionStatus('pending_sent');
            } else {
              setConnectionStatus('pending_received');
            }
          } else {
            setConnectionStatus('none');
          }
        } else if (targetUid) {
          // Live count for own profile
          const [{ count: fc }, { count: fgc }] = await Promise.all([
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUid),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUid),
          ]);
          if (fc !== null) setFollowersCount(fc);
          if (fgc !== null) setFollowingCount(fgc);
        }

        // 3. Fetch posts from Supabase
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, content, image_url, likes_count, comments_count, created_at')
          .eq('author_id', targetUid)
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
  }, [routeUserId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  // Follow / Unfollow Toggle
  const handleToggleFollow = async () => {
    if (!currentUserId || !profile?.id || isOwnProfile || followLoading) return;

    setFollowLoading(true);
    const prevFollowing = isFollowing;
    const nextFollowing = !prevFollowing;

    // Optimistic Update
    setIsFollowing(nextFollowing);
    setFollowersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextFollowing) {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: profile.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id);
        if (error) throw error;
      }
    } catch (err: any) {
      console.warn('Error toggling follow:', err);
      // Revert on error
      setIsFollowing(prevFollowing);
      setFollowersCount((prev) => (prevFollowing ? prev + 1 : Math.max(0, prev - 1)));
      Alert.alert('Follow Error', 'Could not update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Connection Request Handling
  const handleConnectionAction = async () => {
    if (!currentUserId || !profile?.id || isOwnProfile || connectionLoading) return;

    setConnectionLoading(true);
    try {
      if (connectionStatus === 'none') {
        // Send connection request
        setConnectionStatus('pending_sent');
        const { error } = await supabase.from('connections').insert({
          requester_id: currentUserId,
          recipient_id: profile.id,
          status: 'pending',
        });
        if (error) throw error;
        Alert.alert('Request Sent', `Connection invitation sent to ${profile.name || profile.username}!`);
      } else if (connectionStatus === 'pending_sent') {
        // Cancel pending request
        setConnectionStatus('none');
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('requester_id', currentUserId)
          .eq('recipient_id', profile.id);
        if (error) throw error;
      } else if (connectionStatus === 'pending_received') {
        // Accept incoming request
        setConnectionStatus('accepted');
        const { error } = await supabase
          .from('connections')
          .update({ status: 'accepted' })
          .eq('requester_id', profile.id)
          .eq('recipient_id', currentUserId);
        if (error) throw error;
        Alert.alert('Connected!', `You and ${profile.name || profile.username} are now campus connections!`);
      } else if (connectionStatus === 'accepted') {
        // Option to disconnect
        Alert.alert(
          'Campus Connection',
          `Are you sure you want to disconnect from ${profile.name || profile.username}?`,
          [
            { text: 'Keep Connected', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: async () => {
                setConnectionStatus('none');
                await supabase
                  .from('connections')
                  .delete()
                  .or(`and(requester_id.eq.${currentUserId},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${currentUserId})`);
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.warn('Connection action error:', err);
      Alert.alert('Error', err.message || 'Could not complete connection action.');
      fetchProfileData();
    } finally {
      setConnectionLoading(false);
    }
  };

  // Direct Message
  const handleOpenMessage = () => {
    if (!profile) return;
    navigation.navigate('Messages', {
      targetUser: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        is_verified: profile.is_verified,
      },
    });
  };

  // Share Profile
  const handleShareProfile = async () => {
    if (!profile) return;
    try {
      const shareUrl = `https://unilink.app/u/${profile.username || profile.id}`;
      await Share.share({
        title: `${profile.name || profile.username} on UniLink`,
        message: `Connect with ${profile.name || profile.username} (${profile.university || 'Campus Student'}) on UniLink!\n\n${shareUrl}`,
      });
    } catch (err) {
      console.warn('Error sharing profile:', err);
    }
  };

  // Open Social / External Link
  const handleOpenLink = (url: string | null) => {
    if (!url) return;
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    Linking.openURL(formatted).catch(() => Alert.alert('Invalid Link', 'Could not open this webpage.'));
  };

  // Fetch Followers or Following list for modal
  const handleOpenSocialList = async (type: 'followers' | 'following') => {
    if (!profile?.id) return;
    setSocialModalType(type);
    setSocialListLoading(true);
    setSocialList([]);

    try {
      if (type === 'followers') {
        const { data, error } = await supabase
          .from('follows')
          .select(`
            follower:profiles!follower_id (
              id, name, username, avatar_url, university, is_verified, headline
            )
          `)
          .eq('following_id', profile.id)
          .limit(60);

        if (error) throw error;
        const students = (data?.map((d: any) => d.follower).filter(Boolean) || []) as MiniStudent[];
        setSocialList(students);
      } else {
        const { data, error } = await supabase
          .from('follows')
          .select(`
            following:profiles!following_id (
              id, name, username, avatar_url, university, is_verified, headline
            )
          `)
          .eq('follower_id', profile.id)
          .limit(60);

        if (error) throw error;
        const students = (data?.map((d: any) => d.following).filter(Boolean) || []) as MiniStudent[];
        setSocialList(students);
      }
    } catch (err: any) {
      console.warn('Error fetching social list:', err);
    } finally {
      setSocialListLoading(false);
    }
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

  const isSameUniversity =
    !isOwnProfile &&
    profile?.university &&
    currentUserProfile?.university &&
    profile.university.toLowerCase() === currentUserProfile.university.toLowerCase();

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
        {!isOwnProfile ? (
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
        <Text style={styles.headerTitle}>{isOwnProfile ? 'Profile' : `@${profile?.username || 'profile'}`}</Text>
        {isOwnProfile ? (
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <LogOut color={colors.danger} size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShareProfile}>
              <Share2 color={colors.text} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setReportModalVisible(true)}>
              <Flag color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        )}
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

          {/* Same University Proximity Pill */}
          {isSameUniversity && (
            <View style={styles.campusProximityPill}>
              <GraduationCap size={13} color="#059669" />
              <Text style={styles.campusProximityText}>
                Fellow student at {profile?.university}
              </Text>
            </View>
          )}

          {/* Headline / Bio */}
          {profile?.headline ? (
            <Text style={styles.headlineText}>{profile.headline}</Text>
          ) : null}

          {profile?.about ? <Text style={styles.aboutText}>{profile.about}</Text> : null}

          {/* Location */}
          {profile?.location ? (
            <View style={styles.metaInfoRow}>
              <MapPin size={13} color={colors.textSecondary} />
              <Text style={styles.metaInfoText}>{profile.location}</Text>
            </View>
          ) : null}

          {/* Skills Chips */}
          {profile?.skills && (
            <View style={styles.skillsContainer}>
              {(Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((skill, idx) => {
                const s = typeof skill === 'string' ? skill.trim() : '';
                if (!s) return null;
                return (
                  <View key={idx} style={[styles.skillChip, { backgroundColor: isDark ? '#27272A' : '#F3F4F6' }]}>
                    <Text style={[styles.skillChipText, { color: colors.text }]}>{s}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Social & Portfolio Links Row */}
          {(profile?.website_url || profile?.github_url || profile?.linkedin_url || profile?.twitter_url) && (
            <View style={styles.socialChipsRow}>
              {profile?.website_url && (
                <TouchableOpacity
                  style={[styles.socialChip, { borderColor: colors.border }]}
                  onPress={() => handleOpenLink(profile.website_url)}
                >
                  <Globe size={13} color={colors.primary} />
                  <Text style={[styles.socialChipText, { color: colors.text }]}>Website</Text>
                </TouchableOpacity>
              )}
              {profile?.github_url && (
                <TouchableOpacity
                  style={[styles.socialChip, { borderColor: colors.border }]}
                  onPress={() => handleOpenLink(profile.github_url)}
                >
                  <ExternalLink size={13} color={colors.text} />
                  <Text style={[styles.socialChipText, { color: colors.text }]}>GitHub</Text>
                </TouchableOpacity>
              )}
              {profile?.linkedin_url && (
                <TouchableOpacity
                  style={[styles.socialChip, { borderColor: colors.border }]}
                  onPress={() => handleOpenLink(profile.linkedin_url)}
                >
                  <ExternalLink size={13} color="#0A66C2" />
                  <Text style={[styles.socialChipText, { color: '#0A66C2' }]}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {profile?.twitter_url && (
                <TouchableOpacity
                  style={[styles.socialChip, { borderColor: colors.border }]}
                  onPress={() => handleOpenLink(profile.twitter_url)}
                >
                  <ExternalLink size={13} color="#1DA1F2" />
                  <Text style={[styles.socialChipText, { color: '#1DA1F2' }]}>Twitter / X</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Interactive Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => handleOpenSocialList('followers')}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => handleOpenSocialList('following')}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Interaction Buttons for Other Profiles */}
          {!isOwnProfile && (
            <View style={styles.socialActionGroup}>
              {/* Follow Button */}
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  isFollowing
                    ? [styles.followingBtnActive, { borderColor: colors.border, backgroundColor: isDark ? '#27272A' : '#F3F4F6' }]
                    : { backgroundColor: colors.primary },
                ]}
                onPress={handleToggleFollow}
                disabled={followLoading}
                activeOpacity={0.8}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={[styles.followingBtnText, { color: colors.text }]}>Following</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.followBtnText}>Follow</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Connect Button */}
              <TouchableOpacity
                style={[
                  styles.connectBtn,
                  connectionStatus === 'accepted'
                    ? { backgroundColor: '#ECFDF5', borderColor: '#10B981' }
                    : connectionStatus === 'pending_sent'
                    ? { backgroundColor: isDark ? '#27272A' : '#F3F4F6', borderColor: colors.border }
                    : connectionStatus === 'pending_received'
                    ? { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }
                    : { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: colors.border },
                ]}
                onPress={handleConnectionAction}
                disabled={connectionLoading}
                activeOpacity={0.8}
              >
                {connectionStatus === 'accepted' ? (
                  <>
                    <Users size={15} color="#059669" style={{ marginRight: 5 }} />
                    <Text style={[styles.connectBtnText, { color: '#059669' }]}>Connected</Text>
                  </>
                ) : connectionStatus === 'pending_sent' ? (
                  <>
                    <Clock size={15} color={colors.textSecondary} style={{ marginRight: 5 }} />
                    <Text style={[styles.connectBtnText, { color: colors.textSecondary }]}>Pending</Text>
                  </>
                ) : connectionStatus === 'pending_received' ? (
                  <>
                    <Check size={15} color="#2563EB" style={{ marginRight: 5 }} />
                    <Text style={[styles.connectBtnText, { color: '#2563EB' }]}>Accept</Text>
                  </>
                ) : (
                  <>
                    <Link2 size={15} color={colors.text} style={{ marginRight: 5 }} />
                    <Text style={[styles.connectBtnText, { color: colors.text }]}>Connect</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Direct Message Icon Button */}
              <TouchableOpacity
                style={[styles.messageIconBtn, { backgroundColor: isDark ? '#27272A' : '#F3F4F6', borderColor: colors.border }]}
                onPress={handleOpenMessage}
                activeOpacity={0.8}
              >
                <MessageCircle size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}

          {/* Admin Dashboard Entry (Visible ONLY to Staff / Admins) */}
          {isOwnProfile && profile?.is_admin && (
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

          {/* Edit Profile Action Button (If Own Profile) */}
          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: isDark ? '#27272A' : '#F3F4F6', borderColor: colors.border }]}
              onPress={handleOpenEdit}
            >
              <Edit3 size={15} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={[styles.editProfileBtnText, { color: colors.text }]}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          {/* Theme Mode Switcher (Light / Dark) */}
          {isOwnProfile && (
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
          )}
        </View>

        {/* User Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>
            {isOwnProfile ? 'Your Posts' : `${profile?.name || 'User'}'s Posts`} ({posts.length})
          </Text>

          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                {isOwnProfile
                  ? 'Share thoughts, project updates, or course notes with your university campus.'
                  : 'This student has not shared any campus updates yet.'}
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
                    {isOwnProfile && (
                      <TouchableOpacity
                        style={styles.postDeleteBtn}
                        onPress={() => handleDeletePost(post.id)}
                      >
                        <Trash2 size={13} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Followers & Following Bottom Sheet / Modal */}
      <Modal
        visible={!!socialModalType}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSocialModalType(null)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {socialModalType === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSocialModalType(null)}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {socialListLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : socialList.length === 0 ? (
            <View style={styles.emptySocialList}>
              <Users size={32} color={colors.textSecondary} style={{ marginBottom: 10 }} />
              <Text style={styles.emptySocialTitle}>
                {socialModalType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
              <Text style={styles.emptySocialSubtitle}>
                {socialModalType === 'followers'
                  ? 'When students follow this profile, they will appear here.'
                  : 'Profiles followed by this student will be listed here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={socialList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.socialListItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSocialModalType(null);
                    if (item.id === currentUserId) {
                      navigation.navigate('MainTabs', { screen: 'Profile' });
                    } else {
                      navigation.push('Profile', { userId: item.id });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.miniAvatar} />
                  ) : (
                    <View style={styles.miniAvatarPlaceholder}>
                      <Text style={styles.miniAvatarText}>
                        {(item.name || item.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.socialListName, { color: colors.text }]}>
                        {item.name || item.username || 'Student'}
                      </Text>
                      {item.is_verified && <CheckCircle2 size={13} color={colors.primary} />}
                    </View>
                    <Text style={styles.socialListUsername}>@{item.username || 'student'}</Text>
                    {item.university && (
                      <Text style={styles.socialListUniv} numberOfLines={1}>
                        🎓 {item.university}
                      </Text>
                    )}
                  </View>

                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.saveBtn}
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

      {/* Report Offence / User Modal */}
      {profile && !isOwnProfile && (
        <ReportModal
          visible={reportModalVisible}
          targetUserId={profile.id}
          targetUserName={profile.name || profile.username || 'student'}
          onClose={() => setReportModalVisible(false)}
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
  campusProximityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  campusProximityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  skillChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  socialChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialChipText: {
    fontSize: 11,
    fontWeight: '600',
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
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  socialActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  followBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  followingBtnActive: {
    borderWidth: 1,
  },
  followingBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  connectBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  messageIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Social Modal List
  emptySocialList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptySocialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySocialSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  socialListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  miniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  miniAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  socialListName: {
    fontSize: 14,
    fontWeight: '700',
  },
  socialListUsername: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  socialListUniv: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

