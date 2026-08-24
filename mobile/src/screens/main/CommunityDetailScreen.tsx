import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Users,
  Globe,
  Lock,
  Heart,
  MessageCircle,
  Repeat2,
  CheckCircle2,
  Send,
  X,
  Settings,
  Share2,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  Crown,
  UserMinus,
  UserPlus,
  Trash2,
  Camera,
  Check,
  Flag,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { AutoHeightImage } from '../../components/AutoHeightImage';
import { VideoPlayer } from '../../components/VideoPlayer';
import { FormattedText } from '../../components/FormattedText';
import { SocialSourceBadge } from '../../components/SocialSourceBadge';
import { PollCard } from '../../components/PollCard';
import { ReportModal } from '../../components/ReportModal';
import { extractYouTubeId, cleanVideoUrlsFromText } from '../../utils/videoUtils';
import { uploadService, PickedMedia } from '../../services/uploadService';
import { FeedService } from '../../services/feedService';

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const { width } = Dimensions.get('window');

/* ─── Types ─────────────────────────────────────────────── */
interface Community {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  icon_url: string | null;
  cover_url: string | null;
  cover_image_url?: string | null;
  privacy: 'public' | 'private';
  category?: string;
  members_count: number;
  creator_id?: string;
  posting_permission?: 'all' | 'admins_only';
  rules?: string | null;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: 'admin' | 'member' | 'owner';
  joined_at?: string;
  profile: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    is_verified?: boolean;
  };
}

interface Post {
  id: string;
  author_id?: string;
  content: string | null;
  image_url: string | null;
  image_urls: string[];
  video_url?: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
  is_repost?: boolean;
  repost_comment?: string | null;
  poll_options?: string[] | null;
  poll_counts?: number[] | null;
  user_vote?: number | null;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    university: string | null;
  };
}

interface Comment {
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

export default function CommunityDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { communityId, communitySlug } = route.params || {};

