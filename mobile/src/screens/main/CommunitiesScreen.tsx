import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Users,
  Search,
  Plus,
  ArrowLeft,
  Globe,
  Lock,
  Check,
  Camera,
  X,
  Compass,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { uploadService } from '../../services/uploadService';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Technology',
  'Academic',
  'Career & Business',
  'Arts & Culture',
  'Sports & Fitness',
  'Social & Fun',
  'Other',
];

interface Community {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  icon_url: string | null;
  cover_url: string | null;
  privacy: 'public' | 'private';
  category?: string;
  members_count?: number;
  creator_id?: string;
}

export default function CommunitiesScreen() {
  const navigation = useNavigation<any>();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunityIds, setMyCommunityIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Create Community Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createCategory, setCreateCategory] = useState('Technology');
  const [createPrivacy, setCreatePrivacy] = useState<'public' | 'private'>('public');
  const [createIconUri, setCreateIconUri] = useState<string | null>(null);
  const [createCoverUri, setCreateCoverUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // 1. Fetch User & Communities
  const fetchCommunitiesData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) setCurrentUserId(uid);

      // Fetch all communities with member counts
      const { data: comms, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_members(count)
        `)
        .order('created_at', { ascending: false })
        .limit(60);

      if (error) throw error;

      const formatted: Community[] = (comms || []).map((c: any) => ({
        ...c,
        members_count: c.community_members?.[0]?.count || 0,
      }));

      setCommunities(formatted);

      // If user logged in, fetch their joined community IDs
      if (uid) {
        const { data: myMemberships } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', uid);

        if (myMemberships) {
          setMyCommunityIds(new Set(myMemberships.map((m: any) => m.community_id)));
        }
      }
    } catch (err) {
      console.warn('Error fetching communities:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunitiesData();
  }, [fetchCommunitiesData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunitiesData();
  };

  // 2. Join / Leave Community
  const handleToggleJoin = async (community: Community) => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to join communities.');
      return;
    }

    const isJoined = myCommunityIds.has(community.id);
    setJoiningId(community.id);

    try {
      if (isJoined) {
        // Leave
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', currentUserId);

        setMyCommunityIds((prev) => {
          const next = new Set(prev);
          next.delete(community.id);
          return next;
        });
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === community.id
              ? { ...c, members_count: Math.max(0, (c.members_count || 1) - 1) }
              : c
          )
        );
      } else {
        // Join
        await supabase.from('community_members').insert({
          community_id: community.id,
          user_id: currentUserId,
          role: 'member',
        });

        setMyCommunityIds((prev) => new Set([...prev, community.id]));
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === community.id
              ? { ...c, members_count: (c.members_count || 0) + 1 }
              : c
          )
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update membership.');
    } finally {
      setJoiningId(null);
    }
  };

  // 3. Create New Community
  const handleCreateCommunity = async () => {
    if (!createName.trim() || createName.trim().length < 3) {
      Alert.alert('Name Required', 'Please enter a community name (at least 3 characters).');
      return;
    }
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please log in to create a community.');
      return;
    }

    setCreating(true);
    try {
      const slug = createName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      let iconUrl: string | null = null;
      let coverUrl: string | null = null;

      if (createIconUri) {
        iconUrl = await uploadService.uploadFile(
          { uri: createIconUri, type: 'image' },
          'community-icons'
        );
      }
      if (createCoverUri) {
        coverUrl = await uploadService.uploadFile(
          { uri: createCoverUri, type: 'image' },
          'community-covers'
        );
      }

      // Insert community
      const { data: newComm, error } = await supabase
        .from('communities')
        .insert({
          name: createName.trim(),
          slug,
          description: createDescription.trim() || null,
          category: createCategory,
          privacy: createPrivacy,
          icon_url: iconUrl,
          cover_url: coverUrl,
          creator_id: currentUserId,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add creator as admin member
      if (newComm?.id) {
        await supabase.from('community_members').insert({
          community_id: newComm.id,
          user_id: currentUserId,
          role: 'admin',
        });

        setMyCommunityIds((prev) => new Set([...prev, newComm.id]));
        setCommunities((prev) => [{ ...newComm, members_count: 1 }, ...prev]);
        setIsCreateModalOpen(false);

        // Reset form
        setCreateName('');
        setCreateDescription('');
        setCreateIconUri(null);
        setCreateCoverUri(null);

        Alert.alert('Community Created 🎉', `${newComm.name} is now open for students to join!`);
        navigation.navigate('CommunityDetail', { communityId: newComm.id });
      }
    } catch (err: any) {
      console.error('Error creating community:', err);
      Alert.alert('Creation Failed', err.message || 'Could not create community.');
    } finally {
      setCreating(false);
    }
  };

  // Filtered lists
  const filteredCommunities = communities.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      c.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myJoinedCommunities = communities.filter((c) => myCommunityIds.has(c.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Users size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Campus Communities</Text>
        </View>
        <TouchableOpacity
          style={styles.createHeaderBtn}
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={styles.createHeaderBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs, study groups, tech societies..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Horizontal Tabs with Onboarding Pastel Tints */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            const pastelTints = [
              { bg: colors.sunYellowLight, border: colors.sunYellow, text: colors.sunYellowDark },
              { bg: colors.lilacLight, border: colors.lilac, text: colors.lilacDark },
              { bg: colors.coralLight, border: colors.coral, text: colors.coralDark },
              { bg: colors.mintLight, border: colors.mint, text: colors.mintDark },
            ];
            const tint = pastelTints[idx % pastelTints.length];

            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isSelected ? '#000000' : tint.bg, borderColor: isSelected ? '#000000' : tint.border },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isSelected ? '#ffffff' : tint.text, fontWeight: isSelected ? '800' : '700' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus communities...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* My Communities Horizontal Shelf */}
          {myJoinedCommunities.length > 0 && selectedCategory === 'All' && !searchQuery ? (
            <View style={styles.myCommunitiesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Your Communities ({myJoinedCommunities.length})</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myCommList}>
                {myJoinedCommunities.map((comm) => (
                  <TouchableOpacity
                    key={comm.id}
                    style={styles.myCommCard}
                    onPress={() => navigation.navigate('CommunityDetail', { communityId: comm.id })}
                  >
                    {comm.icon_url ? (
                      <Image source={{ uri: comm.icon_url }} style={styles.myCommIcon} />
                    ) : (
                      <View style={[styles.myCommIcon, styles.commIconPlaceholder]}>
                        <Users size={20} color={colors.primary} />
                      </View>
                    )}
                    <Text style={styles.myCommName} numberOfLines={1}>
                      {comm.name}
                    </Text>
                    <Text style={styles.myCommMeta}>{comm.members_count || 1} members</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Explore All Communities Grid / List */}
          <View style={styles.exploreSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'All' ? 'Explore Communities' : `${selectedCategory} Communities`}
              </Text>
              <Text style={styles.sectionCount}>{filteredCommunities.length} groups</Text>
            </View>

            {filteredCommunities.length === 0 ? (
              <View style={styles.emptyBox}>
                <Compass size={40} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No communities found</Text>
                <Text style={styles.emptySub}>Be the first student to create one!</Text>
                <TouchableOpacity
                  style={styles.createEmptyBtn}
                  onPress={() => setIsCreateModalOpen(true)}
                >
                  <Plus size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.createEmptyBtnText}>Create Community</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredCommunities.map((comm) => {
                const isJoined = myCommunityIds.has(comm.id);
                const isProcessing = joiningId === comm.id;

                return (
                  <TouchableOpacity
                    key={comm.id}
                    style={styles.commCard}
                    activeOpacity={0.88}
                    onPress={() =>
                      navigation.navigate('CommunityDetail', { communityId: comm.id })
                    }
                  >
                    {/* Cover / Icon Row */}
                    <View style={styles.commCardTop}>
                      {comm.icon_url ? (
                        <Image source={{ uri: comm.icon_url }} style={styles.commIcon} />
                      ) : (
                        <View style={[styles.commIcon, styles.commIconPlaceholder]}>
                          <Users size={24} color={colors.primary} />
                        </View>
                      )}

                      <View style={styles.commCardInfo}>
                        <View style={styles.commTitleRow}>
                          <Text style={styles.commName} numberOfLines={1}>
                            {comm.name}
                          </Text>
                          {comm.privacy === 'private' ? (
                            <Lock size={13} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                          ) : (
                            <Globe size={13} color={colors.primary} style={{ marginLeft: 4 }} />
                          )}
                        </View>
                        <Text style={styles.commMetaText}>
                          {comm.members_count || 0} members · {comm.category || 'General'}
                        </Text>
                      </View>

                      {/* Join / Joined Button */}
                      <TouchableOpacity
                        style={[
                          styles.joinBtn,
                          isJoined && styles.joinedBtn,
                          isProcessing && { opacity: 0.6 },
                        ]}
                        onPress={() => handleToggleJoin(comm)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator
                            size="small"
                            color={isJoined ? colors.text : '#ffffff'}
                          />
                        ) : isJoined ? (
                          <>
                            <Check size={13} color={colors.primary} />
                            <Text style={styles.joinedBtnText}> Joined</Text>
                          </>
                        ) : (
                          <Text style={styles.joinBtnText}>Join</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Description */}
                    {comm.description ? (
                      <Text style={styles.commDescription} numberOfLines={2}>
                        {comm.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ── Create Community Modal ─────────────────────────────────────── */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Modal Top Bar */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Community</Text>
              <TouchableOpacity
                style={[styles.modalCreateBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreateCommunity}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalCreateBtnText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Community Icon Upload */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Icon</Text>
                <TouchableOpacity
                  style={styles.iconUploadBox}
                  onPress={async () => {
                    const media = await uploadService.pickImages(1);
                    if (media.length > 0) setCreateIconUri(media[0].uri);
                  }}
                >
                  {createIconUri ? (
                    <Image source={{ uri: createIconUri }} style={styles.uploadedIconPreview} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={24} color={colors.primary} />
                      <Text style={styles.uploadText}>Upload Logo / Icon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Community Name */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Community Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. UNILAG AI & Robotics Club"
                  placeholderTextColor={colors.textSecondary}
                  value={createName}
                  onChangeText={setCreateName}
                />
              </View>

              {/* Category */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                    const isSelected = createCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => setCreateCategory(cat)}
                      >
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Privacy Setting */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Privacy</Text>
                <View style={styles.privacyRow}>
                  <TouchableOpacity
                    style={[styles.privacyBtn, createPrivacy === 'public' && styles.privacyBtnActive]}
                    onPress={() => setCreatePrivacy('public')}
                  >
                    <Globe size={18} color={createPrivacy === 'public' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, createPrivacy === 'public' && styles.privacyTitleActive]}>
                        Public
                      </Text>
                      <Text style={styles.privacySub}>Anyone on campus can join & view</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.privacyBtn, createPrivacy === 'private' && styles.privacyBtnActive]}
                    onPress={() => setCreatePrivacy('private')}
                  >
                    <Lock size={18} color={createPrivacy === 'private' ? colors.primary : colors.textSecondary} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.privacyTitle, createPrivacy === 'private' && styles.privacyTitleActive]}>
                        Private
                      </Text>
                      <Text style={styles.privacySub}>Requires admin approval to join</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="What is this community about? What events or discussions take place?"
                  placeholderTextColor={colors.textSecondary}
                  value={createDescription}
                  onChangeText={setCreateDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  createHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  myCommunitiesSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  myCommList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  myCommCard: {
    width: 110,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myCommIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  commIconPlaceholder: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myCommName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  myCommMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exploreSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  commCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  commCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  commCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  commTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  commMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  joinedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  joinedBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  commDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  createEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  createEmptyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalCreateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  modalCreateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  formScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  iconUploadBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  uploadedIconPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
  },
  formTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  chipsRow: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  privacyRow: {
    gap: 10,
  },
  privacyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  privacyBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  privacyTitleActive: {
    color: colors.primary,
  },
  privacySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
