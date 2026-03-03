import { useRef, useEffect, useState } from 'react';
import { Play, Pause, X, Music } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';

export default function GlobalAudioPlayer() {
    const { currentTrack, isPlaying, volume, pauseTrack, resumeTrack, stopTrack } = useAudioStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            audioRef.current.play().catch(err => console.error('Audio play error:', err));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        }
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="relative overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-zinc-800 shadow-2xl rounded-3xl p-4 flex items-center gap-4 group">
                {/* Progress Bar Background */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-zinc-800">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 shadow-inner">
                    {currentTrack.thumbnail ? (
                        <img
                            src={currentTrack.thumbnail}
                            alt=""
                            className={`w-full h-full object-cover transition-transform duration-[10s] linear rotate-0 ${isPlaying ? 'scale-110' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Music className="w-6 h-6" />
                        </div>
                    )}
                </div>

                {/* Meta & Controls */}
                <div className="flex-1 min-w-0 pr-8">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate mb-0.5">
                            {currentTrack.source}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate pr-4">
                            {currentTrack.title}
                        </h4>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
                            className="w-8 h-8 flex items-center justify-center bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                        </button>

                        <div className="flex-1 flex gap-0.5 items-end h-3 group-hover:opacity-100 transition-opacity">
                            <div className={`w-1 bg-emerald-500/50 ${isPlaying ? 'animate-bounce' : ''}`} style={{ height: isPlaying ? '60%' : '20%', animationDuration: '0.4s' }} />
                            <div className={`w-1 bg-emerald-500/60 ${isPlaying ? 'animate-bounce' : ''}`} style={{ height: isPlaying ? '100%' : '30%', animationDuration: '0.7s' }} />
                            <div className={`w-1 bg-emerald-500/50 ${isPlaying ? 'animate-bounce' : ''}`} style={{ height: isPlaying ? '80%' : '25%', animationDuration: '0.5s' }} />
                            <div className={`w-1 bg-emerald-500/40 ${isPlaying ? 'animate-bounce' : ''}`} style={{ height: isPlaying ? '40%' : '15%', animationDuration: '0.9s' }} />
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={stopTrack}
                    className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <audio
                    ref={audioRef}
                    src={currentTrack.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={stopTrack}
                    className="hidden"
                />
            </div>
        </div>
    );
}
