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

export interface AudioCommand {
  action: 'play' | 'pause' | 'resume' | 'seek' | 'rate' | 'stop';
  payload?: any;
}

type StateListener = (state: PlaybackState) => void;
type CommandListener = (cmd: AudioCommand) => void;

class AudioPlayerService {
  private listeners = new Set<StateListener>();
  private commandListeners = new Set<CommandListener>();

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

  public subscribe(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeCommands(listener: CommandListener) {
    this.commandListeners.add(listener);
    return () => {
      this.commandListeners.delete(listener);
    };
  }

  public getState(): PlaybackState {
    return this.state;
  }

  public updateState(partial: Partial<PlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  /**
   * Called by the audio engine on progress update
   */
  public onTimeUpdate(currentTimeSec: number, durationSec: number) {
    const pos = Math.floor(currentTimeSec * 1000);
    const dur = Math.floor(durationSec * 1000);
    this.updateState({
      positionMillis: pos,
      durationMillis: dur > 0 ? dur : this.state.durationMillis,
      isLoading: false,
    });
  }

  public onEnded() {
    this.playNext();
  }

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
    let qIndex = this.state.queue.findIndex((t) => t.id === track.id || t.uri === track.uri);
    let newQueue = [...this.state.queue];
    if (qIndex === -1) {
      newQueue = [track, ...newQueue];
      qIndex = 0;
    }

    this.updateState({
      isLoading: true,
      isPlaying: true,
      currentUri: track.uri,
      currentTrack: track,
      positionMillis: 0,
      durationMillis: (track.durationSeconds || 0) * 1000,
      queue: newQueue,
      queueIndex: qIndex,
    });

    this.commandListeners.forEach((fn) =>
      fn({ action: 'play', payload: { uri: track.uri, rate: this.state.rate } })
    );
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
    this.updateState({ isPlaying: false });
    this.commandListeners.forEach((fn) => fn({ action: 'pause' }));
  }

  public async resume() {
    if (this.state.currentUri) {
      this.updateState({ isPlaying: true });
      this.commandListeners.forEach((fn) => fn({ action: 'resume' }));
    }
  }

  public async togglePlay(uri?: string, meta?: Partial<AudioTrack>) {
    if (uri && uri !== this.state.currentUri) {
      await this.play(uri, meta);
      return;
    }

    if (this.state.isPlaying) {
      await this.pause();
    } else if (this.state.currentUri) {
      await this.resume();
    } else if (this.state.currentTrack) {
      await this.playTrack(this.state.currentTrack);
    }
  }

  public async seek(positionMillis: number) {
    this.updateState({ positionMillis });
    this.commandListeners.forEach((fn) =>
      fn({ action: 'seek', payload: { positionMillis } })
    );
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
    this.updateState({ rate });
    this.commandListeners.forEach((fn) =>
      fn({ action: 'rate', payload: { rate } })
    );
  }

  public async playNext() {
    const { queue, queueIndex } = this.state;
    if (queue.length > 0 && queueIndex + 1 < queue.length) {
      await this.playTrack(queue[queueIndex + 1]);
    }
  }

  public async playPrevious() {
    const { queue, queueIndex, positionMillis } = this.state;
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
    this.updateState({
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
      isLoading: false,
      currentUri: null,
      currentTrack: null,
      rate: 1.0,
      queue: [],
      queueIndex: -1,
    });
    this.commandListeners.forEach((fn) => fn({ action: 'stop' }));
  }
}

export const audioService = new AudioPlayerService();
