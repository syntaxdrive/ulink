import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { GlassCard } from '../../../components/GlassCard';
import { colors } from '../../../theme/colors';
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal, Trash } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ParsedText } from '../../../components/ParsedText';

interface PostCardProps {
    post: any;
    onLike: (post: any) => void;
    onComment: (post: any) => void;
    onRepost: (post: any) => void;
    onShare: (post: any) => void;
    onDelete?: (post: any) => void;
    currentUserId?: string;
}

export const PostCard = ({ post, onLike, onComment, onRepost, onShare, onDelete, currentUserId }: PostCardProps) => {
    const isLiked = post.user_has_liked;
    const isReposted = post.user_has_reposted;

    const formattedDate = useMemo(() => {
        try {
            return formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
        } catch (e) {
            return 'Just now';
        }
    }, [post.created_at]);

    return (
        <GlassCard style={styles.container}>
            {/* Header: Author Info */}
            <View style={styles.header}>
                <Image
                    source={{ uri: post.profiles?.avatar_url || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                />
                <View style={styles.headerText}>
                    <Text style={styles.name}>{post.profiles?.name || 'Unknown User'}</Text>
                    <Text style={styles.username}>@{post.profiles?.email?.split('@')[0] || 'user'} • {formattedDate}</Text>
                </View>

                {currentUserId === post.author_id && onDelete ? (
                    <TouchableOpacity onPress={() => onDelete(post)} style={{ padding: 8 }}>
                        <Trash color="#EF4444" size={18} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity>
                        <MoreHorizontal color={colors.light.muted} size={20} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content with Link Highlighting */}
            <ParsedText style={styles.content}>{post.content}</ParsedText>

            {/* Images (Single for now, Grid later) */}
            {post.image_url && (
                <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
            )}
            {post.image_urls && post.image_urls.length > 0 && (
                <Image source={{ uri: post.image_urls[0] }} style={styles.postImage} resizeMode="cover" />
            )}

            {/* Footer: Interactions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.interaction} onPress={() => onLike(post)}>
                    <Heart
                        size={20}
                        color={isLiked ? '#EF4444' : colors.light.muted}
                        fill={isLiked ? '#EF4444' : 'transparent'}
                    />
                    <Text style={[styles.interactionText, isLiked && { color: '#EF4444' }]}>
                        {post.likes_count || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interaction} onPress={() => onComment(post)}>
                    <MessageCircle size={20} color={colors.light.muted} />
                    <Text style={styles.interactionText}>{post.comments_count || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interaction} onPress={() => onRepost(post)}>
                    <Repeat
                        size={20}
                        color={isReposted ? '#10B981' : colors.light.muted}
                    />
                    <Text style={[styles.interactionText, isReposted && { color: '#10B981' }]}>
                        {post.reposts_count || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interaction} onPress={() => onShare(post)}>
                    <Share size={20} color={colors.light.muted} />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: colors.light.border,
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
    },
    username: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    content: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
        color: colors.light.text,
        lineHeight: 22,
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: colors.light.border,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
    },
    interaction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    interactionText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
        color: colors.light.muted,
    },
});
