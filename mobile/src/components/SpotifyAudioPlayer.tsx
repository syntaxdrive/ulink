import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Platform,
  Share,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  ChevronDown,
  Share2,
  ListMusic,
  CheckCircle2,
  X,
  Radio,
  MoreVertical,
  Heart,
  Download,
  Check,
  Trash2,
  Flame,
  Plus,
} from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { audioService, PlaybackState, AudioTrack } from '../services/audioService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatTime(millis: number): string {
  if (!millis || isNaN(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// 45 Waveform heights to create a natural frequency pattern
const WAVEFORM_BARS = [
  8, 14, 22, 16, 28, 36, 20, 12, 24, 32, 40, 26, 18, 30, 38, 22, 14, 28, 42, 34,
  20, 16, 26, 36, 44, 30, 18, 24, 38, 28, 14, 22, 36, 42, 26, 16, 30, 34, 20, 12,
  22, 32, 24, 16, 10,
];

export function SpotifyAudioPlayer() {
  const { colors, isDark } = useTheme();
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [queueVisible, setQueueVisible] = useState(false);
  const [scrubPosition, setScrubPosition] = useState<number | null>(null);

  // Liked & Downloaded local state
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [downloadedTracks, setDownloadedTracks] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  // Draggable Bubble Position
  const pan = useRef(
    new Animated.ValueXY({
      x: SCREEN_WIDTH - 76,
      y: SCREEN_HEIGHT - 220,
    })
  ).current;

  // Artwork rotation animation
  const spinValue = useRef(new Animated.Value(0)).current;
  const isSpinning = useRef(false);

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setPlaybackState);
    return () => {
      unsubscribe();
    };
  }, []);

  const { currentTrack, isPlaying, positionMillis, durationMillis, isLoading, queue, queueIndex } = playbackState;

  // Handle vinyl rotation
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isPlaying) {
      isSpinning.current = true;
      anim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      isSpinning.current = false;
      spinValue.stopAnimation();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isPlaying]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Pan Responder for Draggable Bubble
  const isDragging = useRef(false);

  const bubblePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6) {
          isDragging.current = true;
        }
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        // If not dragged significantly, tap to expand player
        if (!isDragging.current) {
          setFullscreenVisible(true);
        } else {
          // Snap bubble to nearest edge
          const currentX = (pan.x as any)._value;
          const currentY = (pan.y as any)._value;
          const targetX = currentX < SCREEN_WIDTH / 2 ? 14 : SCREEN_WIDTH - 76;
          const boundedY = Math.max(60, Math.min(SCREEN_HEIGHT - 140, currentY));

          Animated.spring(pan, {
            toValue: { x: targetX, y: boundedY },
            useNativeDriver: false,
            friction: 6,
          }).start();
        }
      },
    })
  ).current;

  if (!currentTrack) return null;

  const isCurrentTrackLiked = currentTrack.id ? likedTracks.has(currentTrack.id) : false;
  const isCurrentTrackDownloaded = currentTrack.id ? downloadedTracks.has(currentTrack.id) : false;

  const toggleTrackLike = () => {
    if (!currentTrack.id) return;
    setLikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(currentTrack.id)) {
        next.delete(currentTrack.id);
        Alert.alert('Unliked', `"${currentTrack.title}" removed from your favorites.`);
      } else {
        next.add(currentTrack.id);
        Alert.alert('Liked! ❤️', `"${currentTrack.title}" added to your favorites!`);
      }
      return next;
    });
  };

  const handleDownloadCurrentTrack = () => {
    if (!currentTrack.id) return;
    if (downloadedTracks.has(currentTrack.id)) {
      Alert.alert('Downloaded 📥', `"${currentTrack.title}" is saved for offline playback.`);
      return;
    }

    setDownloading(true);
    setTimeout(() => {
      setDownloadedTracks((prev) => new Set([...prev, currentTrack.id]));
      setDownloading(false);
      Alert.alert(
        'Downloaded! 📥',
        `"${currentTrack.title}" is saved to your device for offline listening anytime.`
      );
    }, 600);
  };

  const activePosition = scrubPosition !== null ? scrubPosition : positionMillis;
  const totalDuration = durationMillis > 0 ? durationMillis : (currentTrack.durationSeconds ? currentTrack.durationSeconds * 1000 : 900000);
  const progressRatio = Math.min(1, Math.max(0, activePosition / totalDuration));

  // Waveform PanResponder for touch scrubbing
  const waveformWidth = SCREEN_WIDTH - 48;
  const waveformPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / waveformWidth));
      setScrubPosition(ratio * totalDuration);
    },
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / waveformWidth));
      setScrubPosition(ratio * totalDuration);
    },
    onPanResponderRelease: async (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / waveformWidth));
      const targetPos = ratio * totalDuration;
      setScrubPosition(null);
      await audioService.seek(targetPos);
    },
  });

  const handleShare = async () => {
    if (!currentTrack) return;
    try {
      await Share.share({
        message: `Listen to "${currentTrack.title}" on UniLink Campus Podcasts!\n\nhttps://unilink.ng/podcasts/${currentTrack.podcastId || currentTrack.id}`,
      });
    } catch {}
  };

  return (
    <>
      {/* ── 1. DRAGGABLE FLOATING AUDIO BUBBLE ──────────────────────── */}
      {!fullscreenVisible && (
        <Animated.View
          style={[
            styles.bubbleWrapper,
            {
              transform: pan.getTranslateTransform(),
            },
          ]}
          {...bubblePanResponder.panHandlers}
        >
          <View style={[styles.bubbleCircle, isPlaying && styles.bubbleCirclePlaying]}>
            {/* Spinning Disc Cover */}
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              {currentTrack.coverUrl ? (
                <Image source={{ uri: currentTrack.coverUrl }} style={styles.bubbleImage} />
              ) : (
                <View style={styles.bubblePlaceholder}>
                  <Radio size={24} color="#10B981" />
                </View>
              )}
            </Animated.View>

            {/* Inner Center Hole for Vinyl Record Effect */}
            <View style={styles.vinylCenterHole} />

            {/* Mini 1-Tap Play/Pause Badge Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bubblePlayBadge}
              onPress={() => audioService.togglePlay()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : isPlaying ? (
                <Pause size={12} color="#000000" fill="#000000" />
              ) : (
                <Play size={12} color="#000000" fill="#000000" style={{ marginLeft: 1 }} />
              )}
            </TouchableOpacity>

            {/* Mini Close Badge */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bubbleCloseBadge}
              onPress={() => audioService.stop()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={10} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── 2. EXPANDED FULLSCREEN WAVEFORM PLAYER MODAL ─────────────── */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <SafeAreaView style={[styles.fullModalContainer, { backgroundColor: '#0D0D11' }]}>
          {/* Header Bar */}
          <View style={styles.fullHeader}>
            <TouchableOpacity
              onPress={() => setFullscreenVisible(false)}
              style={styles.fullHeaderBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronDown size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.fullHeaderMeta}>
              <Text style={styles.fullHeaderSub}>Now Playing from Podcast</Text>
              <Text style={styles.fullHeaderTitle} numberOfLines={1}>
                {currentTrack.hostName || currentTrack.podcastTitle || 'THOMAS LARSON'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleShare} style={styles.fullHeaderBtn}>
              <MoreVertical size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.fullScrollContent} showsVerticalScrollIndicator={false}>
            {/* Giant Cover Artwork Card */}
            <View style={styles.fullArtworkWrap}>
              {currentTrack.coverUrl ? (
                <Image source={{ uri: currentTrack.coverUrl }} style={styles.fullArtwork} />
              ) : (
                <View style={[styles.fullArtwork, styles.fullArtworkPlaceholder]}>
                  <Radio size={64} color="#10B981" />
                </View>
              )}

              {/* Artwork Badge Overlay */}
              <View style={styles.artworkBadge}>
                <Text style={styles.artworkBadgeSub}>CAMPUS PODCAST</Text>
                <Text style={styles.artworkBadgeEpisode}>
                  {currentTrack.episodeNumber ? `EPISODE ${currentTrack.episodeNumber}` : 'NOW PLAYING'}
                </Text>
              </View>

              {/* Monthly Listens Badge */}
              <View style={styles.monthlyBadge}>
                <Flame size={12} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.monthlyBadgeText}>
                  {currentTrack.monthlyListens ? `${(currentTrack.monthlyListens / 1000).toFixed(1)}K listens/mo` : 'Top Show'}
                </Text>
              </View>
            </View>

            {/* Title, Host Meta & Interactive Like / Download Icons */}
            <View style={styles.titleHostContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fullTrackTitle} numberOfLines={2}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.fullHostName} numberOfLines={1}>
                  {currentTrack.hostName || 'Thomas Larson'}
                </Text>
              </View>

              <View style={styles.playerHeaderActionsRow}>
                {/* Like Button */}
                <TouchableOpacity
                  style={[styles.playerActionCircle, isCurrentTrackLiked && styles.playerActionCircleLiked]}
                  onPress={toggleTrackLike}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Heart
                    size={20}
                    color={isCurrentTrackLiked ? '#EF4444' : '#FFFFFF'}
                    fill={isCurrentTrackLiked ? '#EF4444' : 'none'}
                  />
                </TouchableOpacity>

                {/* Download Button */}
                <TouchableOpacity
                  style={styles.playerActionCircle}
                  onPress={handleDownloadCurrentTrack}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : isCurrentTrackDownloaded ? (
                    <Check size={20} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Download size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ── SOUND WAVEFORM SCRUBBER ────────────────────────────── */}
            <View style={styles.waveformContainer}>
              <View
                style={styles.waveformBarsArea}
                {...waveformPanResponder.panHandlers}
              >
                {WAVEFORM_BARS.map((barHeight, idx) => {
                  const barProgressRatio = idx / WAVEFORM_BARS.length;
                  const isBarActive = barProgressRatio <= progressRatio;

                  return (
                    <View
                      key={idx}
                      style={[
                        styles.waveformBar,
                        {
                          height: barHeight,
                          backgroundColor: isBarActive ? '#10B981' : '#2C2C38',
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Time Indicators */}
              <View style={styles.waveformTimeRow}>
                <Text style={styles.waveformTimeText}>{formatTime(activePosition)}</Text>
                <Text style={styles.waveformTimeText}>{formatTime(totalDuration)}</Text>
              </View>
            </View>

            {/* ── MAIN PLAYBACK CONTROLS ROW ─────────────────────────── */}
            <View style={styles.mainControlsRow}>
              {/* Skip Previous Track */}
              <TouchableOpacity
                onPress={() => audioService.playPrevious()}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <SkipBack size={22} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>

              {/* 10s Rewind */}
              <TouchableOpacity
                onPress={() => audioService.skip(-10)}
                style={styles.rewindBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCcw size={26} color="#FFFFFF" />
                <Text style={styles.rewindBtnNumber}>10</Text>
              </TouchableOpacity>

              {/* Central Large Play/Pause Button */}
              <TouchableOpacity
                onPress={() => audioService.togglePlay()}
                style={styles.centerPlayBtn}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : isPlaying ? (
                  <Pause size={30} color="#000000" fill="#000000" />
                ) : (
                  <Play size={30} color="#000000" fill="#000000" style={{ marginLeft: 3 }} />
                )}
              </TouchableOpacity>

              {/* 10s Fast Forward */}
              <TouchableOpacity
                onPress={() => audioService.skip(10)}
                style={styles.rewindBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCw size={26} color="#FFFFFF" />
                <Text style={styles.rewindBtnNumber}>10</Text>
              </TouchableOpacity>

              {/* Skip Next Track */}
              <TouchableOpacity
                onPress={() => audioService.playNext()}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <SkipForward size={22} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* ── ABOUT THIS EPISODE DRAWER ──────────────────────────── */}
            <View style={styles.aboutEpisodeDrawer}>
              <Text style={styles.aboutEpisodeTitle}>About this Episode</Text>
              <Text style={styles.aboutEpisodeText}>
                In this episode of '{currentTrack.podcastTitle || currentTrack.hostName || 'Campus Audio'}', host {currentTrack.hostName || 'Creator'} discusses exam room chronicles, campus life hacks, and student growth.
              </Text>
            </View>

            {/* Episode Queue Button */}
            <View style={styles.bottomQueueRow}>
              <TouchableOpacity
                style={styles.queueBtn}
                onPress={() => setQueueVisible(true)}
                activeOpacity={0.8}
              >
                <ListMusic size={16} color="#9CA3AF" style={{ marginRight: 6 }} />
                <Text style={styles.queueBtnText}>
                  Episode Queue {queue.length > 0 ? `(${queue.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── 3. QUEUE MODAL SHEET ─────────────────────────────────────── */}
      <Modal
        visible={queueVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQueueVisible(false)}
      >
        <View style={styles.queueModalOverlay}>
          <View style={styles.queueSheet}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Now Playing & Up Next ({queue.length})</Text>
              <TouchableOpacity onPress={() => setQueueVisible(false)} style={styles.queueCloseBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <View
                    key={track.id || idx}
                    style={[styles.queueItem, isCurrent && styles.queueItemActive]}
                  >
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      onPress={() => {
                        audioService.playTrack(track);
                        setQueueVisible(false);
                      }}
                    >
                      <Text style={[styles.queueIndex, isCurrent && styles.queueIndexActive]}>
                        {idx + 1}
                      </Text>
                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text style={[styles.queueTrackTitle, isCurrent && styles.queueTrackTitleActive]} numberOfLines={1}>
                          {track.title}
                        </Text>
                        <Text style={styles.queueTrackHost} numberOfLines={1}>
                          {track.hostName || 'Campus Podcast'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Status Pill or Remove from Queue */}
                    {isCurrent && isPlaying ? (
                      <View style={styles.playingPill}>
                        <Text style={styles.playingPillText}>PLAYING</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => audioService.removeFromQueue(track.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Draggable Bubble Styles
  bubbleWrapper: {
    position: 'absolute',
    zIndex: 9999,
  },
  bubbleCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#18181B',
    borderWidth: 2.5,
    borderColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'visible',
  },
  bubbleCirclePlaying: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.6,
  },
  bubbleImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  bubblePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylCenterHole: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  bubblePlayBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 10,
  },
  bubbleCloseBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
    zIndex: 10,
  },

  // Fullscreen Modal Styles
  fullModalContainer: {
    flex: 1,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fullHeaderBtn: {
    padding: 6,
  },
  fullHeaderMeta: {
    alignItems: 'center',
  },
  fullHeaderSub: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fullHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  fullScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  fullArtworkWrap: {
    width: '100%',
    height: SCREEN_WIDTH - 48,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 20,
    backgroundColor: '#181820',
  },
  fullArtwork: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullArtworkPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  artworkBadgeSub: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  artworkBadgeEpisode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  monthlyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  monthlyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  titleHostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fullTrackTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  fullHostName: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  playerHeaderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerActionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A36',
  },
  playerActionCircleLiked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  // Waveform Visualizer
  waveformContainer: {
    marginBottom: 24,
  },
  waveformBarsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 2,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  waveformTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  waveformTimeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Main Controls Row
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
    paddingHorizontal: 10,
  },
  controlIconBtn: {
    padding: 10,
  },
  rewindBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rewindBtnNumber: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  centerPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  // About Episode Drawer
  aboutEpisodeDrawer: {
    backgroundColor: '#16161E',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#242432',
  },
  aboutEpisodeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  aboutEpisodeText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomQueueRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  queueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  queueBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Queue Modal Sheet
  queueModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  queueSheet: {
    backgroundColor: '#14141B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242430',
  },
  queueTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  queueCloseBtn: {
    padding: 4,
  },
  queueList: {
    marginTop: 12,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E28',
  },
  queueItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  queueIndex: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
    width: 20,
  },
  queueIndexActive: {
    color: '#10B981',
  },
  queueTrackTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  queueTrackTitleActive: {
    color: '#10B981',
  },
  queueTrackHost: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  playingPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  playingPillText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
});
