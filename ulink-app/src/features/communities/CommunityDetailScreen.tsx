import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { ArrowLeft, Users, Plus } from 'lucide-react-native';
import { PostCard } from '../feed/components/PostCard';
import { useAuth } from '../auth/AuthContext';

export const CommunityDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { id } = route.params;

    const [community, setCommunity] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ members: 0, posts: 0 });

    useEffect(() => {
        fetchCommunityDetails();
    }, [id]);

    const fetchCommunityDetails = async () => {
        try {
            // Fetch Community Info
            const { data: communityData, error } = await supabase
                .from('communities')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCommunity(communityData);

            // Fetch Stats (Approximate)
            const { count: memberCount } = await supabase
                .from('community_members')
                .select('*', { count: 'exact', head: true })
                .eq('community_id', id);

            const { count: postCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('community_id', id);

            setStats({ members: memberCount || 0, posts: postCount || 0 });

            // Check Membership
            if (user) {
                const { data: membership } = await supabase
                    .from('community_members')
                    .select('*')
                    .eq('community_id', id)
                    .eq('user_id', user.id)
                    .single();
                setIsMember(!!membership);
            }

            // Fetch Community Posts
            const { data: postsData } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:author_id (id, name, avatar_url),
                    likes (user_id),
                    comments (id)
                `)
                .eq('community_id', id)
                .order('created_at', { ascending: false });

            if (postsData) {
                const formattedPosts = postsData.map((post: any) => ({
                    ...post,
                    likes_count: post.likes ? post.likes.length : 0,
                    comments_count: post.comments ? post.comments.length : 0,
                    user_has_liked: user ? post.likes.some((l: any) => l.user_id === user.id) : false,
                }));
                setPosts(formattedPosts);
            }

        } catch (error) {
            console.error('Error fetching community details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMembership = async () => {
        if (!user) return;

        if (isMember) {
            const { error } = await supabase
                .from('community_members')
                .delete()
                .match({ community_id: id, user_id: user.id });

            if (!error) {
                setIsMember(false);
                setStats(prev => ({ ...prev, members: prev.members - 1 }));
            }
        } else {
            const { error } = await supabase
                .from('community_members')
                .insert({ community_id: id, user_id: user.id, role: 'member' });

            if (!error) {
                setIsMember(true);
                setStats(prev => ({ ...prev, members: prev.members + 1 }));
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.light.primary} />
            </View>
        );
    }

    if (!community) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: colors.light.text }}>Community not found</Text>
            </View>
        );
    }

    const toggleLike = async (postId: string) => {
        if (!user) return;

        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const newIsLiked = !post.user_has_liked;
        const newLikesCount = newIsLiked ? post.likes_count + 1 : post.likes_count - 1;

        // Optimistic update
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = { ...post, user_has_liked: newIsLiked, likes_count: newLikesCount };
        setPosts(updatedPosts);

        try {
            if (newIsLiked) {
                await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
            } else {
                await supabase.from('likes').delete().match({ user_id: user.id, post_id: postId });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Rollback could be added here
        }
    };

    const handleComment = (post: any) => {
        navigation.navigate('PostDetails', { post });
    };

    const renderHeader = () => (
        <ImageBackground
            source={{ uri: community.cover_image || 'https://via.placeholder.com/800x400' }}
            style={styles.coverImage}
        >
            <View style={styles.overlay} />
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
        </ImageBackground>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderHeader()}

                <View style={styles.content}>
                    {/* Info Card */}
                    <GlassCard style={styles.infoCard} intensity={90}>
                        <Image
                            source={{ uri: community.icon_url || 'https://via.placeholder.com/100' }}
                            style={styles.icon}
                        />
                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{community.name}</Text>
                            <TouchableOpacity
                                style={[styles.joinButton, isMember && styles.joinedButton]}
                                onPress={toggleMembership}
                            >
                                <Text style={[styles.joinText, isMember && styles.joinedText]}>
                                    {isMember ? 'Joined' : 'Join'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.description}>{community.description}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Users size={16} color={colors.light.muted} />
                                <Text style={styles.statText}>{stats.members} Members</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statText}>•</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statText}>{stats.posts} Posts</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Posts Section */}
                    <Text style={styles.sectionTitle}>Community Posts</Text>

                    {posts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
                            {isMember && (
                                <TouchableOpacity style={styles.createButton}>
                                    <Plus color="#FFF" size={20} />
                                    <Text style={styles.createButtonText}>Create Post</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={toggleLike}
                                onComment={handleComment}
                                onRepost={(p) => console.log('Repost', p.id)}
                                onShare={(p) => console.log('Share', p.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    coverImage: {
        width: '100%',
        height: 200,
        justifyContent: 'flex-start',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        marginTop: -40, // Overlap cover image
    },
    infoCard: {
        padding: 20,
        marginBottom: 24,
    },
    icon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: colors.light.card, // Match card background?
        marginTop: -50,
        marginBottom: 12,
        backgroundColor: colors.light.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
        flex: 1,
        marginRight: 10,
    },
    description: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: colors.light.text,
        marginBottom: 16,
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
        color: colors.light.muted,
    },
    joinButton: {
        backgroundColor: colors.light.text,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    joinedButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    joinText: {
        color: colors.light.background,
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
    },
    joinedText: {
        color: colors.light.text,
    },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 20,
        color: colors.light.text,
        marginBottom: 16,
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: colors.light.muted,
        fontFamily: 'Outfit_400Regular',
        marginBottom: 20,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
    },
    createButtonText: {
        color: '#FFF',
        fontFamily: 'Outfit_700Bold',
    }
});
