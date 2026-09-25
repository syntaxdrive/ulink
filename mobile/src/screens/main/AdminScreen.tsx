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
  pending_podcasts: number;
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
    pending_podcasts: 0,
  });
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'podcasts'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [adminPodcasts, setAdminPodcasts] = useState<any[]>([]);
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
        { count: podcastPendingCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('podcasts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        total_users: userCount || 0,
        total_verified: verifiedCount || 0,
        total_posts: postCount || 0,
        total_communities: commCount || 0,
        pending_reports: reportCount || 0,
        pending_podcasts: podcastPendingCount || 0,
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

      // 4. Fetch All Podcasts for Moderation
      const { data: podData } = await supabase
        .from('podcasts')
        .select(`
          *,
          creator:profiles!creator_id(id, name, username, avatar_url),
          episodes:podcast_episodes(*)
        `)
        .order('created_at', { ascending: false });

      if (podData) {
        setAdminPodcasts(podData);
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

  // Approve a Podcast Show
  const handleApprovePodcast = async (pod: any) => {
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ status: 'approved' })
        .eq('id', pod.id);

      if (error) throw error;

      setAdminPodcasts((prev) =>
        prev.map((p) => (p.id === pod.id ? { ...p, status: 'approved' } : p))
      );
      setStats((s) => ({ ...s, pending_podcasts: Math.max(0, s.pending_podcasts - 1) }));

      // Send approval notification to student creator
      if (pod.creator_id) {
        try {
          await supabase.from('notifications').insert({
            user_id: pod.creator_id,
            type: 'podcast_approved',
            title: 'Podcast Approved! 🎉',
            message: `Your podcast "${pod.title}" has been approved by campus admins and is now live on UniLink!`,
            action_url: `/podcasts/${pod.id}`,
            read: false,
          });
        } catch {}
      }

      Alert.alert('Approved! 🎉', `"${pod.title}" is now approved and live for all campus students!`);
    } catch (err: any) {
      Alert.alert('Approval Error', err.message || 'Could not approve podcast.');
    }
  };

  // Reject a Podcast Show
  const handleRejectPodcast = async (pod: any) => {
    Alert.alert(
      'Reject Podcast?',
      `Are you sure you want to reject "${pod.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('podcasts')
                .update({ status: 'rejected' })
                .eq('id', pod.id);

              if (error) throw error;

              setAdminPodcasts((prev) =>
                prev.map((p) => (p.id === pod.id ? { ...p, status: 'rejected' } : p))
              );
              setStats((s) => ({ ...s, pending_podcasts: Math.max(0, s.pending_podcasts - 1) }));

              if (pod.creator_id) {
                try {
                  await supabase.from('notifications').insert({
                    user_id: pod.creator_id,
                    type: 'podcast_rejected',
                    title: 'Podcast Update',
                    message: `Your podcast "${pod.title}" requires modifications before it can be approved.`,
                    action_url: `/podcasts/${pod.id}`,
                    read: false,
                  });
                } catch {}
              }

              Alert.alert('Podcast Rejected', `"${pod.title}" has been marked as rejected.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not reject podcast.');
            }
          },
        },
      ]
    );
  };

  // Delete a Podcast
  const handleDeletePodcast = async (pod: any) => {
    Alert.alert(
      'Delete Podcast?',
      `Permanently remove "${pod.title}" and its episodes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('podcasts')
                .delete()
                .eq('id', pod.id);

              if (error) throw error;

              setAdminPodcasts((prev) => prev.filter((p) => p.id !== pod.id));
              Alert.alert('Deleted', `"${pod.title}" was removed.`);
            } catch (err: any) {
              Alert.alert('Delete Error', err.message || 'Could not delete podcast.');
            }
          },
        },
      ]
    );
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

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'podcasts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('podcasts')}
          >
            <Radio size={15} color={activeTab === 'podcasts' ? '#ffffff' : '#000000'} />
            <Text style={[styles.tabBtnText, activeTab === 'podcasts' && styles.tabBtnTextActive]}>
              Shows ({adminPodcasts.length})
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

        {/* ── TAB 3: PODCASTS APPROVAL & MODERATION ── */}
        {activeTab === 'podcasts' && (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#000000" style={{ marginTop: 24 }} />
            ) : adminPodcasts.length === 0 ? (
              <View style={styles.emptyState}>
                <Radio size={36} color="#059669" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No Podcasts Found</Text>
                <Text style={styles.emptyText}>No student podcasts have been submitted yet.</Text>
              </View>
            ) : (
              <View style={styles.reportList}>
                {adminPodcasts.map((pod) => {
                  const isPending = pod.status === 'pending';
                  const isApproved = pod.status === 'approved';
                  const isRejected = pod.status === 'rejected';

                  return (
                    <View key={pod.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View
                          style={[
                            styles.reportReasonBadge,
                            {
                              backgroundColor: isApproved
                                ? '#ECFDF5'
                                : isPending
                                ? '#FFFBEB'
                                : '#FEF2F2',
                            },
                          ]}
                        >
                          <Radio
                            size={12}
                            color={isApproved ? '#059669' : isPending ? '#D97706' : '#DC2626'}
                          />
                          <Text
                            style={[
                              styles.reportReasonText,
                              {
                                color: isApproved ? '#059669' : isPending ? '#D97706' : '#DC2626',
                              },
                            ]}
                          >
                            {pod.status?.toUpperCase() || 'PENDING'}
                          </Text>
                        </View>
                        <Text style={styles.reportDate}>
                          {new Date(pod.created_at).toLocaleDateString()}
                        </Text>
                      </View>

                      {/* Podcast Meta */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                        {pod.cover_url ? (
                          <Image source={{ uri: pod.cover_url }} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 10 }} />
                        ) : (
                          <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Radio size={20} color="#059669" />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '800', color: '#000000' }}>
                            {pod.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>
                            Category: {pod.category || 'Other'} · {pod.episodes?.length || pod.episodes_count || 0} episodes
                          </Text>
                        </View>
                      </View>

                      {pod.description ? (
                        <Text style={[styles.reportDetails, { marginTop: 2, marginBottom: 8 }]}>
                          {pod.description}
                        </Text>
                      ) : null}

                      <Text style={styles.reportDetails}>
                        Created by:{' '}
                        <Text style={{ fontWeight: '700', color: '#000000' }}>
                          {pod.creator?.name || pod.creator?.username || 'Student Creator'}
                        </Text>
                      </Text>

                      {/* Action Buttons */}
                      <View style={[styles.reportActionsRow, { gap: 8 }]}>
                        {isPending && (
                          <TouchableOpacity
                            style={[styles.dismissReportBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                            onPress={() => handleApprovePodcast(pod)}
                          >
                            <Check size={14} color="#000000" />
                            <Text style={[styles.dismissReportText, { color: '#000000', fontWeight: '800' }]}>
                              Approve Show
                            </Text>
                          </TouchableOpacity>
                        )}

                        {!isRejected && (
                          <TouchableOpacity
                            style={[styles.dismissReportBtn, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}
                            onPress={() => handleRejectPodcast(pod)}
                          >
                            <X size={14} color="#DC2626" />
                            <Text style={[styles.dismissReportText, { color: '#DC2626' }]}>
                              Reject
                            </Text>
                          </TouchableOpacity>
                        )}

                        {isApproved && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                            <CheckCircle2 size={13} color="#059669" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>Live on UniLink</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={{ padding: 6, marginLeft: 'auto' }}
                          onPress={() => handleDeletePodcast(pod)}
                        >
                          <Trash2 size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
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
