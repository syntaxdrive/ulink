import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Send, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface AdminNote {
    id: string;
    author_id: string;
    content: string;
    color: NoteColor;
    emoji: string;
    reactions: Record<string, string[]>; // { "❤️": ["uid1", ...] }
    created_at: string;
    author?: { name: string | null; avatar_url: string | null; email: string | null };
}

type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

// ─── Constants ───────────────────────────────────────────────────────────────
const NOTE_COLORS: { key: NoteColor; bg: string; border: string; shadow: string }[] = [
    { key: 'yellow',  bg: 'bg-yellow-100',  border: 'border-yellow-300',  shadow: 'shadow-yellow-200'  },
    { key: 'pink',    bg: 'bg-pink-100',    border: 'border-pink-300',    shadow: 'shadow-pink-200'    },
    { key: 'blue',    bg: 'bg-sky-100',     border: 'border-sky-300',     shadow: 'shadow-sky-200'     },
    { key: 'green',   bg: 'bg-emerald-100', border: 'border-emerald-300', shadow: 'shadow-emerald-200' },
    { key: 'purple',  bg: 'bg-purple-100',  border: 'border-purple-300',  shadow: 'shadow-purple-200'  },
    { key: 'orange',  bg: 'bg-orange-100',  border: 'border-orange-300',  shadow: 'shadow-orange-200'  },
];

const NOTE_EMOJIS = ['📝', '🎯', '💡', '🚀', '⚡', '🎉', '🔥', '🌟', '💬', '📌', '👀', '🛠️'];
const REACTION_EMOJIS = ['❤️', '🔥', '😂', '👏', '🎯', '💡', '👀', '🚀'];

const colorStyle = (color: NoteColor) =>
    NOTE_COLORS.find(c => c.key === color) ?? NOTE_COLORS[0];

const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name?.trim()) return name.trim()[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return '?';
};

