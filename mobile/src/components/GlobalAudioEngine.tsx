import React, { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { audioService, AudioCommand } from '../services/audioService';

export const GlobalAudioEngine: React.FC = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentUriRef = useRef<string | null>(null);

  useEffect(() => {
    // Configure audio mode for background playback on native devices
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch((e) => {
      console.warn('Audio mode setup notice:', e);
    });

    const unsubscribeCmd = audioService.subscribeCommands(async (cmd: AudioCommand) => {
      try {
        if (cmd.action === 'play') {
          const { uri, rate } = cmd.payload || {};
          if (!uri) return;

          audioService.updateState({ isLoading: true, isPlaying: false, currentUri: uri });

          // Unload previous sound if any
          if (soundRef.current) {
            try {
              await soundRef.current.unloadAsync();
            } catch {}
            soundRef.current = null;
          }

          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true, rate: rate || 1.0, progressUpdateIntervalMillis: 500 },
            (status) => {
              if (status.isLoaded) {
                audioService.updateState({
                  isPlaying: status.isPlaying,
                  positionMillis: status.positionMillis || 0,
                  durationMillis: status.durationMillis || 0,
                  isLoading: status.isBuffering,
                });
                if (status.didJustFinish) {
                  audioService.onEnded();
                }
              } else if (status.error) {
                console.warn('Native audio playback error:', status.error);
                audioService.updateState({ isPlaying: false, isLoading: false });
              }
            }
          );

          soundRef.current = sound;
          currentUriRef.current = uri;
          audioService.updateState({ isPlaying: true, isLoading: false });
        } else if (cmd.action === 'pause') {
          if (soundRef.current) {
            await soundRef.current.pauseAsync();
            audioService.updateState({ isPlaying: false });
          }
        } else if (cmd.action === 'resume') {
          if (soundRef.current) {
            await soundRef.current.playAsync();
            audioService.updateState({ isPlaying: true });
          }
        } else if (cmd.action === 'seek') {
          if (soundRef.current && typeof cmd.payload === 'number') {
            await soundRef.current.setPositionAsync(cmd.payload);
          }
        } else if (cmd.action === 'rate') {
          if (soundRef.current && typeof cmd.payload === 'number') {
            await soundRef.current.setRateAsync(cmd.payload, true);
          }
        } else if (cmd.action === 'stop') {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
            audioService.updateState({ isPlaying: false, positionMillis: 0 });
          }
        }
      } catch (err) {
        console.warn('Audio command execution error:', err);
        audioService.updateState({ isLoading: false });
      }
    });

    return () => {
      unsubscribeCmd();
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  return null;
};
