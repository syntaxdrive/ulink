import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Send, Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Trash2, Flag, Repeat, X, ChevronLeft, ChevronRight, Globe, UserPlus, ExternalLink, GraduationCap, Image as ImageIcon } from 'lucide-react';
import type { Post, Comment } from '../../../types';
import VideoEmbed from '../../../components/VideoEmbed';
import { detectVideoEmbed, removeVideoLink } from '../../../utils/videoEmbed';
import RepostModal from './RepostModal';
import NativeVideoPlayer from './NativeVideoPlayer';
import { useCommunityMembership } from '../../communities/hooks/useCommunityMembership';
import { supabase } from '../../../lib/supabase';
import { signInWithGoogle } from '../../../lib/auth-helpers';
import { nativeShare } from '../../../utils/shareUtils';
import { cloudinaryService, getOptimizedMediaUrl } from '../../../services/cloudinaryService';
import { getBaseUrl } from '../../../config';
import { checkClientRateLimit } from '../../../utils/rateLimit';

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
    onPostComment: (id: string, content: string | null, stickerUrl?: string, type?: 'text' | 'sticker' | 'image', parentId?: string) => Promise<void>;
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
    const navigate = useNavigate();
    const [commentText, setCommentText] = useState('');
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const [showRepostModal, setShowRepostModal] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [sharedToFeed, setSharedToFeed] = useState<boolean>(post.shared_to_feed || false);
    const [sharingToFeed, setSharingToFeed] = useState(false);
    const [likeAnim, setLikeAnim] = useState(false);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
    const particleRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);

    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; username: string } | null>(null);

    const [commentImage, setCommentImage] = useState<File | null>(null);
    const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);
    const commentImageInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingCommentImage, setIsUploadingCommentImage] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const ensureAuth = () => {
        if (!currentUserId) {
            if (confirm('Please sign in to interact with posts.')) {
                signInWithGoogle();
            }
            return false;
        }
        return true;
    };

    const handleLikeWithAnim = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!ensureAuth()) return;

        // Trigger heart bounce
        setLikeAnim(false);
        requestAnimationFrame(() => requestAnimationFrame(() => setLikeAnim(true)));
        // Trigger particle burst only when liking (not unliking)
        if (!post.user_has_liked) {
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
        if (!ensureAuth()) return;
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
        if (!ensureAuth()) return;
        if (!confirm('Remove this post from the main feed?')) return;
        const { error } = await supabase
            .from('posts')
            .update({ shared_to_feed: false })
            .eq('id', post.id);
        if (!error) setSharedToFeed(false);
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMember, setIsMember] = useState(false);
    const [membershipStatus, setMembershipStatus] = useState<'active' | 'pending' | null>(null);

    const { joinCommunity, joiningCommunity } = useCommunityMembership();

    const handleReply = (comment: Comment) => {
        const username = comment.profiles?.username || comment.author_id;
        const name = comment.profiles?.name || 'User';
        setReplyingTo({ id: comment.id, name, username });
        setCommentText((prev) => prev.startsWith(`@${username}`) ? prev : `@${username} ${prev}`);
        commentInputRef.current?.focus();
    };

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

    const handleCommentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setCommentImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCommentImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCommentSubmit = async () => {
        if (!ensureAuth()) return;
        if (!commentText.trim() && !commentImage) return;

        // Client-side rate limit check
        const rl = checkClientRateLimit('comment');
        if (!rl.allowed) {
            alert(rl.message);
            return;
        }

        try {
            let stickerUrl: string | undefined = undefined;
            let type: 'text' | 'sticker' | 'image' = 'text';

            if (commentImage) {
                setIsUploadingCommentImage(true);
                let imageUrl: string | null = null;

                // Attempt 1: Cloudinary (CDN-optimised delivery)
                if (cloudinaryService.isConfigured()) {
                    try {
                        const result = await cloudinaryService.uploadImage(commentImage, {
                            folder: 'ulink/comments',
                        });
                        imageUrl = result.secureUrl;
                    } catch (cloudErr) {
                        console.warn('[Comment image] Cloudinary failed, falling back to Supabase:', cloudErr);
                    }
                }

                // Attempt 2: Supabase fallback
                if (!imageUrl) {
                    const fileExt = commentImage.name.split('.').pop();
                    const fileName = `comments/${post.id}_${currentUserId}_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('post-images')
                        .upload(fileName, commentImage);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(fileName);
                    imageUrl = publicUrl;
                }

                stickerUrl = imageUrl ?? undefined;
                type = 'sticker';
            }

            await onPostComment(post.id, commentText || null, stickerUrl, type, replyingTo?.id);
            setCommentText('');
            setCommentImage(null);
            setCommentImagePreview(null);
            setReplyingTo(null);
            if (commentInputRef.current) {
                commentInputRef.current.style.height = 'auto';
            }
        } catch (error: any) {
            console.error(error);
            // Show the DB-level error message if available
            const msg = error?.message || 'Failed to post comment';
            if (msg.includes('Rate limit exceeded')) {
                alert(msg);
            } else {
                alert('Failed to post comment');
            }
        } finally {
            setIsUploadingCommentImage(false);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!ensureAuth()) return;
        if (confirm('Are you sure you want to delete this post?')) {
            onDelete(post.id);
        }
    };

    const handleJoinCommunity = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!ensureAuth()) return;

        if (!post.community?.id) return;

        const result = await joinCommunity(post.community.id);
        if (result && typeof result === 'object' && result.success) {
            setIsMember(result.status === 'active');
            setMembershipStatus(result.status as any);
            if (result.status === 'pending') {
                alert('Join request sent to community admins!');
            }
        }
    };

    const copyLink = () => {
        const url = `${getBaseUrl()}/app/post/${post.id}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    const getShareText = () => {
        const authorName = post.profiles?.name || 'A UniLink User';
        const communityName = post.community?.name || null;
        const hasMedia = (post.image_urls && post.image_urls.length > 0) || post.image_url || post.video_url;

        let title = `Post by ${authorName} on UniLink`;
        if (communityName) {
            title = `${authorName} in ${communityName} | UniLink`;
        }

        // Clean content for snippet
        const safeContent = post.content || '';
        const cleanContent = safeContent.replace(/\r?\n|\r/g, ' ').trim();

        let snippet = '';
        if (cleanContent) {
            snippet = cleanContent.length > 120 ? `${cleanContent.substring(0, 120)}...` : cleanContent;
            snippet = `"${snippet}"`;
        } else if (hasMedia) {
            snippet = "📸 (Shared a photo/video)";
        } else {
            snippet = "Check out this post on UniLink!";
        }

        const text = `${title}\n\n${snippet}\n\nRead more:`;
        return { title, text };
    };

    const handleShare = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const url = `${getBaseUrl()}/app/post/${post.id}`;
        const { title, text } = getShareText();
        const imageUrl = post.image_url || (post.image_urls && post.image_urls[0]) || undefined;

        const shared = await nativeShare(title, text, url, imageUrl);
        if (!shared) {
            copyLink();
        }
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
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors mx-0.5"
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
            className={`post-card bg-white dark:bg-bg-cardDark border transition-all duration-300 rounded-2xl overflow-hidden ${isViral
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
                    <Repeat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                    <Link to={`/app/profile/${post.profiles?.username || post.author_id}`} className="hover:underline">
                        <span className="font-bold text-stone-700 dark:text-zinc-300">{post.profiles.name}</span>
                        <span className="text-xs ml-1 text-stone-400 dark:text-zinc-500">@{post.profiles.username}</span>
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
                                src={getOptimizedMediaUrl(post.community.icon_url)}
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

                    {!isMember && membershipStatus !== 'pending' && currentUserId && !sharedToFeed && !post.shared_to_feed && (
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
                    {membershipStatus === 'pending' && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                            Requested
                        </span>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start px-4 pt-3 pb-2">
                <Link to={`/app/profile/${post.profiles?.username || post.author_id}`} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 ${post.profiles?.role === 'org' ? 'rounded-lg' : 'rounded-full'} overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-700`}>
                        <img
                            loading="lazy"
                            src={getOptimizedMediaUrl(post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.username || post.profiles?.name || 'User')}&size=128&background=${post.profiles?.role === 'org' ? 'f97316' : 'random'}`)}
                            alt={post.profiles?.username || post.profiles?.name}
                            className={`w-full h-full ${post.profiles?.role === 'org' ? 'object-contain p-1.5' : 'object-cover'} transition-transform duration-300 group-hover:scale-105`}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-[15px] text-stone-900 dark:text-zinc-100 leading-tight flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                            {post.profiles?.name}
                            {post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />}
                            {post.profiles?.is_verified && !post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 dark:fill-blue-950" />}
                            {post.profiles?.role !== 'org' && post.profiles?.expected_graduation_year && post.profiles?.expected_graduation_year <= new Date().getFullYear() && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none shadow-sm dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300">
                                    <GraduationCap className="w-3 h-3" />
                                    Alumni
                                </span>
                            )}
                        </h3>
                        <p className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 leading-none mt-1">
                            @{post.profiles?.username || post.author_id.slice(0, 8)}
                        </p>
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
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-bg-cardDark rounded-lg shadow-lg border border-stone-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                                        onClick={(e) => { onToggleMenu(post.id); handleShare(e); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share Post
                                    </button>
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
                                        onClick={(e) => { onToggleMenu(post.id); handleShare(e); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 font-medium transition-colors flex items-center gap-2.5"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share Post
                                    </button>
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
            <div
                className="px-4 py-2 cursor-pointer group/content"
                onClick={() => navigate(`/app/post/${post.id}`)}
            >
                <div className="text-stone-900 dark:text-zinc-100 leading-[1.5] text-[15px] whitespace-pre-wrap break-words">
                    {renderContent(contentToRender)}
                    {shouldTruncate && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-stone-500 dark:text-zinc-500 text-sm font-medium hover:text-stone-700 dark:hover:text-zinc-300 ml-1"
                        >
                            {isExpanded ? 'less' : 'more'}
                        </button>
                    )}
                </div>
            </div>

            {/* Original Post (for reposts) */}
            {post.is_repost && post.original_post && (
                <div
                    onClick={() => navigate(`/app/post/${post.original_post!.id}`)}
                    className="mx-4 mb-4 border-2 border-stone-200 dark:border-zinc-800 rounded-2xl p-4 bg-stone-50/50 dark:bg-zinc-900/30 cursor-pointer hover:border-emerald-500/50 transition-colors group/repost"
                >
                    <div
                        className="flex items-center gap-3 mb-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/profile/${post.original_post!.profiles?.username || post.original_post!.author_id}`);
                        }}
                    >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-700">
                            <img
                                loading="lazy"
                                src={getOptimizedMediaUrl(post.original_post!.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.original_post!.profiles?.username || post.original_post!.profiles?.name || 'User')}&background=random`)}
                                alt={post.original_post.profiles?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900 dark:text-zinc-100 text-[14px]">
                                    {post.original_post!.profiles?.name}
                                </span>
                                {post.original_post.profiles?.is_verified && (
                                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-current" />
                                )}
                            </div>
                            <span className="text-[11px] text-stone-400 dark:text-zinc-500 font-medium">
                                @{post.original_post!.profiles?.username}
                            </span>
                        </div>
                        <span className="text-xs text-stone-500 ml-auto self-start bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium">{formatTimeAgo(post.original_post.created_at)}</span>
                    </div>
                    <p className="text-stone-700 dark:text-zinc-300 text-sm leading-relaxed mb-3">{originalContentWithoutLink}</p>

                    {/* Original Post Images */}
                    {
                        (() => {
                            const originalImages = post.original_post.image_urls?.length
                                ? post.original_post.image_urls
                                : (post.original_post.image_url ? [post.original_post.image_url] : []);

                            if (originalImages.length === 0) return null;

                            return (
                                <div className={`grid gap-px mb-3 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-black ${originalImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {originalImages.map((url, i) => (
                                        <div
                                            key={i}
                                            className={`relative overflow-hidden cursor-pointer active:opacity-90 transition-opacity ${originalImages.length === 3 && i === 0 ? 'col-span-2' : ''}`}
                                            onClick={() => {
                                                setFullscreenImage(url);
                                                setCurrentImageIndex(i);
                                            }}
                                        >
                                            <img
                                                loading="lazy"
                                                src={getOptimizedMediaUrl(url)}
                                                alt="Original post content"
                                                className={`w-full object-cover bg-stone-900 ${originalImages.length > 1 ? 'h-40 md:h-52' : 'max-h-80'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()
                    }

                    {/* Original Post Video Embed */}
                    {
                        originalVideoEmbed && (
                            <div className="mb-3">
                                <VideoEmbed
                                    id={`${post.original_post.id}-original-embed`}
                                    embed={originalVideoEmbed}
                                    originalUrl={(post.original_post.content || '').match(/https?:\/\/[^\s]+/)?.[0]}
                                    defaultMuted={true}
                                />
                            </div>
                        )
                    }

                    {/* Original Post Native Video */}
                    {
                        post.original_post.video_url && (
                            <div className="mb-3 rounded-xl overflow-hidden bg-black">
                                <NativeVideoPlayer
                                    src={post.original_post.video_url}
                                    id={`${post.original_post.id}-original-video`}
                                />
                            </div>
                        )
                    }
                </div>
            )
            }

            {/* Embedded Video from Link */}
            {
                videoEmbed && (
                    <div className="-mx-0 my-3">
                        <VideoEmbed
                            id={`${post.id}-embed`}
                            embed={videoEmbed}
                            originalUrl={(post.content || '').match(/https?:\/\/[^\s]+/)?.[0]}
                            defaultMuted={false}
                        />
                    </div>
                )
            }

            {/* Polls */}
            {
                post.poll_options && post.poll_options.length > 0 && (
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
                                        if (!ensureAuth()) return;
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
                )
            }

            {/* Post Images */}
            {
                (() => {
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
                                        src={getOptimizedMediaUrl(url)}
                                        alt="Post content"
                                        className={`w-full object-cover bg-stone-900 ${images.length > 1 ? 'h-64 md:h-80' : 'max-h-[600px]'}`}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })()
            }

            {/* Post Video */}
            {
                post.video_url && (
                    <div className="border-y border-stone-200/80 dark:border-zinc-800 my-3 bg-black">
                        <NativeVideoPlayer
                            src={post.video_url}
                            id={`${post.id}-video`}
                        />
                    </div>
                )
            }


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

                {/* Comment Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleComments(post.id);
                    }}
                    className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group p-2"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 transition-all">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    {(post.comments_count || 0) > 0 && (
                        <span className="text-sm font-medium tabular-nums">{post.comments_count}</span>
                    )}
                </button>

                {/* Repost Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!ensureAuth()) return;
                        setShowRepostModal(true);
                    }}
                    className={`flex items-center gap-1.5 transition-colors group p-2 ${post.user_has_reposted
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                        }`}
                >
                    <div className={`p-1.5 rounded-full transition-all ${post.user_has_reposted
                        ? 'bg-emerald-50 dark:bg-emerald-950/20'
                        : 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20'
                        }`}>
                        <Repeat className="w-6 h-6" />
                    </div>
                    {(post.reposts_count || 0) > 0 && (
                        <span className="text-sm font-medium tabular-nums">{post.reposts_count}</span>
                    )}
                </button>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors group p-2"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 transition-all">
                        <Share2 className="w-6 h-6" />
                    </div>
                </button>

                {/* Share to Feed — only for community posts authored by current user */}
                {post.community && post.author_id === currentUserId && (
                    <button
                        onClick={handleShareToFeed}
                        disabled={sharingToFeed || sharedToFeed}
                        title={sharedToFeed ? 'Already shared to main feed' : 'Share this post to the main feed'}
                        className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sharedToFeed
                            ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 cursor-default'
                            : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        {sharingToFeed ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        {sharedToFeed ? 'Shared' : 'Share to feed'}
                    </button>
                )}
            </div>

            {/* Unified Responsive Comment Section (Inline but scrollable) */}
            {
                isActiveCommentSection && (
                    <div className="border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/60 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header Area */}
                        <div className="px-5 py-3 border-b border-stone-100 dark:border-zinc-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                                Comments
                                <span className="text-xs font-semibold text-stone-500 bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md border border-stone-200 dark:border-zinc-700">
                                    {post.comments_count || 0}
                                </span>
                            </h3>
                            <button
                                onClick={() => onToggleComments(post.id)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-all active:scale-95 hover:bg-stone-200 dark:hover:bg-zinc-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Comments List (Scrollable to prevent elongating) */}
                        <div className="max-h-[400px] overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar scroll-smooth">
                            {loadingComments ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                    <p className="text-xs font-bold text-stone-400 animate-pulse uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle className="w-6 h-6 text-emerald-500 opacity-50" />
                                    </div>
                                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">No comments yet</h4>
                                    <p className="text-xs text-stone-500 leading-relaxed">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map((comment, idx) => (
                                        <div
                                            key={comment.id}
                                            className={`flex gap-3 group animate-in slide-in-from-bottom-2 fade-in ${comment.parent_id ? 'ml-8 sm:ml-12' : ''}`}
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                        >
                                            <Link
                                                to={`/app/profile/${comment.profiles?.username || comment.author_id}`}
                                                className="shrink-0"
                                            >
                                                <div className={`w-8 h-8 ${comment.profiles?.role === 'org' ? 'rounded-lg' : 'rounded-full'} overflow-hidden ring-1 ring-stone-200 dark:ring-zinc-800 shadow-sm`}>
                                                    <img
                                                        src={getOptimizedMediaUrl(comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.username || comment.profiles?.name || 'User')}&background=random`)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                {comment.sticker_url && !comment.content ? (
                                                    <div className="relative inline-block group/sticker">
                                                        <img
                                                            src={getOptimizedMediaUrl(comment.sticker_url)}
                                                            alt="Sticker"
                                                            className="max-w-[140px] sm:max-w-[180px] h-auto rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFullscreenImage(comment.sticker_url!);
                                                            }}
                                                        />
                                                        {currentUserId === comment.author_id && (
                                                            <button
                                                                onClick={() => { if (confirm('Delete this sticker?')) onDeleteComment(post.id, comment.id); }}
                                                                className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 p-1.5 rounded-full opacity-0 group-hover/sticker:opacity-100 transition-opacity shadow-lg border border-stone-200 dark:border-zinc-700 hover:text-red-500"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-2xl rounded-tl-none p-3 shadow-sm group-hover:border-emerald-500/30 transition-colors">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="flex flex-col">
                                                                <Link
                                                                    to={`/app/profile/${comment.profiles?.username || comment.author_id}`}
                                                                    className="font-bold text-stone-900 dark:text-white text-xs hover:text-emerald-500 transition-colors flex items-center gap-1.5"
                                                                >
                                                                    {comment.profiles?.name}
                                                                    {comment.profiles?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                                                                </Link>
                                                                <span className="text-[10px] text-stone-400 dark:text-zinc-500">@{comment.profiles?.username}</span>
                                                            </div>
                                                            {currentUserId === comment.author_id && (
                                                                <button
                                                                    onClick={() => { if (confirm('Delete this comment?')) onDeleteComment(post.id, comment.id); }}
                                                                    className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ml-2"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {comment.content && (
                                                            <div className="text-stone-700 dark:text-stone-300 text-[13px] leading-relaxed whitespace-pre-wrap">
                                                                {renderContent(comment.content)}
                                                            </div>
                                                        )}

                                                        {comment.sticker_url && (
                                                            <div className="mt-2 flex justify-start">
                                                                <div className="max-w-[160px] sm:max-w-[200px] relative">
                                                                    <img
                                                                        src={getOptimizedMediaUrl(comment.sticker_url)}
                                                                        alt="Sticker"
                                                                        className="w-full h-auto rounded-lg shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFullscreenImage(comment.sticker_url!);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5 px-1">
                                                    <span className="text-[10px] font-medium text-stone-500">
                                                        {formatTimeAgo(comment.created_at)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleReply(comment)}
                                                        className="text-[10px] font-bold text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-stone-100/50 dark:bg-zinc-900/50 border-t border-stone-200 dark:border-zinc-800/80 rounded-b-[2rem]">
                            {/* Replying indicator */}
                            {replyingTo && (
                                <div className="mb-2 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/20 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                        Replying to <span className="font-bold">@{replyingTo.username}</span>
                                    </p>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        className="text-emerald-600 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {commentImagePreview && (
                                <div className="mb-3 relative inline-block animate-in fade-in zoom-in-95 duration-200">
                                    <div className="relative group">
                                        <img
                                            src={commentImagePreview}
                                            alt="Comment Preview"
                                            className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-500/50 shadow-md transition-transform group-hover:scale-[1.02]"
                                        />
                                        <button
                                            onClick={() => {
                                                setCommentImage(null);
                                                setCommentImagePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-90"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute inset-0 bg-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sticker Mode</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 items-end bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all shadow-sm">
                                <button
                                    onClick={() => commentImageInputRef.current?.click()}
                                    className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all active:scale-90"
                                    title="Add sticker / image"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={commentImageInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCommentImageChange}
                                />
                                <div className="w-[1px] h-6 bg-stone-200 dark:bg-zinc-800 self-center mx-0.5" />

                                <textarea
                                    ref={commentInputRef}
                                    className="flex-1 bg-transparent border-0 py-2 px-3 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-0 resize-none min-h-[36px] max-h-24 no-scrollbar"
                                    placeholder={commentImage ? "Add a caption..." : "Add a comment..."}
                                    rows={1}
                                    value={commentText}
                                    onChange={(e) => {
                                        setCommentText(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCommentSubmit();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={(!commentText.trim() && !commentImage) || isUploadingCommentImage}
                                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-40 disabled:grayscale transition-all active:scale-95 shrink-0 m-0.5 flex items-center justify-center min-w-[36px]"
                                >
                                    {isUploadingCommentImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

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
            {
                fullscreenImage && (() => {
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
                })()
            }
        </article>
    );
}