  const [community, setCommunity] = useState<Community | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Settings & Edit Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivacy, setEditPrivacy] = useState<'public' | 'private'>('public');
  const [editCategory, setEditCategory] = useState('Academic');
  const [editPostingPermission, setEditPostingPermission] = useState<'all' | 'admins_only'>('all');
  const [editRules, setEditRules] = useState('');
  const [editIconUri, setEditIconUri] = useState<string | null>(null);
  const [editCoverUri, setEditCoverUri] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Members Management Modal
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addMemberQuery, setAddMemberQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // In-Community Post Composer
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<PickedMedia[]>([]);
  const [attachedVideo, setAttachedVideo] = useState<PickedMedia | null>(null);
  const [publishingPost, setPublishingPost] = useState(false);

  // Pending Join Requests
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Comments Modal
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Moderation / Report Offence Modal
  const [reportingUser, setReportingUser] = useState<{ id: string; name: string; postId?: string } | null>(null);

  /* ── 1. Init Session & Community ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUserId(session.user.id);
    });
  }, []);

  const fetchCommunity = useCallback(async () => {
    try {
      let query = supabase.from('communities').select('*');
      if (communityId) query = query.eq('id', communityId) as any;
      else if (communitySlug) query = query.eq('slug', communitySlug) as any;

      const { data, error } = await (query as any).single();
      if (error || !data) return;

      const commData: Community = {
        ...data,
        cover_url: data.cover_url || data.cover_image_url || null,
      };
      setCommunity(commData);
      setEditName(commData.name);
      setEditDescription(commData.description || '');
      setEditPrivacy(commData.privacy);
      setEditCategory(commData.category || 'Academic');
      setEditPostingPermission(commData.posting_permission || 'all');
      setEditRules(commData.rules || '');

      // Check membership & role
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        const { data: member } = await supabase
          .from('community_members')
          .select('id, role, status')
          .eq('community_id', data.id)
          .eq('user_id', uid)
          .maybeSingle();

        setIsMember(!!member && (member.status === 'active' || !member.status));
        const adminCheck = member?.role === 'admin' || data.creator_id === uid;
        setIsAdmin(adminCheck);

        if (adminCheck) {
          fetchPendingRequests(data.id);
        }
      }
    } catch (err) {
      console.warn('Error fetching community:', err);
    }
  }, [communityId, communitySlug]);

  /* ── 1b. Fetch Pending Join Requests ── */
  const fetchPendingRequests = useCallback(async (commId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id, user_id, created_at,
          profile:profiles(id, name, username, avatar_url, university, is_verified)
        `)
        .eq('community_id', commId)
        .eq('status', 'pending');

      if (!error && data) {
        setPendingRequests(data);
      }
    } catch (e) {
      console.warn('Error fetching pending community requests:', e);
    }
  }, []);

  const handleAcceptRequest = async (membershipId: string) => {
    setProcessingReqId(membershipId);
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ status: 'active' })
        .eq('id', membershipId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(r => r.id !== membershipId));
      setCommunity(prev => prev ? { ...prev, members_count: (prev.members_count || 0) + 1 } : null);
      Alert.alert('Request Accepted 🎉', 'The student is now a member of this community.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept request.');
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleDeclineRequest = async (membershipId: string) => {
    setProcessingReqId(membershipId);
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(r => r.id !== membershipId));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not decline request.');
    } finally {
      setProcessingReqId(null);
    }
  };

  /* ── 2. Fetch Posts ── */
  const fetchPosts = useCallback(async (commId: string, uid: string | null) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, author_id, content, image_url, image_urls, video_url, likes_count, comments_count,
          created_at, is_repost, repost_comment, poll_options, poll_counts,
          author:profiles!author_id(id, name, username, avatar_url, is_verified, university)
        `)
        .eq('community_id', commId)
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;

      let likedIds = new Set<string>();
      let userVotesMap = new Map<string, number>();

      if (uid && data && data.length > 0) {
        const postIds = data.map((p: any) => p.id);
        const [likesRes, votesRes] = await Promise.all([
          supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', uid)
            .in('post_id', postIds),
          supabase
            .from('poll_votes')
            .select('post_id, option_index')
            .eq('user_id', uid)
            .in('post_id', postIds),
        ]);

        if (likesRes.data) likedIds = new Set(likesRes.data.map((l: any) => l.post_id));
        if (votesRes.data) {
          votesRes.data.forEach((v: any) => userVotesMap.set(v.post_id, v.option_index));
        }
      }

      const mapped = (data as any[]).map((p) => ({
        ...p,
        author_id: p.author_id || p.author?.id,
        poll_options: Array.isArray(p.poll_options) && p.poll_options.length > 0 ? p.poll_options : null,
        poll_counts: Array.isArray(p.poll_counts) ? p.poll_counts : (p.poll_options ? p.poll_options.map(() => 0) : null),
        user_vote: userVotesMap.has(p.id) ? userVotesMap.get(p.id) : null,
        user_has_liked: likedIds.has(p.id),
      }));
      setPosts(mapped as Post[]);
    } catch (err) {
      console.warn('Error fetching posts:', err);
    }
  }, []);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    await fetchCommunity();
    setLoading(false);
    setRefreshing(false);
  }, [fetchCommunity]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (community) fetchPosts(community.id, currentUserId);
  }, [community, currentUserId, fetchPosts]);

  /* ── 3. Fetch Members ── */
  const fetchMembers = async () => {
    if (!community) return;
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id, user_id, role, joined_at,
          profile:profiles!user_id(id, name, username, avatar_url, university, is_verified)
        `)
        .eq('community_id', community.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers((data as any[]) || []);
    } catch (e) {
      console.warn('Error fetching members:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const openMembersModal = () => {
    setIsMembersModalOpen(true);
    fetchMembers();
  };

  /* ── 4. Admin Actions (Promote, Demote, Remove, Add) ── */
  const handleToggleAdminRole = async (member: MemberItem) => {
    if (!community || !isAdmin) return;
    const newRole = member.role === 'admin' ? 'member' : 'admin';

    try {
      await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('id', member.id);

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
      Alert.alert('Role Updated', `${member.profile.name || 'User'} is now ${newRole}.`);
    } catch {
      Alert.alert('Error', 'Could not update member role.');
    }
  };

  const handleRemoveMember = (member: MemberItem) => {
    if (!community || !isAdmin) return;

    Alert.alert('Remove Member', `Remove ${member.profile.name || 'this user'} from the community?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('community_members').delete().eq('id', member.id);
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            setCommunity((prev) =>
              prev ? { ...prev, members_count: Math.max(0, prev.members_count - 1) } : prev
            );
          } catch {
            Alert.alert('Error', 'Could not remove member.');
          }
        },
      },
    ]);
  };

  const searchUsersToAdd = async (q: string) => {
    setAddMemberQuery(q);
    if (!q.trim()) {
      setSearchedUsers([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, university, is_verified')
        .or(`name.ilike.%${q.trim()}%,username.ilike.%${q.trim()}%`)
        .limit(10);
      setSearchedUsers((data as any[]) || []);
    } catch {
      // Ignore
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddUserToCommunity = async (userToAdd: any) => {
    if (!community) return;
    try {
      const existing = members.some((m) => m.user_id === userToAdd.id);
      if (existing) {
        Alert.alert('Already a Member', 'This user is already in the community.');
        return;
      }

      const { data, error } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: userToAdd.id,
          role: 'member',
          status: 'active',
        })
        .select(`id, user_id, role, created_at, profile:profiles!user_id(id, name, username, avatar_url, university, is_verified)`)
        .single();

      if (error) throw error;

      if (data) {
        setMembers((prev) => [...prev, data as any]);
        setCommunity((prev) => (prev ? { ...prev, members_count: prev.members_count + 1 } : prev));
        Alert.alert('Success 🎉', `${userToAdd.name || 'User'} added to community.`);
        setAddMemberQuery('');
        setSearchedUsers([]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not add user.');
    }
  };

  /* ── 4b. Direct Banner & DP Upload Handlers ── */
  const handlePickBanner = async () => {
    if (!community || !isAdmin) return;
    try {
      const picked = await uploadService.pickImages(1);
      if (picked.length > 0) {
        setEditCoverUri(picked[0].uri);
        if (!isSettingsOpen) {
          setSavingSettings(true);
          const coverUrl = await uploadService.uploadFile({ uri: picked[0].uri, type: 'image' }, 'community-covers');
          const { error } = await supabase
            .from('communities')
            .update({ cover_image_url: coverUrl })
            .eq('id', community.id);
          if (!error) {
            setCommunity((prev) => (prev ? { ...prev, cover_url: coverUrl } : null));
            Alert.alert('Banner Updated 🎉', 'Community cover banner has been updated.');
          } else {
            throw error;
          }
          setSavingSettings(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Could not upload banner image.');
      setSavingSettings(false);
    }
  };

  const handlePickIcon = async () => {
    if (!community || !isAdmin) return;
    try {
      const picked = await uploadService.pickImages(1);
      if (picked.length > 0) {
        setEditIconUri(picked[0].uri);
        if (!isSettingsOpen) {
          setSavingSettings(true);
          const iconUrl = await uploadService.uploadFile({ uri: picked[0].uri, type: 'image' }, 'community-icons');
          const { error } = await supabase
            .from('communities')
            .update({ icon_url: iconUrl })
            .eq('id', community.id);
          if (!error) {
            setCommunity((prev) => (prev ? { ...prev, icon_url: iconUrl } : null));
            Alert.alert('Icon Updated 🎉', 'Community display picture (DP) has been updated.');
          } else {
            throw error;
          }
          setSavingSettings(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Could not upload icon DP.');
      setSavingSettings(false);
    }
  };

  /* ── 5. Save Community Settings ── */
  const handleSaveSettings = async () => {
    if (!community || !editName.trim()) return;
    setSavingSettings(true);

    try {
      let iconUrl = community.icon_url;
      let coverUrl = community.cover_url;

      if (editIconUri && !editIconUri.startsWith('http')) {
        iconUrl = await uploadService.uploadFile({ uri: editIconUri, type: 'image' }, 'community-icons');
      }
      if (editCoverUri && !editCoverUri.startsWith('http')) {
        coverUrl = await uploadService.uploadFile({ uri: editCoverUri, type: 'image' }, 'community-covers');
      }

      const updates: any = {
        name: editName.trim(),
        description: editDescription.trim() || null,
        privacy: editPrivacy,
        icon_url: iconUrl,
        cover_image_url: coverUrl,
      };

      const { error } = await supabase.from('communities').update(updates).eq('id', community.id);
      if (error) throw error;

      setCommunity((prev) => (prev ? { ...prev, ...updates, cover_url: coverUrl } : null));
      setIsSettingsOpen(false);
      Alert.alert('Settings Updated 🎉', 'Community settings have been saved successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  /* ── 6. Delete Community ── */
  const handleDeleteCommunity = () => {
    if (!community) return;

    Alert.alert(
      'Delete Community',
      `Are you sure you want to permanently delete "${community.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.allSettled([
                supabase.from('community_members').delete().eq('community_id', community.id),
                supabase.from('posts').delete().eq('community_id', community.id),
              ]);
              await supabase.from('communities').delete().eq('id', community.id);

              Alert.alert('Deleted', 'Community has been deleted.');
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Could not delete community.');
            }
          },
        },
      ]
    );
  };

  /* ── 7. Share Community ── */
  const handleShare = async () => {
    if (!community) return;
    try {
      await Share.share({
        message: `Join ${community.name} on UniLink: Discover campus discussions and student projects!`,
        url: `https://unilink.app/communities/${community.id}`,
      });
    } catch {
      // Ignore
    }
  };

  /* ── 8. Join / Leave Community ── */
  const handleJoinLeave = async () => {
    if (!community || !currentUserId) return;
    setMembershipLoading(true);
    try {
      if (isMember) {
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', currentUserId);

        setIsMember(false);
        setCommunity((prev) =>
          prev ? { ...prev, members_count: Math.max(0, prev.members_count - 1) } : prev
        );
      } else {
        await supabase.from('community_members').upsert({
          community_id: community.id,
          user_id: currentUserId,
          role: 'member',
          status: 'active',
        });

        setIsMember(true);
        setCommunity((prev) => (prev ? { ...prev, members_count: prev.members_count + 1 } : prev));
      }
    } catch {
      Alert.alert('Error', 'Could not update membership.');
    } finally {
      setMembershipLoading(false);
    }
  };

  /* ── 9. In-Community Post Creation ── */
  const handleCreateCommunityPost = async () => {
    if (!community || !currentUserId) return;
    const hasMedia = attachedImages.length > 0 || attachedVideo;

    if (!newPostContent.trim() && !hasMedia) {
      Alert.alert('Empty Post', 'Please write something or attach photos/video.');
      return;
    }

    setPublishingPost(true);
    try {
      let uploadedImageUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;

      if (attachedImages.length > 0) {
        uploadedImageUrls = await uploadService.uploadMultiple(attachedImages, 'community-posts');
      }
      if (attachedVideo) {
        uploadedVideoUrl = await uploadService.uploadFile(attachedVideo, 'community-videos');
      }

      await FeedService.createPost({
        userId: currentUserId,
        content: newPostContent.trim(),
        communityId: community.id,
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
        videoUrl: uploadedVideoUrl,
      });

      setNewPostContent('');
      setAttachedImages([]);
      setAttachedVideo(null);
      fetchPosts(community.id, currentUserId);
      Alert.alert('Post Published 🎉', 'Your post is now live in this community!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not publish post.');
    } finally {
      setPublishingPost(false);
    }
  };

  /* ── 9b. Post Actions (Delete, Poll, Repost) ── */
  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post from the community?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('posts').delete().eq('id', postId);
              if (error) throw error;
              setPosts((prev) => prev.filter((p) => p.id !== postId));
              Alert.alert('Deleted', 'Post has been removed.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete post.');
            }
          },
        },
      ]
    );
  };

  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to vote in polls.');
      return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const oldVote = p.user_vote;
          if (oldVote === optionIndex) return p;

          const counts = Array.isArray(p.poll_counts)
            ? [...p.poll_counts]
            : (p.poll_options || []).map(() => 0);

          if (oldVote !== null && oldVote !== undefined) {
            counts[oldVote] = Math.max(0, (counts[oldVote] || 1) - 1);
          }
          counts[optionIndex] = (counts[optionIndex] || 0) + 1;

          return {
            ...p,
            poll_counts: counts,
            user_vote: optionIndex,
          };
        }
        return p;
      })
    );

    await FeedService.votePoll(postId, optionIndex, currentUserId);
  };

  const handleRepostPost = async (postId: string) => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to repost.');
      return;
    }
    try {
      await FeedService.repost(postId, currentUserId);
      Alert.alert('Reposted 🎉', 'Post shared to your campus feed!');
    } catch {
      Alert.alert('Error', 'Could not repost this item.');
    }
  };

  /* ── 10. Likes & Comments ── */
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_has_liked: !isLiked,
              likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );
    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
      }
    } catch {
      fetchPosts(community?.id || '', currentUserId);
    }
  };

  const openComments = async (postId: string) => {
    setActivePostId(postId);
    setCommentsVisible(true);
    setCommentsLoading(true);
    try {
      const fetched = await FeedService.getComments(postId);
      setComments(fetched as any);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !activePostId || !currentUserId) return;
    setSubmittingComment(true);
    const text = commentText.trim();
    setCommentText('');
    try {
      const newC = await FeedService.addComment(activePostId, currentUserId, text);
      if (newC) {
        setComments((prev) => [...prev, newC as any]);
        setPosts((prev) =>
          prev.map((p) => (p.id === activePostId ? { ...p, comments_count: p.comments_count + 1 } : p))
        );
      }
    } catch {
      Alert.alert('Error', 'Could not post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activePostId || !currentUserId) return;

    Alert.alert('Delete Comment', 'Are you sure you want to delete your comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === activePostId
                ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
                : p
            )
          );
          try {
            await FeedService.deleteComment(commentId, activePostId, currentUserId);
          } catch {
            openComments(activePostId);
          }
        },
      },
    ]);
  };

  /* ── Post Card Renderer ── */
  const renderPost = ({ item }: { item: Post }) => {
    const isPostAuthor =
      (item.author_id && item.author_id === currentUserId) ||
      (item.author?.id && item.author.id === currentUserId);
    const canDelete = isPostAuthor || isAdmin;

    return (
      <View style={styles.postCard}>
        {item.is_repost && (
          <View style={styles.repostBanner}>
            <Repeat2 size={12} color={colors.textSecondary} />
            <Text style={styles.repostText}> Reposted</Text>
          </View>
        )}
        <View style={styles.postHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {item.author?.avatar_url ? (
              <Image source={{ uri: item.author.avatar_url }} style={styles.authorAvatar} />
            ) : (
              <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{(item.author?.name || 'U')[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{item.author?.name || 'Student'}</Text>
                {item.author?.is_verified && (
                  <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 3 }} />
                )}
                {item.created_at && (
                  <Text style={styles.authorTimestamp}>
                    {' · '}{formatRelativeTime(item.created_at)}
                  </Text>
                )}
              </View>
              <Text style={styles.authorMeta}>
                @{item.author?.username || 'user'} {item.author?.university ? `· ${item.author.university}` : ''}
              </Text>
            </View>
          </View>

          {canDelete ? (
            <TouchableOpacity
              style={styles.postDeleteBtn}
              onPress={() => handleDeletePost(item.id)}
            >
              <Trash2 size={15} color={colors.danger} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.postDeleteBtn}
              onPress={() =>
                setReportingUser({
                  id: item.author_id || item.author?.id || '',
                  name: item.author?.name || item.author?.username || 'student',
                  postId: item.id,
                })
              }
            >
              <Flag size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {item.content ? (
          <>
            <FormattedText content={item.content} style={styles.postContent} />
            <View style={{ paddingHorizontal: 16 }}>
              <SocialSourceBadge text={item.content || ''} linkUrl={item.video_url || undefined} />
            </View>
          </>
        ) : null}

        {/* Poll */}
        {item.poll_options && item.poll_options.length > 0 && (
          <PollCard
            options={item.poll_options}
            counts={item.poll_counts}
            userVote={item.user_vote}
            onVote={(optionIndex) => handleVotePoll(item.id, optionIndex)}
          />
        )}

        {/* Video */}
        {item.video_url || extractYouTubeId(item.content || '') ? (
          <VideoPlayer url={item.video_url} content={item.content} />
        ) : null}

        {/* Images */}
        {item.image_url ? (
          <AutoHeightImage uri={item.image_url} />
        ) : null}
        {item.image_urls && item.image_urls.length > 0 && !item.image_url ? (
          item.image_urls.map((imgUri, idx) => (
            <AutoHeightImage key={idx} uri={imgUri} />
          ))
        ) : null}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id, !!item.user_has_liked)}>
            <Heart
              size={18}
              color={item.user_has_liked ? colors.danger : colors.textSecondary}
              fill={item.user_has_liked ? colors.danger : 'transparent'}
            />
            <Text style={[styles.actionCount, item.user_has_liked && { color: colors.danger }]}>
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(item.id)}>
            <MessageCircle size={18} color={colors.textSecondary} />
            <Text style={styles.actionCount}>{item.comments_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => handleRepostPost(item.id)}>
            <Repeat2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              try {
                const shareUrl = `https://unilink.ng/post/${item.id}`;
                await Share.share({
                  message: `${item.content || 'Check out this post on UniLink'}\n\n${shareUrl}`,
                });
              } catch {}
            }}
          >
            <Share2 size={17} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ── Community Header Component ── */
  const CommunityHeader = () => {
    if (!community) return null;
    return (
      <View style={styles.communityHeader}>
        {/* Cover Banner */}
        <TouchableOpacity
          activeOpacity={isAdmin ? 0.85 : 1}
          onPress={isAdmin ? handlePickBanner : undefined}
          style={styles.coverWrapper}
        >
          {community.cover_url ? (
            <Image source={{ uri: community.cover_url }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          {isAdmin && (
            <View style={styles.editBannerBadge}>
              <Camera size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.editBannerBadgeText}>Edit Banner</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Icon & Action Row */}
        <View style={styles.communityInfoRow}>
          <TouchableOpacity
            activeOpacity={isAdmin ? 0.85 : 1}
            onPress={isAdmin ? handlePickIcon : undefined}
            style={styles.iconContainer}
          >
            {community.icon_url ? (
              <Image source={{ uri: community.icon_url }} style={styles.communityIcon} />
            ) : (
              <Text style={styles.communityInitial}>{community.name[0].toUpperCase()}</Text>
            )}
            {isAdmin && (
              <View style={styles.editIconBadge}>
                <Camera size={11} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerBtnsRow}>
            {/* Manage Members */}
            <TouchableOpacity style={styles.membersBtn} onPress={openMembersModal}>
              <Users size={14} color={colors.text} />
              <Text style={styles.membersBtnText}>Members</Text>
            </TouchableOpacity>

            {/* Community Settings */}
            <TouchableOpacity style={styles.membersBtn} onPress={() => setIsSettingsOpen(true)}>
              <Settings size={14} color={colors.text} />
              <Text style={styles.membersBtnText}>Settings</Text>
            </TouchableOpacity>

            {/* Join / Leave */}
            <TouchableOpacity
              style={[styles.joinBtn, isMember && styles.leaveBtn, membershipLoading && { opacity: 0.6 }]}
              onPress={handleJoinLeave}
              disabled={membershipLoading}
            >
              {membershipLoading ? (
                <ActivityIndicator size="small" color={isMember ? colors.textSecondary : '#fff'} />
              ) : (
                <Text style={[styles.joinBtnText, isMember && styles.leaveBtnText]}>
                  {isMember ? 'Leave' : 'Join'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta & Privacy */}
        <View style={styles.communityMeta}>
          <Text style={styles.communityName}>{community.name}</Text>
          <View style={styles.communityStats}>
            <Users size={13} color={colors.textSecondary} />
            <Text style={styles.communityStatText}>{community.members_count || 0} members</Text>
            {community.privacy === 'public' ? (
              <>
                <Globe size={13} color={colors.primary} />
                <Text style={[styles.communityStatText, { color: colors.primary }]}>Public</Text>
              </>
            ) : (
              <>
                <Lock size={13} color={colors.danger} />
                <Text style={[styles.communityStatText, { color: colors.danger }]}>Private</Text>
              </>
            )}
          </View>
          {community.description ? (
            <Text style={styles.communityDescription}>{community.description}</Text>
          ) : null}
        </View>

        {/* Pending Join Requests (Visible ONLY to Owner/Admins) */}
        {isAdmin && pendingRequests.length > 0 && (
          <View style={styles.pendingRequestsContainer}>
            <View style={styles.pendingRequestsHeader}>
              <Users size={16} color={colors.primary} />
              <Text style={styles.pendingRequestsTitle}>
                Pending Join Requests ({pendingRequests.length})
              </Text>
            </View>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.pendingRequestCard}>
                <View style={styles.pendingRequestLeft}>
                  {req.profile?.avatar_url ? (
                    <Image source={{ uri: req.profile.avatar_url }} style={styles.pendingAvatar} />
                  ) : (
                    <View style={styles.pendingAvatarPlaceholder}>
                      <Text style={styles.pendingAvatarInitial}>
                        {(req.profile?.name || req.profile?.username || 'S')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pendingName} numberOfLines={1}>
                      {req.profile?.name || req.profile?.username || 'Student'}
                    </Text>
                    <Text style={styles.pendingUniversity} numberOfLines={1}>
                      @{req.profile?.username || 'student'} {req.profile?.university ? `· ${req.profile.university}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={[styles.acceptReqBtn, processingReqId === req.id && { opacity: 0.5 }]}
                    onPress={() => handleAcceptRequest(req.id)}
                    disabled={processingReqId === req.id}
                    activeOpacity={0.85}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.declineReqBtn, processingReqId === req.id && { opacity: 0.5 }]}
                    onPress={() => handleDeclineRequest(req.id)}
                    disabled={processingReqId === req.id}
                    activeOpacity={0.85}
                  >
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* In-Community Post Composer (For Members) */}
        {isMember && (
          <View style={styles.inCommunityComposer}>
            <TextInput
              style={styles.composerInput}
              placeholder={`Post something in ${community.name}...`}
              placeholderTextColor={colors.textSecondary}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
            />
            {attachedImages.length > 0 && (
              <ScrollView horizontal style={styles.attachedThumbsRow}>
                {attachedImages.map((img, i) => (
                  <View key={i} style={styles.thumbWrap}>
                    <Image source={{ uri: img.uri }} style={styles.attachedThumb} />
                    <TouchableOpacity
                      style={styles.removeThumbBtn}
                      onPress={() => setAttachedImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            {attachedVideo && (
              <View style={styles.videoBadgeRow}>
                <VideoIcon size={14} color={colors.primary} />
                <Text style={styles.videoBadgeText} numberOfLines={1}>
                  {attachedVideo.fileName || 'Video'}
                </Text>
                <TouchableOpacity onPress={() => setAttachedVideo(null)}>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.composerActions}>
              <View style={styles.composerMediaIcons}>
                <TouchableOpacity
                  style={styles.mediaIconBtn}
                  onPress={async () => {
                    const media = await uploadService.pickImages(4);
                    if (media.length > 0) setAttachedImages((prev) => [...prev, ...media]);
                  }}
                >
                  <ImageIcon size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaIconBtn}
                  onPress={async () => {
                    const vid = await uploadService.pickVideo();
                    if (vid) setAttachedVideo(vid);
                  }}
                >
                  <VideoIcon size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.postSubmitBtn,
                  (!newPostContent.trim() && attachedImages.length === 0 && !attachedVideo) ||
                  publishingPost
                    ? { opacity: 0.5 }
                    : {},
                ]}
                onPress={handleCreateCommunityPost}
                disabled={
                  (!newPostContent.trim() && attachedImages.length === 0 && !attachedVideo) ||
                  publishingPost
                }
              >
                {publishingPost ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={13} color="#fff" />
                    <Text style={styles.postSubmitBtnText}>Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.postsLabel}>
          <Text style={styles.postsSectionTitle}>Community Discussions</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {community?.name || 'Community'}
        </Text>
        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 size={19} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSettingsOpen(true)}>
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          ListHeaderComponent={<CommunityHeader />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAll(true)}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isMember ? 'No discussions yet. Post the first one!' : 'Join this community to view and participate in discussions.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Admin Settings Modal ─────────────────────────────────────── */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)} style={styles.modalCloseBtn}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Community Settings</Text>
              <TouchableOpacity
                style={[styles.saveBtn, savingSettings && { opacity: 0.6 }]}
                onPress={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.settingsFormScroll} showsVerticalScrollIndicator={false}>
              {/* Cover Banner Upload */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Cover Banner</Text>
                <TouchableOpacity
                  style={styles.coverUploadBox}
                  onPress={async () => {
                    const media = await uploadService.pickImages(1);
                    if (media.length > 0) setEditCoverUri(media[0].uri);
                  }}
                >
                  {editCoverUri || community?.cover_url ? (
                    <Image
                      source={{ uri: editCoverUri || community?.cover_url || '' }}
                      style={styles.uploadedCoverPreview}
                    />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={24} color={colors.primary} />
                      <Text style={styles.uploadText}>Upload Cover Banner</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Logo / Icon DP Upload */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Display Picture (DP) / Icon</Text>
                <TouchableOpacity
                  style={styles.logoUploadBox}
                  onPress={async () => {
                    const media = await uploadService.pickImages(1);
                    if (media.length > 0) setEditIconUri(media[0].uri);
                  }}
                >
                  {editIconUri || community?.icon_url ? (
                    <Image
                      source={{ uri: editIconUri || community?.icon_url || '' }}
                      style={styles.uploadedLogoPreview}
                    />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={24} color={colors.primary} />
                      <Text style={styles.uploadText}>Upload Community DP</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Community Name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Privacy Setting Toggle */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Privacy</Text>
                <View style={styles.privacyRow}>
                  <TouchableOpacity
                    style={[styles.privacyBtn, editPrivacy === 'public' && styles.privacyBtnActive]}
                    onPress={() => setEditPrivacy('public')}
                  >
                    <Globe size={18} color={editPrivacy === 'public' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, editPrivacy === 'public' && styles.privacyTitleActive]}>
                        Public
                      </Text>
                      <Text style={styles.privacySub}>Open to all campus students</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.privacyBtn, editPrivacy === 'private' && styles.privacyBtnActive]}
                    onPress={() => setEditPrivacy('private')}
                  >
                    <Lock size={18} color={editPrivacy === 'private' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, editPrivacy === 'private' && styles.privacyTitleActive]}>
                        Private
                      </Text>
                      <Text style={styles.privacySub}>Invite & approval required</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Posting Permissions */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Posting Permissions</Text>
                <View style={styles.privacyRow}>
                  <TouchableOpacity
                    style={[styles.privacyBtn, editPostingPermission === 'all' && styles.privacyBtnActive]}
                    onPress={() => setEditPostingPermission('all')}
                  >
                    <Users size={18} color={editPostingPermission === 'all' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, editPostingPermission === 'all' && styles.privacyTitleActive]}>
                        All Members
                      </Text>
                      <Text style={styles.privacySub}>Any joined member can post</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.privacyBtn, editPostingPermission === 'admins_only' && styles.privacyBtnActive]}
                    onPress={() => setEditPostingPermission('admins_only')}
                  >
                    <Crown size={18} color={editPostingPermission === 'admins_only' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, editPostingPermission === 'admins_only' && styles.privacyTitleActive]}>
                        Admins Only
                      </Text>
                      <Text style={styles.privacySub}>Only group leaders & admins can post</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Community description, goals, and overview..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Rules & Guidelines */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Rules & Guidelines</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={editRules}
                  onChangeText={setEditRules}
                  placeholder="e.g. 1. Respect fellow students\n2. No spam or unsolicited promotions\n3. Stay relevant to the topic"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Danger Zone: Delete Community */}
              <View style={styles.dangerSection}>
                <Text style={styles.dangerTitle}>Danger Zone</Text>
                <TouchableOpacity style={styles.deleteCommBtn} onPress={handleDeleteCommunity}>
                  <Trash2 size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteCommBtnText}>Delete Community</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Members & Role Management Modal ──────────────────────────── */}
      <Modal
        visible={isMembersModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMembersModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMembersModalOpen(false)} style={styles.modalCloseBtn}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Manage Members ({members.length})</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Add Member Search Bar */}
          {isAdmin && (
            <View style={styles.addMemberSearchRow}>
              <TextInput
                style={styles.addMemberInput}
                placeholder="Search students to invite / add..."
                placeholderTextColor={colors.textSecondary}
                value={addMemberQuery}
                onChangeText={searchUsersToAdd}
              />
            </View>
          )}

          {/* Searched Users List */}
          {searchedUsers.length > 0 && (
            <View style={styles.searchResultsBox}>
              <Text style={styles.searchHeader}>Search Results:</Text>
              {searchedUsers.map((u) => (
                <View key={u.id} style={styles.searchResultItem}>
                  <Text style={styles.searchUserName}>{u.name || u.username}</Text>
                  <TouchableOpacity
                    style={styles.addUserBtn}
                    onPress={() => handleAddUserToCommunity(u)}
                  >
                    <Plus size={14} color="#fff" />
                    <Text style={styles.addUserBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Members List */}
          {loadingMembers ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
          ) : (
            <ScrollView contentContainerStyle={styles.membersListScroll}>
              {members.map((m) => {
                const isUserAdmin = m.role === 'admin';
                const isSelf = m.user_id === currentUserId;

                return (
                  <View key={m.id} style={styles.memberCard}>
                    {m.profile?.avatar_url ? (
                      <Image source={{ uri: m.profile.avatar_url }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>
                          {(m.profile?.name || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.memberMeta}>
                      <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{m.profile?.name || 'Student'}</Text>
                        {isUserAdmin && (
                          <View style={styles.adminBadge}>
                            <Crown size={10} color="#ffffff" style={{ marginRight: 3 }} />
                            <Text style={styles.adminBadgeText}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberHandle}>@{m.profile?.username || 'user'}</Text>
                    </View>

                    {/* Admin Actions */}
                    {isAdmin && !isSelf && (
                      <View style={styles.memberActionsRow}>
                        <TouchableOpacity
                          style={styles.promoteBtn}
                          onPress={() => handleToggleAdminRole(m)}
                        >
                          <Text style={styles.promoteBtnText}>
                            {isUserAdmin ? 'Demote' : 'Make Admin'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.kickBtn}
                          onPress={() => handleRemoveMember(m)}
                        >
                          <UserMinus size={15} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ── Comments Modal ───────────────────────────────────────────── */}
      <Modal visible={commentsVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.commentsSheet}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentsVisible(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {commentsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <ScrollView style={styles.commentsList}>
                {comments.length === 0 ? (
                  <Text style={styles.noCommentsText}>No comments yet. Start the conversation!</Text>
                ) : (
                  comments.map((comment) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <View style={styles.commentBubble}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={styles.commentAuthor}>{comment.author?.name || 'Student'}</Text>
                          {(comment.author?.id === currentUserId || (comment as any).author_id === currentUserId) && (
                            <TouchableOpacity
                              style={{ padding: 2 }}
                              onPress={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 size={13} color={colors.danger} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.commentContent}>{comment.content}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!commentText.trim() || submittingComment) && { opacity: 0.4 }]}
                onPress={submitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Moderation / Report Offence Modal */}
      {reportingUser && (
        <ReportModal
          visible={!!reportingUser}
          targetUserId={reportingUser.id}
          targetUserName={reportingUser.name}
          targetPostId={reportingUser.postId}
          onClose={() => setReportingUser(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1, textAlign: 'center' },
  topRightActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 40 },

  // Community Header
  communityHeader: { backgroundColor: colors.background },
  coverWrapper: { position: 'relative', width, height: 140 },
  coverImage: { width, height: 140, resizeMode: 'cover' },
  coverPlaceholder: { width, height: 140, backgroundColor: colors.surfaceElevated },
  editBannerBadge: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  editBannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  communityInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    overflow: 'hidden',
    position: 'relative',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityIcon: { width: 72, height: 72 },
  communityInitial: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  headerBtnsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  membersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  membersBtnText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  joinBtn: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  leaveBtn: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  leaveBtnText: { color: colors.textSecondary },
  communityMeta: { paddingHorizontal: 16, paddingTop: 12 },
  communityName: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  communityStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  communityStatText: { fontSize: 13, color: colors.textSecondary },
  communityDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  // Pending Join Requests
  pendingRequestsContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 14,
  },
  pendingRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  pendingRequestsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pendingRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  pendingRequestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pendingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  pendingAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAvatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  pendingName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  pendingUniversity: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 1,
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptReqBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineReqBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // In-Community Post Composer
  inCommunityComposer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  composerInput: { fontSize: 14, color: colors.text, minHeight: 40 },
  attachedThumbsRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  thumbWrap: { position: 'relative' },
  attachedThumb: { width: 54, height: 54, borderRadius: 8 },
  removeThumbBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 6 },
  videoBadgeText: { fontSize: 12, color: colors.primary, flex: 1 },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerMediaIcons: { flexDirection: 'row', gap: 12 },
  mediaIconBtn: { padding: 4 },
  postSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  postSubmitBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  postsLabel: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
  },
  postsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Post Card
  postCard: { paddingHorizontal: 16, paddingVertical: 12 },
  repostBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  repostText: { fontSize: 12, color: colors.textSecondary },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  authorAvatar: { width: 38, height: 38, borderRadius: 19 },
  avatarPlaceholder: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 14, fontWeight: '700' },
  authorInfo: { flex: 1, marginLeft: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.text },
  authorTimestamp: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  authorMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  postDeleteBtn: { padding: 8 },
  postContent: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 20, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  // Modal Common
  modalSafeArea: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseBtn: { padding: 6 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  saveBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  settingsFormScroll: { padding: 20, paddingBottom: 40 },
  formSection: { marginBottom: 18 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  categoryPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  coverUploadBox: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  uploadedCoverPreview: { width: '100%', height: 110, resizeMode: 'cover' },
  logoUploadBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  uploadedLogoPreview: { width: 72, height: 72, borderRadius: 36 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: 9, color: colors.textSecondary, marginTop: 3 },
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
  formTextArea: { height: 90, textAlignVertical: 'top' },
  privacyRow: { gap: 10 },
  privacyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  privacyBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(16, 185, 129, 0.08)' },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  privacyTitleActive: { color: colors.primary },
  privacySub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  dangerSection: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  dangerTitle: { fontSize: 13, fontWeight: '800', color: colors.danger, textTransform: 'uppercase', marginBottom: 10 },
  deleteCommBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteCommBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // Members Management Styles
  addMemberSearchRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  addMemberInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  searchResultsBox: { padding: 14, backgroundColor: colors.surfaceElevated, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchHeader: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  searchUserName: { fontSize: 14, fontWeight: '600', color: colors.text },
  addUserBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  addUserBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  membersListScroll: { padding: 16 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberMeta: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 14, fontWeight: '700', color: colors.text },
  memberHandle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  adminBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  memberActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoteBtn: { backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  promoteBtnText: { fontSize: 11, fontWeight: '700', color: colors.text },
  kickBtn: { padding: 6 },

  // Comments Sheet
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  commentsSheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 20 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentsTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  commentsList: { paddingHorizontal: 16, paddingVertical: 8, maxHeight: 360 },
  noCommentsText: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 20, fontSize: 14 },
  commentRow: { marginBottom: 10 },
  commentBubble: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  commentContent: { fontSize: 14, color: colors.text, lineHeight: 19 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  commentInput: { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.text, maxHeight: 80 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
