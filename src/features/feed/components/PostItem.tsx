import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send, Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Trash2, Flag, Repeat, X, ChevronLeft, ChevronRight, Globe, UserPlus, ExternalLink } from 'lucide-react';
import type { Post, Comment } from '../../../types';
import VideoEmbed from '../../../components/VideoEmbed';
import { detectVideoEmbed, removeVideoLink } from '../../../utils/videoEmbed';
import RepostModal from './RepostModal';
import NativeVideoPlayer from './NativeVideoPlayer';
import { useCommunityMembership } from '../../communities/hooks/useCommunityMembership';
import { supabase } from '../../../lib/supabase';

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

interface PostItemProps {
    post: Post;
    currentUserId: string | null;
    isActiveCommentSection: boolean;
    isActiveMenu: boolean;
    comments: Comment[];
    loadingComments: boolean;
    onDelete: (id: string) => void;
    onLike: (post: Post) => void;
    onRepost: (post: Post, comment?: string) => void;
    onToggleComments: (id: string) => void;
    onToggleMenu: (id: string) => void;
    onPostComment: (id: string, content: string) => Promise<void>;
    onSearchTag: (tag: string) => void;
    onReport: (id: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
    onVotePoll?: (postId: string, optionIndex: number) => Promise<void>;
    isInCommunityFeed?: boolean;
}

export default function PostItem({
    post,
    currentUserId,
    isActiveCommentSection,
    isActiveMenu,
    comments,
    loadingComments,
    onDelete,
    onLike,
    onRepost,
    onToggleComments,
    onToggleMenu,
    onPostComment,
    onSearchTag,
    onReport,
    onDeleteComment,
    onVotePoll,
    isInCommunityFeed = false,
}: PostItemProps) {
    const [commentText, setCommentText] = useState('');
    const [showRepostModal, setShowRepostModal] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [sharedToFeed, setSharedToFeed] = useState<boolean>(post.shared_to_feed || false);
    const [sharingToFeed, setSharingToFeed] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
    const particleRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleLikeWithAnim = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Trigger heart bounce
        setLikeAnim(false);
        requestAnimationFrame(() => requestAnimationFrame(() => setLikeAnim(true)));
        // Trigger particle burst only when liking (not unliking)
        if (!post.user_has_liked) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const newParticles = Array.from({ length: 6 }, (_, i) => ({
                id: ++particleRef.current * 10 + i,
                x: Math.random() * 40 - 20,
                y: Math.random() * -40 - 10,
            }));
            setParticles(newParticles);
            setTimeout(() => setParticles([]), 700);
        }
        onLike(post);
    };

    const handleShareToFeed = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (sharingToFeed || sharedToFeed) return;
        setSharingToFeed(true);
        const { error } = await supabase
            .from('posts')
            .update({ shared_to_feed: true })
            .eq('id', post.id);
        if (!error) setSharedToFeed(true);
        setSharingToFeed(false);
    };

    const handleUnshare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Remove this post from the main feed?')) return;
        const { error } = await supabase
            .from('posts')
            .update({ shared_to_feed: false })
            .eq('id', post.id);
        if (!error) setSharedToFeed(false);
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMember, setIsMember] = useState(false);

    const { joinCommunity, joiningCommunity } = useCommunityMembership();

    // Detect video embed in post content
    const videoEmbed = useMemo(() => detectVideoEmbed(post.content || ''), [post.content]);
    const contentWithoutVideoLink = useMemo(() => {
        if (videoEmbed) {
            return removeVideoLink(post.content || '', videoEmbed);
        }
        return post.content || '';
    }, [post.content, videoEmbed]);

    // Detect video embed in original post (for reposts)
    const originalVideoEmbed = useMemo(() => {
        if (!post.original_post) return null;
        return detectVideoEmbed(post.original_post.content || '');
    }, [post.original_post]);

    const originalContentWithoutLink = useMemo(() => {
        if (!post.original_post) return '';
        const content = post.original_post.content || '';
        if (originalVideoEmbed) {
            return removeVideoLink(content, originalVideoEmbed);
        }
        return content;
    }, [post.original_post, originalVideoEmbed]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this post?')) {
            onDelete(post.id);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            await onPostComment(post.id, commentText);
            setCommentText('');
        } catch (error) {
            console.error(error);
            alert('Failed to post comment');
        }
    };

    const handleJoinCommunity = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!post.community?.id) return;

        const success = await joinCommunity(post.community.id);
        if (success) {
            setIsMember(true);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/app/post/${post.id}`);
        alert('Link copied to clipboard!');
    };

    // Truncation Logic
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 280; // Twitter-style length
    const shouldTruncate = contentWithoutVideoLink.length > MAX_LENGTH;

    const contentToRender = isExpanded || !shouldTruncate
        ? contentWithoutVideoLink
        : contentWithoutVideoLink.slice(0, MAX_LENGTH) + '...';

    const renderContent = (text: string) => {
        // Enhanced regex to detect URLs, hashtags, and mentions
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const hashtagMentionRegex = /([#@][a-z0-9_]+)/gi;

        // First split by URLs
        const parts = text.split(urlRegex);

        return parts.map((part, i) => {
            // Check if it's a URL
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-500 font-medium hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }

            // Split by hashtags and mentions
            return part.split(hashtagMentionRegex).map((subPart, j) => {
                if (subPart.match(/^#[a-z0-9_]+$/i)) {
                    return (
                        <span
                            key={`${i}-${j}`}
                            className="text-emerald-600 dark:text-emerald-500 font-bold cursor-pointer hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSearchTag(subPart);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            {subPart}
                        </span>
                    );
                }
                if (subPart.match(/^@[a-z0-9_]+$/i)) {
                    const username = subPart.substring(1);
                    return (
                        <Link
                            key={`${i}-${j}`}
                            to={`/app/profile/${username}`}
                            className="text-blue-600 dark:text-blue-500 font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {subPart}
                        </Link>
                    );
                }
                return <span key={`${i}-${j}`}>{subPart}</span>;
            });
        });
    };

    const isHot = (post.likes_count || 0) >= 10;
    const isViral = (post.likes_count || 0) >= 25;

    return (
        <article
            className={`bg-white dark:bg-zinc-900 border transition-all duration-300 rounded-2xl overflow-hidden ${isViral
                    ? 'border-orange-300/60 dark:border-orange-500/30 shadow-md shadow-orange-100/50 dark:shadow-orange-500/5'
                    : isHot
                        ? 'border-emerald-200/60 dark:border-emerald-700/30'
                        : 'border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transition: 'opacity 0.35s ease, transform 0.35s ease, border-color 0.2s' }}
        >
            {/* Hot / Viral badge */}
            {(isHot || isViral) && (
                <div className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold ${isViral
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 text-orange-600 dark:text-orange-400'
                        : 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                    }`}>
                    <span>{isViral ? '🔥' : '⚡'}</span>
                    <span>{isViral ? 'Trending on campus' : 'Popular post'}</span>
                </div>
            )}

            {/* Repost Banner */}
            {post.is_repost && post.profiles && (
                <div className="flex items-center gap-2 px-4 pt-4 pb-2 text-sm text-stone-500 dark:text-zinc-500">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                    <Link
                        to={`/app/profile/${post.profiles?.username || post.author_id}`}
                        className="font-semibold text-stone-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                    >
                        {post.profiles.name}
                    </Link>
                    <span>reposted</span>
                </div>
            )}

            {/* Community Banner — only on main feed when shared to feed */}
            {post.community && !isInCommunityFeed && (
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-stone-100 dark:border-zinc-800">
                    <Link
                        to={`/app/communities/${post.community.slug}`}
                        className="flex items-center gap-2 group"
                    >
                        {post.community.icon_url ? (
                            <img
                                src={post.community.icon_url}
                                alt={post.community.name}
                                className="w-6 h-6 rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-stone-400 dark:text-zinc-500 leading-none">
                                {sharedToFeed || post.shared_to_feed ? 'Shared from' : 'Posted in'}
                            </p>
                            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                {post.community.name}
                            </p>
                        </div>
                    </Link>

                    {!isMember && currentUserId && !sharedToFeed && !post.shared_to_feed && (
                        <button
                            onClick={handleJoinCommunity}
                            disabled={joiningCommunity === post.community.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {joiningCommunity === post.community.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <UserPlus className="w-3.5 h-3.5" />
                            )}
                            Join
                        </button>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start px-4 pt-3 pb-2">
                <Link to={`/app/profile/${post.profiles?.username || post.author_id}`} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 ${post.profiles?.role === 'org' ? 'rounded-lg' : 'rounded-full'} overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-700`}>
                        <img
                            loading="lazy"
                            src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}&background=${post.profiles?.role === 'org' ? 'f97316' : 'random'}`}
                            alt={post.profiles?.name}
                            className={`w-full h-full ${post.profiles?.role === 'org' ? 'object-contain p-1.5' : 'object-cover'} transition-transform duration-300 group-hover:scale-105`}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px] text-stone-900 dark:text-zinc-100 leading-tight flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                            {post.profiles?.name}
                            {post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />}
                            {post.profiles?.is_verified && !post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 dark:fill-blue-950" />}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-zinc-500 leading-tight mt-0.5">
                            {post.profiles?.headline || (post.profiles?.role === 'org' ? 'Organization' : post.profiles?.university)}
                            {' • '}
                            <span className="text-stone-400 dark:text-zinc-600">{formatTimeAgo(post.created_at)}</span>
                        </p>
                    </div>
                </Link>
                <div className="relative">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleMenu(post.id); }}
                        className="text-stone-400 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400 transition-colors p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isActiveMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-stone-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            {currentUserId === post.author_id ? (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Post
                                    </button>
                                    {post.community && (sharedToFeed || post.shared_to_feed) && (
                                        <button
                                            onClick={(e) => { onToggleMenu(post.id); handleUnshare(e); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-medium transition-colors flex items-center gap-2.5"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Unshare from feed
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyLink(); onToggleMenu(post.id); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Copy Link
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyLink(); onToggleMenu(post.id); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Report this post for inappropriate content?')) {
                                                onReport(post.id);
                                            }
                                            onToggleMenu(post.id);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Flag className="w-4 h-4" />
                                        Report Post
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content with Hashtags and Read More */}
            <div className="px-4 py-2 text-stone-900 dark:text-zinc-100 leading-[1.5] text-[15px] whitespace-pre-wrap break-words">
                {renderContent(contentToRender)}
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-stone-500 dark:text-zinc-500 text-sm font-medium hover:text-stone-700 dark:hover:text-zinc-300 ml-1"
                    >
                        {isExpanded ? 'less' : 'more'}
                    </button>
                )}
            </div>

            {/* Original Post (for reposts) */}
            {post.is_repost && post.original_post && (
                <div className="mb-4 border-2 border-stone-200 rounded-2xl p-4 bg-stone-50/50">
                    <Link to={`/app/profile/${post.original_post.profiles?.username || post.original_post.author_id}`} className="flex items-center gap-3 mb-3">
                        <img
                            loading="lazy"
                            src={post.original_post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.original_post.profiles?.name || 'User')}`}
                            alt={post.original_post.profiles?.name}
                            className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900">{post.original_post.profiles?.name}</span>
                                {post.original_post.profiles?.is_verified && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />
                                )}
                            </div>
                            <span className="text-xs text-stone-500">{formatTimeAgo(post.original_post.created_at)}</span>
                        </div>
                    </Link>
                    <p className="text-stone-700 text-sm leading-relaxed mb-3">{originalContentWithoutLink}</p>

                    {/* Original Post Video Embed */}
                    {originalVideoEmbed && (
                        <div className="mb-3">
                            <VideoEmbed
                                id={`${post.original_post.id}-original-embed`}
                                embed={originalVideoEmbed}
                                originalUrl={(post.original_post.content || '').match(/https?:\/\/[^\s]+/)?.[0]}
                                defaultMuted={true} // Mute inner videos by default
                            />
                        </div>
                    )}

                    {/* Original Post Native Video */}
                    {post.original_post.video_url && (
                        <div className="mb-3 rounded-xl overflow-hidden bg-black">
                            <NativeVideoPlayer
                                src={post.original_post.video_url}
                                id={`${post.original_post.id}-original-video`}
                            />
                        </div>
                    )}

                    {post.original_post.image_url && (
                        <img
                            loading="lazy"
                            src={post.original_post.image_url}
                            alt="Original post"
                            className="rounded-xl w-full object-cover max-h-80"
                        />
                    )}
                </div>
            )}

            {/* Embedded Video from Link */}
            {videoEmbed && (
                <div className="-mx-0 my-3">
                    <VideoEmbed
                        id={`${post.id}-embed`}
                        embed={videoEmbed}
                        originalUrl={(post.content || '').match(/https?:\/\/[^\s]+/)?.[0]}
                        defaultMuted={false}
                    />
                </div>
            )}

            {/* Polls */}
            {post.poll_options && post.poll_options.length > 0 && (
                <div className="px-4 pb-3 space-y-2">
                    {post.poll_options.map((option, index) => {
                        const counts = post.poll_counts || [];
                        const count = counts[index] || 0;
                        const totalVotes = counts.reduce((a, b) => a + b, 0);
                        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isSelected = post.user_vote === index;

                        return (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onVotePoll) onVotePoll(post.id, index);
                                }}
                                className={`w-full relative overflow-hidden rounded-xl border transition-all ${isSelected
                                    ? 'border-emerald-500 bg-emerald-50/30'
                                    : 'border-stone-200 bg-white hover:bg-stone-50'
                                    }`}
                            >
                                <div
                                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${isSelected ? 'bg-emerald-100' : 'bg-stone-100'
                                        }`}
                                    style={{ width: `${percent}%`, opacity: 0.5 }}
                                />
                                <div className="relative px-4 py-3 flex justify-between items-center z-10">
                                    <div className="flex items-center gap-2">
                                        {isSelected && <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                                        <span className={`font-medium ${isSelected ? 'text-emerald-900' : 'text-stone-700'}`}>
                                            {option}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-emerald-700' : 'text-stone-500'}`}>
                                        {percent}%
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                    <p className="text-xs text-stone-400 pl-1">
                        {(post.poll_counts || []).reduce((a, b) => a + b, 0)} votes
                    </p>
                </div>
            )}

            {/* Post Images */}
            {(() => {
                const images = post.image_urls?.length ? post.image_urls : (post.image_url ? [post.image_url] : []);
                if (images.length === 0) return null;

                return (
                    <div className={`border-y border-stone-200/80 dark:border-zinc-800 my-3 bg-black grid gap-px ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {images.map((url, i) => (
                            <div
                                key={i}
                                className={`relative overflow-hidden cursor-pointer active:opacity-90 transition-opacity ${images.length === 3 && i === 0 ? 'col-span-2' : ''}`}
                                onClick={() => {
                                    setFullscreenImage(url);
                                    setCurrentImageIndex(i);
                                }}
                            >
                                <img
                                    loading="lazy"
                                    src={url}
                                    alt="Post content"
                                    className={`w-full object-cover bg-stone-900 ${images.length > 1 ? 'h-64 md:h-80' : 'max-h-[600px]'}`}
                                />
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* Post Video */}
            {post.video_url && (
                <div className="border-y border-stone-200/80 dark:border-zinc-800 my-3 bg-black">
                    <NativeVideoPlayer
                        src={post.video_url}
                        id={`${post.id}-video`}
                    />
                </div>
            )}


            {/* Actions */}
            <div className="flex items-center gap-1 px-4 py-2">
                {/* Like Button with animation */}
                <button
                    onClick={handleLikeWithAnim}
                    className="flex items-center gap-1.5 group transition-colors p-2 -ml-2 relative"
                >
                    {/* Particle burst */}
                    {particles.map(p => (
                        <span
                            key={p.id}
                            className="absolute w-1.5 h-1.5 rounded-full bg-red-400 pointer-events-none"
                            style={{
                                left: '50%', top: '50%',
                                animation: 'particleBurst 0.6s ease-out forwards',
                                '--tx': `${p.x}px`,
                                '--ty': `${p.y}px`,
                            } as React.CSSProperties}
                        />
                    ))}
                    <Heart
                        className={`w-6 h-6 transition-all ${likeAnim ? 'scale-125' : 'scale-100'
                            } ${post.user_has_liked
                                ? 'fill-red-500 text-red-500'
                                : 'text-stone-900 dark:text-zinc-100 hover:text-red-400'
                            }`}
                        style={{ transition: likeAnim ? 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1)' : 'transform 0.2s ease' }}
                    />
                    {(post.likes_count || 0) > 0 && (
                        <span className={`text-sm font-medium tabular-nums ${post.user_has_liked ? 'text-red-500' : 'text-stone-600 dark:text-zinc-400'
                            }`}>
                            {post.likes_count}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => onToggleComments(post.id)}
                    className="flex items-center gap-1.5 group transition-colors p-2 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
                >
                    <MessageCircle className="w-6 h-6 transition-all group-hover:scale-110" />
                    {(post.comments_count || 0) > 0 ? (
                        <span className="text-sm font-medium text-stone-600 dark:text-zinc-400">
                            {post.comments_count}
                        </span>
                    ) : (
                        <span className="text-xs text-stone-400 dark:text-zinc-600 hidden group-hover:inline transition-all">
                            Reply
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setShowRepostModal(true)}
                    className="flex items-center gap-1.5 group transition-colors p-2"
                >
                    <Repeat className={`w-6 h-6 transition-all active:scale-90 ${post.user_has_reposted ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-900 dark:text-zinc-100 hover:text-stone-600 dark:hover:text-zinc-400'}`} />
                    {(post.reposts_count || 0) > 0 && (
                        <span className={`text-sm font-medium ${post.user_has_reposted ? 'text-emerald-600 dark:text-emerald-500' : 'text-stone-600 dark:text-zinc-400'}`}>
                            {post.reposts_count}
                        </span>
                    )}
                </button>

                <button
                    onClick={copyLink}
                    className="flex items-center group transition-colors p-2 ml-auto text-stone-900 dark:text-zinc-100 hover:text-stone-600 dark:hover:text-zinc-400"
                >
                    <Share2 className="w-[22px] h-[22px] transition-all active:scale-90" />
                </button>

                {/* Share to Feed — only for community posts authored by current user */}
                {post.community && post.author_id === currentUserId && (
                    <button
                        onClick={handleShareToFeed}
                        disabled={sharingToFeed || sharedToFeed}
                        title={sharedToFeed ? 'Already shared to main feed' : 'Share this post to the main feed'}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sharedToFeed
                                ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 cursor-default'
                                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        {sharingToFeed ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        {sharedToFeed ? 'Shared to feed' : 'Share to feed'}
                    </button>
                )}
            </div>

            {/* Comments Section — inline on desktop */}
            {isActiveCommentSection && (
                <div className="hidden md:block mt-4 pt-4 border-t border-dashed border-stone-100 dark:border-zinc-800 px-4 pb-4 animate-in slide-in-from-top-2">
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {loadingComments ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-stone-300" /></div>
                        ) : (
                            comments.length === 0 ? (
                                <p className="text-center text-xs text-stone-400 py-2">No comments yet. Be the first!</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3 text-sm group">
                                        <img src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=random`} className="w-8 h-8 rounded-full bg-stone-100 mt-0.5 flex-shrink-0" />
                                        <div className="bg-stone-50 dark:bg-zinc-800 rounded-2xl rounded-tl-sm p-3 px-4 flex-1 relative group-hover:bg-stone-100 dark:group-hover:bg-zinc-700 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <Link to={`/app/profile/${comment.profiles?.username || comment.author_id}`} className="font-bold text-stone-900 dark:text-zinc-100 text-xs mb-1 hover:underline">
                                                    {comment.profiles?.name}
                                                </Link>
                                                {currentUserId === comment.author_id && (
                                                    <button onClick={() => { if (confirm('Delete this comment?')) onDeleteComment(post.id, comment.id); }} className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-stone-600 dark:text-zinc-400 leading-relaxed text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                    <div className="flex gap-3 items-center">
                        <input type="text" placeholder="Write a comment..." className="flex-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-all" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} />
                        <button onClick={handleCommentSubmit} disabled={!commentText.trim()} className="p-2.5 bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Comments Section — bottom drawer on mobile */}
            {isActiveCommentSection && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => onToggleComments(post.id)}
                    />
                    {/* Drawer */}
                    <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-300 shadow-2xl">
                        {/* Handle */}
                        <div className="flex flex-col items-center pt-3 pb-2 flex-shrink-0">
                            <div className="w-10 h-1 bg-stone-200 dark:bg-zinc-700 rounded-full mb-3" />
                            <div className="flex items-center justify-between w-full px-5 pb-2 border-b border-stone-100 dark:border-zinc-800">
                                <h3 className="font-bold text-base text-stone-900 dark:text-zinc-100">Comments</h3>
                                <button onClick={() => onToggleComments(post.id)} className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors">
                                    <X className="w-5 h-5 text-stone-500" />
                                </button>
                            </div>
                        </div>
                        {/* Comment list */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                            {loadingComments ? (
                                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-stone-300" /></div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                                    <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
                                    <p className="text-sm">No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3 text-sm group">
                                        <img src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=random`} className="w-9 h-9 rounded-full bg-stone-100 mt-0.5 flex-shrink-0" />
                                        <div className="bg-stone-50 dark:bg-zinc-800 rounded-2xl rounded-tl-sm p-3 px-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <Link to={`/app/profile/${comment.profiles?.username || comment.author_id}`} className="font-bold text-stone-900 dark:text-zinc-100 text-xs mb-1 hover:underline">
                                                    {comment.profiles?.name}
                                                </Link>
                                                {currentUserId === comment.author_id && (
                                                    <button onClick={() => { if (confirm('Delete this comment?')) onDeleteComment(post.id, comment.id); }} className="text-stone-400 hover:text-red-500 p-1">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Comment input */}
                        <div className="flex gap-3 items-center px-4 py-3 border-t border-stone-100 dark:border-zinc-800 flex-shrink-0 pb-safe">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="flex-1 bg-stone-100 dark:bg-zinc-800 border-0 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                autoFocus
                            />
                            <button
                                onClick={handleCommentSubmit}
                                disabled={!commentText.trim()}
                                className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-40 transition-colors flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Repost Modal */}
            <RepostModal
                post={post}
                isOpen={showRepostModal}
                onClose={() => setShowRepostModal(false)}
                onRepost={(post, comment) => {
                    onRepost(post, comment);
                }}
            />

            {/* Fullscreen Image Viewer */}
            {fullscreenImage && (() => {
                const images = post.image_urls?.length ? post.image_urls : (post.image_url ? [post.image_url] : []);
                const handlePrevious = () => {
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    setFullscreenImage(images[currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1]);
                };
                const handleNext = () => {
                    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    setFullscreenImage(images[currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0]);
                };

                return (
                    <div
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={() => setFullscreenImage(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setFullscreenImage(null)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Previous Button */}
                        {images.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Image */}
                        <img
                            src={fullscreenImage}
                            alt="Fullscreen view"
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Next Button */}
                        {images.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                );
            })()}
        </article>
    );
}
