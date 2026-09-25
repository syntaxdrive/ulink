import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ExternalLink, MoreHorizontal } from 'lucide-react';
import type { SponsoredPost } from '../../../types/sponsored';
import { useSponsoredPosts } from '../../../hooks/useSponsoredPosts';

interface SponsoredPostItemProps {
    post: SponsoredPost;
}

export default function SponsoredPostItem({ post }: SponsoredPostItemProps) {
    const { trackImpression, trackClick } = useSponsoredPosts();

    useEffect(() => {
        trackImpression(post.id);
    }, [post.id]);

    const handleClick = () => {
        trackClick(post.id);
    };

    return (
        <article className="bg-white dark:bg-bg-cardDark border border-stone-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-4 hover:border-stone-300 dark:hover:border-zinc-700 transition-all shadow-sm">
            {/* Header */}
            <div className="p-4 flex items-start gap-3">
                <Link to={`/app/profile/${post.organization?.username || post.organization?.id}`} className="shrink-0 relative">
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden ring-2 ring-stone-100 dark:ring-zinc-800">
                        <img
                            src={post.organization?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.organization?.name || 'Org')}`}
                            alt={post.organization?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Link to={`/app/profile/${post.organization?.username || post.organization?.id}`} className="font-bold text-stone-900 dark:text-white hover:underline truncate">
                                {post.organization?.name}
                            </Link>
                            {post.organization?.gold_verified ? (
                                <BadgeCheck className="w-4 h-4 text-yellow-500 shrink-0" />
                            ) : post.organization?.is_verified ? (
                                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : null}

                            <span className="text-stone-400 dark:text-zinc-500 text-xs">•</span>
                            <span className="text-stone-500 dark:text-zinc-500 text-xs font-medium">Sponsored</span>
                        </div>

                        <button className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    {post.organization?.username && (
                        <p className="text-xs text-stone-500 dark:text-zinc-500">@{post.organization.username}</p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="whitespace-pre-wrap text-stone-800 dark:text-zinc-200 text-[15px] leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* Media */}
            {post.media_url && (
                <div className="w-full bg-black/5 dark:bg-black/20">
                    {post.media_type === 'video' ? (
                        <video
                            src={post.media_url}
                            controls
                            className="w-full max-h-[500px] object-contain"
                            poster={post.media_url.replace(/\.[^/.]+$/, "") + "_thumb.jpg"}
                        />
                    ) : (
                        <img
                            src={post.media_url}
                            alt="Ad content"
                            className="w-full max-h-[500px] object-cover"
                        />
                    )}
                </div>
            )}

            {/* CTA Footer */}
            <div className="p-3 bg-stone-50 dark:bg-zinc-800/50 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-zinc-500 uppercase font-semibold tracking-wider px-2">
                    Promoted
                </span>

                {post.cta_url && (
                    <a
                        href={post.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg text-sm font-semibold hover:bg-stone-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                        {post.cta_text || 'Learn More'}
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </article>
    );
}
