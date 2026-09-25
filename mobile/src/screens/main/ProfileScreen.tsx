import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Edit3,
  X,
  Check,
  Globe,
  MapPin,
  Moon,
  Sun,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  Share2,
  Sparkles,
  Link2,
  ExternalLink,
  ChevronDown,
  Plus,
  Grid,
  Film,
  Repeat2,
  Tag,
  Menu,
  Play,
  Pause,
  Bookmark,
  Shield,
  Headphones,
  Radio,
  Download,
  Trash2,
  ChevronRight,
  HardDrive,
  Flame,
  FileText,
  Lock,
  Users,
  AlertTriangle,
  Bug,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ReportModal, BugReportModal } from '../../components/ReportModal';
import { LegalModal, LegalDocType } from '../../components/LegalModal';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { uploadService } from '../../services/uploadService';
import { extractYouTubeId } from '../../utils/videoUtils';
import { audioService, PlaybackState, AudioTrack } from '../../services/audioService';
import { getOfflineDownloads, removeDownloadedEpisode, OfflineEpisode } from '../../services/downloadService';
import { FeedService } from '../../services/feedService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 6) / 3;

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
  video_url?: string | null;
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

const MOCK_GRID_POSTS: UserPost[] = [
  {
    id: 'p1',
    content: 'Eco303 Structure of Nigerian Economy notes ready! 📚',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    likes_count: 34,
    comments_count: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    content: 'Campus sunset at UI 🌇',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    likes_count: 89,
    comments_count: 12,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'p3',
    content: 'Study session essentials ☕️',
    image_url: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?auto=format&fit=crop&w=600&q=80',
    likes_count: 45,
    comments_count: 3,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'p4',
    content: 'UniLink Launch Announcement 🚀',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    likes_count: 120,
    comments_count: 18,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'p5',
    content: 'New Podcast Episode drops tonight! 🎙',
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    likes_count: 67,
    comments_count: 9,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

// Offline Podcast Downloads (starts empty — populated when user actually downloads episodes)

export default function ProfileScreen({ navigation, route }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [bugReportModalVisible, setBugReportModalVisible] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const routeUserId = route?.params?.userId;
  const isOwnProfile = !routeUserId || routeUserId === currentUserId;

  // Active Grid Tab: 'grid' | 'reels' | 'reposts' | 'saved'
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'reposts' | 'saved'>('grid');
  const [savedPosts, setSavedPosts] = useState<UserPost[]>([]);

  // Status Note State
  const [noteText, setNoteText] = useState<string>("Can't decide...");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [tempNoteInput, setTempNoteInput] = useState('');

  // Hamburger Settings Drawer Modal State
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  // Legal Modal State (Play Store UGC compliance)
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType>('terms');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Delete Account Handler (Mandatory Google Play Store Policy)
  const handleDeleteAccount = () => {
    setIsMenuDrawerOpen(false);
    Alert.alert(
      'Delete Account & Personal Data',
      'Are you sure you want to permanently delete your UniLink account? This will erase your profile, posts, comments, and uploaded files. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              if (currentUserId) {
                await supabase.from('posts').delete().eq('author_id', currentUserId);
                await supabase.from('comments').delete().eq('author_id', currentUserId);
                await supabase.from('profiles').delete().eq('id', currentUserId);
              }
              await supabase.auth.signOut();
              await logout();
              Alert.alert('Account Deleted', 'Your account and data have been permanently removed.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account. Please try again.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  // Offline Downloads Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineDownloads, setOfflineDownloads] = useState<OfflineEpisode[]>([]);

  // Load real downloads from device storage on mount and when modal opens
  const loadOfflineDownloads = useCallback(async () => {
    const downloads = await getOfflineDownloads();
    setOfflineDownloads(downloads);
  }, []);

  useEffect(() => {
    loadOfflineDownloads();
  }, [loadOfflineDownloads]);

  // Audio Playback state for offline player preview
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());

  // Social Interaction States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  // Followers / Following Modal State
  const [socialModalType, setSocialModalType] = useState<'followers' | 'following' | null>(null);
  const [socialList, setSocialList] = useState<MiniStudent[]>([]);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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
    background_image_url: '',
  });

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setPlaybackState);
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id;
      if (currentUid) setCurrentUserId(currentUid);

      const targetUid = routeUserId || currentUid;

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

          setEditForm({
            name: userProf.name || '',
            username: userProf.username || '',
            headline: userProf.headline || '',
            about: userProf.about || '',
            university: userProf.university || '',
            location: userProf.location || '',
            skills: Array.isArray(userProf.skills) ? userProf.skills.join(', ') : userProf.skills || '',
            website_url: userProf.website_url || '',
            github_url: userProf.github_url || '',
            linkedin_url: userProf.linkedin_url || '',
            twitter_url: userProf.twitter_url || '',
            avatar_url: userProf.avatar_url || '',
            background_image_url: userProf.background_image_url || '',
          });
        }

        // 2. Fetch posts and saved bookmarks in parallel
        const [postsRes, savedList] = await Promise.all([
          supabase
            .from('posts')
            .select('id, content, image_url, image_urls, video_url, likes_count, comments_count, created_at, is_repost, original_post_id')
            .eq('author_id', targetUid)
            .order('created_at', { ascending: false }),
          FeedService.getSavedPosts(targetUid),
        ]);

        if (postsRes.data) {
          const fetchedPosts = postsRes.data as UserPost[];
          setPosts(fetchedPosts);
          setPostsCount(fetchedPosts.filter((p: any) => !p.is_repost).length);
        } else {
          setPosts([]);
          setPostsCount(0);
        }

        setSavedPosts((savedList || []) as UserPost[]);
      }
    } catch (error: any) {
      console.warn('Error fetching profile:', error);
      setPosts([]);
      setSavedPosts([]);
      setPostsCount(0);
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

  const loadSavedPosts = useCallback(async () => {
    const targetUid = routeUserId || currentUserId || useAuthStore.getState().userId;
    if (targetUid) {
      const saved = await FeedService.getSavedPosts(targetUid);
      setSavedPosts((saved || []) as UserPost[]);
    }
  }, [routeUserId, currentUserId]);

  const handlePickAvatar = async () => {
    try {
      setUploadingAvatar(true);
      const picked = await uploadService.pickImages(1);
      if (picked && picked.length > 0) {
        const publicUrl = await uploadService.uploadFile(picked[0], 'avatars');
        setEditForm((p) => ({ ...p, avatar_url: publicUrl }));
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Could not upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePickCover = async () => {
    try {
      setUploadingCover(true);
      const picked = await uploadService.pickImages(1);
      if (picked && picked.length > 0) {
        const publicUrl = await uploadService.uploadFile(picked[0], 'covers');
        setEditForm((p) => ({ ...p, background_image_url: publicUrl }));
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Could not upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUserId || !profile?.id || isOwnProfile || followLoading) return;
    setFollowLoading(true);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextFollowing) {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id });
      } else {
        await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id);
      }
    } catch (err) {
      console.warn('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = async () => {
    const handle = profile?.username || 'user';
    try {
      await Share.share({
        message: `Check out ${profile?.name || handle}'s profile on UniLink: https://unilink.ng/u/${handle}`,
      });
    } catch {}
  };

  const handleOpenLink = (url: string | null) => {
    if (!url) return;
    const formatted = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formatted).catch(() => {});
  };

  const handleSaveProfile = async () => {
    if (!profile?.id || savingProfile) return;
    setSavingProfile(true);
    try {
      const skillsArray = editForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name.trim() || null,
          username: editForm.username.trim() || null,
          headline: editForm.headline.trim() || null,
          about: editForm.about.trim() || null,
          university: editForm.university.trim() || null,
          location: editForm.location.trim() || null,
          website_url: editForm.website_url.trim() || null,
          github_url: editForm.github_url.trim() || null,
          linkedin_url: editForm.linkedin_url.trim() || null,
          twitter_url: editForm.twitter_url.trim() || null,
          avatar_url: editForm.avatar_url.trim() || null,
          background_image_url: editForm.background_image_url.trim() || null,
          skills: skillsArray,
        })
        .eq('id', profile.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchProfileData();
      Alert.alert('Profile Saved', 'Your profile details have been updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Play an offline podcast episode
  const handlePlayOfflineEpisode = (ep: any) => {
    audioService.play(ep.audio_url, {
      id: ep.id,
      title: ep.title,
      hostName: ep.showTitle,
      coverUrl: ep.cover_url,
      durationSeconds: ep.duration_seconds,
    });
  };

  // Delete an offline podcast episode (removes from disk + AsyncStorage)
  const handleDeleteOfflineEpisode = (epId: string) => {
    Alert.alert('Remove Download', 'Remove this episode from offline storage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          // Optimistic UI update
          setOfflineDownloads((prev) => prev.filter((e) => e.id !== epId));
          try {
            await removeDownloadedEpisode(epId);
          } catch {
            // Re-sync if removal fails
            loadOfflineDownloads();
          }
        },
      },
    ]);
  };

  const displayName = profile?.name || profile?.username || 'UniLink Scholar';
  const displayUsername = profile?.username || 'student';
  const displayHeadline = profile?.headline || profile?.university || 'Campus Scholar';
  const displayAbout = profile?.about || '';
  const displayWebsite = profile?.website_url || '';

  const displayedPosts = useMemo(() => {
    if (activeTab === 'grid') {
      return posts.filter((p: any) => !p.is_repost);
    }
    if (activeTab === 'reels') {
      return posts.filter((p: any) => p.video_url || extractYouTubeId(p.content || '') || extractYouTubeId(p.video_url || ''));
    }
    if (activeTab === 'reposts') {
      return posts.filter((p: any) => p.is_repost);
    }
    if (activeTab === 'saved') {
      return savedPosts;
    }
    return posts;
  }, [activeTab, posts, savedPosts]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* ── 1. Top Header ────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        {/* Left: Create icon */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Create' as never)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Plus size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        {/* Center: Username Dropdown & Verification */}
        <View style={styles.usernameDropdownRow}>
          <Text style={[styles.headerUsername, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            {displayUsername}
          </Text>
          {profile?.is_verified && (
            <VerifiedBadge size={14} isGold={profile?.is_admin} />
          )}
        </View>

        {/* Right: Theme Toggle & Hamburger Drawer Menu */}
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={toggleTheme}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isDark ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#3B82F6" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setIsMenuDrawerOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Menu size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {/* ── 2. Profile Info & Stats Row ──────────────────────────────── */}
        <View style={styles.profileInfoRow}>
          {/* Avatar with Status Bubble */}
          <View style={styles.avatarSection}>
            {/* Note Speech Bubble */}
            <TouchableOpacity
              style={[
                styles.thoughtBubble,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2E2E32' : '#E5E7EB' },
              ]}
              activeOpacity={0.85}
              onPress={() => {
                setTempNoteInput(noteText);
                setIsNoteModalOpen(true);
              }}
            >
              <Text style={[styles.thoughtBubbleText, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
                {noteText || 'Thought...'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarWrapper}
              activeOpacity={0.9}
              onPress={() => {
                if (isOwnProfile) {
                  setIsEditModalOpen(true);
                }
              }}
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(displayName || 'S')[0].toUpperCase()}
                  </Text>
                </View>
              )}
              {isOwnProfile && (
                <View style={styles.avatarPlusBadge}>
                  <Plus size={11} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Horizontal Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {postsCount}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#000000' }]}>posts</Text>
            </View>

            <TouchableOpacity
              style={styles.statCol}
              onPress={() => setSocialModalType('followers')}
            >
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {followersCount}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#000000' }]}>followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCol}
              onPress={() => setSocialModalType('following')}
            >
              <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A1A1AA' : '#000000' }]}>following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Bio & Links Section ──────────────────────────────────── */}
        <View style={styles.bioContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.bioName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {displayName}
            </Text>
            {profile?.is_verified && (
              <VerifiedBadge size={15} isGold={profile?.is_admin} />
            )}
          </View>

          {displayHeadline ? (
            <Text style={[styles.bioHeadline, { color: isDark ? '#E4E4E7' : '#1F2937' }]}>
              {displayHeadline}
            </Text>
          ) : null}

          {displayAbout ? (
            <Text style={[styles.bioAbout, { color: isDark ? '#A1A1AA' : '#4B5563' }]}>
              {displayAbout}
            </Text>
          ) : null}

          {/* Website Link */}
          {displayWebsite ? (
            <TouchableOpacity
              style={styles.websiteRow}
              onPress={() => handleOpenLink(displayWebsite)}
              activeOpacity={0.7}
            >
              <Link2 size={14} color="#3B82F6" style={{ marginRight: 4 }} />
              <Text style={styles.websiteText}>{displayWebsite}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Dynamic Skills, University & Social Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollRow}
          >
            {profile?.university ? (
              <View style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}>
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🎓 {profile.university}
                </Text>
              </View>
            ) : null}

            {profile?.location ? (
              <View style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}>
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  📍 {profile.location}
                </Text>
              </View>
            ) : null}

            {Array.isArray(profile?.skills) &&
              profile.skills.map((skill, idx) => (
                <View
                  key={idx}
                  style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}
                >
                  <Text style={[styles.chipText, { color: '#3B82F6', fontWeight: '700' }]}>
                    #{skill}
                  </Text>
                </View>
              ))}

            {profile?.github_url ? (
              <TouchableOpacity
                style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}
                onPress={() => handleOpenLink(profile.github_url)}
              >
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🐙 GitHub
                </Text>
              </TouchableOpacity>
            ) : null}

            {profile?.linkedin_url ? (
              <TouchableOpacity
                style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}
                onPress={() => handleOpenLink(profile.linkedin_url)}
              >
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  💼 LinkedIn
                </Text>
              </TouchableOpacity>
            ) : null}

            {profile?.twitter_url ? (
              <TouchableOpacity
                style={[styles.chipPill, { backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }]}
                onPress={() => handleOpenLink(profile.twitter_url)}
              >
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  🐦 X / Twitter
                </Text>
              </TouchableOpacity>
            ) : null}

            {isOwnProfile && (
              <TouchableOpacity
                style={[styles.chipPill, styles.addChipPill, { backgroundColor: isDark ? '#27272A' : '#E5E7EB' }]}
                onPress={() => setIsEditModalOpen(true)}
              >
                <Plus size={12} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginRight: 3 }} />
                <Text style={[styles.chipText, { color: isDark ? '#FFFFFF' : '#000000', fontWeight: '700' }]}>
                  Edit Details
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* ── 4. Quick Access Bar (Podcasts & Offline Downloads) ───────── */}
        {isOwnProfile && (
          <View style={styles.quickBannerRow}>
            {/* Go to Podcasts */}
            <TouchableOpacity
              style={[styles.quickBannerCard, { backgroundColor: isDark ? '#181822' : '#F3F4F6' }]}
              onPress={() => navigation.navigate('Podcasts' as never)}
              activeOpacity={0.85}
            >
              <View style={styles.quickBannerIconCircle}>
                <Radio size={16} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.quickBannerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Campus Podcasts
                </Text>
                <Text style={styles.quickBannerSub}>Audio Hub & Studio</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Offline Downloads */}
            <TouchableOpacity
              style={[styles.quickBannerCard, { backgroundColor: isDark ? '#181822' : '#F3F4F6' }]}
              onPress={() => { loadOfflineDownloads(); setIsOfflineModalOpen(true); }}
              activeOpacity={0.85}
            >
              <View style={[styles.quickBannerIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Download size={16} color="#3B82F6" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.quickBannerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Offline Downloads
                </Text>
                <Text style={styles.quickBannerSub}>{offlineDownloads.length} Episodes saved</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── 5. Action Buttons Row (Edit profile | Share profile | +👤) ── */}
        <View style={styles.actionButtonsRow}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#26262B' : '#EFEFEF' }]}
                onPress={() => setIsEditModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryActionBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Edit profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#26262B' : '#EFEFEF' }]}
                onPress={handleShareProfile}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryActionBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Share profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconActionBtn, { backgroundColor: isDark ? '#26262B' : '#EFEFEF' }]}
                onPress={() => navigation.navigate('Network' as never)}
                activeOpacity={0.8}
              >
                <UserPlus size={18} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: isFollowing ? (isDark ? '#26262B' : '#EFEFEF') : '#3B82F6' },
                ]}
                onPress={handleToggleFollow}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.primaryActionBtnText,
                    { color: isFollowing ? (isDark ? '#FFFFFF' : '#000000') : '#FFFFFF' },
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: isDark ? '#26262B' : '#EFEFEF' }]}
                onPress={() =>
                  navigation.navigate('Messages' as never, {
                    targetUser: {
                      id: profile?.id,
                      name: profile?.name,
                      username: profile?.username,
                      avatar_url: profile?.avatar_url,
                      is_verified: profile?.is_verified,
                    },
                  } as never)
                }
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryActionBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconActionBtn, { backgroundColor: isDark ? '#26262B' : '#EFEFEF' }]}
                onPress={handleShareProfile}
                activeOpacity={0.8}
              >
                <Share2 size={18} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── 6. Grid Tab Bar (Grid | Reels | Reposts | Saved) ───────── */}
        <View style={[styles.gridTabBar, { borderBottomColor: isDark ? '#26262B' : '#E5E7EB' }]}>
          <TouchableOpacity
            style={[styles.gridTabBtn, activeTab === 'grid' && styles.gridTabBtnActive]}
            onPress={() => setActiveTab('grid')}
          >
            <Grid
              size={22}
              color={activeTab === 'grid' ? (isDark ? '#FFFFFF' : '#000000') : '#8E8E93'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridTabBtn, activeTab === 'reels' && styles.gridTabBtnActive]}
            onPress={() => setActiveTab('reels')}
          >
            <Film
              size={22}
              color={activeTab === 'reels' ? (isDark ? '#FFFFFF' : '#000000') : '#8E8E93'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridTabBtn, activeTab === 'reposts' && styles.gridTabBtnActive]}
            onPress={() => setActiveTab('reposts')}
          >
            <Repeat2
              size={22}
              color={activeTab === 'reposts' ? (isDark ? '#FFFFFF' : '#000000') : '#8E8E93'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridTabBtn, activeTab === 'saved' && styles.gridTabBtnActive]}
            onPress={() => {
              setActiveTab('saved');
              loadSavedPosts();
            }}
          >
            <Bookmark
              size={22}
              color={activeTab === 'saved' ? (isDark ? '#FFFFFF' : '#000000') : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>

        {/* ── 7. 3-Column Content Grid (with Video Previews & Tab-Specific Empty State) ── */}
        {displayedPosts.length === 0 ? (
          <View style={styles.emptyGridContainer}>
            {activeTab === 'grid' && <Grid size={38} color={isDark ? '#3F3F4E' : '#D1D5DB'} />}
            {activeTab === 'reels' && <Film size={38} color={isDark ? '#3F3F4E' : '#D1D5DB'} />}
            {activeTab === 'reposts' && <Repeat2 size={38} color={isDark ? '#3F3F4E' : '#D1D5DB'} />}
            {activeTab === 'saved' && <Bookmark size={38} color={isDark ? '#3F3F4E' : '#D1D5DB'} />}

            <Text style={[styles.emptyGridTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {activeTab === 'grid' && 'No Posts Yet'}
              {activeTab === 'reels' && 'No Videos Yet'}
              {activeTab === 'reposts' && 'No Reshared Posts'}
              {activeTab === 'saved' && 'No Saved Posts'}
            </Text>
            <Text style={styles.emptyGridSubtitle}>
              {activeTab === 'grid' && (isOwnProfile ? 'Share notes, questions, or campus moments with peers.' : 'This student hasn’t posted any content yet.')}
              {activeTab === 'reels' && (isOwnProfile ? 'Share short study clips, lecture clips, or campus moments.' : 'No videos shared yet.')}
              {activeTab === 'reposts' && (isOwnProfile ? 'Posts you reshared from the campus feed will appear here.' : 'No reshared posts by this student.')}
              {activeTab === 'saved' && 'Save posts and videos by tapping the bookmark icon in the feed.'}
            </Text>

            {isOwnProfile && (
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => {
                  if (activeTab === 'saved' || activeTab === 'reposts') {
                    navigation.navigate('Feed' as never);
                  } else {
                    navigation.navigate('Create' as never);
                  }
                }}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyCreateBtnText}>
                  {activeTab === 'saved' || activeTab === 'reposts' ? 'Explore Feed' : 'Create Post'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {displayedPosts.map((p, idx) => {
              const ytId = extractYouTubeId(p.content || '') || extractYouTubeId(p.video_url || '');
              const isVideo = Boolean(p.video_url || ytId);
              const previewThumb =
                p.image_url ||
                (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

              return (
                <TouchableOpacity
                  key={p.id || idx}
                  style={styles.gridTile}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('Feed' as never)}
                >
                  {previewThumb ? (
                    <Image source={{ uri: previewThumb }} style={styles.gridTileImage} />
                  ) : (
                    <View
                      style={[
                        styles.gridTileImage,
                        styles.gridTilePlaceholder,
                        { backgroundColor: isDark ? '#1C1C22' : '#F3F4F6' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.gridTileText,
                          { color: isDark ? '#A1A1AA' : '#6B7280' },
                        ]}
                        numberOfLines={4}
                      >
                        {p.content}
                      </Text>
                    </View>
                  )}

                  {isVideo && (
                    <View style={styles.videoIndicatorBadge}>
                      <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  )}

                  {(p as any).is_repost && (
                    <View style={styles.repostIndicatorBadge}>
                      <Repeat2 size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── 8. HAMBURGER SETTINGS DRAWER MODAL (Admin Access + Podcasts + Offline) ── */}
      <Modal
        visible={isMenuDrawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMenuDrawerOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuModalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuDrawerOpen(false)}
        >
          <View style={[styles.menuDrawerSheet, { backgroundColor: isDark ? '#14141B' : '#FFFFFF' }]}>
            <View style={styles.menuDrawerHandle} />

            <View style={styles.menuDrawerHeader}>
              <Text style={[styles.menuDrawerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Menu & Settings
              </Text>
              <TouchableOpacity onPress={() => setIsMenuDrawerOpen(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: SCREEN_HEIGHT * 0.65 }}>
              {/* ── 🛡️ ADMIN ACCESS BUTTON ─────────────────────────── */}
              <TouchableOpacity
                style={[styles.menuOptionRow, styles.adminHighlightRow]}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  navigation.navigate('Admin' as never);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Shield size={20} color="#F59E0B" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.menuOptionTitle, { color: '#F59E0B' }]}>Admin Access</Text>
                    <View style={styles.adminTagBadge}>
                      <Text style={styles.adminTagBadgeText}>PORTAL</Text>
                    </View>
                  </View>
                  <Text style={styles.menuOptionSub}>
                    Verification, moderation, show approvals & broadcasts
                  </Text>
                </View>
                <ChevronRight size={18} color="#F59E0B" />
              </TouchableOpacity>

              {/* ── 🎙️ GO TO PODCASTS BUTTON ────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  navigation.navigate('Podcasts' as never);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Radio size={20} color="#10B981" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Podcasts & Audio Hub
                  </Text>
                  <Text style={styles.menuOptionSub}>
                    Explore campus shows, trending episodes & host studio
                  </Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── 📥 OFFLINE DOWNLOADS BUTTON ─────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setIsOfflineModalOpen(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Download size={20} color="#3B82F6" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Offline Downloads
                  </Text>
                  <Text style={styles.menuOptionSub}>
                    Listen to downloaded podcasts without internet
                  </Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── ✏️ EDIT PROFILE ─────────────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setIsEditModalOpen(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#F3F4F6' }]}>
                  <Edit3 size={18} color={isDark ? '#FFFFFF' : '#111827'} />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Edit Profile
                  </Text>
                  <Text style={styles.menuOptionSub}>Update bio, skills & handles</Text>
                </View>
              </TouchableOpacity>

              {/* ── 🌓 THEME TOGGLE ──────────────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={toggleTheme}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#F3F4F6' }]}>
                  {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#3B82F6" />}
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                  <Text style={styles.menuOptionSub}>Switch app color theme</Text>
                </View>
              </TouchableOpacity>

              {/* ── 📜 TERMS OF SERVICE & EULA ────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setLegalModalDoc('terms');
                  setLegalModalVisible(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#F3F4F6' }]}>
                  <FileText size={18} color="#3B82F6" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Terms & EULA
                  </Text>
                  <Text style={styles.menuOptionSub}>End User License Agreement & Rules</Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── 🔒 PRIVACY POLICY ─────────────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setLegalModalDoc('privacy');
                  setLegalModalVisible(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#F3F4F6' }]}>
                  <Lock size={18} color="#10B981" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Privacy Policy
                  </Text>
                  <Text style={styles.menuOptionSub}>Data safety & student privacy details</Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── 🛡️ COMMUNITY GUIDELINES ────────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setLegalModalDoc('guidelines');
                  setLegalModalVisible(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#F3F4F6' }]}>
                  <Users size={18} color="#8B5CF6" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Community Guidelines
                  </Text>
                  <Text style={styles.menuOptionSub}>Anti-harassment & safety guidelines</Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── 🐞 REPORT ISSUE OR BUG ────────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  setBugReportModalVisible(true);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: isDark ? '#22222E' : '#FEE2E2' }]}>
                  <Bug size={18} color="#EF4444" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Report Issue or Bug
                  </Text>
                  <Text style={styles.menuOptionSub}>Let us know if something isn't working</Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>

              {/* ── ⚠️ DELETE ACCOUNT & DATA ──────────────────────────── */}
              <TouchableOpacity
                style={styles.menuOptionRow}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Trash2 size={18} color="#EF4444" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: '#EF4444' }]}>
                    Delete Account & Data
                  </Text>
                  <Text style={styles.menuOptionSub}>Permanently erase your account and content</Text>
                </View>
              </TouchableOpacity>

              {/* ── 🚪 LOG OUT ───────────────────────────────────────── */}
              <TouchableOpacity
                style={[styles.menuOptionRow, styles.logoutRow]}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  Alert.alert('Log Out', 'Are you sure you want to log out of UniLink?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', style: 'destructive', onPress: () => logout() },
                  ]);
                }}
              >
                <View style={[styles.menuOptionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <LogOut size={18} color="#EF4444" />
                </View>
                <View style={styles.menuOptionTextCol}>
                  <Text style={[styles.menuOptionTitle, { color: '#EF4444' }]}>Log Out</Text>
                  <Text style={styles.menuOptionSub}>Sign out of your account</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 9. OFFLINE PODCAST DOWNLOADS MODAL ───────────────────────── */}
      <Modal
        visible={isOfflineModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOfflineModalOpen(false)}
      >
        <View style={styles.offlineModalOverlay}>
          <SafeAreaView style={[styles.offlineSheet, { backgroundColor: isDark ? '#101016' : '#FFFFFF' }]}>
            {/* Header */}
            <View style={styles.offlineHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Download size={20} color="#10B981" />
                <Text style={[styles.offlineTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Offline Downloads
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsOfflineModalOpen(false)}>
                <X size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Storage Usage Banner */}
            <View style={[styles.storageBanner, { backgroundColor: isDark ? '#181822' : '#F3F4F6' }]}>
              <HardDrive size={18} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.storageBannerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {offlineDownloads.length} Episodes Downloaded
                </Text>
                <Text style={styles.storageBannerSub}>
                  43.4 MB Storage Used • Playable without internet
                </Text>
              </View>
            </View>

            {/* Offline Episodes List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {offlineDownloads.length === 0 ? (
                <View style={styles.emptyOfflineContainer}>
                  <Download size={40} color="#9CA3AF" />
                  <Text style={[styles.emptyOfflineTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    No Offline Podcasts Yet
                  </Text>
                  <Text style={styles.emptyOfflineSub}>
                    Tap the download icon on any podcast episode to save it for offline listening on campus.
                  </Text>
                </View>
              ) : (
                offlineDownloads.map((ep) => {
                  const isPlaying = playbackState.currentUri === ep.audio_url && playbackState.isPlaying;

                  return (
                    <View
                      key={ep.id}
                      style={[
                        styles.offlineEpisodeItem,
                        {
                          backgroundColor: isDark ? '#161620' : '#F9F9FB',
                          borderColor: isPlaying ? '#10B981' : (isDark ? '#262636' : '#E5E7EB'),
                        },
                      ]}
                    >
                      <Image source={{ uri: ep.cover_url }} style={styles.offlineEpThumb} />

                      <View style={styles.offlineEpInfo}>
                        <Text style={[styles.offlineEpTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
                          {ep.title}
                        </Text>
                        <Text style={styles.offlineEpMeta}>
                          {ep.showTitle} • {ep.file_size} • {Math.floor(ep.duration_seconds / 60)} min
                        </Text>
                      </View>

                      {/* Controls */}
                      <View style={styles.offlineControlsRow}>
                        {/* Play Offline */}
                        <TouchableOpacity
                          style={[styles.offlinePlayBtn, isPlaying && styles.offlinePlayBtnPlaying]}
                          onPress={() => handlePlayOfflineEpisode(ep)}
                        >
                          {isPlaying ? (
                            <Pause size={14} color="#000000" fill="#000000" />
                          ) : (
                            <Play size={14} color="#000000" fill="#000000" style={{ marginLeft: 2 }} />
                          )}
                        </TouchableOpacity>

                        {/* Delete Download */}
                        <TouchableOpacity
                          style={styles.offlineTrashBtn}
                          onPress={() => handleDeleteOfflineEpisode(ep.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── Status Note Modal ───────────────────────────────────────── */}
      <Modal
        visible={isNoteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNoteModalOpen(false)}
      >
        <View style={styles.noteModalOverlay}>
          <View style={[styles.noteModalBox, { backgroundColor: isDark ? '#1E1E24' : '#FFFFFF' }]}>
            <Text style={[styles.noteModalHeading, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Share a thought...
            </Text>
            <TextInput
              style={[
                styles.noteTextInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#2C2C34' : '#F4F4F5',
                  borderColor: isDark ? '#3F3F4A' : '#E5E7EB',
                },
              ]}
              placeholder="What's on your mind? (e.g. Studying at UI library)"
              placeholderTextColor="#9CA3AF"
              maxLength={60}
              value={tempNoteInput}
              onChangeText={setTempNoteInput}
            />

            <View style={styles.noteModalButtonsRow}>
              <TouchableOpacity
                style={[styles.noteBtn, styles.noteCancelBtn]}
                onPress={() => setIsNoteModalOpen(false)}
              >
                <Text style={styles.noteCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.noteBtn, styles.noteSaveBtn]}
                onPress={() => {
                  setNoteText(tempNoteInput.trim() || "Can't decide...");
                  setIsNoteModalOpen(false);
                }}
              >
                <Text style={styles.noteSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Profile Modal ──────────────────────────────────────── */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.editModalOverlay}>
          <SafeAreaView style={[styles.editModalSheet, { backgroundColor: isDark ? '#121218' : '#FFFFFF' }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <X size={22} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Photo & Banner Upload Row */}
              <View style={styles.mediaUploadSection}>
                {/* Profile Picture */}
                <View style={styles.photoUploadCol}>
                  {editForm.avatar_url ? (
                    <Image source={{ uri: editForm.avatar_url }} style={styles.editAvatarPreview} />
                  ) : (
                    <View style={[styles.editAvatarPreview, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {(editForm.name || 'S')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.uploadPhotoBtn, { backgroundColor: isDark ? '#262634' : '#F3F4F6' }]}
                    onPress={handlePickAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                      <Text style={[styles.uploadPhotoBtnText, { color: '#3B82F6' }]}>
                        Change Photo
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Banner Image */}
                <View style={styles.photoUploadCol}>
                  {editForm.background_image_url ? (
                    <Image source={{ uri: editForm.background_image_url }} style={styles.editBannerPreview} />
                  ) : (
                    <View style={[styles.editBannerPreview, { backgroundColor: isDark ? '#262634' : '#F3F4F6' }]}>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>No Banner</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.uploadPhotoBtn, { backgroundColor: isDark ? '#262634' : '#F3F4F6' }]}
                    onPress={handlePickCover}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                      <Text style={[styles.uploadPhotoBtnText, { color: '#3B82F6' }]}>
                        Change Banner
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Basic Details */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. Ayegbeni Daniel"
                placeholderTextColor="#8E8E93"
                value={editForm.name}
                onChangeText={(text) => setEditForm((p) => ({ ...p, name: text }))}
              />

              <Text style={styles.inputLabel}>Username (@handle)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. daniel_dev"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={editForm.username}
                onChangeText={(text) => setEditForm((p) => ({ ...p, username: text }))}
              />

              <Text style={styles.inputLabel}>Headline / Catchphrase</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. Computer Science Student | UI'26"
                placeholderTextColor="#8E8E93"
                value={editForm.headline}
                onChangeText={(text) => setEditForm((p) => ({ ...p, headline: text }))}
              />

              <Text style={styles.inputLabel}>About / Bio</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="Tell peers about yourself, study interests, or campus projects..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
                value={editForm.about}
                onChangeText={(text) => setEditForm((p) => ({ ...p, about: text }))}
              />

              <Text style={styles.inputLabel}>University / Institution</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. University of Ibadan"
                placeholderTextColor="#8E8E93"
                value={editForm.university}
                onChangeText={(text) => setEditForm((p) => ({ ...p, university: text }))}
              />

              <Text style={styles.inputLabel}>Campus Location / Hall</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. Mellanby Hall, UI"
                placeholderTextColor="#8E8E93"
                value={editForm.location}
                onChangeText={(text) => setEditForm((p) => ({ ...p, location: text }))}
              />

              <Text style={styles.inputLabel}>Portfolio / Website URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. https://daniel.dev"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={editForm.website_url}
                onChangeText={(text) => setEditForm((p) => ({ ...p, website_url: text }))}
              />

              <Text style={styles.inputLabel}>GitHub Profile URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. https://github.com/daniel"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={editForm.github_url}
                onChangeText={(text) => setEditForm((p) => ({ ...p, github_url: text }))}
              />

              <Text style={styles.inputLabel}>LinkedIn Profile URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. https://linkedin.com/in/daniel"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={editForm.linkedin_url}
                onChangeText={(text) => setEditForm((p) => ({ ...p, linkedin_url: text }))}
              />

              <Text style={styles.inputLabel}>Twitter / X Profile URL</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. https://x.com/daniel"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                value={editForm.twitter_url}
                onChangeText={(text) => setEditForm((p) => ({ ...p, twitter_url: text }))}
              />

              <Text style={styles.inputLabel}>Skills & Interests (comma separated)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDark ? '#1E1E26' : '#F4F4F5', color: isDark ? '#FFFFFF' : '#000000' }]}
                placeholder="e.g. React Native, Python, Economics, Public Speaking"
                placeholderTextColor="#8E8E93"
                value={editForm.skills}
                onChangeText={(text) => setEditForm((p) => ({ ...p, skills: text }))}
              />

              <TouchableOpacity
                style={styles.saveProfileBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveProfileBtnText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── 10. Legal & Community Safety Modal (Play Store Compliance) ── */}
      <LegalModal
        visible={legalModalVisible}
        initialDoc={legalModalDoc}
        onClose={() => setLegalModalVisible(false)}
      />

      {/* ── 11. In-App Bug & Issue Reporting Modal ── */}
      <BugReportModal
        visible={bugReportModalVisible}
        onClose={() => setBugReportModalVisible(false)}
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
  },
  headerBtn: {
    padding: 6,
  },
  usernameDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  avatarSection: {
    alignItems: 'center',
    position: 'relative',
  },
  thoughtBubble: {
    position: 'absolute',
    top: -24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  thoughtBubbleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 4,
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  bioName: {
    fontSize: 14,
    fontWeight: '700',
  },
  bioHeadline: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  websiteText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  chipsScrollRow: {
    gap: 8,
    marginTop: 10,
  },
  chipPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick Access Bar
  quickBannerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  quickBannerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
  },
  quickBannerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickBannerSub: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTabBar: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
  },
  gridTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  gridTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridTile: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    padding: 1,
    position: 'relative',
  },
  gridTileImage: {
    width: '100%',
    height: '100%',
  },
  gridTilePlaceholder: {
    padding: 8,
    justifyContent: 'center',
  },
  gridTileText: {
    fontSize: 11,
    lineHeight: 15,
  },
  videoIndicatorBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 10,
  },
  repostIndicatorBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.75)',
    padding: 4,
    borderRadius: 10,
  },

  // Hamburger Drawer Styles
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  menuDrawerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  menuDrawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F4E',
    alignSelf: 'center',
    marginBottom: 14,
  },
  menuDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262634',
    marginBottom: 10,
  },
  menuDrawerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  adminHighlightRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  adminTagBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  adminTagBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  logoutRow: {
    borderTopWidth: 1,
    borderTopColor: '#262634',
    marginTop: 8,
    paddingTop: 14,
  },
  menuOptionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionTextCol: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuOptionSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },

  // Offline Downloads Modal Styles
  offlineModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  offlineSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262636',
    marginBottom: 14,
  },
  offlineTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  storageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  storageBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  storageBannerSub: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  emptyOfflineContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyOfflineTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyOfflineSub: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  offlineEpisodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  offlineEpThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  offlineEpInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  offlineEpTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  offlineEpMeta: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },
  offlineControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offlinePlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlinePlayBtnPlaying: {
    backgroundColor: '#34D399',
  },
  offlineTrashBtn: {
    padding: 6,
  },

  // Note Modal Styles
  noteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noteModalBox: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  noteModalHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  noteTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  noteModalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  noteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  noteCancelBtn: {
    backgroundColor: '#3F3F46',
  },
  noteCancelBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteSaveBtn: {
    backgroundColor: '#3B82F6',
  },
  noteSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  editModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
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
    fontSize: 17,
    fontWeight: '900',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  saveProfileBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Avatar Placeholder
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  bioAbout: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  // Media Upload Pickers
  mediaUploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 10,
  },
  photoUploadCol: {
    alignItems: 'center',
    gap: 8,
  },
  editAvatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  editBannerPreview: {
    width: 90,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  uploadPhotoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Empty Grid
  emptyGridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyGridTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyGridSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
