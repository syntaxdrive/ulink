import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, X, Music, ChevronDown, SkipBack, SkipForward, ListMusic } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useUIStore } from '../../stores/useUIStore';

function formatTime(secs: number): string {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GlobalAudioPlayer() {
    const { isImmersive } = useUIStore();
    const location = useLocation();
    const isStudyRoute = location.pathname === '/app/study';
    const isMessagesRoute = location.pathname.startsWith('/app/messages');
    const useCompactMiniPlayer = isImmersive || isStudyRoute || isMessagesRoute;
    const {
        currentTrack, isPlaying, volume,
        currentTime, duration, isExpanded,
        queue, queueIndex,
        pauseTrack, resumeTrack, stopTrack,
        setCurrentTime, setDuration, toggleExpanded, setExpanded,
        playNext, playPrevious, setQueue,
    } = useAudioStore();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Reload audio and play when the URL changes (new track selected)
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;
        audioRef.current.load();
        if (isPlaying) {
            audioRef.current.play().catch(err => console.error('Audio play error:', err));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack?.audioUrl]);

    // Toggle play / pause
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;
        if (isPlaying) {
            audioRef.current.play().catch(err => console.error('Audio play error:', err));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

    // Volume sync
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = parseFloat(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrentTime(t);
    };

    const handleSkip = (secs: number) => {
        if (!audioRef.current) return;
        const t = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
        audioRef.current.currentTime = t;
        setCurrentTime(t);
    };

    const handleEnded = () => {
        if (queue.length > 0 && queueIndex < queue.length - 1) {
            playNext();
        } else {
            stopTrack();
        }
    };

    if (!currentTrack) return null;

    return (
        <>
            {/* Single persistent audio element — lives outside both layouts so it survives expand/collapse */}
            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                onEnded={handleEnded}
                className="hidden"
            />

            {/* ── Expanded full-screen overlay ── */}
            {isExpanded && (
                <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-emerald-950 via-zinc-900 to-zinc-950 animate-in slide-in-from-bottom duration-300">

                    {/* Header bar */}
                    <div className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
                        <button
                            onClick={() => setExpanded(false)}
                            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Now Playing</span>
                        {queue.length > 1 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full">
                                <ListMusic className="w-3.5 h-3.5 text-white/50" />
                                <span className="text-xs text-white/50 font-semibold">{queue.length}</span>
                            </div>
                        )}
                        {queue.length <= 1 && <div className="w-10" />}
                    </div>

                    {/* Main player area */}
                    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4 overflow-hidden">

                        {/* Cover art */}
                        <div className={`w-60 h-60 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 mb-8 transition-all duration-700 ${isPlaying ? 'scale-100' : 'scale-90 opacity-80'}`}>
                            {currentTrack.thumbnail ? (
                                <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/10">
                                    <Music className="w-20 h-20 text-white/20" />
                                </div>
                            )}
                        </div>

                        {/* Track info */}
                        <div className="text-center mb-8 w-full px-4">
                            <h2 className="text-xl font-bold text-white truncate">{currentTrack.title}</h2>
                            <p className="text-sm text-emerald-400 font-semibold mt-1 truncate">{currentTrack.source}</p>
                        </div>

                        {/* Seek bar */}
                        <div className="w-full mb-2">
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                step={0.5}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #34d399 ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
                                }}
                            />
                        </div>
                        <div className="flex justify-between w-full mb-8 px-1">
                            <span className="text-xs text-white/40 tabular-nums">{formatTime(currentTime)}</span>
                            <span className="text-xs text-white/40 tabular-nums">{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-7">
                            <button
                                onClick={playPrevious}
                                disabled={!queue.length || queueIndex === 0}
                                className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-25"
                            >
                                <SkipBack className="w-6 h-6 fill-current" />
                            </button>

                            <button
                                onClick={() => handleSkip(-15)}
                                className="flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition-colors"
                            >
                                <SkipBack className="w-5 h-5" />
                                <span className="text-[10px] font-bold leading-none">15</span>
                            </button>

                            <button
                                onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
                                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying
                                    ? <Pause className="w-7 h-7 fill-zinc-900 text-zinc-900" />
                                    : <Play className="w-7 h-7 fill-zinc-900 text-zinc-900 translate-x-0.5" />
                                }
                            </button>

                            <button
                                onClick={() => handleSkip(15)}
                                className="flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition-colors"
                            >
                                <SkipForward className="w-5 h-5" />
                                <span className="text-[10px] font-bold leading-none">15</span>
                            </button>

                            <button
                                onClick={playNext}
                                disabled={!queue.length || queueIndex >= queue.length - 1}
                                className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-25"
                            >
                                <SkipForward className="w-6 h-6 fill-current" />
                            </button>
                        </div>
                    </div>

                    {/* Queue strip — visible when there are multiple tracks */}
                    {queue.length > 1 && (
                        <div className="shrink-0 border-t border-white/10 px-4 py-3 max-h-52 overflow-y-auto">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-2">Up Next</p>
                            {queue.map((track, i) => (
                                <button
                                    key={track.id}
                                    onClick={() => setQueue(queue, i)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-left transition-colors ${
                                        i === queueIndex
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                        {track.thumbnail
                                            ? <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><Music className="w-4 h-4 text-white/30" /></div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{track.title}</p>
                                        <p className="text-xs text-white/30 truncate">{track.source}</p>
                                    </div>
                                    {i === queueIndex && (
                                        <div className="flex gap-0.5 items-end h-4 shrink-0">
                                            {[0.6, 1, 0.8, 0.4].map((h, j) => (
                                                <div
                                                    key={j}
                                                    className={`w-0.5 bg-emerald-400 rounded-full ${isPlaying ? 'animate-bounce' : ''}`}
                                                    style={{ height: `${h * 100}%`, animationDuration: `${0.4 + j * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Collapsed mini-player bar ── */}
            {!isExpanded && !isStudyRoute && (
                useCompactMiniPlayer ? (
                    <div
                        className={`fixed z-[120] animate-in fade-in zoom-in-95 duration-300 transition-all ${
                            isStudyRoute
                                ? 'top-[calc(env(safe-area-inset-top)+7.75rem)] right-3 md:top-auto md:bottom-6 md:left-6 md:right-auto'
                                : isMessagesRoute
                                    ? 'top-20 right-3 md:top-auto md:bottom-6 md:right-6'
                                    : 'bottom-24 right-3 md:bottom-6 md:right-6'
                        }`}
                    >
                        <button
                            onClick={toggleExpanded}
                            className="w-11 h-11 rounded-full overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/30 dark:border-zinc-700 shadow-lg flex items-center justify-center"
                            title="Open player"
                        >
                            {currentTrack.thumbnail
                                ? <img src={currentTrack.thumbnail} alt="" className={`w-full h-full object-cover ${isPlaying ? 'scale-110 transition-transform duration-[6s] linear' : ''}`} />
                                : <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            }
                        </button>
                    </div>
                ) : (
                    <div
                        className={`fixed z-50 animate-in slide-in-from-bottom-10 duration-500 transition-all ${
                            isStudyRoute
                                ? 'bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:w-96'
                                : isMessagesRoute
                                    ? 'top-20 md:top-auto md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96'
                                    : 'bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96'
                        }`}
                    >
                        <div
                            onClick={toggleExpanded}
                            className="cursor-pointer relative overflow-hidden bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-white/20 dark:border-zinc-700 shadow-2xl rounded-3xl p-4 flex items-center gap-3"
                        >
                            {/* Progress strip */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-zinc-800">
                                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>

                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 shadow-inner">
                                {currentTrack.thumbnail
                                    ? <img src={currentTrack.thumbnail} alt="" className={`w-full h-full object-cover transition-transform duration-[8s] linear ${isPlaying ? 'scale-110' : ''}`} />
                                    : <div className="w-full h-full flex items-center justify-center text-slate-400"><Music className="w-5 h-5" /></div>
                                }
                            </div>

                            {/* Meta + equalizer */}
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate block">{currentTrack.source}</span>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{currentTrack.title}</h4>
                                <div className="flex gap-0.5 items-end h-2.5 mt-1">
                                    {[0.6, 1, 0.8, 0.4].map((h, j) => (
                                        <div
                                            key={j}
                                            className={`w-0.5 bg-emerald-500 rounded-full ${isPlaying ? 'animate-bounce' : ''}`}
                                            style={{ height: `${h * 100}%`, animationDuration: `${0.4 + j * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Inline controls — stop propagation so tapping them doesn't open expanded view */}
                            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                                </button>
                                <button
                                    onClick={stopTrack}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </>
    );
}
