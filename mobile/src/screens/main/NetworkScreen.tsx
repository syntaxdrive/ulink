import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Users,
  Search,
  CheckCircle2,
  UserPlus,
  Check,
  MessageCircle,
  Trophy,
  BookOpen,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  headline: string | null;
  university: string | null;
  is_verified: boolean;
  points: number;
  role?: string | null;
}

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  requester?: Profile;
  recipient?: Profile;
}

/* ─── Helpers ────────────────────────────────────────────── */
function Avatar({ uri, name, size = 48 }: { uri?: string | null; name?: string | null; size?: number }) {
  const initials = (name || 'U')[0].toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function NetworkScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'discover' | 'network'>('discover');

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  // Discover
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [refreshingDiscover, setRefreshingDiscover] = useState(false);

  // Connection state maps
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connections, setConnections] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  // My Network
  const [myNetwork, setMyNetwork] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [refreshingNetwork, setRefreshingNetwork] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Init: get session ── */
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    init();
  }, []);

  /* ── Fetch all connection data ── */
  const fetchConnectionData = useCallback(async (uid: string) => {
    const { data: allConns } = await supabase
      .from('connections')
      .select('id, requester_id, recipient_id, status')
      .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`);

    const connSet = new Set<string>();
    const sentSet = new Set<string>();

    if (allConns) {
      allConns.forEach((c: any) => {
        const other = c.requester_id === uid ? c.recipient_id : c.requester_id;
        if (c.status === 'accepted') connSet.add(other);
        else if (c.requester_id === uid && c.status === 'pending') sentSet.add(other);
      });
    }
    setConnections(connSet);
    setSentRequests(sentSet);
    return { connSet, sentSet };
  }, []);

  /* ── Fetch My Profile ── */
  const fetchMyProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, headline, university, is_verified, points, role')
      .eq('id', uid)
      .single();
    if (data) setMyProfile(data as Profile);
    return data as Profile | null;
  }, []);

  /* ── Discover: Suggestions ── */
  const fetchSuggestions = useCallback(async (uid: string, connSet: Set<string>, sentSet: Set<string>) => {
    const excludeIds = [uid, ...Array.from(connSet), ...Array.from(sentSet)];

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, headline, university, is_verified, points, role')
      .neq('id', uid)
      .order('created_at', { ascending: false })
      .limit(200);

    if (allProfiles) {
      const myUni = myProfile?.university?.toLowerCase().trim();
      const filtered = (allProfiles as Profile[]).filter(p => !excludeIds.includes(p.id));
      filtered.sort((a, b) => {
        const aSame = myUni && a.university?.toLowerCase().trim() === myUni ? 0 : 1;
        const bSame = myUni && b.university?.toLowerCase().trim() === myUni ? 0 : 1;
        if (aSame !== bSame) return aSame - bSame;
        return (b.points || 0) - (a.points || 0);
      });
      setSuggestions(filtered);
    }
  }, [myProfile]);

  /* ── My Network: connections + pending ── */
  const fetchMyNetwork = useCallback(async (uid: string) => {
    // Accepted connections
    const { data: acceptedConns } = await supabase
      .from('connections')
      .select(`
        id, requester_id, recipient_id, status,
        requester:profiles!requester_id(id, name, username, avatar_url, headline, university, is_verified, points),
        recipient:profiles!recipient_id(id, name, username, avatar_url, headline, university, is_verified, points)
      `)
      .or(`requester_id.eq.${uid},recipient_id.eq.${uid}`)
      .eq('status', 'accepted');

    if (acceptedConns) {
      const profiles = (acceptedConns as any[]).map(c => {
        const profile = c.requester_id === uid ? c.recipient : c.requester;
        return profile as Profile;
      }).filter(Boolean);
      setMyNetwork(profiles);
    }

    // Pending requests (people who sent to me)
    const { data: pending } = await supabase
      .from('connections')
      .select(`
        id, requester_id, recipient_id, status, created_at,
        requester:profiles!requester_id(id, name, username, avatar_url, headline, university, is_verified, points)
      `)
      .eq('recipient_id', uid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pending) {
      setPendingRequests(pending as any[]);
    }
  }, []);

  /* ── Full data load ── */
  const loadAllData = useCallback(async (uid: string, isRefresh = false) => {
    if (isRefresh) {
      setRefreshingDiscover(true);
      setRefreshingNetwork(true);
    }
    try {
      const [profile, { connSet, sentSet }] = await Promise.all([
        fetchMyProfile(uid),
        fetchConnectionData(uid),
      ]);
      await Promise.all([
        fetchSuggestions(uid, connSet, sentSet),
        fetchMyNetwork(uid),
      ]);
    } finally {
      setLoadingDiscover(false);
      setLoadingNetwork(false);
      setRefreshingDiscover(false);
      setRefreshingNetwork(false);
    }
  }, [fetchMyProfile, fetchConnectionData, fetchSuggestions, fetchMyNetwork]);

  useEffect(() => {
    if (userId) loadAllData(userId);
  }, [userId, loadAllData]);

  /* ── Search ── */
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      const q = searchQuery.trim().toLowerCase();
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, headline, university, is_verified, points, role')
          .or(`name.ilike.%${q}%,username.ilike.%${q}%,university.ilike.%${q}%,headline.ilike.%${q}%`)
          .neq('id', userId || '')
          .limit(100);
        setSearchResults((data as Profile[]) || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, userId]);

  /* ── Connect ── */
  const handleConnect = async (targetId: string) => {
    if (!userId) return;
    setConnecting(targetId);
    try {
      // Remove any stale record first
      await supabase
        .from('connections')
        .delete()
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${targetId}),and(requester_id.eq.${targetId},recipient_id.eq.${userId})`);

      const { error } = await supabase
        .from('connections')
        .insert({ requester_id: userId, recipient_id: targetId, status: 'pending' });

      if (error) throw error;

      // Optimistic update
      setSentRequests(prev => new Set([...prev, targetId]));
      setSuggestions(prev => prev.filter(p => p.id !== targetId));
    } catch {
      Alert.alert('Error', 'Could not send connection request. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  /* ── Accept / Reject request ── */
  const handleRequestAction = async (connectionId: string, action: 'accept' | 'reject') => {
    setProcessing(connectionId);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;

      // Remove from pending list
      setPendingRequests(prev => prev.filter(r => r.id !== connectionId));

      if (action === 'accept' && userId) {
        // Refresh network data
        await fetchMyNetwork(userId);
        await fetchConnectionData(userId);
      }
    } catch {
      Alert.alert('Error', `Could not ${action} request. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  /* ── Connection button state ── */
  const getConnectionState = (profileId: string): 'connect' | 'pending' | 'connected' => {
    if (connections.has(profileId)) return 'connected';
    if (sentRequests.has(profileId)) return 'pending';
    return 'connect';
  };

  /* ── Profile Card ── */
  const renderProfileCard = ({ item }: { item: Profile }) => {
    const state = getConnectionState(item.id);
    const isProcessing = connecting === item.id;

    return (
      <View style={styles.profileCard}>
        <Avatar uri={item.avatar_url} name={item.name} size={52} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {item.name || item.username || 'Unknown'}
            </Text>
            {item.is_verified && <CheckCircle2 size={14} color={colors.primary} style={{ marginLeft: 4 }} />}
          </View>
          {item.headline ? (
            <Text style={styles.profileHeadline} numberOfLines={1}>{item.headline}</Text>
          ) : null}
          {item.university ? (
            <View style={styles.uniRow}>
              <BookOpen size={11} color={colors.textSecondary} />
              <Text style={styles.profileUniversity} numberOfLines={1}> {item.university}</Text>
            </View>
          ) : null}
        </View>

        {state === 'connect' && (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => handleConnect(item.id)}
            disabled={isProcessing}
          >
            {isProcessing
              ? <ActivityIndicator size="small" color="#fff" />
              : <><UserPlus size={13} color="#fff" /><Text style={styles.connectBtnText}> Connect</Text></>
            }
          </TouchableOpacity>
        )}
        {state === 'pending' && (
          <View style={styles.pendingBtn}>
            <Text style={styles.pendingBtnText}>Sent</Text>
          </View>
        )}
        {state === 'connected' && (
          <View style={styles.connectedBtn}>
            <Check size={13} color={colors.primary} />
            <Text style={styles.connectedBtnText}> Connected</Text>
          </View>
        )}
      </View>
    );
  };

  /* ── Network connected person card ── */
  const renderNetworkCard = ({ item }: { item: Profile }) => (
    <View style={styles.profileCard}>
      <Avatar uri={item.avatar_url} name={item.name} size={52} />
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.profileName} numberOfLines={1}>
            {item.name || item.username || 'Unknown'}
          </Text>
          {item.is_verified && <CheckCircle2 size={14} color={colors.primary} style={{ marginLeft: 4 }} />}
        </View>
        {item.headline ? (
          <Text style={styles.profileHeadline} numberOfLines={1}>{item.headline}</Text>
        ) : null}
        {item.university ? (
          <View style={styles.uniRow}>
            <BookOpen size={11} color={colors.textSecondary} />
            <Text style={styles.profileUniversity} numberOfLines={1}> {item.university}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.messageBtn}
        onPress={() => navigation.navigate('Messages')}
      >
        <MessageCircle size={15} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  /* ── Pending request card ── */
  const renderPendingCard = ({ item }: { item: Connection }) => {
    const requester = (item as any).requester as Profile;
    if (!requester) return null;
    const isProcessing = processing === item.id;

    return (
      <View style={styles.pendingCard}>
        <Avatar uri={requester.avatar_url} name={requester.name} size={46} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName} numberOfLines={1}>
              {requester.name || requester.username || 'Unknown'}
            </Text>
            {requester.is_verified && <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 3 }} />}
          </View>
          {requester.university ? (
            <Text style={styles.profileUniversity} numberOfLines={1}>{requester.university}</Text>
          ) : null}
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.acceptBtn, isProcessing && { opacity: 0.5 }]}
            onPress={() => handleRequestAction(item.id, 'accept')}
            disabled={isProcessing}
          >
            {isProcessing
              ? <ActivityIndicator size="small" color="#fff" />
              : <Check size={16} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, isProcessing && { opacity: 0.5 }]}
            onPress={() => handleRequestAction(item.id, 'reject')}
            disabled={isProcessing}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const displayList = searchQuery.trim() ? searchResults : suggestions;
  const isDiscoverLoading = loadingDiscover && !refreshingDiscover;
  const isNetworkLoading = loadingNetwork && !refreshingNetwork;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Network</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Communities')}
            style={styles.communitiesHeaderBtn}
          >
            <Users size={15} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={styles.communitiesHeaderBtnText}>Communities</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.leaderboardBtn}>
            <Trophy size={19} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'network' && styles.tabActive]}
          onPress={() => setActiveTab('network')}
        >
          <Text style={[styles.tabText, activeTab === 'network' && styles.tabTextActive]}>
            My Network {myNetwork.length > 0 ? `(${myNetwork.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          renderItem={renderProfileCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshingDiscover}
              onRefresh={() => userId && loadAllData(userId, true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Communities Quick-Access Banner Card */}
              <TouchableOpacity
                style={styles.communitiesBannerCard}
                onPress={() => navigation.navigate('Communities')}
                activeOpacity={0.85}
              >
                <View style={styles.commBannerLeft}>
                  <View style={styles.commBannerIconBox}>
                    <Users size={22} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.commBannerTitle}>Campus Communities</Text>
                    <Text style={styles.commBannerSubtitle}>
                      Join academic clubs, tech circles, and student hubs
                    </Text>
                  </View>
                </View>
                <View style={styles.commBannerBadge}>
                  <Text style={styles.commBannerBadgeText}>Explore →</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.searchContainer}>
                <Search size={16} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search students..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searching && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 12 }} />}
              </View>
            </View>
          }
          ListEmptyComponent={
            isDiscoverLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Users size={40} color={colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {searchQuery.trim() ? 'No results found' : 'No suggestions right now'}
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* My Network Tab */}
      {activeTab === 'network' && (
        <FlatList
          data={[]}
          keyExtractor={() => 'placeholder'}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshingNetwork}
              onRefresh={() => userId && loadAllData(userId, true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>
                    Pending Requests ({pendingRequests.length})
                  </Text>
                  {pendingRequests.map(req => (
                    <React.Fragment key={req.id}>
                      {renderPendingCard({ item: req })}
                      <View style={styles.separator} />
                    </React.Fragment>
                  ))}
                </View>
              )}

              {/* My Connections */}
              <Text style={styles.sectionTitle}>
                Connections ({myNetwork.length})
              </Text>
              {isNetworkLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
              ) : myNetwork.length === 0 && pendingRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Users size={40} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>No connections yet</Text>
                  <Text style={styles.emptySubText}>Switch to Discover to find people to connect with</Text>
                </View>
              ) : myNetwork.length > 0 ? (
                myNetwork.map(profile => (
                  <React.Fragment key={profile.id}>
                    {renderNetworkCard({ item: profile })}
                    <View style={styles.separator} />
                  </React.Fragment>
                ))
              ) : null}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  communitiesHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  communitiesHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  leaderboardBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.sunYellowLight,
    borderWidth: 1,
    borderColor: colors.sunYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Communities Banner Card
  communitiesBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#064E3B',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  commBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  commBannerSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  commBannerBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  commBannerBadgeText: {
    color: '#064E3B',
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.coralLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.coral,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  profileHeadline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  profileUniversity: {
    fontSize: 11,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pendingBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  pendingBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  connectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 90,
    justifyContent: 'center',
  },
  connectedBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lilacLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lilac,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
