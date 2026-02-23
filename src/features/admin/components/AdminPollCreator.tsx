import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, ToggleLeft, ToggleRight, Send, X } from 'lucide-react';

const OPTION_EMOJIS = ['🔥', '✅', '💡', '🚀', '❤️', '😂', '🎯', '⚡', '🌟', '🏆', '💎', '🎉'];

interface PollOption { id: string; text: string; emoji: string; }
interface Poll {
    id: string;
    question: string;
    description: string | null;
    options: PollOption[];
    is_active: boolean;
    created_at: string;
    ends_at: string | null;
}

const genId = () => Math.random().toString(36).slice(2, 7);

export default function AdminPollCreator() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<PollOption[]>([
        { id: genId(), text: '', emoji: '🔥' },
        { id: genId(), text: '', emoji: '✅' },
    ]);
    const [endsAt, setEndsAt] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPolls = async () => {
        const { data } = await supabase
            .from('polls')
            .select('*')
            .order('created_at', { ascending: false });
        setPolls(data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchPolls(); }, []);

    const addOption = () => {
        if (options.length >= 6) return;
        setOptions(prev => [...prev, { id: genId(), text: '', emoji: OPTION_EMOJIS[prev.length % OPTION_EMOJIS.length] }]);
    };

    const removeOption = (id: string) => {
        if (options.length <= 2) return;
        setOptions(prev => prev.filter(o => o.id !== id));
    };

    const updateOption = (id: string, field: 'text' | 'emoji', value: string) => {
        setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleCreate = async () => {
        if (!question.trim() || options.some(o => !o.text.trim())) return;
        setSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('polls').insert({
            question: question.trim(),
            description: description.trim() || null,
            options,
            created_by: user?.id,
            ends_at: endsAt || null,
            is_active: true,
        });

        setQuestion('');
        setDescription('');
        setOptions([
            { id: genId(), text: '', emoji: '🔥' },
            { id: genId(), text: '', emoji: '✅' },
        ]);
        setEndsAt('');
        setShowForm(false);
        setSubmitting(false);
        fetchPolls();
    };

    const toggleActive = async (poll: Poll) => {
        await supabase.from('polls').update({ is_active: !poll.is_active }).eq('id', poll.id);
        setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, is_active: !p.is_active } : p));
    };

    const deletePoll = async (id: string) => {
        if (!window.confirm('Delete this poll and all its votes?')) return;
        await supabase.from('polls').delete().eq('id', id);
        setPolls(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">Campus Challenges</h2>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">{polls.filter(p => p.is_active).length} active poll{polls.filter(p => p.is_active).length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'New Poll'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-stone-50 dark:bg-zinc-800/60 rounded-2xl border border-stone-200 dark:border-zinc-700 p-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-300">Question *</label>
                        <input
                            value={question}
                            onChange={e => setQuestion(e.target.value.slice(0, 300))}
                            placeholder="e.g. Which superpower would you choose?"
                            className="w-full bg-white dark:bg-zinc-900 rounded-xl px-3 py-2.5 text-sm border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 ring-emerald-400"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-300">Description (optional)</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value.slice(0, 500))}
                            placeholder="Add context or instructions…"
                            className="w-full bg-white dark:bg-zinc-900 rounded-xl px-3 py-2.5 text-sm border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 ring-emerald-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-300">Options (2–6) *</label>
                        {options.map((opt, idx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                {/* Emoji picker (simple select for now) */}
                                <select
                                    value={opt.emoji}
                                    onChange={e => updateOption(opt.id, 'emoji', e.target.value)}
                                    className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg px-1 py-2 text-lg focus:outline-none"
                                >
                                    {OPTION_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <input
                                    value={opt.text}
                                    onChange={e => updateOption(opt.id, 'text', e.target.value.slice(0, 100))}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1 bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-sm border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 ring-emerald-400"
                                />
                                {options.length > 2 && (
                                    <button onClick={() => removeOption(opt.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 6 && (
                            <button onClick={addOption} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Add option
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-300">End date (optional)</label>
                        <input
                            type="datetime-local"
                            value={endsAt}
                            onChange={e => setEndsAt(e.target.value)}
                            className="bg-white dark:bg-zinc-900 rounded-xl px-3 py-2 text-sm border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 ring-emerald-400"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!question.trim() || options.some(o => !o.text.trim()) || submitting}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                    >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Creating…' : 'Create Challenge'}
                    </button>
                </div>
            )}

            {/* Poll list */}
            {loading ? (
                <div className="text-center py-10 text-stone-400">Loading…</div>
            ) : polls.length === 0 ? (
                <div className="text-center py-10 text-stone-400">No challenges yet — create the first one!</div>
            ) : (
                <div className="space-y-3">
                    {polls.map(poll => (
                        <div key={poll.id} className={`rounded-2xl border p-4 transition-all ${poll.is_active ? 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700' : 'bg-stone-50 dark:bg-zinc-800/40 border-stone-200 dark:border-zinc-700 opacity-60'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${poll.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-stone-100 text-stone-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                                            {poll.is_active ? '● Live' : '○ Inactive'}
                                        </span>
                                        <span className="text-xs text-stone-400">{poll.options.length} options</span>
                                    </div>
                                    <p className="font-semibold text-stone-900 dark:text-white text-sm leading-snug">{poll.question}</p>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {poll.options.map(o => (
                                            <span key={o.id} className="text-xs bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                                                {o.emoji} {o.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => toggleActive(poll)}
                                        className={`p-2 rounded-xl transition-colors ${poll.is_active ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-700'}`}
                                        title={poll.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {poll.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => deletePoll(poll.id)}
                                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        title="Delete poll"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
