import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, X, RotateCw, Mic2 } from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { audioService, PlaybackState } from '../services/audioService';

const { width } = Dimensions.get('window');

export function GlobalMiniPlayer() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    isLoading: false,
    currentUri: null,
    currentTrack: null,
  });

  useEffect(() => {
    const unsub = audioService.subscribe(setPlayback);
    return () => unsub();
  }, []);

  if (!playback.currentUri && !playback.currentTrack) {
    return null;
  }

  const track = playback.currentTrack;
  const progressPercent =
    playback.durationMillis > 0
      ? (playback.positionMillis / playback.durationMillis) * 100
      : 0;

  const handleTogglePlay = () => {
    if (playback.currentUri) {
      audioService.togglePlay(playback.currentUri, track || undefined);
    }
  };

  const handleOpenFullPlayer = () => {
    if (track?.podcastId) {
      navigation.navigate('Podcast', { podcastId: track.podcastId });
    } else {
      navigation.navigate('Podcasts');
    }
  };

  const handleClose = () => {
    audioService.stop();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: isDark ? '#27272A' : '#000000',
        },
      ]}
    >
      {/* Top progress bar line */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.contentRow}
        onPress={handleOpenFullPlayer}
      >
        {/* Cover Art */}
        {track?.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
            <Mic2 size={16} color={colors.primary} />
          </View>
        )}

        {/* Title & Host */}
        <View style={styles.infoArea}>
          <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
            {track?.title || 'Campus Podcast'}
          </Text>
          <Text style={[styles.hostText, { color: colors.textSecondary }]} numberOfLines={1}>
            {track?.hostName || 'UniLink Campus Audio'}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => audioService.skip(15)}>
            <RotateCw size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: isDark ? '#10B981' : '#000000' }]}
            onPress={handleTogglePlay}
          >
            {playback.isPlaying ? (
              <Pause size={16} color="#ffffff" fill="#ffffff" />
            ) : (
              <Play size={16} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 76, // Sits directly above the bottom tab bar
    left: 12,
    right: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 9999,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  coverImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoArea: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  hostText: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
});
