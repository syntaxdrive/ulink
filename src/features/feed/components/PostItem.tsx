import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send, Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Trash2, Flag, Repeat, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Post, Comment } from '../../../types';
import VideoEmbed from '../../../components/VideoEmbed';
import { detectVideoEmbed, removeVideoLink } from '../../../utils/videoEmbed';
import RepostModal from './RepostModal';
import NativeVideoPlayer from './NativeVideoPlayer';

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
    onVotePoll
}: PostItemProps) {
    const [commentText, setCommentText] = useState('');
    const [showRepostModal, setShowRepostModal] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        return text.split(/([#@][a-z0-9_]+)/gi).map((part, i) => {
            if (part.match(/^#[a-z0-9_]+$/i)) {
                return (
                    <span
                        key={i}
                        className="text-emerald-600 font-bold cursor-pointer hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSearchTag(part);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        {part}
                    </span>
                );
            }
            if (part.match(/^@[a-z0-9_]+$/i)) {
                const username = part.substring(1);
                return (
                    <Link
                        key={i}
                        to={`/app/profile/${username}`}
                        className="text-blue-600 font-bold hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <article className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-stone-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
            {/* Repost Banner */}
            {post.is_repost && post.profiles && (
                <div className="flex items-center gap-2 mb-3 text-sm text-stone-500">
                    <Repeat className="w-4 h-4 text-green-600" />
                    <Link
                        to={`/app/profile/${post.author_id}`}
                        className="font-semibold text-stone-700 hover:text-green-600 transition-colors"
                    >
                        {post.profiles.name}
                    </Link>
                    <span>reposted</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <Link to={`/app/profile/${post.author_id}`} className="flex items-center gap-4 group">
                    <div className={`w-12 h-12 ${post.profiles?.role === 'org' ? 'rounded-xl' : 'rounded-2xl'} overflow-hidden bg-stone-100 ring-2 ring-white shadow-sm`}>
                        <img
                            loading="lazy"
                            src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}&background=${post.profiles?.role === 'org' ? 'f97316' : 'random'}`}
                            alt={post.profiles?.name}
                            className={`w-full h-full ${post.profiles?.role === 'org' ? 'object-contain p-1' : 'object-cover'} transition-transform duration-500 group-hover:scale-110`}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-900 leading-tight flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                            {post.profiles?.name}
                            {post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50" />}
                            {post.profiles?.is_verified && !post.profiles?.gold_verified && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />}
                        </h3>
                        <p className="text-xs font-medium text-stone-400">
                            {post.profiles?.headline || (post.profiles?.role === 'org' ? 'Organization' : post.profiles?.university)}
                            {' • '}
                            {formatTimeAgo(post.created_at)}
                        </p>
                    </div>
                </Link>
                <div className="relative">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleMenu(post.id); }}
                        className="text-stone-300 hover:text-stone-600 transition-colors p-2 rounded-xl hover:bg-stone-50"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isActiveMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                            {currentUserId === post.author_id ? (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Post
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyLink(); onToggleMenu(post.id); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Copy Link
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyLink(); onToggleMenu(post.id); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 font-medium transition-colors flex items-center gap-2"
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
                                        className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 font-medium transition-colors flex items-center gap-2"
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
            <div className="text-stone-600 leading-relaxed mb-4 font-medium text-[15px] whitespace-pre-wrap">
                {renderContent(contentToRender)}
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-stone-400 text-sm font-semibold hover:text-emerald-600 ml-1 hover:underline"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {/* Original Post (for reposts) */}
            {post.is_repost && post.original_post && (
                <div className="mb-4 border-2 border-stone-200 rounded-2xl p-4 bg-stone-50/50">
                    <Link to={`/app/profile/${post.original_post.author_id}`} className="flex items-center gap-3 mb-3">
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
                <div className="mb-6">
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
                <div className="mb-4 space-y-2 max-w-lg">
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
                    <div className={`mb-6 rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-stone-50 grid gap-0.5 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {images.map((url, i) => (
                            <div
                                key={i}
                                className={`relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${images.length === 3 && i === 0 ? 'col-span-2' : ''}`}
                                onClick={() => {
                                    setFullscreenImage(url);
                                    setCurrentImageIndex(i);
                                }}
                            >
                                <img
                                    loading="lazy"
                                    src={url}
                                    alt="Post content"
                                    className={`w-full object-cover bg-stone-50 ${images.length > 1 ? 'h-48 md:h-64' : 'max-h-[500px] object-contain'}`}
                                />
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* Post Video */}
            {post.video_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-black">
                    <NativeVideoPlayer
                        src={post.video_url}
                        id={`${post.id}-video`}
                    />
                </div>
            )}


            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-stone-50">
                <button
                    onClick={() => onLike(post)}
                    className={`flex items-center gap-2 group transition-all ${post.user_has_liked ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                >
                    <div className={`p-2 rounded-xl group-hover:bg-red-50 transition-colors ${post.user_has_liked ? 'bg-red-50' : ''}`}>
                        <Heart className={`w-5 h-5 transition-transform group-active:scale-75 ${post.user_has_liked ? 'fill-current' : ''}`} />
                    </div>
                    <span className={`text-sm font-semibold transition-all ${post.user_has_liked ? 'text-red-600' : 'text-stone-500'}`}>
                        {post.likes_count || 0}
                    </span>
                </button>

                <button
                    onClick={() => onToggleComments(post.id)}
                    className="flex items-center gap-2 group text-stone-400 hover:text-blue-500 transition-all"
                >
                    <div className="p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-stone-500 transition-all">
                        {post.comments_count || 0}
                    </span>
                </button>

                <button
                    onClick={() => setShowRepostModal(true)}
                    className={`flex items-center gap-2 group transition-all ${post.user_has_reposted ? 'text-green-500' : 'text-stone-400 hover:text-green-500'}`}
                >
                    <div className={`p-2 rounded-xl group-hover:bg-green-50 transition-colors ${post.user_has_reposted ? 'bg-green-50' : ''}`}>
                        <Repeat className="w-5 h-5 transition-transform group-active:scale-75" />
                    </div>
                    <span className={`text-sm font-semibold transition-all ${post.user_has_reposted ? 'text-green-600' : 'text-stone-500'}`}>
                        {post.reposts_count || 0}
                    </span>
                </button>

                <button
                    onClick={copyLink}
                    className="flex items-center gap-2 group text-stone-400 hover:text-emerald-500 transition-all ml-auto"
                >
                    <div className="p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </div>
                </button>
            </div>

            {/* Comments Section */}
            {isActiveCommentSection && (
                <div className="mt-6 pt-6 border-t border-dashed border-stone-100 animate-in slide-in-from-top-2">
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingComments ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-stone-300" /></div>
                        ) : (
                            comments.length === 0 ? (
                                <p className="text-center text-xs text-stone-400 py-2">No comments yet. Be the first!</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3 text-sm group">
                                        <img src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.name || 'User')}&background=random`} className="w-8 h-8 rounded-full bg-stone-100 mt-1" />
                                        <div className="bg-stone-50 rounded-2xl rounded-tl-sm p-3 px-4 flex-1 relative group-hover:bg-stone-100 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <Link to={`/app/profile/${comment.author_id}`} className="font-bold text-stone-900 text-xs mb-1 hover:underline">
                                                    {comment.profiles?.name}
                                                </Link>
                                                {currentUserId === comment.author_id && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this comment?')) onDeleteComment(post.id, comment.id);
                                                        }}
                                                        className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-stone-600 leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim()}
                            className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
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
