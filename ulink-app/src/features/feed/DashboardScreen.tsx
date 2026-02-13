import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { useFeed } from './hooks/useFeed';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostWidget';
import { Plus, Search, Menu } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export const DashboardScreen = () => {
    const navigation = useNavigation();
    const { signOut, user } = useAuth();
    const { posts, loading, refreshing, handleRefresh, toggleLike, createPost } = useFeed();
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Menu' as never)}>
                <Menu color={colors.light.text} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>UniLink</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search' as never)}>
                <Search color={colors.light.text} size={24} />
            </TouchableOpacity>
        </View>
    );

    const handleCreatePost = async () => {
        setCreateModalVisible(false);
        handleRefresh();
    }

    const handleComment = (post: any) => {
        // @ts-ignore
        navigation.navigate('PostDetails', { post });
    };

    const handleDelete = (post: any) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // Optimistic update
                        const { error } = await supabase.from('posts').delete().eq('id', post.id);
                        if (!error) {
                            handleRefresh();
                        } else {
                            Alert.alert("Error", "Could not delete post.");
                        }
                    }
                }
            ]
        );
    };

    const handleRepost = async (post: any) => {
        Alert.alert("Repost", "Reposting feature coming soon!");
    };

    return (
        <View style={styles.container}>
            {renderHeader()}

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            currentUserId={user?.id}
                            onLike={toggleLike}
                            onComment={handleComment}
                            onRepost={handleRepost}
                            onShare={(post) => console.log('Share', post.id)}
                            onDelete={handleDelete}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>Your feed is quiet.</Text>
                            <Text style={styles.emptyText}>Connect with students from your university to see their posts here!</Text>
                            <TouchableOpacity
                                style={styles.findButton}
                                onPress={() => navigation.navigate('Network' as never)}
                            >
                                <Text style={styles.findButtonText}>Find Classmates</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button (Alternative to Tab Bar center button for now) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.8}
            >
                <Plus color="#FFF" size={28} />
            </TouchableOpacity>

            {/* Create Post Modal */}
            <Modal
                visible={isCreateModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Post</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <CreatePostModal
                            user={user || { id: 'temp', avatar_url: null }} // Fallback if user is null
                            onSuccess={handleCreatePost}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: colors.light.background,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for FAB and TabBar
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.light.muted,
        fontFamily: 'Outfit_400Regular',
        marginBottom: 20,
    },
    findButton: {
        backgroundColor: colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    findButtonText: {
        fontFamily: 'Outfit_700Bold',
        color: '#FFF',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 100, // Above tab bar
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        minHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
    },
    closeText: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.primary,
        fontSize: 16,
    }
});
