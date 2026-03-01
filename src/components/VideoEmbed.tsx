import { getYouTubeEmbedUrl } from '../utils/youtube';
import type { VideoEmbed as VideoEmbedType } from '../utils/videoEmbed';

interface VideoEmbedProps {
    id?: string;
    embed: VideoEmbedType;
    originalUrl?: string;
    defaultMuted?: boolean;
    className?: string;
}

export default function VideoEmbed({ id, embed, className = '' }: VideoEmbedProps) {
    if (embed.type === 'youtube') {
        return (
            <div
                id={id}
                className={`relative w-full pb-[56.25%] bg-zinc-950 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-zinc-800/50 shadow-lg ${className}`}
            >
                <iframe
                    src={`${getYouTubeEmbedUrl(embed.id, false)}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                />
            </div>
        );
    }

    return null;
}