const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminReactionsBoard() {
    const [notes, setNotes] = useState<AdminNote[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');
    const [selectedEmoji, setSelectedEmoji] = useState('📝');
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    // ── Load current user ────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id ?? null);
        });
    }, []);

    // ── Fetch notes ───────────────────────────────────────────────────────────
    const fetchNotes = async () => {
        const { data, error } = await supabase
            .from('admin_notes')
            .select('*, author:author_id(name, avatar_url, email)')
            .order('created_at', { ascending: false });
        if (!error && data) setNotes(data as AdminNote[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotes();

        const channel = supabase
            .channel('admin_notes_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notes' }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // ── Add note ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!content.trim() || !currentUserId) return;
        setSubmitting(true);
        await supabase.from('admin_notes').insert({
            author_id: currentUserId,
            content: content.trim(),
            color: selectedColor,
            emoji: selectedEmoji,
            reactions: {},
        });
        setContent('');
        setSelectedColor('yellow');
        setSelectedEmoji('📝');
        setShowForm(false);
        setSubmitting(false);
    };

    // ── Toggle reaction ───────────────────────────────────────────────────────
    const toggleReaction = async (note: AdminNote, emoji: string) => {
        if (!currentUserId) return;
        const existing: string[] = note.reactions[emoji] ?? [];
        const has = existing.includes(currentUserId);
        const updated = has
            ? existing.filter(id => id !== currentUserId)
            : [...existing, currentUserId];

        const newReactions = { ...note.reactions, [emoji]: updated };
        if (newReactions[emoji].length === 0) delete newReactions[emoji];

        // Optimistic update
        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, reactions: newReactions } : n));
        await supabase.from('admin_notes').update({ reactions: newReactions }).eq('id', note.id);
    };

    // ── Delete note ───────────────────────────────────────────────────────────
    const deleteNote = async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        await supabase.from('admin_notes').delete().eq('id', id);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">Admin Board</h2>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">{notes.length} note{notes.length !== 1 ? 's' : ''} · visible to admins only</p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setTimeout(() => textRef.current?.focus(), 50); }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Add Note'}
                </button>
            </div>

            {/* Add Note Form */}
            {showForm && (
                <div className={`rounded-2xl border-2 p-4 space-y-3 shadow-lg transition-all ${colorStyle(selectedColor).bg} ${colorStyle(selectedColor).border}`}>
                    {/* Emoji + Color row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Emoji selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowEmojiPicker(v => !v)}
                                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 hover:bg-white/90 transition border border-white/80"
                            >
                                {selectedEmoji}
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute top-12 left-0 z-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-3 border border-stone-200 dark:border-zinc-700 flex flex-wrap gap-2 w-52">
                                    {NOTE_EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            onClick={() => { setSelectedEmoji(e); setShowEmojiPicker(false); }}
                                            className={`text-xl p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-700 transition ${selectedEmoji === e ? 'bg-stone-100 dark:bg-zinc-700' : ''}`}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color swatches */}
                        <div className="flex gap-1.5">
                            {NOTE_COLORS.map(c => (
                                <button
                                    key={c.key}
                                    onClick={() => setSelectedColor(c.key)}
                                    className={`w-7 h-7 rounded-full border-2 transition-transform ${c.bg} ${selectedColor === c.key ? 'scale-125 border-stone-600' : 'border-transparent hover:scale-110'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Text area */}
                    <textarea
                        ref={textRef}
                        value={content}
                        onChange={e => setContent(e.target.value.slice(0, 280))}
                        placeholder="What's on your mind? Drop a note for the team…"
                        rows={3}
                        className="w-full bg-white/50 dark:bg-white/10 rounded-xl px-3 py-2.5 text-sm text-stone-800 dark:text-white placeholder-stone-400 border border-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                    />

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">{content.length}/280</span>
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || submitting}
                            className="flex items-center gap-1.5 bg-stone-900 dark:bg-emerald-600 hover:bg-stone-700 dark:hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Post
                        </button>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-400 dark:text-zinc-500">
                    <span className="text-5xl">📌</span>
                    <p className="font-medium">No notes yet — be the first to drop one!</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
                    {notes.map(note => {
                        const cs = colorStyle(note.color);
                        const isOwn = note.author_id === currentUserId;
                        const totalReactions = Object.values(note.reactions).reduce((s, arr) => s + arr.length, 0);

                        return (
                            <div
                                key={note.id}
                                className={`break-inside-avoid mb-4 rounded-2xl border-2 p-4 shadow-lg ${cs.bg} ${cs.border} ${cs.shadow} group relative`}
                            >
                                {/* Delete button (own notes only) */}
                                {isOwn && (
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg bg-white/70 hover:bg-red-100 text-stone-400 hover:text-red-500 transition-all"
                                        title="Delete note"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                {/* Emoji + content */}
                                <div className="text-3xl mb-2">{note.emoji}</div>
                                <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed mb-3">{note.content}</p>

                                {/* Author */}
                                <div className="flex items-center gap-2 mb-3">
                                    {note.author?.avatar_url ? (
                                        <img src={note.author.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-700">
                                            {getInitials(note.author?.name, note.author?.email)}
                                        </div>
                                    )}
                                    <span className="text-xs text-stone-600 font-medium truncate">
                                        {note.author?.name ?? note.author?.email?.split('@')[0] ?? 'Admin'}
                                    </span>
                                    <span className="text-xs text-stone-400 ml-auto shrink-0">{timeAgo(note.created_at)}</span>
                                </div>

                                {/* Reactions */}
                                <div className="flex flex-wrap gap-1.5">
                                    {REACTION_EMOJIS.map(emoji => {
                                        const reactors = note.reactions[emoji] ?? [];
                                        const reacted = currentUserId ? reactors.includes(currentUserId) : false;
                                        return (
                                            <button
                                                key={emoji}
                                                onClick={() => toggleReaction(note, emoji)}
                                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                                                    reacted
                                                        ? 'bg-stone-800 border-stone-700 text-white scale-105'
                                                        : 'bg-white/60 border-white/80 text-stone-600 hover:bg-white/90 hover:scale-105'
                                                }`}
                                            >
                                                {emoji}
                                                {reactors.length > 0 && <span>{reactors.length}</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {totalReactions > 0 && (
                                    <p className="text-xs text-stone-400 mt-1.5">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
