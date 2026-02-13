import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useSearch } from './hooks/useSearch';
import { PostCard } from '../feed/components/PostCard';

export const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const { query, setQuery, results, loading, type, setType } = useSearch();

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.userItem}>
            <Image
                source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userHandle}>@{item.email?.split('@')[0] || 'user'}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPostItem = ({ item }: { item: any }) => (
        <PostCard
            post={item}
            onLike={() => { }}
            onComment={(post) => navigation.navigate('PostDetails', { post })}
            onRepost={() => { }}
            onShare={() => { }}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Search</Text>
            </View>

            <View style={styles.searchSection}>
                <GlassCard style={styles.searchContainer}>
                    <Search size={20} color={colors.light.muted} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search..."
                        placeholderTextColor={colors.light.muted}
                        style={styles.searchInput}
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                    />
                </GlassCard>

                {/* Filter Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, type === 'users' && styles.activeTab]}
                        onPress={() => setType('users')}
                    >
                        <Text style={[styles.tabText, type === 'users' && styles.activeTabText]}>People</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, type === 'posts' && styles.activeTab]}
                        onPress={() => setType('posts')}
                    >
                        <Text style={[styles.tabText, type === 'posts' && styles.activeTabText]}>Posts</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="small" color={colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={type === 'users' ? renderUserItem : renderPostItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query ? (
                            <Text style={styles.emptyText}>No results found.</Text>
                        ) : (
                            <View style={styles.trendingContainer}>
                                <Text style={styles.sectionHeader}>Trending</Text>
                                <View style={styles.trendingItem}>
                                    <Text style={styles.hashtag}>#UniLink</Text>
                                    <Text style={styles.postCount}>Top Community</Text>
                                </View>
                            </View>
                        )
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 28,
        color: colors.light.text,
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.light.border,
        backgroundColor: colors.light.background,
    },
    activeTab: {
        backgroundColor: colors.light.text,
        borderColor: colors.light.text,
    },
    tabText: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.muted,
    },
    activeTabText: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    center: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.light.muted,
        marginTop: 40,
        fontFamily: 'Outfit_400Regular',
    },
    // User Item Styles
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
    },
    userHandle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
    },
    // Trending
    trendingContainer: {
        marginTop: 20,
    },
    sectionHeader: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
        marginBottom: 16,
    },
    trendingItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    hashtag: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
        marginBottom: 4,
    },
    postCount: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
    }
});
