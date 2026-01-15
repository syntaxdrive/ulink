import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send, Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Trash2, Flag } from 'lucide-react';
import type { Post, Comment } from '../../../types';

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
    onToggleComments: (id: string) => void;
    onToggleMenu: (id: string) => void;
    onPostComment: (id: string, content: string) => Promise<void>;
    onSearchTag: (tag: string) => void;
    onReport: (id: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
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
    onToggleComments,
    onToggleMenu,
    onPostComment,
    onSearchTag,
    onReport,
    onDeleteComment
}: PostItemProps) {
    const [commentText, setCommentText] = useState('');

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
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert('Link copied to clipboard!');
    };

    // Truncation Logic
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 280; // Twitter-style length
    const shouldTruncate = post.content.length > MAX_LENGTH;

    const contentToRender = isExpanded || !shouldTruncate
        ? post.content
        : post.content.slice(0, MAX_LENGTH) + '...';

    const renderContent = (text: string) => {
        return text.split(/(#[a-z0-9_]+)/gi).map((part, i) => {
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
            return part;
        });
    };

    return (
        <article className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-stone-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <Link to={`/app/profile/${post.author_id}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 ring-2 ring-white shadow-sm">
                        <img
                            src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}&background=random`}
                            alt={post.profiles?.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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

            {/* Post Image */}
            {post.image_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-stone-100 bg-stone-50">
                    <img src={post.image_url} alt="Post content" className="w-full max-h-96 object-contain bg-stone-50" />
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
        </article>
    );
}
