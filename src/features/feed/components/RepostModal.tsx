import { useState } from 'react';
import { Repeat } from 'lucide-react';
import type { Post } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface RepostModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onRepost: (post: Post, comment?: string) => void;
}

export default function RepostModal({ post, isOpen, onClose, onRepost }: RepostModalProps) {
    const [comment, setComment] = useState('');
    const [isQuoteRepost, setIsQuoteRepost] = useState(false);

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

    const handleClose = () => {
        setComment('');
        setIsQuoteRepost(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Repost"
            size="lg"
            footer={isQuoteRepost && (
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => {
                            setIsQuoteRepost(false);
                            setComment('');
                        }}
                        className="flex-1 px-4 py-3 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleQuoteRepost}
                        disabled={!comment.trim()}
                        className="flex-1 px-4 py-3 bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-stone-200 dark:shadow-none"
                    >
                        Post Repost
                    </button>
                </div>
            )}
        >
            <div className="p-6 space-y-4">
                {!isQuoteRepost ? (
                    <div className="space-y-3">
                        {/* Simple Repost Option */}
                        <button
                            onClick={handleSimpleRepost}
                            className="w-full p-4 flex items-center gap-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl transition-all border border-stone-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800 text-left group"
                        >
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                <Repeat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 dark:text-white">Instant Repost</h4>
                                <p className="text-sm text-stone-500 dark:text-zinc-500">Share this immediately to your feed</p>
                            </div>
                        </button>

                        {/* Quote Repost Option */}
                        <button
                            onClick={() => setIsQuoteRepost(true)}
                            className="w-full p-4 flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-2xl transition-all border border-stone-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-left group"
                        >
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                <Repeat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-stone-900 dark:text-white">Quote Repost</h4>
                                <p className="text-sm text-stone-500 dark:text-zinc-500">Add your thoughts before sharing</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Quote Repost Form */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-stone-700 dark:text-zinc-300">
                                Your thoughts
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What do you think about this?"
                                className="w-full px-4 py-3 border border-stone-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:text-white outline-none transition-all resize-none min-h-[100px]"
                                autoFocus
                            />
                        </div>

                        {/* Original Post Preview */}
                        <div className="border border-stone-100 dark:border-zinc-800 rounded-2xl p-4 bg-stone-50/50 dark:bg-zinc-950/50">
                            <div className="flex items-center gap-2 mb-2">
                                <img
                                    src={post.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}`}
                                    alt={post.profiles?.name}
                                    className="w-8 h-8 rounded-full border border-stone-200 dark:border-zinc-800"
                                />
                                <span className="font-bold text-xs text-stone-900 dark:text-zinc-100">
                                    {post.profiles?.username ? `@${post.profiles.username}` : post.profiles?.name}
                                </span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">{post.content || ''}</p>
                            {(post.image_url || (post.image_urls && post.image_urls.length > 0)) && (
                                <img
                                    src={post.image_url || post.image_urls?.[0]}
                                    alt="Post preview"
                                    className="mt-3 rounded-xl w-full max-h-32 object-cover border border-stone-200 dark:border-zinc-800 shadow-sm"
                                />
                            )}
                        </div>

                    </div>
                )}
            </div>
        </Modal>
    );
}
