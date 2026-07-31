import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MessageSquare, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

interface ConversationItem {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const response = await apiClient.get('/messages/inbox');
      if (response.data?.conversations) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.warn('Error fetching messages inbox:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity style={styles.conversationCard}>
      {item.user.avatar_url ? (
        <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>
            {(item.user.name || item.user.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{item.user.name || item.user.username || 'Student'}</Text>
            {item.user.is_verified && <CheckCircle2 size={14} color={colors.primary} style={styles.badge} />}
          </View>
          <Text style={styles.timeText}>
            {new Date(item.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.snippetRow}>
          <Text numberOfLines={1} style={[styles.snippetText, item.unreadCount > 0 && styles.unreadSnippet]}>
            {item.lastMessage.content}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Direct Messages</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <MessageSquare size={36} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>Start a conversation with fellow campus students!</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  snippetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  snippetText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  unreadSnippet: {
    color: colors.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
