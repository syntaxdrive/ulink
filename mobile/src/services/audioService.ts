import { Audio, AVPlaybackStatus } from 'expo-av';

export interface AudioTrack {
  id: string;
  uri: string;
  title: string;
  hostName?: string;
  coverUrl?: string;
  podcastId?: string;
  podcastTitle?: string;
  durationSeconds?: number;
  episodeNumber?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isLoading: boolean;
  currentUri: string | null;
  currentTrack?: AudioTrack | null;
  rate: number; // 0.75, 1.0, 1.25, 1.5, 2.0
  queue: AudioTrack[];
  queueIndex: number;
}

type StateListener = (state: PlaybackState) => void;

class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private listeners = new Set<StateListener>();
  private audioModeSet = false;

  private state: PlaybackState = {
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    isLoading: false,
    currentUri: null,
    currentTrack: null,
    rate: 1.0,
    queue: [],
    queueIndex: -1,
  };

  constructor() {
    this.initAudioMode();
  }

  private async initAudioMode() {
    if (this.audioModeSet) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.audioModeSet = true;
    } catch (e) {
      console.warn('Could not set audio mode:', e);
    }
  }

  public subscribe(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  public getState(): PlaybackState {
    return this.state;
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn(`Audio Player Error: ${status.error}`);
        this.state = { ...this.state, isLoading: false, isPlaying: false };
        this.notify();
      }
      return;
    }

    this.state = {
      ...this.state,
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis || 0,
      durationMillis: status.durationMillis || this.state.durationMillis || 0,
      isLoading: status.isBuffering,
    };
    this.notify();

    // Auto-advance on track completion
    if (status.didJustFinish) {
      this.playNext();
    }
  };

  /**
   * Set queue of episodes/tracks
   */
  public setQueue(tracks: AudioTrack[], startIndex = 0) {
    this.state.queue = tracks;
    this.state.queueIndex = startIndex;
    if (tracks[startIndex]) {
      this.playTrack(tracks[startIndex]);
    }
  }

  /**
   * Play a specific track object
   */
  public async playTrack(track: AudioTrack) {
    await this.initAudioMode();

    // If already playing this track, toggle or resume
    if (this.sound && this.state.currentUri === track.uri) {
      if (!this.state.isPlaying) {
        await this.sound.playAsync();
      }
      return;
    }

    // Unload existing sound
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }

    // Find index in queue or add
    let qIndex = this.state.queue.findIndex((t) => t.id === track.id || t.uri === track.uri);
    let newQueue = [...this.state.queue];
    if (qIndex === -1) {
      newQueue = [track, ...newQueue];
      qIndex = 0;
    }

    this.state = {
      ...this.state,
      isLoading: true,
      isPlaying: true,
      currentUri: track.uri,
      currentTrack: track,
      positionMillis: 0,
      durationMillis: (track.durationSeconds || 0) * 1000,
      queue: newQueue,
      queueIndex: qIndex,
    };
    this.notify();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          rate: this.state.rate,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 300,
        },
        this.onPlaybackStatusUpdate
      );
      this.sound = sound;
    } catch (err: any) {
      console.warn('Failed to load audio sound:', err);
      this.state = { ...this.state, isLoading: false, isPlaying: false };
      this.notify();
    }
  }

  /**
   * Play from URI with optional metadata
   */
  public async play(uri: string, meta?: Partial<AudioTrack>) {
    const track: AudioTrack = {
      id: meta?.id || uri,
      uri,
      title: meta?.title || 'Campus Audio',
      hostName: meta?.hostName || 'UniLink Podcast',
      coverUrl: meta?.coverUrl,
      podcastId: meta?.podcastId,
      podcastTitle: meta?.podcastTitle,
      durationSeconds: meta?.durationSeconds,
      episodeNumber: meta?.episodeNumber,
    };
    await this.playTrack(track);
  }

  public async pause() {
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
        this.state = { ...this.state, isPlaying: false };
        this.notify();
      } catch (err) {
        console.warn('Pause error:', err);
      }
    }
  }

  public async resume() {
    if (this.sound) {
      try {
        await this.sound.playAsync();
        this.state = { ...this.state, isPlaying: true };
        this.notify();
      } catch (err) {
        console.warn('Resume error:', err);
      }
    }
  }

  public async togglePlay(uri?: string, meta?: Partial<AudioTrack>) {
    if (uri && uri !== this.state.currentUri) {
      await this.play(uri, meta);
      return;
    }

    if (this.state.isPlaying) {
      await this.pause();
    } else if (this.sound) {
      await this.resume();
    } else if (this.state.currentTrack) {
      await this.playTrack(this.state.currentTrack);
    }
  }

  public async seek(positionMillis: number) {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis);
        this.state = { ...this.state, positionMillis };
        this.notify();
      } catch (err) {
        console.warn('Seek error:', err);
      }
    }
  }

  public async skip(seconds: number) {
    const target = Math.max(
      0,
      Math.min(
        this.state.durationMillis || 3600000,
        this.state.positionMillis + seconds * 1000
      )
    );
    await this.seek(target);
  }

  public async setRate(rate: number) {
    if (this.sound) {
      try {
        await this.sound.setRateAsync(rate, true);
      } catch {}
    }
    this.state = { ...this.state, rate };
    this.notify();
  }

  public async playNext() {
    const { queue, queueIndex } = this.state;
    if (queue.length > 0 && queueIndex + 1 < queue.length) {
      await this.playTrack(queue[queueIndex + 1]);
    }
  }

  public async playPrevious() {
    const { queue, queueIndex, positionMillis } = this.state;
    // If more than 3 seconds in, restart track
    if (positionMillis > 3000) {
      await this.seek(0);
      return;
    }
    if (queue.length > 0 && queueIndex - 1 >= 0) {
      await this.playTrack(queue[queueIndex - 1]);
    } else {
      await this.seek(0);
    }
  }

  public async stop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }
    this.state = {
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
      isLoading: false,
      currentUri: null,
      currentTrack: null,
      rate: 1.0,
      queue: [],
      queueIndex: -1,
    };
    this.notify();
  }
}

export const audioService = new AudioPlayerService();
