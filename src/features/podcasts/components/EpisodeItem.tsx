import { Play, Pause, Mic2 } from 'lucide-react';
import type { PodcastEpisode } from '../../../types';
import { useAudioStore } from '../../../stores/useAudioStore';
import { incrementEpisodePlay } from '../hooks/usePodcasts';

interface Props {
    episode: PodcastEpisode;
    podcastTitle: string;
    podcastCover?: string;
    /** Full list of episodes in the podcast — used to build the playback queue. */
    queue: PodcastEpisode[];
    /** Index of this episode inside `queue`. */
    queueIndex: number;
}

function formatDuration(secs: number): string {
    if (!secs || secs <= 0) return '';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m${s > 0 ? ` ${s}s` : ''}`;
    return `${s}s`;
}

export default function EpisodeItem({ episode, podcastTitle, podcastCover, queue, queueIndex }: Props) {
    const { currentTrack, isPlaying, setQueue, pauseTrack, resumeTrack } = useAudioStore();
    const isActive = currentTrack?.episodeId === episode.id;
    const isThisPlaying = isActive && isPlaying;

    const handlePlay = async () => {
        if (isActive) {
            isPlaying ? pauseTrack() : resumeTrack();
            return;
        }

        // Build a queue from the full episode list
        const tracks = queue.map(ep => ({
            id: ep.id,
            title: ep.title,
            audioUrl: ep.audio_url,
            source: podcastTitle,
            thumbnail: ep.cover_url ?? podcastCover,
            episodeId: ep.id,
        }));

        setQueue(tracks, queueIndex);

        // Fire-and-forget play count increment
        incrementEpisodePlay(episode.id).catch(() => {});
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/20'
                : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
        }`}>
            {/* Thumbnail / episode number */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 relative">
                {episode.cover_url ?? podcastCover ? (
                    <img
                        src={episode.cover_url ?? podcastCover}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Mic2 className="w-5 h-5 text-slate-400" />
                    </div>
                )}
                {episode.episode_number != null && (
                    <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold bg-black/60 text-white px-1 rounded leading-tight">
                        #{episode.episode_number}
                    </span>
                )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold truncate ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-100'
                }`}>
                    {episode.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {episode.plays_count > 0 && (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">
                            {episode.plays_count.toLocaleString()} plays
                        </span>
                    )}
                    {episode.plays_count > 0 && episode.duration_seconds > 0 && (
                        <span className="text-slate-300 dark:text-zinc-600">·</span>
                    )}
                    {episode.duration_seconds > 0 && (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">
                            {formatDuration(episode.duration_seconds)}
                        </span>
                    )}
                </div>
                {episode.description && (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 truncate mt-0.5">{episode.description}</p>
                )}
            </div>

            {/* Play button */}
            <button
                onClick={handlePlay}
                className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 ${
                    isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-950/50 hover:bg-emerald-700'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
            >
                {isThisPlaying
                    ? <Pause className="w-4 h-4 fill-current" />
                    : <Play className="w-4 h-4 fill-current translate-x-0.5" />
                }
            </button>
        </div>
    );
}
