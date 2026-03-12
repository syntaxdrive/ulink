import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Timer,
    Plus,
    Users,
    Play,
    Pause,
    RotateCcw,
    LogOut,
    X,
    Loader2,
    BookOpen,
    Coffee,
    CheckCircle2,
    Star,
    Lock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ParticipantStatus = 'Studying' | 'On break' | 'Done';

interface StudyRoom {
    id: string;
    creator_id: string;
    name: string;
    subject: string | null;
    description: string | null;
    timer_minutes: 25 | 50;
    timer_started_at: string | null;
    timer_paused_at: string | null;
    timer_elapsed_seconds: number;
    is_active: boolean;
    created_at: string;
    participant_count?: number;
}

interface Participant {
    id: string;
    room_id: string;
    user_id: string;
    status: ParticipantStatus;
    joined_at: string;
    profiles?: {
        name: string;
        username: string;
        avatar_url: string | null;
        university: string | null;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getElapsedSeconds(room: StudyRoom): number {
    if (!room.timer_started_at) return room.timer_elapsed_seconds;
    if (room.timer_paused_at) return room.timer_elapsed_seconds;
    const startedAt = new Date(room.timer_started_at).getTime();
    const now = Date.now();
    return room.timer_elapsed_seconds + Math.floor((now - startedAt) / 1000);
}

function getRemainingSeconds(room: StudyRoom): number {
    const total = room.timer_minutes * 60;
    const elapsed = getElapsedSeconds(room);
    return Math.max(0, total - elapsed);
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function isTimerRunning(room: StudyRoom): boolean {
    return !!room.timer_started_at && !room.timer_paused_at;
}

// ─── Circular Timer SVG ───────────────────────────────────────────────────────

function CircularTimer({ room }: { room: StudyRoom }) {
    const [remaining, setRemaining] = useState(() => getRemainingSeconds(room));
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setRemaining(getRemainingSeconds(room));
        if (timerRef.current) clearInterval(timerRef.current);

        if (isTimerRunning(room)) {
            timerRef.current = setInterval(() => {
                setRemaining(getRemainingSeconds(room));
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [room.timer_started_at, room.timer_paused_at, room.timer_elapsed_seconds, room.timer_minutes]);

    const total = room.timer_minutes * 60;
    const progress = remaining / total;
    const radius = 72;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);
    const isDone = remaining === 0;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor"
                        className="text-slate-200 dark:text-zinc-700" strokeWidth="10" />
                    <circle cx="80" cy="80" r={radius} fill="none"
                        stroke={isDone ? '#ef4444' : '#10b981'}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-mono font-bold ${isDone ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {formatTime(remaining)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {isDone ? 'Time up!' : isTimerRunning(room) ? 'Focusing…' : 'Paused'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ParticipantStatus }) {
    const cfg = {
        Studying:  { icon: BookOpen,    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
        'On break': { icon: Coffee,     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
        Done:      { icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    };
    const { icon: Icon, color } = cfg[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [myStatus, setMyStatus] = useState<ParticipantStatus>('Studying');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState<string | null>(null);
    const [newRoom, setNewRoom] = useState({ name: '', subject: '', description: '', timer_minutes: 25 as 25 | 50 });

    // ── Auth ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    }, []);

    // ── Fetch rooms ───────────────────────────────────────────────────────────

    const fetchRooms = useCallback(async () => {
        const { data } = await supabase
            .from('study_rooms')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!data) { setLoading(false); return; }

        // Count participants per room
        const roomIds = data.map((r: StudyRoom) => r.id);
        const { data: pcData } = await supabase
            .from('study_room_participants')
            .select('room_id')
            .in('room_id', roomIds);

        const counts: Record<string, number> = {};
        (pcData || []).forEach((p: { room_id: string }) => {
            counts[p.room_id] = (counts[p.room_id] || 0) + 1;
        });

        setRooms(data.map((r: StudyRoom) => ({ ...r, participant_count: counts[r.id] || 0 })));
        setLoading(false);
    }, []);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    // ── Rooms realtime ────────────────────────────────────────────────────────

    useEffect(() => {
        const channel = supabase.channel('study_rooms_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, fetchRooms)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_participants' }, fetchRooms)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchRooms]);

    // ── Fetch participants (in-room) ──────────────────────────────────────────

    const fetchParticipants = useCallback(async (roomId: string) => {
        const { data } = await supabase
            .from('study_room_participants')
            .select('*, profiles:user_id(name, username, avatar_url, university)')
            .eq('room_id', roomId);
        setParticipants(data || []);

        if (currentUserId) {
            const mine = (data || []).find((p: Participant) => p.user_id === currentUserId);
            if (mine) setMyStatus(mine.status);
        }
    }, [currentUserId]);

    // ── In-room realtime ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!activeRoom) return;
        const roomId = activeRoom.id;

        fetchParticipants(roomId);

        const channel = supabase.channel(`room_${roomId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'study_room_participants', filter: `room_id=eq.${roomId}` },
                () => fetchParticipants(roomId))
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'study_rooms', filter: `id=eq.${roomId}` },
                ({ new: updated }) => setActiveRoom(prev => prev ? { ...prev, ...(updated as StudyRoom) } : null))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeRoom?.id, fetchParticipants]);

    // ── Create room ───────────────────────────────────────────────────────────

    const handleCreateRoom = async () => {
        if (!currentUserId || !newRoom.name.trim()) return;
        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('study_rooms')
                .insert({
                    creator_id: currentUserId,
                    name: newRoom.name.trim(),
                    subject: newRoom.subject.trim() || null,
                    description: newRoom.description.trim() || null,
                    timer_minutes: newRoom.timer_minutes,
                })
                .select()
                .single();
            if (error) throw error;

            // Auto-join as participant
            await supabase.from('study_room_participants').insert({
                room_id: data.id,
                user_id: currentUserId,
                status: 'Studying',
            });

            setShowCreate(false);
            setNewRoom({ name: '', subject: '', description: '', timer_minutes: 25 });
            setActiveRoom(data);
        } catch (err) {
            console.error('Error creating room:', err);
        } finally {
            setCreating(false);
        }
    };

    // ── Join / Leave ──────────────────────────────────────────────────────────

    const joinRoom = async (room: StudyRoom) => {
        if (!currentUserId) return;
        setJoining(room.id);
        try {
            await supabase.from('study_room_participants').upsert({
                room_id: room.id,
                user_id: currentUserId,
                status: 'Studying',
            }, { onConflict: 'room_id,user_id' });
            setActiveRoom(room);
        } finally {
            setJoining(null);
        }
    };

    const leaveRoom = async () => {
        if (!currentUserId || !activeRoom) return;

        // If creator and no one else, deactivate room
        const otherParticipants = participants.filter(p => p.user_id !== currentUserId);
        if (activeRoom.creator_id === currentUserId && otherParticipants.length === 0) {
            await supabase.from('study_rooms').update({ is_active: false }).eq('id', activeRoom.id);
        }

        await supabase.from('study_room_participants')
            .delete()
            .eq('room_id', activeRoom.id)
            .eq('user_id', currentUserId);

        setActiveRoom(null);
        setParticipants([]);
        fetchRooms();
    };

    // ── Update my status ──────────────────────────────────────────────────────

    const updateStatus = async (status: ParticipantStatus) => {
        if (!currentUserId || !activeRoom) return;
        setMyStatus(status);
        await supabase.from('study_room_participants')
            .update({ status })
            .eq('room_id', activeRoom.id)
            .eq('user_id', currentUserId);
    };

    // ── Timer controls (creator only) ─────────────────────────────────────────

    const startTimer = async () => {
        if (!activeRoom) return;
        await supabase.from('study_rooms').update({
            timer_started_at: new Date().toISOString(),
            timer_paused_at: null,
        }).eq('id', activeRoom.id);
    };

    const pauseTimer = async () => {
        if (!activeRoom) return;
        const elapsed = getElapsedSeconds(activeRoom);
        await supabase.from('study_rooms').update({
            timer_paused_at: new Date().toISOString(),
            timer_elapsed_seconds: elapsed,
        }).eq('id', activeRoom.id);
    };

    const resetTimer = async () => {
        if (!activeRoom) return;
        await supabase.from('study_rooms').update({
            timer_started_at: null,
            timer_paused_at: null,
            timer_elapsed_seconds: 0,
        }).eq('id', activeRoom.id);
    };

    const isCreator = activeRoom?.creator_id === currentUserId;

    // ─────────────────────────────────────────────────────────────────────────
    // Render: In-Room View
    // ─────────────────────────────────────────────────────────────────────────

    if (activeRoom) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{activeRoom.name}</h1>
                        {activeRoom.subject && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{activeRoom.subject}</p>
                        )}
                        {activeRoom.description && (
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{activeRoom.description}</p>
                        )}
                    </div>
                    <button
                        onClick={leaveRoom}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave
                    </button>
                </div>

                {/* Timer Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col items-center gap-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
                        <Timer className="w-4 h-4" />
                        <span>{activeRoom.timer_minutes}-minute Pomodoro</span>
                    </div>

                    <CircularTimer room={activeRoom} />

                    {/* Timer controls — creator only */}
                    {isCreator ? (
                        <div className="flex items-center gap-3">
                            {!isTimerRunning(activeRoom) ? (
                                <button onClick={startTimer}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm">
                                    <Play className="w-4 h-4" />
                                    {activeRoom.timer_elapsed_seconds > 0 || activeRoom.timer_paused_at ? 'Resume' : 'Start'}
                                </button>
                            ) : (
                                <button onClick={pauseTimer}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors shadow-sm">
                                    <Pause className="w-4 h-4" />
                                    Pause
                                </button>
                            )}
                            <button onClick={resetTimer}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Timer is controlled by the room creator
                        </p>
                    )}
                </div>

                {/* My Status */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">My Status</p>
                    <div className="flex flex-wrap gap-2">
                        {(['Studying', 'On break', 'Done'] as ParticipantStatus[]).map(s => (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    myStatus === s
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Participants */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participants ({participants.length})
                    </p>
                    {participants.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-zinc-500">No participants yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {participants.map(p => (
                                <div key={p.id} className="flex items-center gap-3">
                                    {p.profiles?.avatar_url ? (
                                        <img src={p.profiles.avatar_url} alt={p.profiles.name}
                                            className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                                {(p.profiles?.name || '?')[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                                {p.profiles?.name || 'Anonymous'}
                                            </p>
                                            {p.user_id === activeRoom.creator_id && (
                                                <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                            )}
                                            {p.user_id === currentUserId && (
                                                <span className="text-xs text-slate-400 dark:text-zinc-500">(you)</span>
                                            )}
                                        </div>
                                        {p.profiles?.university && (
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{p.profiles.university}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render: Rooms List
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Timer className="w-6 h-6 text-emerald-600" />
                        Study Rooms
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                        Focus together with Pomodoro timers
                    </p>
                </div>
                {currentUserId && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Room
                    </button>
                )}
            </div>

            {/* Rooms list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-16">
                    <Timer className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
                    <p className="text-slate-600 dark:text-zinc-400 font-medium">No active study rooms</p>
                    <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">
                        {currentUserId ? 'Be the first to create one!' : 'Sign in to create a room.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rooms.map(room => {
                        const remaining = getRemainingSeconds(room);
                        const running = isTimerRunning(room);
                        const total = room.timer_minutes * 60;
                        const progress = 1 - remaining / total;

                        return (
                            <div key={room.id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start gap-4">
                                    {/* Mini ring */}
                                    <div className="relative w-14 h-14 flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                                            <circle cx="28" cy="28" r="22" fill="none"
                                                stroke="currentColor" strokeWidth="5"
                                                className="text-slate-100 dark:text-zinc-800" />
                                            <circle cx="28" cy="28" r="22" fill="none"
                                                stroke={running ? '#10b981' : '#94a3b8'}
                                                strokeWidth="5"
                                                strokeDasharray={2 * Math.PI * 22}
                                                strokeDashoffset={2 * Math.PI * 22 * (1 - progress)}
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-white leading-none">
                                                {formatTime(remaining)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{room.name}</h3>
                                                {room.subject && (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">{room.subject}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {running && (
                                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Live
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{room.participant_count ?? 0} studying</span>
                                                <span className="mx-1.5 text-slate-300 dark:text-zinc-600">·</span>
                                                <Timer className="w-3.5 h-3.5" />
                                                <span>{room.timer_minutes} min</span>
                                            </div>

                                            {currentUserId ? (
                                                <button
                                                    onClick={() => joinRoom(room)}
                                                    disabled={joining === room.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                                                >
                                                    {joining === room.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : 'Join'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-zinc-500">Sign in to join</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Study Room</h2>
                            <button onClick={() => setShowCreate(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                                    Room Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={newRoom.name}
                                    onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Late night MCQ grind"
                                    maxLength={80}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Subject</label>
                                <input
                                    value={newRoom.subject}
                                    onChange={e => setNewRoom(p => ({ ...p, subject: e.target.value }))}
                                    placeholder="e.g. Organic Chemistry"
                                    maxLength={60}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Pomodoro Duration</label>
                                <div className="flex gap-3">
                                    {([25, 50] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setNewRoom(p => ({ ...p, timer_minutes: m }))}
                                            className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                                                newRoom.timer_minutes === m
                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            {m} min
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">
                                    {newRoom.timer_minutes === 25 ? 'Classic Pomodoro — 25 min focus' : 'Deep work session — 50 min focus'}
                                </p>
                            </div>
                            <button
                                onClick={handleCreateRoom}
                                disabled={creating || !newRoom.name.trim()}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {creating ? 'Creating…' : 'Create & Join'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
