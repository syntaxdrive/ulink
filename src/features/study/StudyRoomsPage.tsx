import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Users, Plus, LogOut, X, Loader2, BookOpen, Coffee, CheckCircle2,
    MessageCircle, FileText, BarChart2, Send, ChevronDown,
    Crown, Trash2, Link2, ToggleRight, BookMarked, Bot, PenTool, type LucideIcon,
} from 'lucide-react';

// const AI_API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;
// const _AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL as string || 'https://api.groq.com/openai/v1';
// const _AI_MODEL = import.meta.env.VITE_AI_MODEL as string || 'llama-3.3-70b-versatile';

async function askAI(_question: string, _context: string): Promise<string> {
    return '🤖 *UniLink AI Assistant is currently cooking...* 🚀\n\nThis feature is coming soon to help you and your study group with questions, summaries, and explanations!';
}

async function uploadFileForRoom(file: File): Promise<string> {
    // Primary: Supabase Storage (fast, no CORS issues)
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `study-room-files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    if (!error) {
        return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
    }
    // Fallback: Cloudinary
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) throw new Error('Upload failed — storage not configured');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);
    fd.append('resource_type', 'auto');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ParticipantStatus = 'Here' | 'On break' | 'Done';
type Tab = 'chat' | 'board' | 'docs' | 'polls' | 'people';
type TabDef = { id: Tab; label: string; icon: LucideIcon; badge?: number };

interface StudyRoom {
    id: string; creator_id: string; name: string; subject: string | null;
    description: string | null; is_active: boolean; created_at: string;
    participant_count?: number; is_private?: boolean;
}
interface Participant {
    id: string; room_id: string; user_id: string; status: ParticipantStatus;
    profiles?: { name: string; username: string; avatar_url: string | null; university: string | null; };
}
interface RoomMessage {
    id: string; room_id: string; user_id: string; content: string; created_at: string;
    profiles?: { name: string; avatar_url: string | null; };
    isAI?: boolean; // client-only flag for AI messages
}
interface RoomDocument {
    id: string; room_id: string; shared_by: string; title: string;
    content: string; doc_url: string | null; is_active: boolean; created_at: string;
    profiles?: { name: string; };
}
interface PollOption { id: string; text: string; }
interface RoomPoll {
    id: string; room_id: string; created_by: string; question: string;
    options: PollOption[]; is_active: boolean; created_at: string;
}
interface PollVote { poll_id: string; user_id: string; option_id: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
}

function Avatar({ src, name, size = 8 }: { src?: string | null; name?: string; size?: number }) {
    const cls = `w-${size} h-${size} rounded-full object-cover flex-shrink-0`;
    if (src) return <img src={src} className={cls} alt={name || ''} />;
    return (
        <div className={`${cls} bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center`}>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {(name || '?')[0].toUpperCase()}
            </span>
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ParticipantStatus }) {
    const cfg: Record<ParticipantStatus, { icon: LucideIcon; color: string }> = {
        'Here':     { icon: BookOpen,    color: 'bg-emerald-100 text-emerald-700' },
        'On break': { icon: Coffee,      color: 'bg-amber-100 text-amber-700' },
        'Done':     { icon: CheckCircle2, color: 'bg-blue-100 text-blue-700' },
    };
    const { icon: Icon, color } = cfg[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />{status}
        </span>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState<string | null>(null);
    const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [myStatus, setMyStatus] = useState<ParticipantStatus>('Here');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState<string | null>(null);
    const [newRoom, setNewRoom] = useState({ name: '', subject: '', description: '', is_private: false });
    const [tab, setTab] = useState<Tab>('chat');

    // Chat
    const [messages, setMessages] = useState<RoomMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sending, setSending] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Docs
    const [docs, setDocs] = useState<RoomDocument[]>([]);
    const [showDocForm, setShowDocForm] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', content: '', doc_url: '' });
    const [savingDoc, setSavingDoc] = useState(false);
    const [openDocId, setOpenDocId] = useState<string | null>(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const docFileRef = useRef<HTMLInputElement>(null);

    // Polls
    const [polls, setPolls] = useState<RoomPoll[]>([]);
    const [votes, setVotes] = useState<PollVote[]>([]);
    const [showPollForm, setShowPollForm] = useState(false);
    const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
    const [savingPoll, setSavingPoll] = useState(false);
    const [voting, setVoting] = useState<string | null>(null);

    // ── Auth ─────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUid(data.user?.id || null));
    }, []);

    // ── Rooms list ────────────────────────────────────────────────────────
    const fetchRooms = useCallback(async () => {
        // Fetch active rooms then participant counts (filtered to active rooms only)
        const { data: roomsData } = await supabase
            .from('study_rooms')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!roomsData) { setLoading(false); return; }

        const roomIds = roomsData.map((r: StudyRoom) => r.id);
        const { data: pcData } = roomIds.length
            ? await supabase.from('study_room_participants').select('room_id, user_id').in('room_id', roomIds)
            : { data: [] };

        const counts: Record<string, number> = {};
        const myRooms = new Set<string>();
        (pcData || []).forEach((p: { room_id: string; user_id: string }) => { 
            counts[p.room_id] = (counts[p.room_id] || 0) + 1; 
            if (p.user_id === uid) myRooms.add(p.room_id);
        });

        // Filter out private rooms unless I am a participant or creator
        const visibleRooms = roomsData.filter((r: StudyRoom) => !r.is_private || r.creator_id === uid || myRooms.has(r.id));

        setRooms(visibleRooms.map((r: StudyRoom) => ({ ...r, participant_count: counts[r.id] || 0 })));
        setLoading(false);
    }, [uid]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    useEffect(() => {
        const ch = supabase.channel('rooms_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, fetchRooms)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_participants' }, fetchRooms)
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [fetchRooms]);

    // ── In-room fetchers ──────────────────────────────────────────────────
    const fetchParticipants = useCallback(async (rid: string) => {
        const { data: list } = await supabase.from('study_room_participants').select('*').eq('room_id', rid);
        if (!list?.length) { setParticipants([]); return; }
        const uids = [...new Set(list.map(p => p.user_id))];
        const { data: prfs } = await supabase.from('profiles').select('id, name, username, avatar_url, university').in('id', uids);
        const map = Object.fromEntries(prfs?.map(p => [p.id, p]) || []);
        const data = list.map(p => ({ ...p, profiles: map[p.user_id] || { name: 'User', avatar_url: null } }));
        setParticipants(data);
        if (uid) { const m = data.find((p: Participant) => p.user_id === uid); if (m) setMyStatus(m.status); }
    }, [uid]);

    const fetchMessages = useCallback(async (rid: string) => {
        const { data: list } = await supabase.from('study_room_messages').select('*').eq('room_id', rid).order('created_at').limit(200);
        if (!list) return;
        const uids = [...new Set(list.map(m => m.user_id))];
        const { data: prfs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', uids);
        const map = Object.fromEntries(prfs?.map(p => [p.id, p]) || []);
        const data = list.map(m => ({ ...m, profiles: map[m.user_id] || { name: 'User', avatar_url: null } }));
        setMessages(prev => {
            const aiMessages = prev.filter(m => m.isAI);
            const combined = [...data, ...aiMessages];
            return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
    }, []);

    const fetchDocs = useCallback(async (rid: string) => {
        const { data: list } = await supabase.from('study_room_documents').select('*').eq('room_id', rid).eq('is_active', true).order('created_at', { ascending: false });
        if (!list) return;
        const uids = [...new Set(list.map(d => d.shared_by))];
        const { data: prfs } = await supabase.from('profiles').select('id, name').in('id', uids);
        const map = Object.fromEntries(prfs?.map(p => [p.id, p]) || []);
        const data = list.map(d => ({ ...d, profiles: map[d.shared_by] || { name: 'User' } }));
        setDocs(data);
    }, []);

    const fetchPolls = useCallback(async (rid: string) => {
        const { data } = await supabase.from('study_room_polls').select('*').eq('room_id', rid).order('created_at', { ascending: false });
        setPolls(data || []);
    }, []);

    const fetchVotes = useCallback(async (pollIds: string[]) => {
        if (!pollIds.length) return;
        const { data } = await supabase.from('study_room_poll_votes').select('*').in('poll_id', pollIds);
        setVotes(data || []);
    }, []);

    useEffect(() => {
        if (polls.length) fetchVotes(polls.map(p => p.id));
    }, [polls, fetchVotes]);

    // ── In-room realtime ──────────────────────────────────────────────────
    useEffect(() => {
        if (!activeRoom) return;
        const rid = activeRoom.id;
        fetchParticipants(rid); fetchMessages(rid); fetchDocs(rid); fetchPolls(rid);
        const ch = supabase.channel(`room_${rid}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_participants', filter: `room_id=eq.${rid}` }, () => fetchParticipants(rid))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_room_messages', filter: `room_id=eq.${rid}` }, () => fetchMessages(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_documents', filter: `room_id=eq.${rid}` }, () => fetchDocs(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_polls', filter: `room_id=eq.${rid}` }, () => fetchPolls(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_poll_votes' }, () => fetchVotes(polls.map(p => p.id)))
            .subscribe();

        // Fallback polling for message updates so chat doesn't get stuck
        const poll = setInterval(() => { fetchMessages(rid); }, 5000);

        return () => { 
            supabase.removeChannel(ch); 
            clearInterval(poll);
        };
    }, [activeRoom?.id]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // ── Create / Join / Leave ─────────────────────────────────────────────
    const handleCreate = async () => {
        if (!uid || !newRoom.name.trim()) return;
        setCreating(true);
        try {
            const { data, error } = await supabase.from('study_rooms').insert({
                creator_id: uid, name: newRoom.name.trim(),
                subject: newRoom.subject.trim() || null,
                description: newRoom.description.trim() || null,
                is_private: newRoom.is_private,
            }).select().single();
            if (error) throw error;
            await supabase.from('study_room_participants').insert({ room_id: data.id, user_id: uid, status: 'Here' });
            setShowCreate(false);
            setNewRoom({ name: '', subject: '', description: '', is_private: false });
            setActiveRoom(data);
            setTab('chat');
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const joinRoom = async (room: StudyRoom) => {
        if (!uid) return;
        setJoining(room.id);
        try {
            await supabase.from('study_room_participants').upsert(
                { room_id: room.id, user_id: uid, status: 'Here' }, { onConflict: 'room_id,user_id' }
            );
            setActiveRoom(room); setTab('chat');
        } finally { setJoining(null); }
    };

    const leaveRoom = async () => {
        if (!uid || !activeRoom) return;
        await supabase.from('study_room_participants').delete().eq('room_id', activeRoom.id).eq('user_id', uid);
        setActiveRoom(null); setParticipants([]); setMessages([]); setDocs([]); setPolls([]); setVotes([]);
        fetchRooms();
    };

    const deleteRoom = async () => {
        if (!uid || !activeRoom) return;
        if (!window.confirm('Are you sure you want to delete this study room for everyone?')) return;
        
        await supabase.from('study_rooms').update({ is_active: false }).eq('id', activeRoom.id);
        setActiveRoom(null); setParticipants([]); setMessages([]); setDocs([]); setPolls([]); setVotes([]);
        fetchRooms();
    };

    const isHost = activeRoom?.creator_id === uid;

    // ── Status ────────────────────────────────────────────────────────────
    const updateStatus = (s: ParticipantStatus) => {
        if (!uid || !activeRoom) return;
        setMyStatus(s);
        supabase.from('study_room_participants').update({ status: s }).eq('room_id', activeRoom.id).eq('user_id', uid);
    };

    // ── Chat ──────────────────────────────────────────────────────────────
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !uid || !activeRoom || sending) return;
        setSending(true);
        const c = chatInput.trim(); setChatInput('');
        const clientMsg: RoomMessage = {
            id: crypto.randomUUID(),
            room_id: activeRoom.id,
            user_id: uid,
            content: c,
            created_at: new Date().toISOString(),
            profiles: participants.find(p => p.user_id === uid)?.profiles || { name: 'Me', avatar_url: null }
        };

        // Append locally instantly so user feels instant updates
        setMessages(prev => [...prev, clientMsg]);
        setSending(false);

        const { error } = await supabase.from('study_room_messages').insert({
            id: clientMsg.id,
            room_id: clientMsg.room_id,
            user_id: clientMsg.user_id,
            content: clientMsg.content
        });

        if (error) {
            console.error('Chat error:', error);
            // alert('Failed to broadcast message: ' + error.message);
        }

        // AI assistant: triggered by @AI prefix
        const aiMatch = c.match(/^@AI\s+(.+)/i);
        if (aiMatch) {
            setAiThinking(true);
            const question = aiMatch[1];
            const context = `Room: ${activeRoom.name}${activeRoom.subject ? `, Subject: ${activeRoom.subject}` : ''}`;
            try {
                const reply = await askAI(question, context);
                // Inject as a client-only AI message (not stored in DB)
                const aiMsg: RoomMessage = {
                    id: `ai_${Date.now()}`,
                    room_id: activeRoom.id,
                    user_id: 'ai',
                    content: reply,
                    created_at: new Date().toISOString(),
                    profiles: { name: 'UniLink AI', avatar_url: null },
                    isAI: true,
                };
                setMessages(prev => [...prev, aiMsg]);
            } finally {
                setAiThinking(false);
            }
        }
    };

    // ── Documents ─────────────────────────────────────────────────────────
    const saveDoc = async () => {
        if (!uid || !activeRoom || !newDoc.title.trim()) return;
        setSavingDoc(true);
        await supabase.from('study_room_documents').insert({
            id: crypto.randomUUID(),
            room_id: activeRoom.id, shared_by: uid, title: newDoc.title.trim(),
            content: newDoc.content.trim(), doc_url: newDoc.doc_url.trim() || null,
        });
        setNewDoc({ title: '', content: '', doc_url: '' }); setShowDocForm(false); setSavingDoc(false);
    };

    // ── Polls ─────────────────────────────────────────────────────────────
    const savePoll = async () => {
        if (!uid || !activeRoom || !newPoll.question.trim()) return;
        const valid = newPoll.options.filter(o => o.trim());
        if (valid.length < 2) return;
        setSavingPoll(true);
        const options: PollOption[] = valid.map((text, i) => ({ id: `o${i}`, text }));
        await supabase.from('study_room_polls').insert({
            id: crypto.randomUUID(),
            room_id: activeRoom.id, created_by: uid, question: newPoll.question.trim(), options
        });
        setNewPoll({ question: '', options: ['', ''] }); setShowPollForm(false); setSavingPoll(false);
    };

    const castVote = async (pollId: string, optId: string) => {
        if (!uid || voting) return;
        setVoting(pollId);
        const existing = votes.find(v => v.poll_id === pollId && v.user_id === uid);
        if (existing) await supabase.from('study_room_poll_votes').delete().eq('poll_id', pollId).eq('user_id', uid);
        await supabase.from('study_room_poll_votes').insert({ poll_id: pollId, user_id: uid, option_id: optId });
        await fetchVotes(polls.map(p => p.id));
        setVoting(null);
    };

    // ─────────────────────────────────────────────────────────────────────
    // IN-ROOM VIEW
    // ─────────────────────────────────────────────────────────────────────
    if (activeRoom) {
        const tabs: TabDef[] = [
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'board', label: 'Board', icon: PenTool },
            { id: 'docs', label: 'Docs', icon: FileText, badge: docs.length || undefined },
            { id: 'polls', label: 'Polls', icon: BarChart2, badge: polls.filter(p => p.is_active).length || undefined },
            { id: 'people', label: 'People', icon: Users, badge: participants.length || undefined },
        ];

        return (
            <div className="flex flex-col flex-1 h-full min-h-[calc(100dvh-5rem)]">
                <div className="w-full h-full p-2 md:p-3 flex flex-col flex-1 min-h-0 gap-3">
                    {/* ── Room Header ── */}
                    <div className="px-5 pt-5 pb-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex-shrink-0 mb-2 rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate leading-tight">{activeRoom.name}</h1>
                                {activeRoom.is_private && <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">PRIVATE</span>}
                                {isHost && (
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                        <Crown className="w-2.5 h-2.5" />HOST
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {activeRoom.subject && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{activeRoom.subject}</span>}
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    {participants.length} live
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/app/study?room=${activeRoom.id}`;
                                    navigator.clipboard.writeText(link);
                                    alert('Invite link copied to clipboard!');
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium text-xs rounded-xl transition-colors"
                            >
                                <Link2 className="w-4 h-4" /> <span className="hidden sm:inline">Invite</span>
                            </button>
                            {/* Status pill */}
                            <div className="relative">
                                <select
                                    value={myStatus}
                                    onChange={e => updateStatus(e.target.value as ParticipantStatus)}
                                    className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                >
                                    <option value="Here">📚 Here</option>
                                    <option value="On break">☕ Break</option>
                                    <option value="Done">✅ Done</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                            {isHost && (
                                <button
                                    onClick={deleteRoom}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span className="hidden sm:inline">Delete</span>
                                </button>
                            )}
                            <button
                                onClick={leaveRoom}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <LogOut className="w-3 h-3" />
                                <span className="hidden sm:inline">Leave</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex gap-1 mt-3 bg-slate-100 dark:bg-zinc-800 rounded-xl p-1">
                        {tabs.map(({ id, label, icon: Icon, badge }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                                    tab === id
                                        ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{label}</span>
                                {badge != null && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content Container ── */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* ── CHAT ── */}
                    {tab === 'chat' && (
                        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-b-2xl border border-t-0 border-slate-100 dark:border-zinc-800">
                            {/* AI shortcut banner */}
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-50 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex-shrink-0">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Bot className="w-3 h-3 text-white dark:text-zinc-900" />
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ask the AI:</span>
                                {['Explain this topic', 'Quiz me', 'Summarize'].map(q => (
                                    <button key={q} onClick={() => setChatInput(`@AI ${q}`)} className="text-[10px] px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium transition-colors whitespace-nowrap flex-shrink-0">
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Messages area — bigger and more open */}
                            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-[300px]">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 py-12">
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-inner">
                                            <Bot className="w-10 h-10 text-emerald-600 dark:text-emerald-400 opacity-70" />
                                        </div>
                                        <div className="text-center max-w-xs">
                                            <p className="text-base font-semibold text-slate-600 dark:text-zinc-300 mb-1">Start the conversation</p>
                                            <p className="text-sm text-slate-400 dark:text-zinc-500">Say hi 👋 or tap a shortcut above to ask the AI</p>
                                        </div>
                                    </div>
                                ) : messages.map((msg, i) => {
                                    const isMe = msg.user_id === uid;
                                    const isAI = msg.isAI === true;
                                    const showName = !isMe && !isAI && (!messages[i - 1] || messages[i - 1].user_id !== msg.user_id);

                                    if (isAI) return (
                                        <div key={msg.id} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                            <div className="w-9 h-9 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                                                <Bot className="w-4 h-4 text-white dark:text-zinc-900" />
                                            </div>
                                            <div className="max-w-[88%] min-w-0 flex flex-col gap-1.5 items-start">
                                                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 px-1 flex items-center gap-1">
                                                    UniLink AI
                                                </span>
                                                <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 whitespace-pre-wrap break-words overflow-hidden leading-relaxed shadow-sm max-w-full">
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-slate-400 px-1">{timeAgo(msg.created_at)}</span>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div key={msg.id} className={`flex gap-2.5 group/msg ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {!isMe && (
                                                <div className="flex-shrink-0 self-end">
                                                    <Avatar src={msg.profiles?.avatar_url} name={msg.profiles?.name} size={8} />
                                                </div>
                                            )}
                                            <div className={`max-w-[75%] min-w-0 flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                {showName && (
                                                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 px-1 font-medium">
                                                        {msg.profiles?.name || 'Anonymous'}
                                                    </span>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words overflow-hidden max-w-full ${
                                                    isMe
                                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
                                                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-tl-sm border border-slate-100 dark:border-zinc-700'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 px-1">{timeAgo(msg.created_at)}</span>
                                                    {isMe && !msg.isAI && (
                                                        <button
                                                            onClick={async () => { await supabase.from('study_room_messages').delete().eq('id', msg.id); setMessages(prev => prev.filter(m => m.id !== msg.id)); }}
                                                            className="opacity-0 group-hover/msg:opacity-100 p-0.5 text-slate-300 hover:text-red-500 transition-all"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* AI typing indicator */}
                                {aiThinking && (
                                    <div className="flex gap-3 animate-in fade-in duration-200">
                                        <div className="w-9 h-9 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <Bot className="w-4 h-4 text-white dark:text-zinc-900" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 px-1">UniLink AI is thinking…</span>
                                            <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.18}s`, animationDuration: '1s' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input bar — larger, always visible @AI tip */}
                            <div className="flex-shrink-0 px-3 pb-4 pt-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-2xl space-y-2">
                                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                                    <div className="flex-1 relative">
                                        <input
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Type a message…"
                                            maxLength={500}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow pr-12"
                                        />
                                        {chatInput.startsWith('@AI') && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-500 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded-full">AI</span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || sending || aiThinking}
                                        className="w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white disabled:opacity-40 transition-all flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex-shrink-0"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                                <p className="text-[11px] text-center text-slate-400 dark:text-zinc-600">
                                    Type <button onClick={() => setChatInput('@AI ')} className="font-mono text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-bold">@AI</button> before your question to get an instant answer
                                </p>
                            </div>
                        </div>
                    )}

                {/* ── BOARD ── */}
                {tab === 'board' && (() => {
                    // Excalidraw collab URL format: #room=<20hex>,<22base64key>
                    // Both values are derived deterministically from the study room UUID
                    // so every participant always connects to the same persistent board.
                    const hex = activeRoom.id.replace(/-/g, '');          // 32 hex chars
                    const boardRoomId = hex.slice(0, 20);                  // 20 char room id
                    const boardKey = btoa(hex.slice(10, 26)).slice(0, 22); // 22 char key
                    const excalidrawUrl = `https://excalidraw.com/#room=${boardRoomId},${boardKey}`;
                    return (
                        <div className="flex-1 w-full flex flex-col overflow-hidden rounded-b-2xl min-h-[500px]">
                            {/* Board header */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <PenTool className="w-4 h-4 text-violet-500" />
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">Collaborative Whiteboard</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">Live</span>
                                </div>
                                <a
                                    href={excalidrawUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
                                >
                                    Open full screen ↗
                                </a>
                            </div>
                            {/* Excalidraw embed */}
                            <div className="flex-1 relative overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950">
                                <iframe
                                    src={excalidrawUrl}
                                    className="w-full h-full absolute inset-0 border-none"
                                    title="Collaborative Whiteboard"
                                    allow="clipboard-read; clipboard-write"
                                />
                            </div>
                        </div>
                    );
                })()}

                {/* ── DOCS ── */}
                {tab === 'docs' && (
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {!showDocForm && (
                                <button
                                    onClick={() => setShowDocForm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />Share a Document
                                </button>
                            )}

                            {showDocForm && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-slate-800 dark:text-white">Share Document</span>
                                        <button onClick={() => { setShowDocForm(false); setNewDoc({ title: '', content: '', doc_url: '' }); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>

                                    {/* File upload area */}
                                    <div
                                        onClick={() => docFileRef.current?.click()}
                                        className="relative cursor-pointer border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors bg-slate-50 dark:bg-zinc-800/50"
                                    >
                                        <FileText className="w-6 h-6 text-slate-400" />
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">
                                            {uploadingDoc ? 'Uploading…' : 'Tap to upload a file (PDF, DOC, PPTX…)'}
                                        </p>
                                        {newDoc.doc_url && (
                                            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-full">✓ File uploaded</p>
                                        )}
                                        <input
                                            ref={docFileRef}
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.md,.key,.pages,.numbers,image/*,video/*,audio/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploadingDoc(true);
                                                try {
                                                    const url = await uploadFileForRoom(file);
                                                    setNewDoc(p => ({
                                                        ...p,
                                                        doc_url: url,
                                                        title: p.title || file.name.replace(/\.[^.]+$/, ''),
                                                    }));
                                                } catch (err) {
                                                    alert('Upload failed. Please try a link instead.');
                                                } finally {
                                                    setUploadingDoc(false);
                                                    if (docFileRef.current) docFileRef.current.value = '';
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
                                        <span className="text-[10px] text-slate-400 font-medium">or paste a link</span>
                                        <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
                                    </div>

                                    <input
                                        value={newDoc.title}
                                        onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Title *"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <input
                                            value={newDoc.doc_url}
                                            onChange={e => setNewDoc(p => ({ ...p, doc_url: e.target.value }))}
                                            placeholder="External link (Google Doc, PDF URL…)"
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <textarea
                                        value={newDoc.content}
                                        onChange={e => setNewDoc(p => ({ ...p, content: e.target.value }))}
                                        placeholder="Optional notes / description…"
                                        rows={2}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                    <button
                                        onClick={saveDoc}
                                        disabled={savingDoc || uploadingDoc || !newDoc.title.trim()}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileText className="w-4 h-4" />Share to Room</>}
                                    </button>
                                </div>
                            )}

                            {!showDocForm && docs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <FileText className="w-8 h-8 opacity-30" />
                                    </div>
                                    <p className="text-sm text-center">No documents shared yet. Tap the button above to share one.</p>
                                </div>
                            )}

                            {docs.map(doc => (
                                <div key={doc.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.title}</p>
                                            <p className="text-xs text-slate-400">by {doc.profiles?.name || 'Host'} · {timeAgo(doc.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {doc.doc_url && (
                                                <a href={doc.doc_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-emerald-600 transition-colors">
                                                    <Link2 className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button onClick={() => setOpenDocId(openDocId === doc.id ? null : doc.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors">
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDocId === doc.id ? 'rotate-180' : ''}`} />
                                            </button>
                                            {doc.shared_by === uid && (
                                                <button onClick={() => supabase.from('study_room_documents').update({ is_active: false }).eq('id', doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {openDocId === doc.id && doc.content && (
                                        <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-zinc-800/60 max-h-64 overflow-y-auto text-xs leading-relaxed">
                                            {doc.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── POLLS ── */}
                    {tab === 'polls' && (
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {isHost && !showPollForm && (
                                <button
                                    onClick={() => setShowPollForm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />Create Poll
                                </button>
                            )}

                            {isHost && showPollForm && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-slate-800 dark:text-white">New Poll</span>
                                        <button onClick={() => setShowPollForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <input
                                        value={newPoll.question}
                                        onChange={e => setNewPoll(p => ({ ...p, question: e.target.value }))}
                                        placeholder="Question *"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <div className="space-y-2">
                                        {newPoll.options.map((opt, i) => (
                                            <input key={i} value={opt}
                                                onChange={e => { const o = [...newPoll.options]; o[i] = e.target.value; setNewPoll(p => ({ ...p, options: o })); }}
                                                placeholder={`Option ${i + 1}`}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        ))}
                                    </div>
                                    {newPoll.options.length < 5 && (
                                        <button onClick={() => setNewPoll(p => ({ ...p, options: [...p.options, ''] }))} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                                            + Add option
                                        </button>
                                    )}
                                    <button
                                        onClick={savePoll}
                                        disabled={savingPoll || !newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {savingPoll ? <Loader2 className="w-4 h-4 animate-spin" /> : <><BarChart2 className="w-4 h-4" />Launch Poll</>}
                                    </button>
                                </div>
                            )}

                            {polls.length === 0 && !showPollForm && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <BarChart2 className="w-8 h-8 opacity-30" />
                                    </div>
                                    <p className="text-sm">{isHost ? 'Create a poll to get opinions.' : 'No polls yet.'}</p>
                                </div>
                            )}

                            {polls.map(poll => {
                                const myVote = votes.find(v => v.poll_id === poll.id && v.user_id === uid);
                                const total = votes.filter(v => v.poll_id === poll.id).length;
                                return (
                                    <div key={poll.id} className={`bg-white dark:bg-zinc-900 rounded-2xl border p-4 space-y-3 shadow-sm transition-opacity ${poll.is_active ? 'border-emerald-200 dark:border-emerald-800/50' : 'border-slate-200 dark:border-zinc-800 opacity-60'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${poll.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                                                    {poll.is_active ? '● Live' : 'Closed'}
                                                </span>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">{poll.question}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{total} vote{total !== 1 ? 's' : ''}</p>
                                            </div>
                                            {isHost && (
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {poll.is_active && (
                                                        <button onClick={() => supabase.from('study_room_polls').update({ is_active: false }).eq('id', poll.id).then(() => fetchPolls(activeRoom.id))} className="p-1.5 text-emerald-500 hover:text-slate-400 transition-colors" title="Close poll">
                                                            <ToggleRight className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button onClick={async () => { await supabase.from('study_room_poll_votes').delete().eq('poll_id', poll.id); await supabase.from('study_room_polls').delete().eq('id', poll.id); setPolls(prev => prev.filter(p => p.id !== poll.id)); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Delete poll">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {poll.options.map(opt => {
                                                const count = votes.filter(v => v.poll_id === poll.id && v.option_id === opt.id).length;
                                                const pct = total ? Math.round((count / total) * 100) : 0;
                                                const isChosen = myVote?.option_id === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        disabled={!poll.is_active || !!voting}
                                                        onClick={() => poll.is_active && castVote(poll.id, opt.id)}
                                                        className={`w-full text-left rounded-xl border overflow-hidden transition-all ${isChosen ? 'border-emerald-500 dark:border-emerald-600' : 'border-slate-200 dark:border-zinc-700'} ${poll.is_active ? 'hover:border-emerald-400 cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
                                                    >
                                                        <div className="relative px-3 py-2.5">
                                                            <div
                                                                className={`absolute inset-0 transition-all duration-500 ${isChosen ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-zinc-800/40'}`}
                                                                style={{ width: (myVote || !poll.is_active) ? `${pct}%` : '0%' }}
                                                            />
                                                            <div className="relative flex items-center justify-between gap-2">
                                                                <span className={`text-sm font-medium ${isChosen ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-zinc-300'}`}>{opt.text}</span>
                                                                {(myVote || !poll.is_active) && (
                                                                    <span className="text-xs font-bold text-slate-400 flex-shrink-0">{pct}%</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── PEOPLE ── */}
                    {tab === 'people' && (
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                            {participants.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <Users className="w-8 h-8 opacity-30" />
                                    </div>
                                    <p className="text-sm">No participants yet.</p>
                                </div>
                            ) : participants.map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:shadow-sm transition-shadow">
                                    <div className="relative flex-shrink-0">
                                        <Avatar src={p.profiles?.avatar_url} name={p.profiles?.name} size={10} />
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{p.profiles?.name || 'Anonymous'}</p>
                                            {p.user_id === activeRoom.creator_id && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                                            {p.user_id === uid && <span className="text-[10px] text-slate-400 font-medium">(you)</span>}
                                        </div>
                                        {p.profiles?.university && <p className="text-xs text-slate-400 truncate">{p.profiles.university}</p>}
                                    </div>
                                    <StatusBadge status={p.status} />
                                </div>
                            ))}
                    </div>
                )}
                </div>
            </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // ROOMS LIST
    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 flex items-center gap-2.5">
                        <BookMarked className="w-8 h-8 text-emerald-500" />
                        Live Study Rooms
                    </h1>
                    <p className="text-sm mt-1.5 text-slate-500 dark:text-zinc-400 max-w-lg">
                        Join a collaborative session. Chat with peers, ask the AI assistant, share notes, and run polls.
                    </p>
                </div>
                {uid && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/40"
                    >
                        <Plus className="w-4 h-4" />New Room
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-sm font-medium text-slate-400">Loading rooms...</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 px-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-5">
                        <BookMarked className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No active study rooms right now</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                        {uid ? 'Be the first to create one! Start a session for your course or a general topics like LeetCode.' : 'Sign in to create a room and start studying together.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rooms.map(room => (
                        <div key={room.id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all flex flex-col h-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            <div className="flex items-start gap-4 mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                    <BookMarked className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{room.name}</h3>
                                    {room.subject && (
                                        <div className="inline-flex mt-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider truncate max-w-full">
                                            {room.subject}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {room.description && (
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 mb-4 line-clamp-2 flex-grow">{room.description}</p>
                            )}
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                                    <span className="relative flex h-2 w-2 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    {room.participant_count ?? 0} {room.participant_count === 1 ? 'person' : 'people'}
                                </div>
                                {uid ? (
                                    <button
                                        onClick={() => joinRoom(room)}
                                        disabled={joining === room.id}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-xs transition-colors disabled:opacity-60 flex-shrink-0 ${room.creator_id === uid ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:text-zinc-300 text-slate-700'}`}
                                    >
                                        {joining === room.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (room.creator_id === uid ? 'Enter Your Room' : 'Join Room')}
                                    </button>
                                ) : (
                                    <span className="text-xs font-medium text-slate-400">Sign in to join</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE ROOM MODAL */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ zIndex: 99999 }}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCreate(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        {/* Mobile drag handle */}
                        <div className="w-full h-1.5 flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full" />
                        </div>
                        
                        <div className="flex items-center justify-between px-5 pt-4 sm:pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Room</h2>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Start a collaborative study space</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors bg-slate-50 dark:bg-zinc-800/50">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Room Name <span className="text-emerald-500">*</span></label>
                                <input value={newRoom.name} onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Final exam prep — Biochem 301" maxLength={80} autoFocus
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Subject / Topic</label>
                                <input value={newRoom.subject} onChange={e => setNewRoom(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Organic Chemistry" maxLength={60}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                                <textarea value={newRoom.description} onChange={e => setNewRoom(p => ({ ...p, description: e.target.value }))} placeholder="What are you studying? Any notes for participants…" maxLength={200} rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-shadow" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Private Room</p>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Hide from the public feed</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={newRoom.is_private} onChange={e => setNewRoom(p => ({ ...p, is_private: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <div className="pt-2">
                                <button onClick={handleCreate} disabled={creating || !newRoom.name.trim()}
                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]">
                                    {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : 'Create & Enter Room'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
