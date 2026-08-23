import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Search,
  Check,
  X,
  Trash2,
  Megaphone,
  BarChart3,
  ChevronRight,
  UserCheck,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface AdminStats {
  total_users: number;
  total_verified: number;
  total_posts: number;
  total_communities: number;
  pending_reports: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  username: string | null;
  email?: string | null;
  university: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_admin: boolean;
  role: string | null;
  created_at: string;
}

interface AdminReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  post_id?: string;
  reporter?: { name: string; email: string; avatar_url: string };
  reported?: { name: string; email: string; avatar_url: string };
}

export default function AdminScreen({ navigation }: any) {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_verified: 0,
    total_posts: 0,
    total_communities: 0,
    pending_reports: 0,
  });
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'stats'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      // 1. Fetch live counts
      const [
        { count: userCount },
        { count: verifiedCount },
        { count: postCount },
        { count: commCount },
        { count: reportCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        total_users: userCount || 0,
        total_verified: verifiedCount || 0,
        total_posts: postCount || 0,
        total_communities: commCount || 0,
        pending_reports: reportCount || 0,
      });

      // 2. Fetch Users
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, name, username, email, university, avatar_url, is_verified, is_admin, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (userData) {
        setUsers(userData as AdminUser[]);
      }

      // 3. Fetch Pending Reports
      const { data: reportData } = await supabase
        .from('reports')
        .select(`
          id, reason, status, created_at, post_id,
          reporter:reporter_id(name, email, avatar_url),
          reported:reported_id(name, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(30);

      if (reportData) {
        setReports(reportData as any);
      }
    } catch (error) {
      console.warn('Error loading admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  // Toggle Verification status for a user
  const handleToggleVerified = async (user: AdminUser) => {
    const nextState = !user.is_verified;
    setUpdatingUserId(user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: nextState })
        .eq('id', user.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_verified: nextState } : u))
      );
      setStats((s) => ({
        ...s,
        total_verified: nextState ? s.total_verified + 1 : s.total_verified - 1,
      }));
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update verification status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Toggle Admin role for a user
  const handleToggleAdmin = async (user: AdminUser) => {
    const nextState = !user.is_admin;
    Alert.alert(
      nextState ? 'Grant Admin Privileges?' : 'Revoke Admin Privileges?',
      `Are you sure you want to ${nextState ? 'make' : 'remove'} ${user.name || user.username} as an admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: nextState ? 'Make Admin' : 'Revoke',
          style: nextState ? 'default' : 'destructive',
          onPress: async () => {
            setUpdatingUserId(user.id);
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ is_admin: nextState })
                .eq('id', user.id);

              if (error) throw error;

              setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_admin: nextState } : u))
              );
            } catch (err: any) {
              Alert.alert('Update Failed', err.message || 'Could not update admin role.');
            } finally {
              setUpdatingUserId(null);
            }
          },
        },
      ]
    );
  };

  // Resolve or Dismiss a Report
  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((s) => ({ ...s, pending_reports: Math.max(0, s.pending_reports - 1) }));
      Alert.alert('Report Resolved', 'The report has been marked as resolved.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not resolve report.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.university && u.university.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#000000" />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Shield size={20} color="#000000" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>

        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>Staff</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Metric Cards Grid (White & Emerald Palette) */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
            <Users size={18} color="#059669" />
            <Text style={styles.metricValue}>{stats.total_users}</Text>
            <Text style={styles.metricLabel}>Total Students</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
            <CheckCircle2 size={18} color="#059669" />
            <Text style={[styles.metricValue, { color: '#065F46' }]}>{stats.total_verified}</Text>
            <Text style={[styles.metricLabel, { color: '#047857' }]}>Verified Badges</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
            <FileText size={18} color="#059669" />
            <Text style={styles.metricValue}>{stats.total_posts}</Text>
            <Text style={styles.metricLabel}>Campus Posts</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }]}>
            <AlertTriangle size={18} color="#111827" />
            <Text style={styles.metricValue}>{stats.pending_reports}</Text>
            <Text style={styles.metricLabel}>Pending Reports</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
            onPress={() => setActiveTab('users')}
          >
            <Users size={15} color={activeTab === 'users' ? '#ffffff' : '#000000'} />
            <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
              Students ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reports' && styles.tabBtnActive]}
            onPress={() => setActiveTab('reports')}
          >
            <AlertTriangle size={15} color={activeTab === 'reports' ? '#ffffff' : '#000000'} />
            <Text style={[styles.tabBtnText, activeTab === 'reports' && styles.tabBtnTextActive]}>
              Reports ({reports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TAB 1: USERS DIRECTORY & VERIFICATION ── */}
        {activeTab === 'users' && (
          <View style={styles.tabContent}>
            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Search size={16} color="rgba(0,0,0,0.5)" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, @username, or university..."
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#000000" style={{ marginTop: 24 }} />
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No students found matching your search.</Text>
              </View>
            ) : (
              <View style={styles.userList}>
                {filteredUsers.map((user) => (
                  <View key={user.id} style={styles.userCard}>
                    <View style={styles.userCardLeft}>
                      {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
                      ) : (
                        <View style={styles.userAvatarPlaceholder}>
                          <Text style={styles.userAvatarInitial}>
                            {(user.name || user.username || 'U')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userNameText} numberOfLines={1}>
                            {user.name || 'Anonymous Student'}
                          </Text>
                          {user.is_verified && (
                            <CheckCircle2 size={13} color="#2563EB" fill="#2563EB" style={{ marginLeft: 4 }} />
                          )}
                          {user.is_admin && (
                            <View style={styles.adminMiniBadge}>
                              <Text style={styles.adminMiniBadgeText}>Admin</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.userMetaText}>
                          @{user.username || 'unknown'} · {user.university || 'UniLink Campus'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.userActionRow}>
                      <TouchableOpacity
                        style={[
                          styles.verifyToggleBtn,
                          user.is_verified && styles.verifyToggleBtnActive,
                        ]}
                        onPress={() => handleToggleVerified(user)}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <>
                            <CheckCircle2
                              size={13}
                              color={user.is_verified ? '#2563EB' : 'rgba(0,0,0,0.6)'}
                            />
                            <Text
                              style={[
                                styles.verifyToggleText,
                                user.is_verified && styles.verifyToggleTextActive,
                              ]}
                            >
                              {user.is_verified ? 'Verified' : 'Verify'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.adminToggleBtn, user.is_admin && styles.adminToggleBtnActive]}
                        onPress={() => handleToggleAdmin(user)}
                        disabled={updatingUserId === user.id}
                      >
                        <Shield
                          size={13}
                          color={user.is_admin ? '#ffffff' : 'rgba(0,0,0,0.6)'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── TAB 2: CONTENT REPORTS MODERATION ── */}
        {activeTab === 'reports' && (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#000000" style={{ marginTop: 24 }} />
            ) : reports.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle2 size={36} color="#059669" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>All Clear!</Text>
                <Text style={styles.emptyText}>There are no pending reports on campus content.</Text>
              </View>
            ) : (
              <View style={styles.reportList}>
                {reports.map((report) => (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                      <View style={styles.reportReasonBadge}>
                        <AlertTriangle size={12} color="#DC2626" />
                        <Text style={styles.reportReasonText}>{report.reason || 'Flagged Content'}</Text>
                      </View>
                      <Text style={styles.reportDate}>
                        {new Date(report.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={styles.reportDetails}>
                      Reported by:{' '}
                      <Text style={{ fontWeight: '700', color: '#000000' }}>
                        {report.reporter?.name || 'Anonymous'}
                      </Text>{' '}
                      against{' '}
                      <Text style={{ fontWeight: '700', color: '#000000' }}>
                        {report.reported?.name || 'Content Author'}
                      </Text>
                    </Text>

                    <View style={styles.reportActionsRow}>
                      <TouchableOpacity
                        style={styles.dismissReportBtn}
                        onPress={() => handleDismissReport(report.id)}
                      >
                        <Check size={14} color="#000000" />
                        <Text style={styles.dismissReportText}>Dismiss / Resolve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.4,
  },
  badgePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  // Metric Cards Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: (width - 46) / 2,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    marginTop: 8,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#000000',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },

  tabContent: {
    gap: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 10,
  },

  // User List
  userList: {
    gap: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarInitial: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  adminMiniBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    marginLeft: 6,
  },
  adminMiniBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
  },
  userMetaText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.55)',
    marginTop: 2,
  },
  userActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  verifyToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifyToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.6)',
  },
  verifyToggleTextActive: {
    color: '#059669',
  },
  adminToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminToggleBtnActive: {
    backgroundColor: '#000000',
  },

  // Report Card
  reportList: {
    gap: 10,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportReasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  reportReasonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  reportDate: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
  },
  reportDetails: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.7)',
    lineHeight: 18,
    marginBottom: 12,
  },
  reportActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 6,
  },
  dismissReportText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
  },
});
