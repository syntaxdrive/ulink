import { getYouTubeEmbedUrl } from '../utils/youtube';
import type { VideoEmbed as VideoEmbedType } from '../utils/videoEmbed';

interface VideoEmbedProps {
    id?: string;
    embed: VideoEmbedType;
    originalUrl?: string;
    defaultMuted?: boolean;
    className?: string;
}

export default function VideoEmbed({ id, embed, originalUrl, className = '' }: VideoEmbedProps) {
    if (embed.type === 'youtube') {
        const videoUrl = originalUrl || `https://www.youtube.com/watch?v=${embed.id}`;

        return (
            <div className={`space-y-3 ${className}`}>
                {/* Embedded Video Box */}
                <div
                    id={id}
                    className="relative w-full pb-[56.25%] bg-zinc-950 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-zinc-800/50 shadow-lg"
                >
                    <iframe
                        src={`${getYouTubeEmbedUrl(embed.id, true)}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&mute=1`}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; mute"
                        allowFullScreen
                        title="YouTube video"
                    />
                </div>

                {/* Source Link */}
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 dark:bg-zinc-900/50 rounded-xl border border-stone-200/50 dark:border-zinc-800/50 text-xs font-bold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" /></svg>
                    </div>
                    <span className="truncate flex-1">{videoUrl}</span>
                    <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        );
    }

    if (embed.type === 'instagram') {
        const instagramEmbedUrl = `https://www.instagram.com/p/${embed.id}/embed/captioned`;

        return (
            <div className={`space-y-3 ${className}`}>
                {/* Embedded Video Box */}
                <div
                    id={id}
                    className="relative w-full pb-[110%] bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-zinc-800/50 shadow-md"
                >
                    <iframe
                        src={instagramEmbedUrl}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allowTransparency
                        allowFullScreen
                        title="Instagram content"
                    />
                </div>

                {/* Source Link */}
                <a
                    href={embed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 dark:bg-zinc-900/50 rounded-xl border border-stone-200/50 dark:border-zinc-800/50 text-xs font-bold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FFB300] via-[#D81B60] to-[#E91E63] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </div>
                    <span className="truncate flex-1">{embed.url}</span>
                    <svg className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        );
    }

    return null;
}
