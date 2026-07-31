import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { BookOpen, Users, Radio, ThumbsUp, Download, Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { apiClient } from '../../api/client';

export default function StudyScreen() {
  const [activeTab, setActiveTab] = useState<'courses' | 'study-rooms' | 'communities'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses') {
        const res = await apiClient.get('/courses');
        setCourses(res.data?.courses || []);
      } else if (activeTab === 'study-rooms') {
        const res = await apiClient.get('/study-rooms');
        setStudyRooms(res.data?.studyRooms || []);
      } else if (activeTab === 'communities') {
        const res = await apiClient.get('/communities');
        setCommunities(res.data?.communities || []);
      }
    } catch (err) {
      console.warn('Error fetching study data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleJoinStudyRoom = async (roomId: string) => {
    try {
      await apiClient.post(`/study-rooms/${roomId}/join`);
      navigation.navigate('StudyRoom' as never, { roomId } as never);
    } catch (err: any) {
      if (err.response?.data?.message?.includes('already joined')) {
        navigation.navigate('StudyRoom' as never, { roomId } as never);
      } else {
        Alert.alert('Error', err.response?.data?.message || 'Unable to join study room');
      }
    }
  };

  const handleJoinCommunity = async (communityId: string, isMember: boolean) => {
    try {
      if (isMember) {
        await apiClient.delete(`/communities/${communityId}/leave`);
      } else {
        await apiClient.post(`/communities/${communityId}/join`);
      }
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Unable to update community membership');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Academic Hub</Text>
      </View>

      {/* Segmented Filter Bar */}
      <View style={styles.segmentedBar}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'courses' && styles.segmentActive]}
          onPress={() => setActiveTab('courses')}
        >
          <BookOpen size={16} color={activeTab === 'courses' ? colors.background : colors.textSecondary} />
          <Text style={[styles.segmentText, activeTab === 'courses' && styles.segmentTextActive]}>
            Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, activeTab === 'study-rooms' && styles.segmentActive]}
          onPress={() => setActiveTab('study-rooms')}
        >
          <Radio size={16} color={activeTab === 'study-rooms' ? colors.background : colors.textSecondary} />
          <Text style={[styles.segmentText, activeTab === 'study-rooms' && styles.segmentTextActive]}>
            Study Rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segment, activeTab === 'communities' && styles.segmentActive]}
          onPress={() => setActiveTab('communities')}
        >
          <Users size={16} color={activeTab === 'communities' ? colors.background : colors.textSecondary} />
          <Text style={[styles.segmentText, activeTab === 'communities' && styles.segmentTextActive]}>
            Clubs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : activeTab === 'courses' ? (
          courses.length === 0 ? (
            <View style={styles.emptyCard}>
              <BookOpen size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Course Documents Yet</Text>
              <Text style={styles.emptySubtitle}>Course notes and past papers will appear here.</Text>
            </View>
          ) : (
            courses.map((course) => (
              <View key={course.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{course.code || 'COURSE'}</Text>
                  </View>
                  <Text style={styles.universityLabel}>{course.university || 'Campus'}</Text>
                </View>
                <Text style={styles.cardTitle}>{course.name}</Text>
                {course.description ? (
                  <Text style={styles.cardDescription}>{course.description}</Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <Text style={styles.metaText}>❤️ {course.likes_count ?? 0} Likes</Text>
                  <Text style={styles.metaText}>📄 {course._count?.documents ?? 0} Files</Text>
                </View>
              </View>
            ))
          )
        ) : activeTab === 'study-rooms' ? (
          studyRooms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Radio size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Active Study Rooms</Text>
              <Text style={styles.emptySubtitle}>Be the first to open a virtual study room!</Text>
            </View>
          ) : (
            studyRooms.map((room) => (
              <View key={room.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE ROOM</Text>
                  </View>
                  <Text style={styles.metaText}>
                    {room.participants_count || 0} / {room.max_participants || 10} Students
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{room.title || 'Group Study Session'}</Text>
                <Text style={styles.cardDescription}>{room.topic || 'General study discussion'}</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleJoinStudyRoom(room.id)}>
                  <Text style={styles.actionBtnText}>Join Study Session</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          communities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Campus Communities</Text>
              <Text style={styles.emptySubtitle}>Student clubs and societies will appear here.</Text>
            </View>
          ) : (
            communities.map((club) => (
              <View key={club.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.clubCategory}>{club.category || 'Student Club'}</Text>
                  <Text style={styles.metaText}>{club.members_count || 0} Members</Text>
                </View>
                <Text style={styles.cardTitle}>{club.name}</Text>
                {club.description ? <Text style={styles.cardDescription}>{club.description}</Text> : null}
                <TouchableOpacity
                  style={[styles.actionBtn, club.is_member && styles.actionBtnSecondary]}
                  onPress={() => handleJoinCommunity(club.id, club.is_member)}
                >
                  <Text style={[styles.actionBtnText, club.is_member && styles.actionBtnTextSecondary]}>
                    {club.is_member ? 'Member' : 'Join Club'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )
        )}
      </ScrollView>
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
  },
  segmentedBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  universityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: colors.text,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtnTextSecondary: {
    color: colors.textSecondary,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  clubCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
