import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mic, MicOff, Hand, Settings, LogOut, Radio } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { colors } from '../../theme/colors';
export default function StudyRoomScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { roomId } = (route.params || {}) as { roomId: string };

  const [room, setRoom] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchRoomData();
    // Simulate real-time updates for a live room
    const interval = setInterval(fetchRoomData, 10000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchUserData = async () => {
    try {
      const res = await apiClient.get('/profiles/me');
      setUser(res.data);
    } catch (e) {
      console.warn('Could not fetch user profile', e);
    }
  };

  const fetchRoomData = async () => {
    try {
      const res = await apiClient.get(`/study-rooms/${roomId}`);
      setRoom(res.data);
    } catch (error) {
      console.error('Failed to load study room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await apiClient.delete(`/study-rooms/${roomId}/leave`);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to leave room:', error);
      navigation.goBack();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Room not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ensure current user is in participants list for UI if they just joined
  const allParticipants = [...(room.participants || [])];
  if (user && !allParticipants.find((p: any) => p.user_id === user.id)) {
    allParticipants.push({
      user_id: user.id,
      role: 'participant',
      user: {
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
      },
    });
  }

  const renderParticipant = ({ item }: { item: any }) => {
    const isHost = item.role === 'host';
    const isCurrentUser = item.user_id === user?.id;
    
    return (
      <View style={styles.participantCard}>
        <View style={[styles.avatarContainer, isHost && styles.hostAvatarContainer]}>
          {item.user?.avatar_url ? (
            <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {(item.user?.name || item.user?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          {/* Mute indicator logic could be dynamic, we'll hardcode some for UI feel */}
          <View style={styles.micBadge}>
            {(isCurrentUser && isMuted) || (!isCurrentUser && Math.random() > 0.5) ? (
              <MicOff size={10} color={colors.background} />
            ) : (
              <Mic size={10} color={colors.background} />
            )}
          </View>
        </View>
        <Text style={styles.participantName} numberOfLines={1}>
          {isCurrentUser ? 'You' : (item.user?.name || item.user?.username)}
        </Text>
        <Text style={styles.participantRole}>
          {isHost ? 'Host' : 'Listener'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE ROOM</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Room Info */}
      <View style={styles.roomInfo}>
        <Text style={styles.roomTitle}>{room.title}</Text>
        <Text style={styles.roomTopic}>{room.topic || 'General Discussion'}</Text>
        <View style={styles.statsRow}>
          <Radio size={16} color={colors.primary} />
          <Text style={styles.statsText}>{allParticipants.length} Listening</Text>
        </View>
      </View>

      {/* Participants Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={allParticipants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.user_id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
        />
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveRoom}>
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.leaveBtnText}>Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleBtn} onPress={() => setHandRaised(!handRaised)}>
          <Hand size={24} color={handRaised ? colors.primary : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.circleBtn, isMuted && styles.circleBtnMuted]} 
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} color={colors.danger} />
          ) : (
            <Mic size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  liveText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roomInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  roomTopic: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  participantCard: {
    width: '30%',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  hostAvatarContainer: {
    padding: 3,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 40,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceElevated,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  micBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.text,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  leaveBtnText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleBtnMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'transparent',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
