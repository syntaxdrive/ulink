import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Trophy, ChevronLeft, CheckCircle2, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  university: string | null;
  headline: string | null;
  points: number;
  is_verified: boolean;
}

interface UserRank {
  rank: number;
  total_users: number;
  points: number;
}

/* ─── Point Activities ───────────────────────────────────── */
const POINT_ACTIVITIES = [
  { points: 10,  label: 'Create a Post' },
  { points: 2,   label: 'Receive a Like' },
  { points: 5,   label: 'Comment' },
  { points: 15,  label: 'Make a Connection' },
  { points: 110, label: 'Complete Profile', note: 'one-time' },
];

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ uri, name, size = 44 }: { uri?: string | null; name?: string | null; size?: number }) {
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

/* ─── Rank Badge ─────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🏆</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return (
    <Text style={[
      styles.rankNumber,
      rank <= 10 ? { color: colors.primary } : { color: colors.textSecondary },
    ]}>
      #{rank}
    </Text>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ── Fetch ── */
  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      setCurrentUserId(uid);

      // Try Supabase RPC (same as web app)
      const { data: lbData, error: lbError } = await supabase
        .rpc('get_leaderboard', { p_limit: 100, p_offset: 0 });

      if (!lbError && lbData) {
        setLeaderboard(lbData as LeaderboardEntry[]);
      } else {
        // Fallback: query profiles directly sorted by points
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url, university, headline, is_verified, points')
          .order('points', { ascending: false })
          .limit(100);

        if (profiles) {
          const ranked = (profiles as any[]).map((p, i) => ({
            rank: i + 1,
            user_id: p.id,
            name: p.name,
            username: p.username,
            avatar_url: p.avatar_url,
            university: p.university,
            headline: p.headline,
            points: p.points || 0,
            is_verified: p.is_verified || false,
          }));
          setLeaderboard(ranked);
        }
      }

      // Fetch user rank
      if (uid) {
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_user_rank', { p_user_id: uid });

        if (!rankError && rankData && rankData.length > 0) {
          setUserRank(rankData[0] as UserRank);
        } else {
          // Fallback: calculate rank from leaderboard
          const myEntry = leaderboard.find(e => e.user_id === uid);
          if (myEntry) {
            setUserRank({ rank: myEntry.rank, total_users: leaderboard.length, points: myEntry.points });
          }
        }
      }
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Render row ── */
  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.user_id === currentUserId;
    return (
      <View style={[styles.row, isMe && styles.myRow]}>
        <View style={styles.rankCol}>
          <RankBadge rank={item.rank} />
        </View>
        <Avatar uri={item.avatar_url} name={item.name} size={42} />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, isMe && { color: colors.primary }]} numberOfLines={1}>
              {item.name || item.username || 'Unknown'}
              {isMe ? ' (You)' : ''}
            </Text>
            {item.is_verified && (
              <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          {item.university ? (
            <View style={styles.uniRow}>
              <BookOpen size={11} color={colors.textSecondary} />
              <Text style={styles.uniText} numberOfLines={1}> {item.university}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{(item.points || 0).toLocaleString()}</Text>
          <Text style={styles.ptLabel}>pts</Text>
        </View>
      </View>
    );
  };

  /* ── My rank card (pinned at top) ── */
  const MyRankCard = () => {
    if (!userRank || !currentUserId) return null;
    const me = leaderboard.find(e => e.user_id === currentUserId);
    return (
      <View style={styles.myRankCard}>
        <View>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <Text style={styles.myRankNumber}>#{userRank.rank}</Text>
          <Text style={styles.myRankTotal}>of {userRank.total_users} users</Text>
        </View>
        <View style={styles.myRankRight}>
          <Trophy size={28} color="#F59E0B" />
          <Text style={styles.myRankPoints}>{(userRank.points || 0).toLocaleString()} pts</Text>
        </View>
      </View>
    );
  };

  /* ── Points info panel ── */
  const PointsPanel = () => (
    <View style={styles.pointsPanel}>
      <Text style={styles.pointsPanelTitle}>How to Earn Points</Text>
      <View style={styles.pointsPanelGrid}>
        {POINT_ACTIVITIES.map(a => (
          <View key={a.label} style={styles.pointsPanelItem}>
            <Text style={styles.pointsPanelPts}>+{a.points}</Text>
            <Text style={styles.pointsPanelLabel}>{a.label}</Text>
            {a.note ? <Text style={styles.pointsPanelNote}>{a.note}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={item => item.user_id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLeaderboard(true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              <MyRankCard />
              <Text style={styles.sectionTitle}>Top 100</Text>
            </View>
          }
          ListFooterComponent={<PointsPanel />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Trophy size={40} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No leaderboard data yet</Text>
            </View>
          }
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  listContent: {
    paddingBottom: 40,
  },
  myRankCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.text,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myRankNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 42,
  },
  myRankTotal: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  myRankRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  myRankPoints: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myRow: {
    backgroundColor: colors.primaryLight,
  },
  rankCol: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  uniText: {
    fontSize: 11,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  pointsBadge: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  ptLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 16,
  },
  pointsPanel: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsPanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  pointsPanelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pointsPanelItem: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    minWidth: '45%',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsPanelPts: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  pointsPanelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  pointsPanelNote: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
