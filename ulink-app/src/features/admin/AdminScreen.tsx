import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../services/supabase';
import { Search, ShieldCheck, Mail, Users, Building2, BadgeCheck } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';

export const AdminScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        if (!user) return navigation.replace('Feed');

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            Alert.alert("Access Denied", "You do not have permission to view this page.");
            navigation.goBack();
        } else {
            fetchDashboardData();
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats (Try RPC first, fallback to count)
            const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');

            if (statsData && !statsError) {
                setStats(statsData);
            } else {
                // Fallback Counts
                const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: verified } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true);
                const { count: orgs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'org');

                setStats({
                    total_users: totalUsers || 0,
                    total_verified: verified || 0,
                    total_orgs: orgs || 0
                });
            }

            // 2. Fetch Users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Pagination could be added later

            if (usersData) setUsers(usersData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.trim().length === 0) {
            fetchDashboardData(); // Reset
            return;
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .or(`name.ilike.%${text}%,email.ilike.%${text}%`)
            .limit(50);

        if (data) setUsers(data);
    };

    const toggleVerify = async (userId: string, currentStatus: boolean) => {
        // Optimistic Update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));

        // Try RPC first (more secure logic usually)
        const { error: rpcError } = await supabase.rpc('admin_toggle_verify', {
            target_id: userId,
            should_verify: !currentStatus
        });

        if (rpcError) {
            console.log('RPC verify failed, trying direct update...');
            // Fallback direct update (if RLS allows admins)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_verified: !currentStatus })
                .eq('id', userId);

            if (updateError) {
                console.error('Failed to update verification:', updateError);
                Alert.alert("Error", "Could not update user status.");
                // Revert
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: currentStatus } : u));
            }
        }
    };

    const renderUser = ({ item }: { item: any }) => (
        <GlassCard style={styles.userCard}>
            <View style={styles.userInfo}>
                <Image
                    source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}` }}
                    style={styles.avatar}
                />
                <View style={styles.userDetails}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.name}</Text>
                        {item.is_verified && <ShieldCheck size={14} color="#3B82F6" fill="#DBEAFE" />}
                        {item.is_admin && <Text style={styles.adminBadge}>ADMIN</Text>}
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userRole}>{item.role === 'org' ? 'Organization' : item.university || 'Student'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, item.is_verified ? styles.unverifyBtn : styles.verifyBtn]}
                onPress={() => toggleVerify(item.id, item.is_verified || false)}
            >
                <Text style={[styles.actionText, item.is_verified ? styles.unverifyText : styles.verifyText]}>
                    {item.is_verified ? 'Revoke' : 'Verify'}
                </Text>
            </TouchableOpacity>
        </GlassCard>
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    {/* Reuse back arrow or just rely on title context */}
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Admin Dashboard</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <GlassCard style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                            <Users size={20} color="#10B981" />
                        </View>
                        <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                            <BadgeCheck size={20} color="#3B82F6" />
                        </View>
                        <Text style={styles.statValue}>{stats?.total_verified || 0}</Text>
                        <Text style={styles.statLabel}>Verified</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                            <Building2 size={20} color="#F97316" />
                        </View>
                        <Text style={styles.statValue}>{stats?.total_orgs || 0}</Text>
                        <Text style={styles.statLabel}>Orgs</Text>
                    </GlassCard>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={colors.light.muted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor={colors.light.muted}
                    />
                </View>

                {/* List Header */}
                <Text style={styles.sectionTitle}>User Management</Text>

                {/* User List */}
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.light.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View>
                        {users.map(user => (
                            <View key={user.id} style={{ marginBottom: 12 }}>
                                {renderUser({ item: user })}
                            </View>
                        ))}
                        {users.length === 0 && (
                            <Text style={styles.emptyText}>No users found.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    backText: {
        fontSize: 24,
        color: colors.light.text,
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: colors.light.border,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
    },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
        marginBottom: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    userDetails: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    userName: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.text,
    },
    adminBadge: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
        color: '#10B981', // Emerald
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userEmail: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
        marginBottom: 2,
    },
    userRole: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 10,
        color: colors.light.muted,
        opacity: 0.8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    verifyBtn: {
        backgroundColor: '#EFF6FF',
    },
    unverifyBtn: {
        backgroundColor: '#FFF1F2',
    },
    actionText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 12,
    },
    verifyText: {
        color: '#3B82F6',
    },
    unverifyText: {
        color: '#F43F5E',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.light.muted,
        marginTop: 20,
        fontFamily: 'Outfit_400Regular',
    }
});
