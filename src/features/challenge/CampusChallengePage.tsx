import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Users, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PollOption { id: string; text: string; emoji: string; }
interface Poll {
    id: string;
    question: string;
    description: string | null;
    options: PollOption[];
    ends_at: string | null;
    is_active: boolean;
    created_at: string;
}
interface PollResults {
    total: number;
    by_option: Record<string, number>;
    top_universities: { university: string; votes: number; rank: number }[];
}

// ─── Color palette for options ───────────────────────────────────────────────
const OPTION_COLORS = [
    { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
    { bg: 'bg-sky-500',     light: 'bg-sky-100 dark:bg-sky-900/30',         text: 'text-sky-700 dark:text-sky-300',         bar: 'bg-sky-500'     },
    { bg: 'bg-violet-500',  light: 'bg-violet-100 dark:bg-violet-900/30',   text: 'text-violet-700 dark:text-violet-300',   bar: 'bg-violet-500'  },
    { bg: 'bg-orange-500',  light: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-300',   bar: 'bg-orange-500'  },
    { bg: 'bg-pink-500',    light: 'bg-pink-100 dark:bg-pink-900/30',       text: 'text-pink-700 dark:text-pink-300',       bar: 'bg-pink-500'    },
    { bg: 'bg-amber-500',   light: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-300',     bar: 'bg-amber-500'   },
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
    'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-600',
    'bg-stone-50 border-stone-300 dark:bg-stone-800/40 dark:border-stone-500',
    'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-600',
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function CampusChallengePage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [currentPollIndex, setCurrentPollIndex] = useState(0);
    const [myVotes, setMyVotes] = useState<Record<string, string>>({}); // pollId → optionId
    const [results, setResults] = useState<Record<string, PollResults>>({});
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const currentPoll = polls[currentPollIndex] ?? null;

    // ── Load user ─────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    }, []);

    // ── Fetch polls + my existing votes ───────────────────────────────────────
    const fetchPolls = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: pollsData } = await supabase
            .from('polls')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!pollsData || pollsData.length === 0) {
            setPolls([]);
            setLoading(false);
            return;
        }

        setPolls(pollsData);

        // Fetch my votes for all these polls
        if (user) {
            const { data: myVoteData } = await supabase
                .from('poll_votes')
                .select('poll_id, option_id')
                .eq('user_id', user.id)
                .in('poll_id', pollsData.map(p => p.id));

            if (myVoteData) {
                const votesMap: Record<string, string> = {};
                myVoteData.forEach(v => { votesMap[v.poll_id] = v.option_id; });
                setMyVotes(votesMap);

                // Fetch results for polls I've already voted on
                await Promise.all(
                    myVoteData.map(async v => {
                        const { data } = await supabase.rpc('get_poll_results', { p_poll_id: v.poll_id });
                        if (data) setResults(prev => ({ ...prev, [v.poll_id]: data }));
                    })
                );
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPolls();

        // Real-time: when anyone votes, refresh results for current poll
        const channel = supabase
            .channel('poll_votes_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_votes' }, (payload) => {
                const pollId = payload.new?.poll_id;
                if (pollId) {
                    supabase.rpc('get_poll_results', { p_poll_id: pollId }).then(({ data }) => {
                        if (data) setResults(prev => ({ ...prev, [pollId]: data }));
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchPolls]);

    // ── Vote ──────────────────────────────────────────────────────────────────
    const vote = async (optionId: string) => {
        if (!currentPoll || !currentUserId || myVotes[currentPoll.id] || voting) return;
        setVoting(true);

        // Get university for leaderboard
        const { data: profile } = await supabase
            .from('profiles')
            .select('university')
            .eq('id', currentUserId)
            .single();

        const { error } = await supabase.from('poll_votes').insert({
            poll_id: currentPoll.id,
            user_id: currentUserId,
            option_id: optionId,
            university: profile?.university ?? null,
        });

        if (!error) {
            setMyVotes(prev => ({ ...prev, [currentPoll.id]: optionId }));

            // Fetch fresh results
            const { data: resultsData } = await supabase.rpc('get_poll_results', { p_poll_id: currentPoll.id });
            if (resultsData) setResults(prev => ({ ...prev, [currentPoll.id]: resultsData }));

            // 🎉 Confetti!
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'] });
        }

        setVoting(false);
    };

    // ─────────────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentPoll) {
        return (
            <div className="max-w-2xl mx-auto text-center py-24 space-y-4">
                <div className="text-6xl">⚡</div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white">No Active Challenges</h2>
                <p className="text-stone-500 dark:text-zinc-400">Check back soon — admins drop new challenges regularly!</p>
            </div>
        );
    }

    const myVote = myVotes[currentPoll.id];
    const pollResults = results[currentPoll.id];
    const hasVoted = !!myVote;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                    <Zap className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-white font-display">Campus Challenge</h1>
                    <p className="text-stone-500 dark:text-zinc-400 text-sm">Vote · Compare · See your university rank</p>
                </div>

                {polls.length > 1 && (
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-stone-500 dark:text-zinc-400">
                        {polls.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPollIndex(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPollIndex ? 'bg-emerald-500 scale-125' : 'bg-stone-300 dark:bg-zinc-600 hover:bg-stone-400'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Poll Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-xl shadow-stone-100 dark:shadow-zinc-900/50 overflow-hidden">

                {/* Question */}
                <div className="p-6 pb-4 border-b border-stone-100 dark:border-zinc-800">
                    {currentPoll.description && (
                        <p className="text-sm text-stone-500 dark:text-zinc-400 mb-2">{currentPoll.description}</p>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white leading-snug">
                        {currentPoll.question}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-xs text-stone-400">
                            {pollResults?.total ?? 0} vote{(pollResults?.total ?? 0) !== 1 ? 's' : ''} · {hasVoted ? 'You voted' : 'Cast your vote'}
                        </span>
                    </div>
                </div>

                {/* Options */}
                <div className="p-6 space-y-3">
                    {currentPoll.options.map((opt, idx) => {
                        const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                        const voteCount = pollResults?.by_option?.[opt.id] ?? 0;
                        const pct = pollResults && pollResults.total > 0
                            ? Math.round((voteCount / pollResults.total) * 100)
                            : 0;
                        const isMyVote = myVote === opt.id;
                        const isLeading = hasVoted && pollResults && Object.entries(pollResults.by_option).sort((a, b) => b[1] - a[1])[0]?.[0] === opt.id;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => !hasVoted && vote(opt.id)}
                                disabled={hasVoted || voting}
                                className={`w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                                    hasVoted
                                        ? isMyVote
                                            ? `${color.light} border-current ${color.text} cursor-default`
                                            : 'bg-stone-50 dark:bg-zinc-800/60 border-stone-200 dark:border-zinc-700 cursor-default opacity-80'
                                        : `bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 hover:border-current hover:${color.light} hover:${color.text} active:scale-[0.98]`
                                }`}
                            >
                                <div className="relative p-4">
                                    {/* Progress bar (shown after voting) */}
                                    {hasVoted && (
                                        <div
                                            className={`absolute inset-0 ${color.bar} opacity-10 transition-all duration-700`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    )}

                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{opt.emoji}</span>
                                            <span className={`font-semibold text-base ${hasVoted ? (isMyVote ? color.text : 'text-stone-700 dark:text-zinc-200') : 'text-stone-800 dark:text-white'}`}>
                                                {opt.text}
                                            </span>
                                            {isMyVote && <CheckCircle2 className={`w-4 h-4 ${color.text}`} />}
                                            {isLeading && !isMyVote && <span className="text-xs font-bold text-stone-500">📈 Leading</span>}
                                        </div>

                                        {hasVoted && (
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm text-stone-500 dark:text-zinc-400">{voteCount}</span>
                                                <span className={`text-sm font-bold ${isMyVote ? color.text : 'text-stone-600 dark:text-zinc-300'}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {!hasVoted && (
                        <p className="text-center text-xs text-stone-400 dark:text-zinc-500 pt-2">
                            Tap an option to cast your vote — results revealed after voting ✨
                        </p>
                    )}
                </div>

                {/* Navigate between polls */}
                {polls.length > 1 && (
                    <div className="px-6 pb-5 flex justify-between">
                        <button
                            onClick={() => setCurrentPollIndex(i => Math.max(0, i - 1))}
                            disabled={currentPollIndex === 0}
                            className="text-sm text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setCurrentPollIndex(i => Math.min(polls.length - 1, i + 1))}
                            disabled={currentPollIndex === polls.length - 1}
                            className="text-sm text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 disabled:opacity-30 transition-colors flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* University Leaderboard — shown after voting */}
            {hasVoted && pollResults && (pollResults.top_universities?.length ?? 0) > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-stone-200 dark:border-zinc-700 shadow-lg overflow-hidden">
                    <div className="p-5 pb-3 border-b border-stone-100 dark:border-zinc-800 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-stone-900 dark:text-white">University Leaderboard</h3>
                        <span className="ml-auto text-xs text-stone-400">Most engaged campuses</span>
                    </div>

                    <div className="divide-y divide-stone-100 dark:divide-zinc-800">
                        {pollResults.top_universities.map((uni, idx) => {
                            const maxVotes = pollResults.top_universities[0]?.votes ?? 1;
                            const pct = Math.round((uni.votes / maxVotes) * 100);
                            const isTopThree = idx < 3;

                            return (
                                <div
                                    key={uni.university}
                                    className={`px-5 py-3.5 flex items-center gap-4 ${isTopThree ? RANK_COLORS[idx] + ' border-l-4' : ''}`}
                                >
                                    <span className="text-xl w-8 text-center flex-shrink-0">
                                        {idx < 3 ? RANK_MEDALS[idx] : <span className="text-sm font-bold text-stone-400">#{idx + 1}</span>}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-stone-900 dark:text-white text-sm truncate">{uni.university}</p>
                                        <div className="mt-1 h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-stone-400' : idx === 2 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>

                                    <span className="text-sm font-bold text-stone-700 dark:text-zinc-200 flex-shrink-0">
                                        {uni.votes} <span className="text-xs font-normal text-stone-400">votes</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {(pollResults.top_universities?.length ?? 0) === 0 && (
                        <div className="p-6 text-center text-stone-400 text-sm">
                            🏫 University data appears once more students vote!
                        </div>
                    )}
                </div>
            )}

            {/* CTA to add university */}
            {hasVoted && !(pollResults?.top_universities?.length) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">📍 No university leaderboard yet</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Add your university in Profile → Edit to help your campus rank!</p>
                </div>
            )}
        </div>
    );
}
