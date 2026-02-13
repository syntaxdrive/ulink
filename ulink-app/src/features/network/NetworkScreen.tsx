import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { useNetwork, Profile } from './hooks/useNetwork';
import { Search, UserPlus, Check, MessageCircle, School, ShieldCheck, X } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';

export const NetworkScreen = () => {
    const navigation = useNavigation<any>();
    const {
        suggestions,
        myNetwork,
        leaderboard,
        loadingLeaderboard,
        fetchLeaderboard,
        fetchNetworkData,
        receivedRequests,
        loading,
        connections,
        sentRequests,
        connecting,
        accepting,
        acceptRequest,
        rejectRequest,
        connect,
        searchUsers,
        searchResults,
        searching,
        userProfile
    } = useNetwork();

    const [activeTab, setActiveTab] = useState<'grow' | 'network' | 'leaderboard'>('grow');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'university' | 'verified'>('all');

    useEffect(() => {
        if (activeTab === 'leaderboard' && leaderboard.length === 0) {
            fetchLeaderboard();
        }
    }, [activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const onRefresh = async () => {
        if (activeTab === 'leaderboard') {
            await fetchLeaderboard();
        } else {
            await fetchNetworkData();
        }
    };

    const displayedProfiles = searchQuery.trim()
        ? searchResults
        : (activeTab === 'grow' ? suggestions : (activeTab === 'network' ? myNetwork : leaderboard));

    const filteredProfiles = displayedProfiles.filter((profile: Profile) => {
        if (activeTab === 'leaderboard') return true; // Don't filter leaderboard by university/verified for now
        if (activeFilter === 'university') {
            if (!userProfile?.university || !profile.university) return false;
            return profile.university.toLowerCase().trim() === userProfile.university.toLowerCase().trim();
        }
        if (activeFilter === 'verified') {
            return profile.is_verified || profile.gold_verified;
        }
        return true;
    });

    const renderInvitationItem = ({ item }: { item: any }) => (
        <GlassCard style={styles.invitationCard}>
            <View style={styles.invitationRow}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.id })}>
                    <Image
                        source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }}
                        style={styles.invitationAvatar}
                    />
                </TouchableOpacity>
                <View style={styles.invitationInfo}>
                    <Text style={styles.invitationName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.invitationRole} numberOfLines={1}>{item.role === 'org' ? 'Organization' : item.university}</Text>
                </View>
                <View style={styles.invitationActions}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => rejectRequest(item.id)}
                    >
                        <X size={20} color={colors.light.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptRequest(item.id)}
                        disabled={accepting === item.id}
                    >
                        {accepting === item.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Check size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </GlassCard>
    );

    const renderLeaderboardItem = ({ item, index }: { item: any, index: number }) => {
        const getRankColor = (i: number) => {
            switch (i) {
                case 0: return '#EAB308'; // Gold
                case 1: return '#94A3B8'; // Silver
                case 2: return '#B45309'; // Bronze
                default: return colors.light.text;
            }
        };

        return (
            <GlassCard style={styles.leaderboardCard}>
                <View style={styles.leaderboardRow}>
                    <Text style={[styles.rankText, { color: getRankColor(index) }]}>#{index + 1}</Text>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.id })}>
                        <Image
                            source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }}
                            style={styles.leaderboardAvatar}
                        />
                    </TouchableOpacity>

                    <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName} numberOfLines={1}>
                            {item.name} {item.id === userProfile?.id && '(You)'}
                        </Text>
                        <View style={styles.statsRow}>
                            <Text style={styles.statsText}>{item.posts_count || 0} Posts</Text>
                            <Text style={styles.statsDot}>•</Text>
                            <Text style={styles.statsText}>{item.comments_count || 0} Comments</Text>
                        </View>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{item.score}</Text>
                        <Text style={styles.scoreLabel}>pts</Text>
                    </View>
                </View>
            </GlassCard>
        );
    };

    const renderProfileItem = ({ item }: { item: any }) => (
        <GlassCard style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.id })} style={styles.cardContent}>
                <Image
                    source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }}
                    style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        {item.gold_verified ? (
                            <ShieldCheck size={14} color="#EAB308" fill="#FEF08A" />
                        ) : item.is_verified ? (
                            <ShieldCheck size={14} color="#3B82F6" fill="#DBEAFE" />
                        ) : null}
                    </View>
                    <Text style={styles.role} numberOfLines={1}>
                        {item.role === 'org' ? 'Organization' : item.university}
                    </Text>
                    <Text style={styles.subtext} numberOfLines={1}>{item.headline || item.role}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actionContainer}>
                {activeTab === 'grow' ? (
                    <TouchableOpacity
                        onPress={() => connect(item.id)}
                        disabled={connections.has(item.id) || sentRequests.has(item.id) || connecting === item.id}
                        style={[
                            styles.button,
                            connections.has(item.id) ? styles.connectedButton :
                                sentRequests.has(item.id) ? styles.sentButton : styles.connectButton
                        ]}
                    >
                        {connections.has(item.id) ? (
                            <Check size={18} color={colors.light.primary} />
                        ) : sentRequests.has(item.id) ? (
                            <Text style={styles.sentText}>Sent</Text>
                        ) : connecting === item.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <UserPlus size={18} color="#FFF" />
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Chat', { chatId: item.id, chatName: item.name, chatAvatar: item.avatar_url })}
                        style={styles.messageButton}
                    >
                        <MessageCircle size={18} color={colors.light.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </GlassCard>
    );

    if (loading && activeTab !== 'leaderboard') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Network</Text>
                <Text style={styles.headerSubtitle}>Connect with students & alumni</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Search size={20} color={colors.light.muted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search people..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.light.muted}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'grow' && styles.activeTab]}
                    onPress={() => setActiveTab('grow')}
                >
                    <Text style={[styles.tabText, activeTab === 'grow' && styles.activeTabText]}>Grow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'network' && styles.activeTab]}
                    onPress={() => setActiveTab('network')}
                >
                    <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>
                        My Network
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
                    onPress={() => setActiveTab('leaderboard')}
                >
                    <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
                        Top 50
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filters (Hide on Leaderboard for now) */}
            {activeTab !== 'leaderboard' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
                    </TouchableOpacity>
                    {userProfile?.university && (
                        <TouchableOpacity
                            style={[styles.filterChip, activeFilter === 'university' && styles.activeFilterChip]}
                            onPress={() => setActiveFilter('university')}
                        >
                            <School size={14} color={activeFilter === 'university' ? '#FFF' : colors.light.muted} />
                            <Text style={[styles.filterText, activeFilter === 'university' && styles.activeFilterText]}>{userProfile.university}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.filterChip, activeFilter === 'verified' && styles.activeFilterChip]}
                        onPress={() => setActiveFilter('verified')}
                    >
                        <ShieldCheck size={14} color={activeFilter === 'verified' ? '#FFF' : colors.light.muted} />
                        <Text style={[styles.filterText, activeFilter === 'verified' && styles.activeFilterText]}>Verified</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {activeTab === 'leaderboard' && loadingLeaderboard ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProfiles}
                    renderItem={activeTab === 'leaderboard' ? renderLeaderboardItem : renderProfileItem}
                    keyExtractor={(item) => item.id}
                    numColumns={activeTab === 'leaderboard' ? 1 : 2}
                    key={activeTab === 'leaderboard' ? 'leaderboard' : 'grid'} // Force re-render on layout change
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={activeTab === 'leaderboard' ? undefined : styles.columnWrapper}
                    onRefresh={onRefresh}
                    refreshing={activeTab === 'leaderboard' ? loadingLeaderboard : loading}
                    ListHeaderComponent={
                        activeTab === 'grow' && receivedRequests.length > 0 && !searchQuery ? (
                            <View style={styles.invitationsSection}>
                                <Text style={styles.sectionTitle}>Invitations ({receivedRequests.length})</Text>
                                {receivedRequests.map(item => (
                                    <View key={item.id} style={{ marginBottom: 8 }}>
                                        {renderInvitationItem({ item })}
                                    </View>
                                ))}
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'grow' ? "No suggestions found." : (activeTab === 'leaderboard' ? "Leaderboard empty." : "No connections yet.")}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        paddingTop: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        color: colors.light.text,
    },
    headerSubtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
    },
    searchContainer: {
        marginHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: colors.light.border,
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
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.light.border,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.light.text,
    },
    tabText: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.muted,
        fontSize: 14,
    },
    activeTabText: {
        color: '#FFF',
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        marginBottom: 10,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: colors.light.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeFilterChip: {
        backgroundColor: colors.light.text,
        borderColor: colors.light.text,
    },
    filterText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 12,
        color: colors.light.muted,
    },
    activeFilterText: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        flex: 1,
        marginBottom: 12,
        maxWidth: '48%',
        padding: 12,
        alignItems: 'center',
    },
    cardContent: {
        alignItems: 'center',
        width: '100%',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        backgroundColor: colors.light.border,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.text,
        textAlign: 'center',
    },
    role: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
        textAlign: 'center',
        marginBottom: 2,
    },
    subtext: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 10,
        color: colors.light.muted,
        textAlign: 'center',
        opacity: 0.7,
        textTransform: 'capitalize',
    },
    actionContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    connectButton: {
        backgroundColor: colors.light.text,
    },
    connectedButton: {
        backgroundColor: '#ECFDF5',
    },
    sentButton: {
        backgroundColor: colors.light.border,
        width: 'auto',
        paddingHorizontal: 12,
    },
    sentText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 12,
        color: colors.light.muted,
    },
    messageButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Outfit_400Regular',
        color: colors.light.muted,
        textAlign: 'center',
    },
    // Invitation Styles
    invitationsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
        marginBottom: 12,
    },
    invitationCard: {
        padding: 12,
    },
    invitationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    invitationAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    invitationInfo: {
        flex: 1,
    },
    invitationName: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.text,
    },
    invitationRole: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    invitationActions: {
        flexDirection: 'row',
        gap: 8,
    },
    acceptButton: {
        backgroundColor: colors.light.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButton: {
        backgroundColor: colors.light.background,
        borderWidth: 1,
        borderColor: colors.light.border,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Leaderboard Styles
    leaderboardCard: {
        padding: 16,
        marginBottom: 12,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        marginRight: 16,
        width: 30,
        textAlign: 'center',
    },
    leaderboardAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statsText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    statsDot: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
        marginHorizontal: 6,
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
    },
    scoreText: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.primary,
    },
    scoreLabel: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 10,
        color: colors.light.muted,
        marginTop: -2,
    }
});
