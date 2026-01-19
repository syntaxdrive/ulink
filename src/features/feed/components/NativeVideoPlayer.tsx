
import { useEffect, useRef } from 'react';
import { useVideoStore } from '../../../stores/useVideoStore';

interface NativeVideoPlayerProps {
    src: string;
    id: string;
}

export default function NativeVideoPlayer({ src, id }: NativeVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { playingId, setPlayingId } = useVideoStore();

    // Handle Global Pause
    useEffect(() => {
        if (playingId && playingId !== id && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
    }, [playingId, id]);

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        if (videoRef.current && videoRef.current.paused) {
                            // Only autoplay if we're not manually paused? 
                            // For simplicity, autoplay when in view, but allow browser to block if needed.
                            videoRef.current.play().then(() => {
                                setPlayingId(id);
                            }).catch(() => {
                                // console.log('Autoplay prevented');
                            });
                        }
                    } else {
                        if (videoRef.current && !videoRef.current.paused) {
                            videoRef.current.pause();
                        }
                    }
                });
            },
            { threshold: [0, 0.5, 1] }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, [id, setPlayingId]);

    return (
        <video
            ref={videoRef}
            src={src}
            controls
            className="w-full max-h-[500px]"
            preload="metadata"
            playsInline
            onPlay={() => setPlayingId(id)}
        />
    );
}
