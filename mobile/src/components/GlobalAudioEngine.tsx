import React, { useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { audioService, AudioCommand } from '../services/audioService';

export const GlobalAudioEngine: React.FC = () => {
  const playerRef = useRef<AudioPlayer | null>(null);
  const currentUriRef = useRef<string | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    // Configure audio mode for background playback on native devices
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch((e) => {
      console.warn('Audio mode setup notice:', e);
    });

    const unsubscribeCmd = audioService.subscribeCommands(async (cmd: AudioCommand) => {
      try {
        if (cmd.action === 'play') {
          const { uri, rate } = cmd.payload || {};
          if (!uri) return;

          audioService.updateState({ isLoading: true, isPlaying: false, currentUri: uri });

          if (statusSubRef.current) {
            statusSubRef.current.remove();
            statusSubRef.current = null;
          }

          if (playerRef.current) {
            try {
              playerRef.current.pause();
            } catch {}
            playerRef.current = null;
          }

          const player = createAudioPlayer({ uri }, { updateInterval: 500 });
          if (rate && typeof rate === 'number') {
            player.playbackRate = rate;
          }

          const sub = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
            audioService.updateState({
              isPlaying: status.playing,
              positionMillis: Math.round((status.currentTime || 0) * 1000),
              durationMillis: Math.round((status.duration || 0) * 1000),
              isLoading: status.isBuffering,
            });

            if (status.didJustFinish) {
              audioService.onEnded();
            }

            if (status.error) {
              console.warn('Native audio playback error:', status.error);
              audioService.updateState({ isPlaying: false, isLoading: false });
            }
          });

          statusSubRef.current = sub;
          playerRef.current = player;
          currentUriRef.current = uri;

          player.play();
          audioService.updateState({ isPlaying: true, isLoading: false });
        } else if (cmd.action === 'pause') {
          if (playerRef.current) {
            playerRef.current.pause();
            audioService.updateState({ isPlaying: false });
          }
        } else if (cmd.action === 'resume') {
          if (playerRef.current) {
            playerRef.current.play();
            audioService.updateState({ isPlaying: true });
          }
        } else if (cmd.action === 'seek') {
          if (playerRef.current && typeof cmd.payload === 'number') {
            await playerRef.current.seekTo(cmd.payload / 1000);
          }
        } else if (cmd.action === 'rate') {
          if (playerRef.current && typeof cmd.payload === 'number') {
            playerRef.current.playbackRate = cmd.payload;
          }
        } else if (cmd.action === 'stop') {
          if (playerRef.current) {
            playerRef.current.pause();
            if (statusSubRef.current) {
              statusSubRef.current.remove();
              statusSubRef.current = null;
            }
            playerRef.current = null;
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
      if (statusSubRef.current) {
        statusSubRef.current.remove();
      }
      if (playerRef.current) {
        try {
          playerRef.current.pause();
        } catch {}
      }
    };
  }, []);

  return null;
};
