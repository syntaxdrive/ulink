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
} from 'lucide-react-native';
import { useTheme } from '../theme/colors';
import { audioService, PlaybackState } from '../services/audioService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatTime(millis: number): string {
  if (!millis || isNaN(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function SpotifyAudioPlayer() {
  const { colors, isDark } = useTheme();
  const [playbackState, setPlaybackState] = useState<PlaybackState>(audioService.getState());
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [queueVisible, setQueueVisible] = useState(false);
  const [scrubPosition, setScrubPosition] = useState<number | null>(null);

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

  const { currentTrack, isPlaying, positionMillis, durationMillis, isLoading, rate, queue, queueIndex } = playbackState;

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
  const dragStart = useRef({ x: 0, y: 0 });

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
        // If not dragged significantly, treat as tap to expand player!
        if (!isDragging.current) {
          setFullscreenVisible(true);
        } else {
          // Snap bubble to nearest screen edge (left or right)
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

  const activePosition = scrubPosition !== null ? scrubPosition : positionMillis;
  const progressRatio = durationMillis > 0 ? Math.min(1, Math.max(0, activePosition / durationMillis)) : 0;
  const remainingMillis = Math.max(0, durationMillis - activePosition);

  // Scrubber PanResponder for drag seeking in Fullscreen
  const barWidth = SCREEN_WIDTH - 48;
  const scrubberPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / barWidth));
      setScrubPosition(ratio * (durationMillis || 1));
    },
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / barWidth));
      setScrubPosition(ratio * (durationMillis || 1));
    },
    onPanResponderRelease: async (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / barWidth));
      const targetPos = ratio * (durationMillis || 1);
      setScrubPosition(null);
      await audioService.seek(targetPos);
    },
  });

  const handleCycleSpeed = () => {
    const currIdx = PLAYBACK_SPEEDS.indexOf(rate);
    const nextIdx = (currIdx + 1) % PLAYBACK_SPEEDS.length;
    audioService.setRate(PLAYBACK_SPEEDS[nextIdx]);
  };

  const handleShare = async () => {
    if (!currentTrack) return;
    try {
      await Share.share({
        message: `Listen to "${currentTrack.title}" on UniLink Campus Audio!\n\nhttps://unilink.ng/podcasts/${currentTrack.podcastId || currentTrack.id}`,
      });
    } catch {}
  };

  return (
    <>
      {/* ── 1. DRAGGABLE FLOATING SPOTIFY AUDIO BUBBLE ───────────────── */}
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

      {/* ── 2. SPOTIFY FULLSCREEN EXPANDED PLAYER MODAL ──────────────── */}
      <Modal
        visible={fullscreenVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <SafeAreaView style={[styles.fullModalContainer, { backgroundColor: isDark ? '#121212' : '#18181B' }]}>
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
              <Text style={styles.fullHeaderSub}>PLAYING FROM PODCAST</Text>
              <Text style={styles.fullHeaderTitle} numberOfLines={1}>
                {currentTrack.podcastTitle || 'THE BLISSFUL CAST'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleShare} style={styles.fullHeaderBtn}>
              <Share2 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.fullScrollContent} showsVerticalScrollIndicator={false}>
            {/* Giant Cover Artwork */}
            <View style={styles.fullArtworkWrap}>
              {currentTrack.coverUrl ? (
                <Image source={{ uri: currentTrack.coverUrl }} style={styles.fullArtwork} />
              ) : (
                <View style={[styles.fullArtwork, styles.fullArtworkPlaceholder]}>
                  <Radio size={64} color="#10B981" />
                </View>
              )}
            </View>

            {/* Title & Host Meta */}
            <View style={styles.fullMetaRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.fullTrackTitle} numberOfLines={2}>
                  {currentTrack.title}
                </Text>
                <View style={styles.hostRow}>
                  <Text style={styles.fullHostName} numberOfLines={1}>
                    {currentTrack.hostName || 'THE BLISSFUL CAST'}
                  </Text>
                  <CheckCircle2 size={13} color="#10B981" style={{ marginLeft: 4 }} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.speedPill}
                onPress={handleCycleSpeed}
                activeOpacity={0.8}
              >
                <Text style={styles.speedPillText}>{rate}x</Text>
              </TouchableOpacity>
            </View>

            {/* Spotify Scrubber Bar */}
            <View style={styles.scrubberContainer}>
              <View style={styles.scrubTrackArea} {...scrubberPanResponder.panHandlers}>
                <View style={styles.scrubTrackBg}>
                  <View style={[styles.scrubProgressFill, { width: `${progressRatio * 100}%` }]} />
                  <View style={[styles.scrubThumb, { left: `${progressRatio * 100}%` }]} />
                </View>
              </View>

              {/* Time Indicators */}
              <View style={styles.scrubTimeRow}>
                <Text style={styles.scrubTimeText}>{formatTime(activePosition)}</Text>
                <Text style={styles.scrubTimeText}>-{formatTime(remainingMillis)}</Text>
              </View>
            </View>

            {/* Spotify Main Controls Bar */}
            <View style={styles.mainControlsRow}>
              {/* Previous Track */}
              <TouchableOpacity
                onPress={() => audioService.playPrevious()}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <SkipBack size={24} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>

              {/* 15s Rewind */}
              <TouchableOpacity
                onPress={() => audioService.skip(-15)}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCcw size={26} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Central Play/Pause Disc */}
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

              {/* 15s Fast Forward */}
              <TouchableOpacity
                onPress={() => audioService.skip(15)}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <RotateCw size={26} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Next Track */}
              <TouchableOpacity
                onPress={() => audioService.playNext()}
                style={styles.controlIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <SkipForward size={24} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Extras (Queue Selector) */}
            <View style={styles.bottomExtrasRow}>
              <TouchableOpacity
                style={styles.queueBtn}
                onPress={() => setQueueVisible(true)}
              >
                <ListMusic size={18} color="#A1A1AA" style={{ marginRight: 6 }} />
                <Text style={styles.queueBtnText}>
                  Episode Queue {queue.length > 0 ? `(${queue.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── 3. QUEUE / EPISODE DRAWER MODAL ──────────────────────────── */}
      <Modal
        visible={queueVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQueueVisible(false)}
      >
        <View style={styles.queueModalOverlay}>
          <View style={[styles.queueSheet, { backgroundColor: isDark ? '#1C1C1E' : '#27272A' }]}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Now Playing & Up Next</Text>
              <TouchableOpacity onPress={() => setQueueVisible(false)} style={styles.queueCloseBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
              {queue.map((track, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <TouchableOpacity
                    key={track.id || idx}
                    style={[styles.queueItem, isCurrent && styles.queueItemActive]}
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
                        {track.hostName || 'THE BLISSFUL CAST'}
                      </Text>
                    </View>
                    {isCurrent && isPlaying && (
                      <View style={styles.playingPill}>
                        <Text style={styles.playingPillText}>PLAYING</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  bubblePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylCenterHole: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  bubblePlayBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#18181B',
  },
  bubbleCloseBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#18181B',
  },

  // Fullscreen Player
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullHeaderMeta: {
    alignItems: 'center',
    flex: 1,
  },
  fullHeaderSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A1A1AA',
    letterSpacing: 1,
  },
  fullHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  fullScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  fullArtworkWrap: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH - 48,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 14,
    marginVertical: 20,
    alignSelf: 'center',
  },
  fullArtwork: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  fullArtworkPlaceholder: {
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  fullTrackTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fullHostName: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  speedPill: {
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  speedPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },

  // Scrubber Bar
  scrubberContainer: {
    marginVertical: 12,
  },
  scrubTrackArea: {
    height: 30,
    justifyContent: 'center',
  },
  scrubTrackBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  scrubProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  scrubThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginLeft: -7,
  },
  scrubTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  scrubTimeText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },

  // Main Controls
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  controlIconBtn: {
    padding: 8,
  },
  centerPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  // Bottom Extras
  bottomExtrasRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  queueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  queueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4D4D8',
  },

  // Queue Modal Sheet
  queueModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  queueSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 30,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  queueCloseBtn: {
    padding: 6,
  },
  queueList: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  queueItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  queueIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
    width: 20,
  },
  queueIndexActive: {
    color: '#10B981',
  },
  queueTrackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  queueTrackTitleActive: {
    color: '#10B981',
  },
  queueTrackHost: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  playingPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  playingPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
});
