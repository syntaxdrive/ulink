import React, { useState, useEffect, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import {
  Search as SearchIcon,
  CheckCircle2,
  BookOpen,
  Users,
  Mic2,
  MessageSquare,
  ChevronLeft,
  X,
  Lock,
  Globe,
  MessageCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, useTheme } from '../../theme/colors';
import { supabase } from '../../lib/supabase';

type SearchTab = 'all' | 'people' | 'communities' | 'podcasts' | 'posts';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  headline: string | null;
  university: string | null;
  is_verified: boolean;
  points?: number;
}

interface CommunityResult {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  icon_url: string | null;
  cover_url: string | null;
  privacy: 'public' | 'private';
  category?: string;
  members_count?: number;
}

interface PodcastResult {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  host_name?: string | null;
  category?: string | null;
}

interface PostResult {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    is_verified: boolean;
  };
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [loading, setLoading] = useState(false);

  // Results
  const [people, setPeople] = useState<UserProfile[]>([]);
  const [communities, setCommunities] = useState<CommunityResult[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);

  // Execute Search
  const performSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    setLoading(true);

    try {
      if (!q) {
        // Default suggestions when search input is empty
        const [peopleRes, commRes, podRes] = await Promise.allSettled([
          supabase
            .from('profiles')
            .select('id, name, username, avatar_url, headline, university, is_verified, points')
            .order('points', { ascending: false })
            .limit(10),
          supabase
            .from('communities')
            .select('id, name, slug, description, icon_url, cover_url, privacy, category, members_count')
            .order('members_count', { ascending: false })
            .limit(8),
          supabase
            .from('podcasts')
            .select('id, title, description, cover_url, host_name, category')
            .limit(8),
        ]);

        if (peopleRes.status === 'fulfilled' && peopleRes.value.data) {
          setPeople(peopleRes.value.data as UserProfile[]);
        }
        if (commRes.status === 'fulfilled' && commRes.value.data) {
          setCommunities(commRes.value.data as CommunityResult[]);
        }
        if (podRes.status === 'fulfilled' && podRes.value.data) {
          setPodcasts(podRes.value.data as PodcastResult[]);
        }
        setPosts([]);
        return;
      }

      // Multi-table search on Supabase
      const [peopleRes, commRes, podRes, postRes] = await Promise.allSettled([
        supabase
          .from('profiles')
          .select('id, name, username, avatar_url, headline, university, is_verified, points')
          .or(`name.ilike.%${q}%,username.ilike.%${q}%,university.ilike.%${q}%,headline.ilike.%${q}%`)
          .limit(20),
        supabase
          .from('communities')
          .select('id, name, slug, description, icon_url, cover_url, privacy, category, members_count')
          .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
          .limit(20),
        supabase
          .from('podcasts')
          .select('id, title, description, cover_url, host_name, category')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%,host_name.ilike.%${q}%`)
          .limit(20),
        supabase
          .from('posts')
          .select(`
            id, content, created_at, likes_count, comments_count,
            author:profiles!author_id(id, name, username, avatar_url, university, is_verified)
          `)
          .ilike('content', `%${q}%`)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (peopleRes.status === 'fulfilled' && peopleRes.value.data) {
        setPeople(peopleRes.value.data as UserProfile[]);
      } else {
        setPeople([]);
      }

      if (commRes.status === 'fulfilled' && commRes.value.data) {
        setCommunities(commRes.value.data as CommunityResult[]);
      } else {
        setCommunities([]);
      }

      if (podRes.status === 'fulfilled' && podRes.value.data) {
        setPodcasts(podRes.value.data as PodcastResult[]);
      } else {
        setPodcasts([]);
      }

      if (postRes.status === 'fulfilled' && postRes.value.data) {
        setPosts((postRes.value.data as any[]) || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  /* ── Render Student Card ── */
  const renderPersonCard = (item: UserProfile) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.resultCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Messages')}
      activeOpacity={0.7}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarInitials}>{(item.name || item.username || 'U')[0].toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name || item.username || 'Student'}
          </Text>
          {item.is_verified && <CheckCircle2 size={14} color={colors.primary} style={{ marginLeft: 4 }} />}
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>@{item.username}</Text>
        {item.university && (
          <View style={styles.badgeRow}>
            <BookOpen size={11} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.university}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Messages')}
      >
        <MessageCircle size={14} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Chat</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /* ── Render Community Card ── */
  const renderCommunityCard = (item: CommunityResult) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.resultCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}
      activeOpacity={0.7}
    >
      {item.icon_url ? (
        <Image source={{ uri: item.icon_url }} style={styles.commIcon} />
      ) : (
        <View style={[styles.commIconPlaceholder, { backgroundColor: '#059669' }]}>
          <Users size={18} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.privacy === 'private' ? (
            <Lock size={12} color={colors.danger} style={{ marginLeft: 4 }} />
          ) : (
            <Globe size={12} color={colors.primary} style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.category || 'General'} · {item.members_count || 0} members
        </Text>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.actionBtnOutline, { borderColor: colors.primary }]}
        onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}
      >
        <Text style={[styles.actionBtnOutlineText, { color: colors.primary }]}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /* ── Render Podcast Card ── */
  const renderPodcastCard = (item: PodcastResult) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.resultCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Podcast', { podcastId: item.id })}
      activeOpacity={0.7}
    >
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.podcastCover} />
      ) : (
        <View style={[styles.podcastCoverPlaceholder, { backgroundColor: '#064E3B' }]}>
          <Mic2 size={18} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {item.host_name ? `Hosted by ${item.host_name}` : item.category || 'Podcast'}
        </Text>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Podcast', { podcastId: item.id })}
      >
        <Mic2 size={13} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Play</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /* ── Render Post Card ── */
  const renderPostCard = (item: PostResult) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.postResultCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Home')}
      activeOpacity={0.7}
    >
      <View style={styles.nameRow}>
        <Text style={[styles.postAuthorName, { color: colors.text }]}>
          {item.author?.name || item.author?.username || 'Student'}
        </Text>
        {item.author?.is_verified && <CheckCircle2 size={13} color={colors.primary} style={{ marginLeft: 3 }} />}
        <Text style={[styles.postDate, { color: colors.textSecondary }]}>
          {item.author?.university ? `· ${item.author.university}` : ''}
        </Text>
      </View>
      <Text style={[styles.postContentText, { color: colors.text }]} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.postStatsRow}>
        <Text style={[styles.postStatItem, { color: colors.textSecondary }]}>❤️ {item.likes_count || 0}</Text>
        <Text style={[styles.postStatItem, { color: colors.textSecondary }]}>💬 {item.comments_count || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const totalResults = people.length + communities.length + podcasts.length + posts.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Search Input */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <SearchIcon size={17} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search people, communities, podcasts, posts..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 4 }}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {(
            [
              { id: 'all', label: 'All Results' },
              { id: 'people', label: `People (${people.length})` },
              { id: 'communities', label: `Communities (${communities.length})` },
              { id: 'podcasts', label: `Podcasts (${podcasts.length})` },
              { id: 'posts', label: `Posts (${posts.length})` },
            ] as { id: SearchTab; label: string }[]
          ).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabPill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                activeTab === tab.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabPillText,
                  { color: colors.textSecondary },
                  activeTab === tab.id && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Body */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching campus directory...</Text>
        </View>
      ) : totalResults === 0 && query.trim().length > 0 ? (
        <View style={styles.centerContainer}>
          <SearchIcon size={44} color={colors.textTertiary || '#9CA3AF'} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found for "{query}"</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Check your spelling or try searching for student names, clubs, podcasts, or keywords.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Mixed ALL View */}
          {activeTab === 'all' && (
            <>
              {/* People Section */}
              {people.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Students & People</Text>
                    <TouchableOpacity onPress={() => setActiveTab('people')}>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
                    </TouchableOpacity>
                  </View>
                  {people.slice(0, 4).map(renderPersonCard)}
                </View>
              )}

              {/* Communities Section */}
              {communities.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Communities & Clubs</Text>
                    <TouchableOpacity onPress={() => setActiveTab('communities')}>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
                    </TouchableOpacity>
                  </View>
                  {communities.slice(0, 4).map(renderCommunityCard)}
                </View>
              )}

              {/* Podcasts Section */}
              {podcasts.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Podcasts & Shows</Text>
                    <TouchableOpacity onPress={() => setActiveTab('podcasts')}>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
                    </TouchableOpacity>
                  </View>
                  {podcasts.slice(0, 4).map(renderPodcastCard)}
                </View>
              )}

              {/* Posts Section */}
              {posts.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Discussions & Posts</Text>
                    <TouchableOpacity onPress={() => setActiveTab('posts')}>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
                    </TouchableOpacity>
                  </View>
                  {posts.slice(0, 4).map(renderPostCard)}
                </View>
              )}
            </>
          )}

          {/* People Tab */}
          {activeTab === 'people' && (
            <View style={styles.sectionBlock}>
              {people.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>No students match your search.</Text>
              ) : (
                people.map(renderPersonCard)
              )}
            </View>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <View style={styles.sectionBlock}>
              {communities.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>No communities match your search.</Text>
              ) : (
                communities.map(renderCommunityCard)
              )}
            </View>
          )}

          {/* Podcasts Tab */}
          {activeTab === 'podcasts' && (
            <View style={styles.sectionBlock}>
              {podcasts.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>No podcasts match your search.</Text>
              ) : (
                podcasts.map(renderPodcastCard)
              )}
            </View>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <View style={styles.sectionBlock}>
              {posts.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>No posts match your search.</Text>
              ) : (
                posts.map(renderPostCard)
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabsScroll: {
    flexDirection: 'row',
  },
  tabPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  commIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  commIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  podcastCoverPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  cardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  badgeText: {
    fontSize: 11,
    marginLeft: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postResultCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  postDate: {
    fontSize: 11,
    marginLeft: 4,
  },
  postContentText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  postStatsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  postStatItem: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  noItemsText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

