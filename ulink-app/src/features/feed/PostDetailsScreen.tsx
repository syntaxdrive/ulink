import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { GlassCard } from '../../components/GlassCard';
import { ParsedText } from '../../components/ParsedText';
import { PostCard } from './components/PostCard';
import { colors } from '../../theme/colors';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';

export const PostDetailsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { post: initialPost } = route.params;

    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles:author_id (id, name, avatar_url)
                `)
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;
        setSending(true);

        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    author_id: user.id,
                    content: newComment.trim()
                })
                .select(`
                    *,
                    profiles:author_id (id, name, avatar_url)
                `)
                .single();

            if (error) throw error;

            if (data) {
                setComments(prev => [...prev, data]);
                setNewComment('');
                // Optimistically update comment count on post
                setPost((prev: any) => ({
                    ...prev,
                    comments_count: (prev.comments_count || 0) + 1
                }));
            }
        } catch (error) {
            console.error('Error sending comment:', error);
        } finally {
            setSending(false);
        }
    };

    const renderComment = ({ item }: { item: any }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{item.profiles?.name || 'Unknown'}</Text>
                <Text style={styles.commentDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <ParsedText style={styles.commentContent}>{item.content}</ParsedText>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={colors.light.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thread</Text>
            </View>

            <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.postContainer}>
                        <PostCard
                            post={post}
                            onLike={() => { }} // Could wire up real interactions
                            onComment={() => { }}
                            onRepost={() => { }}
                            onShare={() => { }}
                        />
                        <View style={styles.divider} />
                        <Text style={styles.commentsLabel}>Comments</Text>
                    </View>
                }
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
                    ) : (
                        <ActivityIndicator style={{ marginTop: 20 }} color={colors.light.primary} />
                    )
                }
            />

            <GlassCard style={styles.inputContainer} intensity={100}>
                <TextInput
                    style={styles.input}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.light.muted}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!newComment.trim() || sending) && styles.disabledSend]}
                    onPress={handleSendComment}
                    disabled={!newComment.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Send size={20} color="#FFF" />
                    )}
                </TouchableOpacity>
            </GlassCard>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingTop: 60, // Safe area
        paddingBottom: 16,
        backgroundColor: colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: colors.light.text,
    },
    listContent: {
        paddingBottom: 100,
    },
    postContainer: {
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.light.border,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    commentsLabel: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: colors.light.text,
        marginLeft: 16,
        marginBottom: 12,
    },
    commentItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: colors.light.text,
    },
    commentDate: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    commentContent: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.text,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.light.muted,
        marginTop: 40,
        fontFamily: 'Outfit_400Regular',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.light.background, // Ensure background opacity
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontFamily: 'Outfit_400Regular',
        color: colors.light.text,
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSend: {
        opacity: 0.5,
    }
});
