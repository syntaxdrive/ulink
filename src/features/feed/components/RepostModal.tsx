import { useState } from 'react';
import { X, Repeat } from 'lucide-react';
import type { Post } from '../../../types';

interface RepostModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onRepost: (post: Post, comment?: string) => void;
}

export default function RepostModal({ post, isOpen, onClose, onRepost }: RepostModalProps) {
    const [comment, setComment] = useState('');
    const [isQuoteRepost, setIsQuoteRepost] = useState(false);

    if (!isOpen) return null;

    const handleSimpleRepost = () => {
        onRepost(post);
        onClose();
    };

    const handleQuoteRepost = () => {
        onRepost(post, comment);
        setComment('');
        setIsQuoteRepost(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <h3 className="text-xl font-bold text-stone-900">Repost</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {!isQuoteRepost ? (
                        <>
                            {/* Simple Repost Option */}
                            <button
                                onClick={handleSimpleRepost}
                                className="w-full p-4 flex items-center gap-3 hover:bg-green-50 rounded-xl transition-colors border border-stone-200 hover:border-green-200"
                            >
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <Repeat className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-stone-900">Repost</h4>
                                    <p className="text-sm text-stone-500">Share instantly to your feed</p>
                                </div>
                            </button>

                            {/* Quote Repost Option */}
                            <button
                                onClick={() => setIsQuoteRepost(true)}
                                className="w-full p-4 flex items-center gap-3 hover:bg-blue-50 rounded-xl transition-colors border border-stone-200 hover:border-blue-200"
                            >
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Repeat className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-stone-900">Quote Repost</h4>
                                    <p className="text-sm text-stone-500">Add your thoughts before sharing</p>
                                </div>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Quote Repost Form */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Add your comment
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What do you think about this?"
                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
                                    rows={3}
                                    autoFocus
                                />
                            </div>

                            {/* Original Post Preview */}
                            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}`}
                                        alt={post.profiles?.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="font-semibold text-sm text-stone-900">{post.profiles?.name}</span>
                                </div>
                                <p className="text-sm text-stone-600 line-clamp-3">{post.content || ''}</p>
                                {post.image_url && (
                                    <img
                                        src={post.image_url}
                                        alt="Post"
                                        className="mt-2 rounded-lg w-full max-h-40 object-cover"
                                    />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsQuoteRepost(false);
                                        setComment('');
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleQuoteRepost}
                                    disabled={!comment.trim()}
                                    className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Repost
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
