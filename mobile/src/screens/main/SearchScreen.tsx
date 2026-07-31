import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Search as SearchIcon, CheckCircle2, BookOpen, UserPlus, UserCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

interface UserSearchResult {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  headline: string | null;
  university: string | null;
  is_verified: boolean;
  is_following?: boolean;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/profiles/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.warn('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId: string, currentlyFollowing?: boolean) => {
    try {
      setResults((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, is_following: !currentlyFollowing } : user))
      );

      if (currentlyFollowing) {
        await apiClient.delete(`/profiles/${userId}/follow`);
      } else {
        await apiClient.post(`/profiles/${userId}/follow`);
      }
    } catch (error) {
      console.warn('Error toggling follow:', error);
    }
  };

  const renderUserItem = ({ item }: { item: UserSearchResult }) => (
    <View style={styles.userCard}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>
            {(item.name || item.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{item.name || item.username || 'Student'}</Text>
          {item.is_verified && <CheckCircle2 size={15} color={colors.primary} style={styles.badge} />}
        </View>
        <Text style={styles.username}>@{item.username}</Text>
        {item.university && (
          <View style={styles.universityBadge}>
            <BookOpen size={11} color={colors.primary} />
            <Text style={styles.universityText}>{item.university}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.followButton, item.is_following && styles.followingButton]}
        onPress={() => toggleFollow(item.id, item.is_following)}
      >
        {item.is_following ? (
          <>
            <UserCheck size={14} color={colors.textSecondary} />
            <Text style={styles.followingButtonText}>Following</Text>
          </>
        ) : (
          <>
            <UserPlus size={14} color={colors.background} />
            <Text style={styles.followButtonText}>Follow</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Directory</Text>
        <View style={styles.searchBar}>
          <SearchIcon size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students by name, @username, or university..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptySubtitle}>Try searching for names, usernames, or universities.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
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
  username: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  universityText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  followingButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
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
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
