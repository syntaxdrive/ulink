
import { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import YouTube, { type YouTubeEvent } from 'react-youtube';
import type { VideoEmbed as VideoEmbedData } from '../utils/videoEmbed';
import { useVideoStore } from '../stores/useVideoStore';

interface VideoEmbedProps {
    id?: string;
    embed: VideoEmbedData;
    originalUrl?: string;
    variant?: 'feed' | 'full';
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    defaultMuted?: boolean;
}

export default function VideoEmbed({ id, embed, originalUrl, variant = 'feed', onPlay, onPause, onEnded, defaultMuted = true }: VideoEmbedProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [isMuted, setIsMuted] = useState(defaultMuted);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [player, setPlayer] = useState<any>(null); // YouTube Player instance

    // Handle mute/unmute for YouTube player
    // Handle mute/unmute for YouTube player
    useEffect(() => {
        if (!player) return;
        try {
            if (isMuted) {
                player.mute();
            } else {
                player.unMute();
            }
        } catch (error) {
            console.warn('YouTube player mute error:', error);
        }
    }, [isMuted, player]);

    // Global Video Store
    const { playingId, setPlayingId } = useVideoStore();

    // Handle Global Pause
    useEffect(() => {
        if (playingId && playingId !== id && hasStarted) {
            // Pause execution
            if (embed.platform === 'youtube' && player) {
                try { player.pauseVideo(); } catch (e) { console.warn('YouTube pause error:', e); }
            } else if (iframeRef.current) {
                if (embed.platform === 'vimeo') {
                    iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
                }
            }
            // For HTML5 video handled internally by this component (if extended later), or just logic state
        }
    }, [playingId, id, hasStarted, player, embed.platform]);

    // Intersection Observer for Auto-play/pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        if (!hasStarted) {
                            setHasStarted(true);
                        }

                        // Only auto-play if no other video is playing OR we are the one playing
                        // Actually, auto-play on scroll usually takes precedence (steals focus)
                        // But to avoid chaos, let's say if we auto-play, we become the playingId

                        if (id) {
                            // Resume playback
                            if (embed.platform === 'youtube' && player) {
                                try { player.playVideo(); setPlayingId(id); } catch (e) { console.warn('YouTube play error:', e); }
                            } else if (iframeRef.current) {
                                if (embed.platform === 'vimeo') {
                                    iframeRef.current.contentWindow?.postMessage('{"method":"play"}', '*');
                                    setPlayingId(id);
                                }
                            }
                        }

                    } else if (hasStarted) {
                        // Pause when scrolled out
                        if (embed.platform === 'youtube' && player) {
                            try { player.pauseVideo(); } catch (e) { console.warn('YouTube pause error:', e); }
                        } else if (iframeRef.current) {
                            if (embed.platform === 'vimeo') {
                                iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
                            }
                        }
                        // If we were the playing ID, maybe clear it? 
                        // Actually better to just leave it until someone else claims it.
                    }
                });
            },
            {
                threshold: [0, 0.25, 0.5, 1],
                rootMargin: '0px'
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [hasStarted, embed.platform, player, id, setPlayingId]);

    useEffect(() => {
        if (!hasStarted || !iframeRef.current) return;

        if (embed.platform === 'vimeo') {
            iframeRef.current.contentWindow?.postMessage(`{ "method": "setVolume", "value":${isMuted ? 0 : 1} } `, '*');
        }
    }, [isMuted, hasStarted, embed.platform]);

    const getPlatformName = () => {
        switch (embed.platform) {
            case 'youtube': return 'YouTube';
            case 'tiktok': return 'TikTok';
            case 'instagram': return 'Instagram';
            case 'vimeo': return 'Vimeo';
            case 'twitter': return 'Twitter/X';
            default: return 'Video';
        }
    };

    const getPlatformColor = () => {
        switch (embed.platform) {
            case 'youtube': return 'from-red-500 to-red-600';
            case 'tiktok': return 'from-black to-gray-900';
            case 'instagram': return 'from-purple-500 to-pink-500';
            case 'vimeo': return 'from-blue-500 to-blue-600';
            case 'twitter': return 'from-blue-400 to-blue-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    // Build embed URL (only called once when video starts)
    const getEmbedUrl = () => {
        let url = embed.embedUrl;

        if (embed.platform === 'youtube') {
            // Loop video to prevent "More Videos" popup
            // Note: loop=1 requires playlist parameter with the same video ID
            // modestbranding=1 removes YouTube logo, iv_load_policy=3 disables annotations
            url += `?autoplay=1&enablejsapi=1&loop=1&playlist=${embed.videoId}&rel=0&controls=${variant === 'full' ? 0 : 1}&modestbranding=1&iv_load_policy=3&fs=0&cc_load_policy=0&disablekb=1`;
        } else if (embed.platform === 'vimeo') {
            // Remove Vimeo branding and controls
            url += `?autoplay=1&muted=1&api=1&title=0&byline=0&portrait=0&badge=0`;
        } else if (embed.platform === 'tiktok') {
            // TikTok embed with minimal branding
            url += `?autoplay=1`;
        } else if (embed.platform === 'instagram') {
            // Instagram embed - captionless removes some UI elements
            url += `/captionless/?autoplay=1`;
        }

        return url;
    };

    // Show thumbnail before video starts
    if (!hasStarted && embed.thumbnailUrl) {
        return (
            <div
                ref={containerRef}
                className={variant === 'full'
                    ? "relative w-full h-full group cursor-pointer bg-black"
                    : "relative rounded-xl overflow-hidden group cursor-pointer"}
                onClick={() => setHasStarted(true)}
            >
                <img
                    src={embed.thumbnailUrl}
                    alt={`${getPlatformName()} video`}
                    className={variant === 'full'
                        ? "w-full h-full object-contain"
                        : (embed.isVertical ? "w-full aspect-[9/16] object-cover" : "w-full aspect-video object-cover")}
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img && img.src && img.src.includes('maxresdefault')) {
                            img.src = `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`;
                        }
                    }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getPlatformColor()} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
                    {getPlatformName()}
                </div>
            </div>
        );
    }

    // Show embedded player (loaded once, controlled via postMessage API)
    return (
        <div ref={containerRef} className={variant === 'full'
            ? "relative w-full h-full bg-black"
            : (embed.isVertical ? "relative rounded-xl overflow-hidden bg-black max-w-sm mx-auto" : "relative rounded-xl overflow-hidden bg-black")}>
            <div className={variant === 'full' ? "w-full h-full relative" : (embed.isVertical ? "w-full aspect-[9/16] relative" : "w-full aspect-video relative")}>
                {embed.platform === 'twitter' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <a
                            href={originalUrl || embed.embedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ExternalLink className="w-8 h-8" />
                            <span className="text-sm font-medium">View on Twitter/X</span>
                        </a>
                    </div>
                ) : embed.platform === 'youtube' ? (
                    <YouTube
                        videoId={embed.videoId}
                        className="w-full h-full"
                        iframeClassName="w-full h-full"
                        onReady={(event: YouTubeEvent) => {
                            setPlayer(event.target);
                            // Always start muted for autoplay compliance
                            event.target.mute();
                        }}
                        onPlay={(event: YouTubeEvent) => {
                            // Unmute after playback starts if defaultMuted is false
                            if (!defaultMuted) {
                                try {
                                    event.target.unMute();
                                } catch (e) {
                                    console.warn('YouTube unmute error:', e);
                                }
                            }
                            if (onPlay) onPlay();
                        }}
                        onPause={onPause}
                        onEnd={onEnded}
                        opts={{
                            height: '100%',
                            width: '100%',
                            playerVars: {
                                autoplay: 1,
                                mute: 1, // Always start muted for autoplay
                                controls: variant === 'full' ? 0 : 1,
                                modestbranding: 1, // Remove YouTube logo
                                rel: 0, // Don't show related videos
                                loop: 1,
                                playlist: embed.videoId,
                                iv_load_policy: 3, // Disable annotations
                                fs: 0, // Disable fullscreen button
                                cc_load_policy: 0, // Disable captions by default
                                disablekb: 1, // Disable keyboard controls
                                origin: window.location.origin,
                            },
                        }}
                    />
                ) : (
                    <>
                        <iframe
                            ref={iframeRef}
                            src={getEmbedUrl()}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${getPlatformName()} video`}
                        />

                        {/* Mute/Unmute Button */}
                        {(embed.platform === 'vimeo') && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="absolute bottom-3 left-3 p-2 bg-black/70 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors z-10"
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        )}
                    </>
                )}
            </div>
            {originalUrl && (
                <div className="absolute top-3 right-3">
                    <a
                        href={originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium hover:bg-black/90 transition-colors flex items-center gap-1"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Open
                    </a>
                </div>
            )}
        </div>
    );
}
