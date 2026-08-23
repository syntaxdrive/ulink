import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Check,
  CheckCheck,
  Repeat2,
  AtSign,
  Briefcase,
  Users,
  BookOpen,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
interface Notification {
  id: string;
  type: string;
  title: string | null;
  message: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
  user_id: string;
}

interface ConnectionRequest {
  id: string;
  created_at: string;
  requester: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    role: string | null;
  };
}

interface CommunityJoinRequest {
  id: string;
  community_id: string;
  user_id: string;
  created_at: string;
  community?: {
    id: string;
    name: string;
    icon_url: string | null;
  };
  profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
  };
}

/* ─── Notification icon + color map ─────────────────────── */
function NotifIcon({ type, isDark }: { type: string; isDark: boolean }) {
  const iconProps = { size: 18 };
  const iconMap: Record<string, { Icon: any; color: string; bg: string }> = {
    like:                   { Icon: Heart,         color: '#EF4444', bg: isDark ? '#450A0A' : '#FEF2F2' },
    comment:                { Icon: MessageSquare,  color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    repost:                 { Icon: Repeat2,        color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    mention:                { Icon: AtSign,         color: '#F97316', bg: isDark ? '#431407' : '#FFF7ED' },
    message:                { Icon: MessageSquare,  color: '#6366F1', bg: isDark ? '#1E1B4B' : '#EEF2FF' },
    connection_request:     { Icon: UserPlus,       color: '#3B82F6', bg: isDark ? '#172554' : '#EFF6FF' },
    connection_accepted:    { Icon: Check,          color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    community_join_request: { Icon: Users,          color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    community_join_accepted:{ Icon: Check,          color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    job_update:             { Icon: Briefcase,      color: '#059669', bg: isDark ? '#064E3B' : '#ECFDF5' },
    study_invite:           { Icon: BookOpen,       color: '#8B5CF6', bg: isDark ? '#2E1065' : '#F5F3FF' },
    follow:                 { Icon: UserPlus,       color: '#F97316', bg: isDark ? '#431407' : '#FFF7ED' },
  };
  const config = iconMap[type] || { Icon: Bell, color: isDark ? '#A1A1AA' : '#6B7280', bg: isDark ? '#27272A' : '#F3F4F6' };
  return (
    <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
      <config.Icon {...iconProps} color={config.color} />
    </View>
  );
}

/* ─── Relative time helper ───────────────────────────────── */
function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return '';
  }
}

/* ─── Main Component ─────────────────────────────────────── */
export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [communityRequests, setCommunityRequests] = useState<CommunityJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  /* ── Init ── */
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    init();
  }, []);

  /* ── Fetch all ── */
  const fetchAll = useCallback(async (uid: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // 1. Fetch general notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id, type, title, message, read, action_url, created_at, user_id')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifs) setNotifications(notifs as Notification[]);

      // 2. Fetch pending connection requests sent TO me
      const { data: conns } = await supabase
        .from('connections')
        .select(`
          id, created_at,
          requester:profiles!requester_id(id, name, username, avatar_url, university, role)
        `)
        .eq('recipient_id', uid)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (conns) setRequests(conns as any[]);

      // 3. Fetch pending community join requests for communities owned/administered by me
      const { data: myOwnedCommunities } = await supabase
        .from('communities')
        .select('id')
        .eq('creator_id', uid);

      const ownedIds = myOwnedCommunities?.map(c => c.id) || [];

      if (ownedIds.length > 0) {
        const { data: commJoinReqs } = await supabase
          .from('community_members')
          .select(`
            id, community_id, user_id, created_at,
            community:communities(id, name, icon_url),
            profile:profiles(id, name, username, avatar_url, university)
          `)
          .in('community_id', ownedIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (commJoinReqs) {
          setCommunityRequests(commJoinReqs as any[]);
        }
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchAll(userId);
  }, [userId, fetchAll]);

  /* ── Realtime: new notifications & community requests ── */
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`mobile-notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'connections',
        filter: `recipient_id=eq.${userId}`,
      }, () => {
        fetchAll(userId);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_members',
      }, () => {
        fetchAll(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchAll]);

  /* ── Mark All as Read ── */
  const handleMarkAllRead = async () => {
    if (!userId || markingAll) return;
    setMarkingAll(true);
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── Mark Single Notification as Read & Navigate ── */
  const handleNotificationPress = async (item: Notification) => {
    if (!item.read && userId) {
      setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, read: true } : n)));
      await supabase.from('notifications').update({ read: true }).eq('id', item.id);
    }

    // Handle Deep Link / Route Navigation
    if (item.action_url) {
      const url = item.action_url;
      if (url.includes('/communities/')) {
        const commSlug = url.split('/communities/')[1]?.split('/')[0];
        if (commSlug) {
          navigation.navigate('CommunityDetail', { communityId: commSlug });
          return;
        }
      }
      if (url.includes('/podcasts/')) {
        const podId = url.split('/podcasts/')[1]?.split('/')[0];
        if (podId) {
          navigation.navigate('Podcast', { podcastId: podId });
          return;
        }
      }
    }
  };

  /* ── Accept / Reject Connection Request ── */
  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    setProcessing(connectionId);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== connectionId));
    } catch {
      console.warn('Failed to process connection request');
    } finally {
      setProcessing(null);
    }
  };

  /* ── Accept / Decline Community Join Request ── */
  const handleCommunityRequestAction = async (membershipId: string, action: 'accept' | 'reject') => {
    setProcessing(membershipId);
    try {
      if (action === 'accept') {
        const { error } = await supabase
          .from('community_members')
          .update({ status: 'active' })
          .eq('id', membershipId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('id', membershipId);
        if (error) throw error;
      }
      setCommunityRequests(prev => prev.filter(r => r.id !== membershipId));
    } catch (err) {
      console.warn('Failed to process community join request:', err);
    } finally {
      setProcessing(null);
    }
  };

  /* ── Unread count ── */
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  /* ── Render Community Join Request Card ── */
  const renderCommunityRequest = (item: CommunityJoinRequest) => {
    const isProc = processing === item.id;
    return (
      <View key={item.id} style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
          <Users size={18} color="#059669" />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
            {item.profile?.name || item.profile?.username || 'Student'}
          </Text>
          <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            wants to join <Text style={{ fontWeight: '800', color: colors.primary }}>{item.community?.name || 'your community'}</Text>
          </Text>
          <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{relativeTime(item.created_at)}</Text>
        </View>
        <View style={styles.reqActions}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: colors.primary }, isProc && styles.disabledBtn]}
            onPress={() => handleCommunityRequestAction(item.id, 'accept')}
            disabled={isProc}
            activeOpacity={0.85}
          >
            {isProc ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, { backgroundColor: isDark ? '#27272A' : '#F3F4F6' }, isProc && styles.disabledBtn]}
            onPress={() => handleCommunityRequestAction(item.id, 'reject')}
            disabled={isProc}
            activeOpacity={0.85}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ── Render Connection Request Card ── */
  const renderConnectionRequest = (item: ConnectionRequest) => {
    const isProc = processing === item.id;
    return (
      <View key={item.id} style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#172554' : '#EFF6FF' }]}>
          <UserPlus size={18} color="#3B82F6" />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
            {item.requester?.name || item.requester?.username || 'Someone'}
          </Text>
          <Text style={[styles.notifSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.requester?.university ? `${item.requester.university} · ` : ''}wants to connect
          </Text>
          <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{relativeTime(item.created_at)}</Text>
        </View>
        <View style={styles.reqActions}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: colors.primary }, isProc && styles.disabledBtn]}
            onPress={() => handleConnectionAction(item.id, 'accept')}
            disabled={isProc}
            activeOpacity={0.85}
          >
            {isProc ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, { backgroundColor: isDark ? '#27272A' : '#F3F4F6' }, isProc && styles.disabledBtn]}
            onPress={() => handleConnectionAction(item.id, 'reject')}
            disabled={isProc}
            activeOpacity={0.85}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ── Render General Notification Item ── */
  const renderNotification = ({ item }: { item: Notification }) => {
    const isCommunityJoin = item.type === 'community_join_request';

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          { backgroundColor: item.read ? colors.background : (isDark ? '#1A2E26' : '#ECFDF5') },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <NotifIcon type={item.type} isDark={isDark} />
        <View style={styles.notifContent}>
          {item.title ? (
            <Text style={[styles.notifTitle, { color: colors.text }, !item.read && styles.unreadText]} numberOfLines={2}>
              {item.title}
            </Text>
          ) : null}
          {item.message ? (
            <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.message}
            </Text>
          ) : null}
          <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{relativeTime(item.created_at)}</Text>
        </View>

        {isCommunityJoin ? (
          <View style={[styles.badgePillSmall, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.primary }]}>
            <Text style={[styles.badgePillSmallText, { color: colors.primary }]}>Review</Text>
            <ChevronRight size={12} color={colors.primary} />
          </View>
        ) : !item.read ? (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        ) : null}
      </TouchableOpacity>
    );
  };

  /* ── List Header (Join Requests & Connection Requests) ── */
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Community Join Requests Section */}
      {communityRequests.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Community Join Requests ({communityRequests.length})
          </Text>
          {communityRequests.map(req => (
            <React.Fragment key={req.id}>
              {renderCommunityRequest(req)}
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Connection Requests Section */}
      {requests.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Connection Requests ({requests.length})
          </Text>
          {requests.map(req => (
            <React.Fragment key={req.id}>
              {renderConnectionRequest(req)}
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            </React.Fragment>
          ))}
        </View>
      )}

      {notifications.length > 0 && (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        </View>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const hasContent = notifications.length > 0 || requests.length > 0 || communityRequests.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Mark All as Read */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {unreadCount} unread update{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={[
              styles.markAllBtn,
              { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.primary },
            ]}
            onPress={handleMarkAllRead}
            disabled={markingAll}
            activeOpacity={0.8}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <CheckCheck size={15} color={colors.primary} style={{ marginRight: 5 }} />
                <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {hasContent ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          ListHeaderComponent={<ListHeader />}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => userId && fetchAll(userId, true)}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All caught up!</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Notifications about your activity will show up here.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 40,
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  unreadText: {
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
  notifSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
    gap: 2,
  },
  badgePillSmallText: {
    fontSize: 11,
    fontWeight: '800',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
  },
  reqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
