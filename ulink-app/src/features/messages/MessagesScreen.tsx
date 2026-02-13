import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { colors } from '../../theme/colors';
import { useChat } from './hooks/useChat';
import { MessageCircle } from 'lucide-react-native';

export const MessagesScreen = () => {
    const navigation = useNavigation<any>();
    const { conversations, loading, unreadCounts, refreshConversations } = useChat();

    const renderItem = ({ item }: { item: any }) => (
        <GlassCard style={[styles.card, unreadCounts[item.id] > 0 && styles.unreadCard]}>
            <TouchableOpacity onPress={() => navigation.navigate('Chat', { chatId: item.id, chatName: item.name, chatAvatar: item.avatar_url })} style={styles.cardContent}>
                <Image
                    source={{ uri: item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }}
                    style={styles.avatar}
                />
                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.name, unreadCounts[item.id] > 0 && styles.boldName]}>{item.name}</Text>
                        <Text style={styles.time}>{/* Add last message time if available via API */}</Text>
                    </View>
                    <View style={styles.messageRow}>
                        <Text style={[styles.preview, unreadCounts[item.id] > 0 && styles.boldPreview]} numberOfLines={1}>
                            {/* Ideally API returns last message content. For now placeholder or generic */}
                            Tap to view messages
                        </Text>
                        {unreadCounts[item.id] > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCounts[item.id]}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </GlassCard>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={refreshConversations}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MessageCircle size={40} color={colors.light.muted} style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No conversations yet.</Text>
                        <Text style={styles.emptySubtext}>Start chatting with your connections!</Text>
                    </View>
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 12,
        padding: 12, // override default padding for tighter layout
    },
    unreadCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderColor: colors.light.primary,
        borderWidth: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: colors.light.border,
    },
    infoContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        color: colors.light.text,
    },
    boldName: {
        fontFamily: 'Outfit_700Bold',
    },
    time: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: colors.light.muted,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preview: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
        flex: 1,
        marginRight: 8,
    },
    boldPreview: {
        fontFamily: 'Outfit_500Medium',
        color: colors.light.text,
    },
    unreadBadge: {
        backgroundColor: colors.light.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 18,
        color: colors.light.muted,
        marginBottom: 8,
    },
    emptySubtext: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: colors.light.muted,
        textAlign: 'center',
    }
});
