import { getYouTubeEmbedUrl } from '../utils/youtube';
import type { VideoEmbed as VideoEmbedType } from '../utils/videoEmbed';

interface VideoEmbedProps {
    embed: VideoEmbedType;
    className?: string;
}

export default function VideoEmbed({ embed, className = '' }: VideoEmbedProps) {
    if (embed.type === 'youtube') {
        return (
            <div className={`relative w-full pb-[56.25%] bg-slate-900 rounded-lg overflow-hidden ${className}`}>
                <iframe
                    src={getYouTubeEmbedUrl(embed.id)}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                />
            </div>
        );
    }

    return null;
}
