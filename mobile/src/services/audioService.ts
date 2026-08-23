export interface AudioTrack {
  id: string;
  uri: string;
  title: string;
  hostName?: string;
  coverUrl?: string;
  podcastId?: string;
  durationSeconds?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isLoading: boolean;
  currentUri: string | null;
  currentTrack?: AudioTrack | null;
}

type StateListener = (state: PlaybackState) => void;
type CommandListener = (cmd: { action: string; payload?: any }) => void;

class AudioService {
  private listeners = new Set<StateListener>();
  private commandListeners = new Set<CommandListener>();
  private currentUri: string | null = null;
  private currentTrack: AudioTrack | null = null;
  private state: PlaybackState = {
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    isLoading: false,
    currentUri: null,
    currentTrack: null,
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

  public updateState(partial: Partial<PlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public async playTrack(track: AudioTrack) {
    this.currentUri = track.uri;
    this.currentTrack = track;
    this.updateState({
      isLoading: true,
      isPlaying: true,
      currentUri: track.uri,
      currentTrack: track,
    });
    this.commandListeners.forEach((fn) =>
      fn({ action: 'play', payload: { uri: track.uri, track } })
    );
  }

  public async play(uri: string, meta?: Partial<AudioTrack>) {
    const track: AudioTrack = {
      id: meta?.id || uri,
      uri,
      title: meta?.title || 'Campus Audio',
      hostName: meta?.hostName || 'UniLink Podcast',
      coverUrl: meta?.coverUrl,
      podcastId: meta?.podcastId,
      durationSeconds: meta?.durationSeconds,
    };
    await this.playTrack(track);
  }

  public async pause() {
    this.updateState({ isPlaying: false });
    this.commandListeners.forEach((fn) => fn({ action: 'pause' }));
  }

  public async resume() {
    if (this.currentUri) {
      this.updateState({ isPlaying: true });
      this.commandListeners.forEach((fn) => fn({ action: 'resume' }));
    }
  }

  public async togglePlay(uri: string, meta?: Partial<AudioTrack>) {
    if (this.currentUri === uri && this.state.isPlaying) {
      await this.pause();
    } else if (this.currentUri === uri && !this.state.isPlaying) {
      await this.resume();
    } else {
      await this.play(uri, meta);
    }
  }

  public async seek(positionMillis: number) {
    this.commandListeners.forEach((fn) =>
      fn({ action: 'seek', payload: { positionMillis } })
    );
  }

  public async skip(seconds: number) {
    const nextPos = Math.max(
      0,
      Math.min(
        this.state.durationMillis,
        this.state.positionMillis + seconds * 1000
      )
    );
    await this.seek(nextPos);
  }

  public async stop() {
    this.currentUri = null;
    this.currentTrack = null;
    this.updateState({
      isPlaying: false,
      positionMillis: 0,
      currentUri: null,
      currentTrack: null,
    });
    this.commandListeners.forEach((fn) => fn({ action: 'stop' }));
  }
}

export const audioService = new AudioService();
