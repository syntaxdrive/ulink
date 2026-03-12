import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Ghost,
    Plus,
    ChevronDown,
    ChevronUp,
    Send,
    X,
    Loader2,
    MessageCircle,
    Flame,
    Clock,
    ShieldCheck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'All' | 'Academic' | 'Relationships' | 'Finance' | 'Mental Health' | 'NYSC' | 'General';
type SortMode = 'newest' | 'reactions';
type ReactionEmoji = '❤️' | '💪' | '🙏' | '😢';

interface ReactionCount {
    emoji: ReactionEmoji;
    count: number;
}

interface Confession {
    id: string;
    content: string;
    category: string;
    created_at: string;
    reaction_counts: ReactionCount[];
    user_reaction: ReactionEmoji | null;
    reply_count: number;
}

interface Reply {
    id: string;
    confession_id: string;
    content: string;
    created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['All', 'Academic', 'Relationships', 'Finance', 'Mental Health', 'NYSC', 'General'];

const POST_CATEGORIES: Exclude<Category, 'All'>[] = ['Academic', 'Relationships', 'Finance', 'Mental Health', 'NYSC', 'General'];

const REACTIONS: { emoji: ReactionEmoji; label: string }[] = [
    { emoji: '❤️', label: 'Relate' },
    { emoji: '💪', label: 'You got this' },
    { emoji: '🙏', label: 'Praying' },
    { emoji: '😢', label: 'I feel this' },
];

const CATEGORY_STYLES: Record<string, { border: string; badge: string; dot: string }> = {
    Academic: {
        border: 'border-l-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        dot: 'bg-blue-400',
    },
    Relationships: {
        border: 'border-l-rose-400',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        dot: 'bg-rose-400',
    },
    Finance: {
        border: 'border-l-amber-400',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        dot: 'bg-amber-400',
    },
    'Mental Health': {
        border: 'border-l-purple-400',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        dot: 'bg-purple-400',
    },
    NYSC: {
        border: 'border-l-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        dot: 'bg-emerald-400',
    },
    General: {
        border: 'border-l-slate-400',
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        dot: 'bg-slate-400',
    },
};

const MAX_CHARS = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function totalReactions(confession: Confession): number {
    return confession.reaction_counts.reduce((sum, r) => sum + r.count, 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToastState {
    visible: boolean;
    message: string;
    type: 'info' | 'error' | 'success';
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
    useEffect(() => {
        if (!toast.visible) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast.visible, onClose]);

    if (!toast.visible) return null;

    const colors = {
        info: 'bg-rose-500',
        error: 'bg-red-500',
        success: 'bg-emerald-500',
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none px-4 w-full max-w-sm">
            <div
                className={`
                    ${colors[toast.type]} text-white text-sm font-medium
                    px-5 py-3 rounded-2xl shadow-xl
                    animate-in slide-in-from-bottom-4 fade-in duration-300
                    flex items-center gap-3
                `}
            >
                <span className="flex-1 text-center">{toast.message}</span>
            </div>
        </div>
    );
}

// ─── Reply section for a single confession ────────────────────────────────────

function ConfessionReplies({
    confessionId,
    replyCount,
    userId,
    onShowToast,
}: {
    confessionId: string;
    replyCount: number;
    userId: string | null;
    onShowToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localCount, setLocalCount] = useState(replyCount);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const fetchReplies = useCallback(async () => {
        setLoadingReplies(true);
        const { data, error } = await supabase
            .from('confession_replies')
            .select('id, content, created_at, confession_id')
            .eq('confession_id', confessionId)
            .order('created_at', { ascending: true });

        if (!error && data) setReplies(data as Reply[]);
        setLoadingReplies(false);
    }, [confessionId]);

    const handleToggle = () => {
        if (!expanded) {
            fetchReplies();
        }
        setExpanded(prev => !prev);
    };

    const handleSubmitReply = async () => {
        const trimmed = replyText.trim();
        if (!trimmed) return;

        if (!userId) {
            onShowToast('Sign in to reply anonymously');
            return;
        }

        setSubmitting(true);
        const { error } = await supabase
            .from('confession_replies')
            .insert({ confession_id: confessionId, content: trimmed });

        setSubmitting(false);

        if (error) {
            onShowToast('Failed to send reply. Try again.', 'error');
            return;
        }

        setReplyText('');
        setLocalCount(c => c + 1);
        await fetchReplies();
    };

    return (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* Toggle button */}
            <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium"
            >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{localCount === 0 ? 'No replies yet' : `${localCount} ${localCount === 1 ? 'reply' : 'replies'}`}</span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            {/* Expanded reply area */}
            {expanded && (
                <div className="mt-3 space-y-3">
                    {/* Reply list */}
                    {loadingReplies ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        </div>
                    ) : replies.length === 0 ? (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic text-center py-2">
                            No replies yet. Be the first to show support.
                        </p>
                    ) : (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {replies.map(reply => (
                                <div
                                    key={reply.id}
                                    className="flex gap-2.5"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-rose-200 to-purple-200 dark:from-rose-900/50 dark:to-purple-900/50 flex items-center justify-center">
                                        <Ghost className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                Anonymous
                                            </span>
                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                                {relativeTime(reply.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-0.5 break-words">
                                            {reply.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply input */}
                    <div className="flex gap-2 items-end pt-1">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-rose-200 to-purple-200 dark:from-rose-900/50 dark:to-purple-900/50 flex items-center justify-center">
                            <Ghost className="w-3 h-3 text-rose-400" />
                        </div>
                        <div className="flex-1 flex gap-2 items-end bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2">
                            <textarea
                                ref={inputRef}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Reply anonymously..."
                                rows={1}
                                maxLength={300}
                                className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 resize-none outline-none leading-relaxed"
                                style={{ minHeight: '20px', maxHeight: '80px' }}
                                onInput={e => {
                                    const el = e.currentTarget;
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitReply();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSubmitReply}
                                disabled={!replyText.trim() || submitting}
                                className="flex-shrink-0 p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                            >
                                {submitting
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Send className="w-3 h-3" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Single confession card ───────────────────────────────────────────────────

function ConfessionCard({
    confession,
    userId,
    onReact,
    onShowToast,
}: {
    confession: Confession;
    userId: string | null;
    onReact: (confessionId: string, emoji: ReactionEmoji) => Promise<void>;
    onShowToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
}) {
    const styles = CATEGORY_STYLES[confession.category] ?? CATEGORY_STYLES.General;
    const [reacting, setReacting] = useState<ReactionEmoji | null>(null);

    const handleReact = async (emoji: ReactionEmoji) => {
        if (!userId) {
            onShowToast('Sign in to react');
            return;
        }
        setReacting(emoji);
        await onReact(confession.id, emoji);
        setReacting(null);
    };

    return (
        <article
            className={`
                bg-white dark:bg-zinc-900
                border border-zinc-100 dark:border-zinc-800
                border-l-4 ${styles.border}
                rounded-2xl
                p-4 sm:p-5
                shadow-sm hover:shadow-md
                transition-shadow duration-200
            `}
        >
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/40 dark:to-purple-900/40 flex items-center justify-center flex-shrink-0">
                        <Ghost className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
                            Anonymous Student
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                {relativeTime(confession.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category badge */}
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${styles.badge}`}>
                    {confession.category}
                </span>
            </div>

            {/* Content */}
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                {confession.content}
            </p>

            {/* Reactions */}
            <div className="mt-4 flex flex-wrap gap-2">
                {REACTIONS.map(({ emoji, label }) => {
                    const count = confession.reaction_counts.find(r => r.emoji === emoji)?.count ?? 0;
                    const isActive = confession.user_reaction === emoji;
                    const isLoading = reacting === emoji;

                    return (
                        <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            disabled={isLoading}
                            title={label}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                border transition-all duration-150
                                ${isActive
                                    ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 shadow-sm scale-105'
                                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                }
                                disabled:opacity-60
                            `}
                        >
                            {isLoading
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <span className="text-base leading-none">{emoji}</span>
                            }
                            <span>{count > 0 ? count : ''}</span>
                            <span className="hidden sm:inline text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Replies */}
            <ConfessionReplies
                confessionId={confession.id}
                replyCount={confession.reply_count}
                userId={userId}
                onShowToast={onShowToast}
            />
        </article>
    );
}

// ─── Create confession modal ──────────────────────────────────────────────────

function CreateConfessionModal({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, category: string) => Promise<void>;
}) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<string>('General');
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setContent('');
            setCategory('General');
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Trap scroll on body while modal open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        await onSubmit(trimmed, category);
        setSubmitting(false);
    };

    if (!isOpen) return null;

    const remaining = MAX_CHARS - content.length;
    const isOverLimit = remaining < 0;
    const canSubmit = content.trim().length > 0 && !isOverLimit && !submitting;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/40 dark:to-purple-900/40 flex items-center justify-center">
                            <Ghost className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-none">
                                Share Anonymously
                            </h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Your identity is never stored</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Anonymity notice */}
                    <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl p-3">
                        <ShieldCheck className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                            Your name, profile, and identity are <strong>never</strong> linked to this post. Share freely and safely.
                        </p>
                    </div>

                    {/* Textarea */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                            What's on your mind?
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Share your struggle, confession, or ask for support... This is a safe space."
                            rows={5}
                            className={`
                                w-full bg-zinc-50 dark:bg-zinc-800 border rounded-xl px-4 py-3
                                text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400
                                resize-none outline-none leading-relaxed transition-colors
                                focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-700
                                ${isOverLimit
                                    ? 'border-red-400 dark:border-red-600'
                                    : 'border-zinc-200 dark:border-zinc-700 focus:border-rose-300 dark:focus:border-rose-600'
                                }
                            `}
                        />
                        <div className="flex justify-end mt-1">
                            <span className={`text-xs ${isOverLimit ? 'text-red-500 font-semibold' : remaining < 50 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {remaining} characters left
                            </span>
                        </div>
                    </div>

                    {/* Category selector */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                            Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {POST_CATEGORIES.map(cat => {
                                const styles = CATEGORY_STYLES[cat as string] ?? CATEGORY_STYLES.General;
                                const isSelected = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat as string)}
                                        className={`
                                            text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150
                                            ${isSelected
                                                ? `${styles.badge} border-transparent scale-105 shadow-sm`
                                                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300'
                                            }
                                        `}
                                    >
                                        {isSelected && <span className={`inline-block w-1.5 h-1.5 rounded-full ${styles.dot} mr-1.5 align-middle`} />}
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer / submit */}
                <div className="flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`
                            w-full flex items-center justify-center gap-2
                            px-6 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-150
                            ${canSubmit
                                ? 'bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Posting anonymously...
                            </>
                        ) : (
                            <>
                                <Ghost className="w-4 h-4" />
                                Post Anonymously
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ category, onPost }: { category: Category; onPost: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 flex items-center justify-center mb-5">
                <Ghost className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mb-2">
                {category === 'All' ? 'No confessions yet' : `No ${category} posts yet`}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed mb-6">
                This is a safe, judgment-free space. Be the first to share — you might help someone who feels the same way.
            </p>
            <button
                onClick={onPost}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
            >
                <Ghost className="w-4 h-4" />
                Share Anonymously
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfessionsPage() {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [sortMode, setSortMode] = useState<SortMode>('newest');
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });

    // ── Auth ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });
    }, []);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
        setToast({ visible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(t => ({ ...t, visible: false }));
    }, []);

    // ── Fetch confessions ──────────────────────────────────────────────────────
    const fetchConfessions = useCallback(async () => {
        setLoading(true);

        // 1. Fetch all confessions
        const { data: confessionsData, error: confErr } = await supabase
            .from('confessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (confErr || !confessionsData || confessionsData.length === 0) {
            setConfessions([]);
            setLoading(false);
            return;
        }

        const ids = confessionsData.map((c: { id: string }) => c.id);

        // 2. Batch-fetch all reactions for these confessions
        const { data: allReactions } = await supabase
            .from('confession_reactions')
            .select('confession_id, emoji, user_id')
            .in('confession_id', ids);

        // 3. Batch-fetch reply counts
        const { data: allReplies } = await supabase
            .from('confession_replies')
            .select('confession_id')
            .in('confession_id', ids);

        // 4. Merge in JS
        const reactionsMap = new Map<string, { emoji: string; userId: string }[]>();
        (allReactions ?? []).forEach((r: { confession_id: string; emoji: string; user_id: string }) => {
            if (!reactionsMap.has(r.confession_id)) reactionsMap.set(r.confession_id, []);
            reactionsMap.get(r.confession_id)!.push({ emoji: r.emoji, userId: r.user_id });
        });

        const replyCountMap = new Map<string, number>();
        (allReplies ?? []).forEach((r: { confession_id: string }) => {
            replyCountMap.set(r.confession_id, (replyCountMap.get(r.confession_id) ?? 0) + 1);
        });

        const merged: Confession[] = confessionsData.map((c: { id: string; content: string; category: string; created_at: string }) => {
            const reactions = reactionsMap.get(c.id) ?? [];

            // Compute per-emoji counts
            const countByEmoji = new Map<string, number>();
            reactions.forEach(r => {
                countByEmoji.set(r.emoji, (countByEmoji.get(r.emoji) ?? 0) + 1);
            });

            const reaction_counts: ReactionCount[] = REACTIONS.map(({ emoji }) => ({
                emoji,
                count: countByEmoji.get(emoji) ?? 0,
            }));

            // Current user's reaction (if any)
            const myReaction = userId
                ? reactions.find(r => r.userId === userId)?.emoji ?? null
                : null;

            return {
                id: c.id,
                content: c.content,
                category: c.category,
                created_at: c.created_at,
                reaction_counts,
                user_reaction: myReaction as ReactionEmoji | null,
                reply_count: replyCountMap.get(c.id) ?? 0,
            };
        });

        setConfessions(merged);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchConfessions();
    }, [fetchConfessions]);

    // ── Toggle reaction ────────────────────────────────────────────────────────
    const handleReact = useCallback(async (confessionId: string, emoji: ReactionEmoji) => {
        if (!userId) {
            showToast('Sign in to react');
            return;
        }

        // Optimistic update
        setConfessions(prev =>
            prev.map(c => {
                if (c.id !== confessionId) return c;

                const wasMyReaction = c.user_reaction === emoji;
                const hadDifferentReaction = c.user_reaction && c.user_reaction !== emoji;

                const newCounts = c.reaction_counts.map(r => {
                    if (r.emoji === emoji) {
                        return { ...r, count: wasMyReaction ? Math.max(0, r.count - 1) : r.count + 1 };
                    }
                    if (hadDifferentReaction && r.emoji === c.user_reaction) {
                        return { ...r, count: Math.max(0, r.count - 1) };
                    }
                    return r;
                });

                return {
                    ...c,
                    reaction_counts: newCounts,
                    user_reaction: wasMyReaction ? null : emoji,
                };
            })
        );

        // Persist to Supabase
        const existingReaction = confessions.find(c => c.id === confessionId)?.user_reaction;

        if (existingReaction === emoji) {
            // Same emoji → unreact
            await supabase
                .from('confession_reactions')
                .delete()
                .eq('confession_id', confessionId)
                .eq('user_id', userId);
        } else if (existingReaction) {
            // Different emoji → replace via upsert
            await supabase
                .from('confession_reactions')
                .upsert(
                    { confession_id: confessionId, user_id: userId, emoji },
                    { onConflict: 'confession_id,user_id' }
                );
        } else {
            // No prior reaction → insert via upsert
            await supabase
                .from('confession_reactions')
                .upsert(
                    { confession_id: confessionId, user_id: userId, emoji },
                    { onConflict: 'confession_id,user_id' }
                );
        }
    }, [userId, confessions, showToast]);

    // ── Create confession ──────────────────────────────────────────────────────
    const handleCreate = useCallback(async (content: string, category: string) => {
        const { error } = await supabase
            .from('confessions')
            .insert({ content, category });

        if (error) {
            showToast('Failed to post. Please try again.', 'error');
            return;
        }

        setShowCreate(false);
        showToast('Posted anonymously!', 'success');
        await fetchConfessions();
    }, [fetchConfessions, showToast]);

    // ── Derived: filter + sort ────────────────────────────────────────────────
    const displayed = confessions
        .filter(c => selectedCategory === 'All' || c.category === selectedCategory)
        .sort((a, b) => {
            if (sortMode === 'newest') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return totalReactions(b) - totalReactions(a);
        });

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-rose-50/40 dark:bg-zinc-950 pb-24">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-30 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-rose-900/30">
                                <Ghost className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg leading-none">
                                    Campus Confessions
                                </h1>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    A safe space to share — posted anonymously
                                </p>
                            </div>
                        </div>

                        {/* New post button */}
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-200 dark:shadow-rose-900/30"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Post</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Filter & sort bar ───────────────────────────────────────────── */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-100 dark:border-zinc-800 sticky top-[72px] z-20">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Category chips */}
                    <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide no-scrollbar">
                        {CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat;
                            const styles = cat !== 'All' ? CATEGORY_STYLES[cat] : null;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`
                                        flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150
                                        ${isSelected && cat !== 'All'
                                            ? `${styles?.badge} border-transparent shadow-sm`
                                            : isSelected && cat === 'All'
                                                ? 'bg-rose-500 text-white border-transparent shadow-sm'
                                                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                                        }
                                    `}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort toggle */}
                    <div className="flex items-center gap-2 pb-3">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mr-1">Sort:</span>
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 gap-0.5">
                            <button
                                onClick={() => setSortMode('newest')}
                                className={`
                                    flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150
                                    ${sortMode === 'newest'
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }
                                `}
                            >
                                <Clock className="w-3 h-3" />
                                Newest
                            </button>
                            <button
                                onClick={() => setSortMode('reactions')}
                                className={`
                                    flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150
                                    ${sortMode === 'reactions'
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }
                                `}
                            >
                                <Flame className="w-3 h-3" />
                                Most Reactions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 py-5">
                {loading ? (
                    // Skeleton loader
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 border-l-4 border-l-rose-200 dark:border-l-rose-900/50 rounded-2xl p-5 animate-pulse"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-32" />
                                        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full w-20" />
                                    </div>
                                    <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full" />
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-5/6" />
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-3/4" />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {[1, 2, 3, 4].map(j => (
                                        <div key={j} className="h-7 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <EmptyState category={selectedCategory} onPost={() => setShowCreate(true)} />
                ) : (
                    <div className="space-y-4">
                        {displayed.map(confession => (
                            <ConfessionCard
                                key={confession.id}
                                confession={confession}
                                userId={userId}
                                onReact={handleReact}
                                onShowToast={showToast}
                            />
                        ))}
                        {/* Bottom padding note */}
                        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 pt-4 pb-2">
                            All posts are 100% anonymous — no names, no judgment.
                        </p>
                    </div>
                )}
            </div>

            {/* ── FAB (mobile) ─────────────────────────────────────────────────── */}
            <button
                onClick={() => setShowCreate(true)}
                className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-xl shadow-rose-300/50 dark:shadow-rose-900/50 flex items-center justify-center transition-all"
                aria-label="Create anonymous post"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* ── Create modal ─────────────────────────────────────────────────── */}
            <CreateConfessionModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
            />

            {/* ── Toast ────────────────────────────────────────────────────────── */}
            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
