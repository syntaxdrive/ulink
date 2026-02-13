import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { Bell, MessageCircle, Heart, UserPlus } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabase';

// Mock types for demonstration
interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    created_at: string;
    actor: {
        name: string;
        avatar_url: string;
    };
    content?: string; // Preview of comment or post
    read: boolean;
}

export const NotificationsScreen = () => {
    const { session, user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    actor:actor_id (name, avatar_url)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false);

            if (!error) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={20} color="#EF4444" fill="#EF4444" />;
            case 'comment': return <MessageCircle size={20} color={colors.light.primary} />;
            case 'follow': return <UserPlus size={20} color="#3B82F6" />;
            case 'mention': return <Bell size={20} color="#8B5CF6" />; // Purple for mentions
            default: return <Bell size={20} color={colors.light.text} />;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <GlassCard style={[styles.card, !item.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.content}>
                <Text style={styles.text}>
                    <Text style={styles.bold}>{item.actor?.name || 'Someone'}</Text>
                    {item.type === 'like' ? ' liked your post.' :
                        item.type === 'comment' ? ' commented on your post.' :
                            item.type === 'follow' ? ' started following you.' :
                                item.type === 'mention' ? ' mentioned you.' :
                                    ' sent a notification.'}
                </Text>
                {item.content && (
                    <Text style={styles.previewText} numberOfLines={1}>{item.content}</Text>
                )}
                <Text style={styles.time}>
                    {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <GlassCard style={styles.header} intensity={80}>
                <Text style={styles.screenTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markRead}>Mark all read</Text>
                </TouchableOpacity>
            </GlassCard>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Bell size={40} color={colors.light.muted} />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    ) : null
                }
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
    },
    screenTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: colors.light.text,
    },
    markRead: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.primary,
        fontSize: 14,
    },
    list: {
        paddingHorizontal: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 16,
    },
    unreadCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderColor: colors.light.primary,
        borderWidth: 1, // Ensure border width is set
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    text: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
        color: colors.light.text,
        lineHeight: 20,
    },
    previewText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 13,
        color: colors.light.muted,
        marginTop: 4,
    },
    bold: {
        fontFamily: 'Outfit_700Bold',
    },
    time: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
        marginTop: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.light.primary,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontFamily: 'Outfit_400Regular',
        color: colors.light.muted,
        marginTop: 10,
    }
});
