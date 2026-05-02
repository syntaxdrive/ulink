import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useUIStore } from '../../stores/useUIStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { useStudyRoomStore } from '../../stores/useStudyRoomStore';
import {
    Users, Plus, LogOut, X, Loader2, BookOpen, Coffee, CheckCircle2,
    MessageCircle, FileText, BarChart2, Send, ChevronDown, ChevronLeft,
    Crown, Trash2, Link2, ToggleRight, BookMarked, Bot, PenTool, Mic, Play, Pause, Lock, Unlock, EyeOff, GripHorizontal, List, CornerUpLeft, type LucideIcon,
} from 'lucide-react';

// const AI_API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;
// const _AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL as string || 'https://api.groq.com/openai/v1';
// const _AI_MODEL = import.meta.env.VITE_AI_MODEL as string || 'llama-3.3-70b-versatile';

async function askAI(_question: string, _context: string): Promise<string> {
    return '🤖 *UniLink AI Assistant is currently cooking...* 🚀\n\nThis feature is coming soon to help you and your study group with questions, summaries, and explanations!';
}

import { cloudinaryService } from '../../services/cloudinaryService';

async function uploadFileForRoom(file: File, userId?: string | null): Promise<string> {
    // Primary: Cloudinary (optimizes speed & serves via global CDN)
    if (cloudinaryService.isConfigured()) {
        try {
            const isImage = file.type.startsWith('image/');
            const isVideoOrAudio = file.type.startsWith('video/') || file.type.startsWith('audio/');
            
            if (isImage) {
                const res = await cloudinaryService.uploadImage(file, { folder: 'ulink/study-rooms/docs' });
                return res.secureUrl;
            } else if (isVideoOrAudio) {
                const res = await cloudinaryService.uploadVideo(file, { folder: 'ulink/study-rooms/audio' });
                return res.secureUrl;
            } else {
                const res = await cloudinaryService.uploadDocument(file, { folder: 'ulink/study-rooms/docs' });
                return res.secureUrl;
            }
        } catch (err) {
            console.warn('[Study Room Upload] Cloudinary failed, falling back to Supabase:', err);
        }
    }

    // Fallback: Supabase Storage
    const ext = file.name.split('.').pop() ?? 'bin';
    const ownerPath = userId ? `${userId}/` : '';
    const path = `${ownerPath}study-room-files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
    
    if (!error) {
        return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
    }
    
    throw new Error('Upload failed — please check your connection.');
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ParticipantStatus = 'Here' | 'On break' | 'Done';
type Tab = 'chat' | 'board' | 'structure' | 'docs' | 'polls' | 'people';
type TabDef = { id: Tab; label: string; icon: LucideIcon; badge?: number };

interface StudyRoom {
    id: string; creator_id: string; name: string; subject: string | null;
    description: string | null; is_active: boolean; created_at: string;
    participant_count?: number; is_private?: boolean; allow_drawing?: boolean;
}
interface VoiceNote {
    id: string; room_id: string; user_id: string; audio_url: string; x_pos: number; y_pos: number; created_at: string; title?: string | null;
    profiles?: { name: string; avatar_url: string | null; };
}
interface Participant {
    id: string; room_id: string; user_id: string; status: ParticipantStatus;
    profiles?: { name: string; username: string; avatar_url: string | null; university: string | null; };
}
interface RoomMessage {
    id: string; room_id: string; user_id: string; content: string; created_at: string;
    profiles?: { name: string; avatar_url: string | null; };
    reply_to_message_id?: string | null;
    mentions?: Array<{ type: 'all' } | { type: 'user'; user_id: string; username?: string }>;
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
interface RoomJoinRequest {
    id: string;
    room_id: string;
    requester_id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profiles?: { name: string; username: string; avatar_url: string | null };
}

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
    const { setImmersive } = useUIStore();
    const { currentTrack, isPlaying, toggleExpanded } = useAudioStore();
    const { rooms, setRooms, needsRefresh } = useStudyRoomStore();
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
    const [uid, setUid] = useState<string | null>(null);
    const [myJoinedRoomIds, setMyJoinedRoomIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (activeRoom) {
            setImmersive(true);
        } else {
            setImmersive(false);
        }
        return () => setImmersive(false);
    }, [activeRoom, setImmersive]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [joinRequests, setJoinRequests] = useState<RoomJoinRequest[]>([]);
    const [myJoinRequests, setMyJoinRequests] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});
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
    const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
    const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
    const queryHandledRef = useRef(false);
    const chatScrollRef = useRef<HTMLDivElement | null>(null);
    const isChatNearBottomRef = useRef(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

    // Board Voice Notes
    const [voicenotes, setVoicenotes] = useState<VoiceNote[]>([]);
    const [recordingVoice, setRecordingVoice] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const [draggingVnId, setDraggingVnId] = useState<string | null>(null);
    const dragStartRef = useRef<{ id: string | null; x: number; y: number; isDragging: boolean }>({
        id: null,
        x: 0,
        y: 0,
        isDragging: false,
    });
    const boardRef = useRef<HTMLDivElement>(null);

    // ── Auth ─────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUid(data.user?.id || null));
    }, []);

    // ── Rooms list ────────────────────────────────────────────────────────
    const fetchRooms = useCallback(async (isSilent = false) => {
        const cacheExists = useStudyRoomStore.getState().rooms.length > 0;
        if (!isSilent && !cacheExists) setLoading(true);

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
        setMyJoinedRoomIds(myRooms);

        // Keep private rooms visible so users can request to join.
        const visibleRooms = roomsData;

        setRooms(visibleRooms.map((r: StudyRoom) => ({ ...r, participant_count: counts[r.id] || 0 })));
        setLoading(false);
    }, [uid]);

    useEffect(() => { 
        if (needsRefresh() || rooms.length === 0) {
            void fetchRooms(); 
        } else {
            setLoading(false);
        }
    }, [fetchRooms]);

    useEffect(() => {
        const ch = supabase.channel('rooms_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, () => { void fetchRooms(); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_participants' }, () => { void fetchRooms(); })
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [fetchRooms]);

    useEffect(() => {
        if (queryHandledRef.current || activeRoom || !uid || !rooms.length) return;
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('room');
        const messageId = params.get('message');
        if (!roomId) {
            queryHandledRef.current = true;
            return;
        }

        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        queryHandledRef.current = true;
        if (messageId) {
            setTargetMessageId(messageId);
            setTab('chat');
        }

        const openFromQuery = async () => {
            try {
                await supabase.from('study_room_participants').upsert(
                    { room_id: room.id, user_id: uid, status: 'Here' },
                    { onConflict: 'room_id,user_id' }
                );
            } finally {
                setActiveRoom(room);
                setTab('chat');
            }
        };

        void openFromQuery();
    }, [rooms, activeRoom, uid]);

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

    const fetchMyJoinRequests = useCallback(async () => {
        if (!uid) return;
        const { data } = await supabase
            .from('study_room_join_requests')
            .select('room_id, status')
            .eq('requester_id', uid)
            .in('status', ['pending', 'approved', 'rejected']);
        const next: Record<string, 'pending' | 'approved' | 'rejected'> = {};
        (data || []).forEach((r: { room_id: string; status: 'pending' | 'approved' | 'rejected' }) => {
            next[r.room_id] = r.status;
        });
        setMyJoinRequests(next);
    }, [uid]);

    useEffect(() => {
        fetchMyJoinRequests();
        const ch = supabase.channel('my_room_join_requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_join_requests' }, fetchMyJoinRequests)
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [fetchMyJoinRequests]);

    const fetchJoinRequests = useCallback(async (rid: string) => {
        const { data: list } = await supabase
            .from('study_room_join_requests')
            .select('*')
            .eq('room_id', rid)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });
        const reqs = list || [];
        if (!reqs.length) {
            setJoinRequests([]);
            return;
        }

        const requesterIds = [...new Set(reqs.map(r => r.requester_id))];
        const { data: prfs } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .in('id', requesterIds);
        const map = Object.fromEntries((prfs || []).map((p: any) => [p.id, p]));
        setJoinRequests(reqs.map((r: any) => ({ ...r, profiles: map[r.requester_id] || { name: 'User', username: '', avatar_url: null } })));
    }, []);

    const requestJoinPrivateRoom = async (room: StudyRoom) => {
        if (!uid) return;
        const { data, error } = await supabase
            .from('study_room_join_requests')
            .upsert({ room_id: room.id, requester_id: uid, status: 'pending' }, { onConflict: 'room_id,requester_id' })
            .select('id')
            .single();
        if (error) {
            alert(`Request failed: ${error.message}`);
            return;
        }
        setMyJoinRequests(prev => ({ ...prev, [room.id]: 'pending' }));

        if (room.creator_id && room.creator_id !== uid) {
            const requesterName = participants.find(p => p.user_id === uid)?.profiles?.name || 'Someone';
            await sendStudyRoomNotification({
                recipientId: room.creator_id,
                senderId: uid,
                title: 'Study Room Join Request',
                message: `${requesterName} requested to join ${room.name}`,
                roomId: room.id,
                roomName: room.name,
                requestId: data?.id,
            });
        }

        alert('Join request sent to host.');
    };

    const handleJoinRequest = async (req: RoomJoinRequest, approve: boolean) => {
        if (!activeRoom || !isHost) return;
        const nextStatus = approve ? 'approved' : 'rejected';
        const { error } = await supabase
            .from('study_room_join_requests')
            .update({ status: nextStatus })
            .eq('id', req.id);
        if (error) {
            alert(`Could not ${approve ? 'approve' : 'reject'}: ${error.message}`);
            return;
        }
        if (approve) {
            await supabase.from('study_room_participants').upsert(
                { room_id: activeRoom.id, user_id: req.requester_id, status: 'Here' },
                { onConflict: 'room_id,user_id' }
            );
        }

        if (uid) {
            await sendStudyRoomNotification({
                recipientId: req.requester_id,
                senderId: uid,
                title: approve ? 'Join Request Approved' : 'Join Request Rejected',
                message: approve
                    ? `Your request to join ${activeRoom.name} was approved.`
                    : `Your request to join ${activeRoom.name} was rejected.`,
                roomId: activeRoom.id,
                roomName: activeRoom.name,
                requestId: req.id,
            });
        }

        await fetchJoinRequests(activeRoom.id);
        await fetchParticipants(activeRoom.id);
    };

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

    const fetchVoiceNotes = useCallback(async (rid: string) => {
        const { data: list, error } = await supabase
            .from('study_room_voicenotes')
            .select('*')
            .eq('room_id', rid)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch voice notes:', error);
            return;
        }

        const notes = list || [];
        if (!notes.length) {
            setVoicenotes([]);
            return;
        }

        const userIds = [...new Set(notes.map(v => v.user_id).filter(Boolean))];
        const { data: prfs } = userIds.length
            ? await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds)
            : { data: [] };
        const profileMap = Object.fromEntries((prfs || []).map(p => [p.id, p]));

        setVoicenotes(notes.map(v => ({
            ...v,
            profiles: profileMap[v.user_id] || { name: 'User', avatar_url: null },
        })));
    }, []);

    // ── In-room realtime ──────────────────────────────────────────────────
    useEffect(() => {
        if (!activeRoom) return;
        const rid = activeRoom.id;
        fetchParticipants(rid); fetchMessages(rid); fetchDocs(rid); fetchPolls(rid); fetchVoiceNotes(rid);
        if (activeRoom.creator_id === uid) fetchJoinRequests(rid);
        const ch = supabase.channel(`room_${rid}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'study_rooms', filter: `id=eq.${rid}` }, (payload) => setActiveRoom(prev => prev ? { ...prev, ...(payload.new as StudyRoom) } : null))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_participants', filter: `room_id=eq.${rid}` }, () => fetchParticipants(rid))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_room_messages', filter: `room_id=eq.${rid}` }, () => fetchMessages(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_documents', filter: `room_id=eq.${rid}` }, () => fetchDocs(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_polls', filter: `room_id=eq.${rid}` }, () => fetchPolls(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_poll_votes' }, () => fetchVotes(polls.map(p => p.id)))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_voicenotes', filter: `room_id=eq.${rid}` }, () => fetchVoiceNotes(rid))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'study_room_join_requests', filter: `room_id=eq.${rid}` }, () => { if (activeRoom.creator_id === uid) fetchJoinRequests(rid); fetchMyJoinRequests(); })
            .subscribe();

        // Fallback polling for message updates so chat doesn't get stuck
        const poll = setInterval(() => { fetchMessages(rid); }, 5000);

        return () => { 
            supabase.removeChannel(ch); 
            clearInterval(poll);
        };
    }, [activeRoom?.id, uid]);

    useEffect(() => {
        if (targetMessageId) return;
        if (!isChatNearBottomRef.current) return;
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, targetMessageId]);

    useEffect(() => {
        if (!targetMessageId || !messages.length) return;
        let attempts = 0;
        const maxAttempts = 8;
        const tick = () => {
            attempts += 1;
            const el = messageRefs.current[targetMessageId];
            if (el) {
                scrollToMessage(targetMessageId);
                setTargetMessageId(null);
                return;
            }
            if (attempts < maxAttempts) {
                setTimeout(tick, 250);
            }
        };
        tick();
    }, [messages, targetMessageId]);

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

        const isMember = myJoinedRoomIds.has(room.id);
        const isCreator = room.creator_id === uid;
        if (room.is_private && !isCreator && !isMember) {
            await requestJoinPrivateRoom(room);
            return;
        }

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

    const copyRoomInviteLink = async (roomId: string) => {
        const link = `${window.location.origin}/app/study?room=${roomId}`;
        await navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    const deleteRoomFromList = async (room: StudyRoom) => {
        if (!uid || room.creator_id !== uid) return;
        if (!window.confirm('Delete this study room for everyone?')) return;

        const { error } = await supabase.from('study_rooms').update({ is_active: false }).eq('id', room.id);
        if (error) {
            console.error(error);
            alert('Could not delete room. Please try again.');
            return;
        }

        setRooms((rooms || []).filter((r: StudyRoom) => r.id !== room.id));
        if (activeRoom?.id === room.id) {
            setActiveRoom(null);
            setParticipants([]);
            setMessages([]);
            setDocs([]);
            setPolls([]);
            setVotes([]);
        }
    };

    const isHost = activeRoom?.creator_id === uid;


    const startVoiceNote = async () => {
        if (!uid || !activeRoom) return;
        if (recordingVoice) {
            stopVoiceNote();
            return;
        }
        try {
            const { Capacitor } = await import('@capacitor/core');
            const isNative = Capacitor.isNativePlatform();

            if (isNative) {
                // NATIVE APK PATH: Use Capacitor Plugin for permissions & stability
                const { VoiceRecorder } = await import('capacitor-voice-recorder');
                
                const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
                if (!hasPermission) {
                    const { value: nowHasPermission } = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!nowHasPermission) {
                        alert('Microphone permission denied. Please enable it in Android settings.');
                        return;
                    }
                }

                await VoiceRecorder.startRecording();
            } else {
                // WEB BROWSER PATH
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const preferredMime = MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                        ? 'audio/webm;codecs=opus'
                        : 'audio/webm';
                const mr = new MediaRecorder(stream, { mimeType: preferredMime });
                mediaRecorderRef.current = mr;
                audioChunksRef.current = [];

                mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
                mr.onstop = async () => {
                    const chunkType = audioChunksRef.current[0]?.type || mr.mimeType || preferredMime;
                    const blob = new Blob(audioChunksRef.current, { type: chunkType });
                    stream.getTracks().forEach(t => t.stop());
                    await handleSavedAudio(blob);
                };

                mr.start();
            }
            setRecordingVoice(true);
        } catch (e) {
            alert('Microphone access denied or not available.');
            console.error('Microphone exception:', e);
        }
    };

    const handleSavedAudio = async (blob: Blob | string, isBase64: boolean = false) => {
        if (!uid || !activeRoom) return;
        setRecordingVoice(false);

        const titleInput = window.prompt('Voice note title (optional)', '') ?? '';
        const noteTitle = titleInput.trim();
        
        let file: File;
        if (isBase64 && typeof blob === 'string') {
            // Convert base64 to File for uploadFileForRoom helper
            const res = await fetch(blob);
            const buf = await res.arrayBuffer();
            file = new File([buf], `voicenote_${Date.now()}.aac`, { type: 'audio/aac' });
        } else if (blob instanceof Blob) {
            const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
            file = new File([blob], `voicenote_${Date.now()}.${ext}`, { type: blob.type });
        } else {
            return;
        }

        try {
            const url = await uploadFileForRoom(file, uid);
            const { data: inserted } = await supabase.from('study_room_voicenotes').insert({
                room_id: activeRoom.id,
                user_id: uid,
                audio_url: url,
                title: noteTitle || null,
                x_pos: 10 + Math.random() * 80,
                y_pos: 10 + Math.random() * 80
            }).select('*').single();

            if (inserted) {
                const profile = participants.find(p => p.user_id === uid)?.profiles;
                setVoicenotes(prev => [{
                    ...inserted,
                    profiles: profile ? { name: profile.name, avatar_url: profile.avatar_url } : { name: 'You', avatar_url: null },
                }, ...prev]);
            }
            await fetchVoiceNotes(activeRoom.id);
        } catch (e) {
            console.error('Voice note save failed', e);
            alert('Voice note could not be saved.');
        }
    };

    const stopVoiceNote = async () => {
        if (!recordingVoice) return;
        
        const { Capacitor } = await import('@capacitor/core');
        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            const { VoiceRecorder } = await import('capacitor-voice-recorder');
            const { value: recording } = await VoiceRecorder.stopRecording();
            const base64Audio = `data:audio/aac;base64,${recording.recordDataBase64}`;
            await handleSavedAudio(base64Audio, true);
        } else if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setRecordingVoice(false);
    };

    const playVoiceNote = (vn: VoiceNote) => {
        if (playingVoiceId === vn.id) {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
            }
            setPlayingVoiceId(null);
            return;
        }
        if (draggingVnId) return;

        const extractUploadsPath = (rawUrl: string): string | null => {
            try {
                const url = new URL(rawUrl);
                const markers = [
                    '/storage/v1/object/public/uploads/',
                    '/storage/v1/object/authenticated/uploads/',
                    '/storage/v1/object/sign/uploads/',
                ];
                for (const marker of markers) {
                    const idx = url.pathname.indexOf(marker);
                    if (idx >= 0) {
                        const path = url.pathname.slice(idx + marker.length);
                        return decodeURIComponent(path);
                    }
                }
                return null;
            } catch {
                return null;
            }
        };

        const resolvePlayableUrl = async () => {
            let finalUrl = vn.audio_url;
            
            // If it's a Cloudinary URL, ensure it is universally playable (iOS Safari doesn't support .webm)
            if (finalUrl.includes('res.cloudinary.com')) {
                finalUrl = finalUrl.replace(/\.(webm|aac|m4a|ogg|mp3)$/i, '.mp4');
                return finalUrl;
            }

            try {
                const direct = await fetch(finalUrl, { method: 'HEAD' });
                if (direct.ok) return finalUrl;
            } catch {
                // Try signed URL fallback below
            }

            const path = extractUploadsPath(vn.audio_url);
            if (!path) return vn.audio_url;

            const { data, error } = await supabase.storage.from('uploads').createSignedUrl(path, 60 * 10);
            if (error || !data?.signedUrl) {
                console.error('Signed URL generation failed:', error);
                return vn.audio_url;
            }
            return data.signedUrl;
        };

        const run = async () => {
            const src = await resolvePlayableUrl();

            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
            }

            const audio = new Audio(src);
            currentAudioRef.current = audio;
            setPlayingVoiceId(vn.id);

            audio.onended = () => setPlayingVoiceId(null);
            audio.onerror = () => {
                console.error('Audio playback failed for URL:', src);
                setPlayingVoiceId(null);
                alert('Could not play this voice note. It may be private, expired, or encoded in an unsupported format.');
            };

            try {
                await audio.play();
            } catch (e) {
                console.error('Audio play() rejected:', e);
                setPlayingVoiceId(null);
                alert('Playback was blocked. Tap the note again or check device/browser audio support.');
            }
        };

        void run();
    };

    const handleDragStart = (e: React.PointerEvent, id: string) => {
        const vn = voicenotes.find(v => v.id === id);
        if (!vn || (!isHost && vn.user_id !== uid)) return;
        dragStartRef.current = { id, x: e.clientX, y: e.clientY, isDragging: false };
    };

    const handleDragMove = (e: React.PointerEvent) => {
        const pending = dragStartRef.current;
        if (!pending.id || !boardRef.current) return;

        if (!pending.isDragging) {
            const dx = e.clientX - pending.x;
            const dy = e.clientY - pending.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 8) return;
            pending.isDragging = true;
            setDraggingVnId(pending.id);
        }

        const rect = boardRef.current.getBoundingClientRect();
        const x_pos = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
        const y_pos = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);
        setVoicenotes(prev => prev.map(v => v.id === pending.id ? { ...v, x_pos, y_pos } : v));
    };

    const handleDragEnd = async () => {
        const pending = dragStartRef.current;
        if (!pending.id) return;

        const draggedId = pending.id;
        const didDrag = pending.isDragging;
        dragStartRef.current = { id: null, x: 0, y: 0, isDragging: false };
        if (draggingVnId) {
            setDraggingVnId(null);
        }

        if (didDrag) {
            const vn = voicenotes.find(v => v.id === draggedId);
            if (vn) {
                const { error } = await supabase.from('study_room_voicenotes')
                    .update({ x_pos: vn.x_pos, y_pos: vn.y_pos })
                    .eq('id', vn.id);
                if (error) {
                    console.error('Failed to persist voice note drag position:', error);
                }
            }
        }
    };

    const deleteVoiceNote = async (vn: VoiceNote) => {
        if (!uid || !activeRoom) return;
        if (!isHost && vn.user_id !== uid) return;

        if (playingVoiceId === vn.id && currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            setPlayingVoiceId(null);
        }

        setVoicenotes(prev => prev.filter(v => v.id !== vn.id));
        const { error } = await supabase.from('study_room_voicenotes').delete().eq('id', vn.id);
        if (error) {
            console.error('Failed to delete voice note:', error);
            alert('Could not delete this voice note.');
            await fetchVoiceNotes(activeRoom.id);
        }
    };

    const renameVoiceNote = async (vn: VoiceNote) => {
        if (!uid || !activeRoom) return;
        if (!isHost && vn.user_id !== uid) return;

        const proposed = window.prompt('Set voice note title', vn.title || '') ?? '';
        const title = proposed.trim();

        const prevTitle = vn.title ?? null;
        setVoicenotes(prev => prev.map(v => (v.id === vn.id ? { ...v, title } : v)));

        const { error } = await supabase
            .from('study_room_voicenotes')
            .update({ title: title || null })
            .eq('id', vn.id);

        if (error) {
            console.error('Failed to rename voice note:', error);
            setVoicenotes(prev => prev.map(v => (v.id === vn.id ? { ...v, title: prevTitle } : v)));
            alert('Could not update title. Run the latest migration and try again.');
        }
    };

    const toggleDrawingMode = async () => {
        if (!isHost || !activeRoom) return;
        const newVal = activeRoom.allow_drawing === false ? true : false;
        await supabase.from('study_rooms').update({ allow_drawing: newVal }).eq('id', activeRoom.id);
        setActiveRoom({...activeRoom, allow_drawing: newVal});
    };

    // ── Status ────────────────────────────────────────────────────────────
    const updateStatus = (s: ParticipantStatus) => {
        if (!uid || !activeRoom) return;
        setMyStatus(s);
        supabase.from('study_room_participants').update({ status: s }).eq('room_id', activeRoom.id).eq('user_id', uid);
    };

    const parseMentions = (content: string): RoomMessage['mentions'] => {
        const tokens = [...content.matchAll(/(^|\s)@([a-zA-Z0-9_.-]+)/g)].map(m => m[2]);
        if (!tokens.length) return [];

        const seen = new Set<string>();
        const result: NonNullable<RoomMessage['mentions']> = [];

        for (const raw of tokens) {
            const key = raw.toLowerCase();
            if (key === 'ai') continue;
            if (key === 'all') {
                if (!seen.has('all')) {
                    result.push({ type: 'all' });
                    seen.add('all');
                }
                continue;
            }

            const target = participants.find(p => {
                const username = p.profiles?.username?.toLowerCase() || '';
                const name = p.profiles?.name?.toLowerCase().replace(/\s+/g, '') || '';
                return username === key || name === key;
            });
            if (!target) continue;

            const ukey = `user:${target.user_id}`;
            if (seen.has(ukey)) continue;
            result.push({ type: 'user', user_id: target.user_id, username: target.profiles?.username || undefined });
            seen.add(ukey);
        }

        return result;
    };

    const insertMention = (handle: string) => {
        setChatInput(prev => prev.replace(/(^|\s)@[a-zA-Z0-9_.-]*$/, `$1@${handle} `));
    };

    const scrollToMessage = (messageId: string) => {
        const el = messageRefs.current[messageId];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-emerald-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-400'), 1200);
    };

    const renderMentionedText = (text: string) => {
        return text.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, idx) => {
            if (/^@[a-zA-Z0-9_.-]+$/.test(part)) {
                return <span key={idx} className="font-semibold underline decoration-current/50">{part}</span>;
            }
            return <span key={idx}>{part}</span>;
        });
    };

    const insertVoiceNoteReference = (voiceNoteId: string) => {
        setChatInput(prev => prev.replace(/(^|\s)@voicenote\s*$/i, `$1[voicenote:${voiceNoteId}] `));
    };

    const renderMessageContent = (text: string) => {
        const parts = text.split(/(\[voicenote:[a-f0-9-]+\])/gi);
        return parts.map((part, idx) => {
            const tokenMatch = part.match(/^\[voicenote:([a-f0-9-]+)\]$/i);
            if (!tokenMatch) return <span key={`text-${idx}`}>{renderMentionedText(part)}</span>;

            const voiceNoteId = tokenMatch[1];
            const vn = voicenotes.find(v => v.id === voiceNoteId);
            if (!vn) {
                return (
                    <span key={`vn-missing-${idx}`} className="inline-flex items-center mt-1 px-2 py-1 rounded-lg text-xs bg-slate-200/60 dark:bg-zinc-700/60">
                        Voice note unavailable
                    </span>
                );
            }

            return (
                <button
                    key={`vn-${idx}`}
                    type="button"
                    onClick={() => playVoiceNote(vn)}
                    className="mt-1 mb-0.5 w-full max-w-[260px] text-left rounded-xl border border-white/30 dark:border-zinc-600 bg-white/25 dark:bg-zinc-800/60 px-2.5 py-2 hover:bg-white/35 dark:hover:bg-zinc-700/70 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-violet-600 text-white inline-flex items-center justify-center shrink-0">
                            {playingVoiceId === vn.id ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-xs font-semibold truncate">{vn.title?.trim() || 'Voice note'}</span>
                            <span className="block text-[10px] opacity-80 truncate">{vn.profiles?.name || 'User'}</span>
                        </span>
                    </div>
                </button>
            );
        });
    };

    const getReplyPreviewText = (content?: string) => {
        if (!content) return 'Original message unavailable';
        const tokenMatch = content.match(/\[voicenote:([a-f0-9-]+)\]/i);
        if (!tokenMatch) return content;
        const voiceNoteId = tokenMatch[1];
        const vn = voicenotes.find(v => v.id === voiceNoteId);
        return vn ? `Voice note: ${vn.title?.trim() || 'Untitled voice note'}` : 'Voice note unavailable';
    };

    const notifyStudyMentions = async (message: RoomMessage) => {
        if (!uid || !activeRoom || !message.mentions?.length) return;

        const recipientSet = new Set<string>();
        for (const mention of message.mentions) {
            if (mention.type === 'all') {
                participants.forEach(p => {
                    if (p.user_id !== uid) recipientSet.add(p.user_id);
                });
            } else if (mention.type === 'user' && mention.user_id !== uid) {
                recipientSet.add(mention.user_id);
            }
        }

        const recipientIds = [...recipientSet];
        if (!recipientIds.length) return;

        const senderName = participants.find(p => p.user_id === uid)?.profiles?.name || 'Someone';
        const actionUrl = `/app/study?room=${activeRoom.id}&message=${message.id}`;

        const richRows = recipientIds.map(userId => ({
            user_id: userId,
            type: 'mention',
            sender_id: uid,
            title: 'Mention in Study Room',
            message: `${senderName} mentioned you in ${activeRoom.name}`,
            data: {
                room_id: activeRoom.id,
                room_name: activeRoom.name,
                message_id: message.id,
            },
            action_url: actionUrl,
            read: false,
            created_at: new Date().toISOString(),
        }));

        const legacyRows = recipientIds.map(userId => ({
            user_id: userId,
            type: 'mention',
            sender_id: uid,
            content: `${senderName} mentioned you in ${activeRoom.name}`,
            data: {
                room_id: activeRoom.id,
                room_name: activeRoom.name,
                message_id: message.id,
            },
            action_url: actionUrl,
            created_at: new Date().toISOString(),
        }));

        const firstTry = await supabase.from('notifications').insert(richRows);
        if (!firstTry.error) return;

        const fallbackTry = await supabase.from('notifications').insert(legacyRows);
        if (fallbackTry.error) {
            console.error('Study mention notification insert failed:', firstTry.error, fallbackTry.error);
        }
    };

    const sendStudyRoomNotification = async (params: {
        recipientId: string;
        senderId: string;
        title: string;
        message: string;
        roomId: string;
        roomName: string;
        requestId?: string;
    }) => {
        const actionUrl = `/app/study?room=${params.roomId}`;
        const data = {
            room_id: params.roomId,
            room_name: params.roomName,
            join_request_id: params.requestId || null,
        };

        const rich = {
            user_id: params.recipientId,
            type: 'study_invite',
            sender_id: params.senderId,
            title: params.title,
            message: params.message,
            data,
            action_url: actionUrl,
            read: false,
            created_at: new Date().toISOString(),
        };

        const legacy = {
            user_id: params.recipientId,
            type: 'study_invite',
            sender_id: params.senderId,
            content: params.message,
            data,
            action_url: actionUrl,
            created_at: new Date().toISOString(),
        };

        const firstTry = await supabase.from('notifications').insert(rich);
        if (!firstTry.error) return;
        const fallbackTry = await supabase.from('notifications').insert(legacy);
        if (fallbackTry.error) {
            console.error('Study room notification insert failed:', firstTry.error, fallbackTry.error);
        }
    };

    // ── Chat ──────────────────────────────────────────────────────────────
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !uid || !activeRoom || sending) return;
        setSending(true);
        const c = chatInput.trim(); setChatInput('');
        const detectedMentions = parseMentions(c);
        const clientMsg: RoomMessage = {
            id: crypto.randomUUID(),
            room_id: activeRoom.id,
            user_id: uid,
            content: c,
            created_at: new Date().toISOString(),
            reply_to_message_id: replyToMessageId,
            mentions: detectedMentions,
            profiles: participants.find(p => p.user_id === uid)?.profiles || { name: 'Me', avatar_url: null }
        };

        // Append locally instantly so user feels instant updates
        setMessages(prev => [...prev, clientMsg]);
        setReplyToMessageId(null);
        setSending(false);

        const insertPayload: Record<string, unknown> = {
            id: clientMsg.id,
            room_id: clientMsg.room_id,
            user_id: clientMsg.user_id,
            content: clientMsg.content,
            reply_to_message_id: clientMsg.reply_to_message_id || null,
            mentions: clientMsg.mentions || [],
        };

        let { error } = await supabase.from('study_room_messages').insert(insertPayload);
        if (error && /reply_to_message_id|mentions|column/i.test(error.message || '')) {
            const retry = await supabase.from('study_room_messages').insert({
                id: clientMsg.id,
                room_id: clientMsg.room_id,
                user_id: clientMsg.user_id,
                content: clientMsg.content,
            });
            error = retry.error;
        }

        if (error) {
            console.error('Chat error:', error);
            // alert('Failed to broadcast message: ' + error.message);
        } else {
            await notifyStudyMentions(clientMsg);
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
        try {
            const payload = {
                id: crypto.randomUUID(),
                room_id: activeRoom.id,
                shared_by: uid,
                title: newDoc.title.trim(),
                content: newDoc.content.trim(),
                doc_url: newDoc.doc_url.trim() || null,
                is_active: true,
            };

            const { error } = await supabase.from('study_room_documents').insert(payload);
            if (error) throw error;

            await fetchDocs(activeRoom.id);
            setNewDoc({ title: '', content: '', doc_url: '' });
            setShowDocForm(false);
        } catch (error) {
            console.error('Document save failed:', error);
            alert('Could not share this document. Check room/storage policies and try again.');
        } finally {
            setSavingDoc(false);
        }
    };

    const deleteDoc = async (doc: RoomDocument) => {
        if (!uid || !activeRoom) return;
        const canDelete = doc.shared_by === uid || isHost;
        if (!canDelete) return;

        const prevDocs = docs;
        setDocs(prev => prev.filter(d => d.id !== doc.id));
        if (openDocId === doc.id) setOpenDocId(null);

        const { error } = await supabase
            .from('study_room_documents')
            .update({ is_active: false })
            .eq('id', doc.id);

        if (error) {
            console.error('Failed to delete document:', error);
            setDocs(prevDocs);
            alert('Could not delete this document. Check room permissions/policies.');
        }
    };

    // ── Polls ─────────────────────────────────────────────────────────────
    const savePoll = async () => {
        if (!uid || !activeRoom || !newPoll.question.trim()) return;
        if (!isHost) {
            alert('Only the room host can create polls.');
            return;
        }
        const valid = newPoll.options.filter(o => o.trim());
        if (valid.length < 2) {
            alert('Please add at least 2 options.');
            return;
        }
        setSavingPoll(true);
        try {
            const options: PollOption[] = valid.map((text, i) => ({ id: `o${i}`, text: text.trim() }));
            const payload = {
                id: crypto.randomUUID(),
                room_id: activeRoom.id,
                created_by: uid,
                question: newPoll.question.trim(),
                options,
                is_active: true,
            };

            let { error } = await supabase.from('study_room_polls').insert(payload);
            if (error && /id|uuid|default/i.test(error.message || '')) {
                const retry = await supabase.from('study_room_polls').insert({
                    room_id: activeRoom.id,
                    created_by: uid,
                    question: newPoll.question.trim(),
                    options,
                    is_active: true,
                });
                error = retry.error;
            }

            if (error) {
                console.error('Poll create failed:', error);
                alert(`Poll could not be created: ${error.message}`);
                return;
            }

            setNewPoll({ question: '', options: ['', ''] });
            setShowPollForm(false);
            await fetchPolls(activeRoom.id);
        } finally {
            setSavingPoll(false);
        }
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
            { id: 'board', label: 'Board', icon: PenTool, badge: voicenotes.length || undefined },
            { id: 'structure', label: 'Structure', icon: List, badge: voicenotes.length || undefined },
            { id: 'docs', label: 'Docs', icon: FileText, badge: docs.length || undefined },
            { id: 'polls', label: 'Polls', icon: BarChart2, badge: polls.filter(p => p.is_active).length || undefined },
            { id: 'people', label: 'People', icon: Users, badge: participants.length || undefined },
        ];

        const replyTarget = replyToMessageId ? messages.find(m => m.id === replyToMessageId) : null;
        const mentionMatch = chatInput.match(/(^|\s)@([a-zA-Z0-9_.-]*)$/);
        const mentionQuery = mentionMatch?.[2]?.toLowerCase() || '';
        const voiceNotePickerOpen = /(^|\s)@voicenote\s*$/i.test(chatInput);
        const mentionSuggestions = mentionMatch
            ? [
                { label: 'all', value: 'all', subtitle: 'Notify everyone in room' },
                { label: 'voicenote', value: 'voicenote', subtitle: 'Attach a board voice note' },
                ...participants
                    .map(p => ({
                        label: p.profiles?.username || p.profiles?.name || 'user',
                        value: p.profiles?.username || (p.profiles?.name || '').replace(/\s+/g, ''),
                        subtitle: p.profiles?.name || 'User',
                    }))
                    .filter(m => m.value)
                    .filter(m => m.value.toLowerCase().includes(mentionQuery) || m.subtitle.toLowerCase().includes(mentionQuery))
                    .slice(0, 6),
            ]
            : [];

        return (
            <div className="fixed inset-0 z-[100] bg-[#f0f2f5] dark:bg-zinc-950 flex flex-col h-[100dvh] w-full pt-[env(safe-area-inset-top)] sm:pt-0 sm:static sm:z-auto sm:bg-transparent sm:h-[calc(100vh-96px)]">
                
                {/* ── Room Header (Fixed Top) ── */}
                <div className="w-full flex-shrink-0 bg-white dark:bg-zinc-900 px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-200 dark:border-zinc-800 shadow-sm z-10 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1 flex gap-3 items-center">
                        <button onClick={() => setActiveRoom(null)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 self-center transition-colors">
                            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-lg font-bold text-slate-900 dark:text-white truncate leading-tight">{activeRoom.name}</h1>
                                {activeRoom.is_private && <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0 uppercase">Private</span>}
                                {isHost && (
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0 uppercase">
                                        <Crown className="w-2.5 h-2.5" />Host
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
                                {activeRoom.subject && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{activeRoom.subject}</span>}
                                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    {participants.length} live
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status pill */}
                        <div className="relative hidden sm:block">
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
                        <button
                            onClick={leaveRoom}
                            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-full sm:text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <LogOut className="w-5 h-5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    </div>
                </div>

                {/* ── Tab Content Container (Middle Flex) ── */}
                <div className="flex-1 overflow-hidden flex flex-col w-full sm:max-w-7xl mx-auto sm:px-4 sm:pt-4">
                    {/* ── CHAT ── */}
                    {tab === 'chat' && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#0b141a] sm:rounded-2xl sm:border border-slate-200 dark:border-zinc-800 shadow-sm relative">
                            {/* AI shortcut banner */}
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-50 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex-shrink-0 overflow-x-auto">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Bot className="w-3 h-3 text-white dark:text-zinc-900" />
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ask the AI:</span>
                                {['Explain this topic', 'Quiz me', 'Summarize'].map(q => (
                                    <button key={q} onClick={() => setChatInput(`@AI ${q}`)} className="text-[10px] px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium transition-colors whitespace-nowrap flex-shrink-0">
                                        {q}
                                    </button>
                                ))}
                                {currentTrack && (
                                    <button
                                        type="button"
                                        onClick={toggleExpanded}
                                        className="ml-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-semibold transition-colors whitespace-nowrap flex-shrink-0"
                                        title={currentTrack.title}
                                    >
                                        {isPlaying ? 'Podcast: Playing' : 'Podcast: Paused'}
                                    </button>
                                )}
                            </div>

                            {/* Messages area — scrollable, takes all remaining space */}
                            <div
                                ref={chatScrollRef}
                                onScroll={(e) => {
                                    const el = e.currentTarget;
                                    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
                                    isChatNearBottomRef.current = distanceFromBottom < 120;
                                }}
                                className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
                            >
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
                                    const repliedTo = msg.reply_to_message_id
                                        ? messages.find(m => m.id === msg.reply_to_message_id)
                                        : null;

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
                                        <div
                                            key={msg.id}
                                            ref={el => { messageRefs.current[msg.id] = el; }}
                                            className={`flex gap-2.5 group/msg ${isMe ? 'flex-row-reverse' : ''}`}
                                        >
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
                                                    {msg.reply_to_message_id && (
                                                        <button
                                                            onClick={() => scrollToMessage(msg.reply_to_message_id!)}
                                                            className={`mb-2 w-full text-left px-2 py-1 rounded-lg text-[11px] ${
                                                                isMe
                                                                    ? 'bg-white/20 hover:bg-white/30 text-emerald-50'
                                                                    : 'bg-slate-100 dark:bg-zinc-700/60 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-300'
                                                            }`}
                                                        >
                                                            <div className="font-semibold truncate">
                                                                Replying to {repliedTo?.profiles?.name || 'message'}
                                                            </div>
                                                            <div className="truncate opacity-80">
                                                                {getReplyPreviewText(repliedTo?.content)}
                                                            </div>
                                                        </button>
                                                    )}
                                                    {renderMessageContent(msg.content)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 px-1">{timeAgo(msg.created_at)}</span>
                                                    {!msg.isAI && (
                                                        <button
                                                            onClick={() => setReplyToMessageId(msg.id)}
                                                            className="opacity-0 group-hover/msg:opacity-100 p-0.5 text-slate-300 hover:text-emerald-500 transition-all"
                                                            title="Reply"
                                                        >
                                                            <CornerUpLeft className="w-3 h-3" />
                                                        </button>
                                                    )}
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

                            {/* Input bar — pinned to bottom */}
                            <div className="flex-shrink-0 sticky bottom-0 z-10 px-3 pb-4 pt-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-2xl space-y-2">
                                {replyTarget && (
                                    <div className="mx-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Replying to {replyTarget.profiles?.name || 'User'}</p>
                                            <p className="text-xs text-emerald-600/80 dark:text-emerald-300/80 truncate">{getReplyPreviewText(replyTarget.content)}</p>
                                        </div>
                                        <button onClick={() => setReplyToMessageId(null)} className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-800/40">
                                            <X className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                                    <div className="flex-1 relative">
                                        <input
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Type a message… (@all, @username, @AI)"
                                            maxLength={500}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow pr-12"
                                        />
                                        {chatInput.startsWith('@AI') && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-500 bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 rounded-full">AI</span>
                                        )}
                                        {mentionSuggestions.length > 0 && (
                                            <div className="absolute bottom-14 left-0 right-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-30 max-h-56 overflow-y-auto">
                                                {mentionSuggestions.map(m => (
                                                    <button
                                                        key={`${m.value}-${m.subtitle}`}
                                                        type="button"
                                                        onClick={() => insertMention(m.value)}
                                                        className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">@{m.label}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{m.subtitle}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {voiceNotePickerOpen && (
                                            <div className="absolute bottom-14 left-0 right-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-30 max-h-56 overflow-y-auto">
                                                {voicenotes.length === 0 ? (
                                                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-zinc-400">No voice notes available in this room.</div>
                                                ) : voicenotes.slice(0, 8).map(vn => (
                                                    <button
                                                        key={vn.id}
                                                        type="button"
                                                        onClick={() => insertVoiceNoteReference(vn.id)}
                                                        className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{vn.title?.trim() || 'Voice note'}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{vn.profiles?.name || 'User'} • {timeAgo(vn.created_at)}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || sending || aiThinking}
                                        className="w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white disabled:opacity-40 transition-all flex items-center justify-center shadow-lg flex-shrink-0"
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
                    const wboUrl = `https://wbo.ophir.dev/boards/unilink-${activeRoom.id}`;
                    const canDraw = activeRoom.allow_drawing !== false || isHost;

                    return (
                        <div 
                            className="flex-1 w-full flex flex-col overflow-hidden sm:rounded-2xl sm:border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 min-h-[500px] relative group"
                            onPointerMove={handleDragMove}
                            onPointerUp={handleDragEnd}
                            onPointerLeave={handleDragEnd} // Also end drag if cursor leaves the board area
                        >
                            {/* Board header */}
                            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 mr-1">
                                        <PenTool className="w-4 h-4 text-violet-500" />
                                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Board</span>
                                    </div>
                                    
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                        canDraw 
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${canDraw ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        {canDraw ? 'Live Sync' : 'Read Only'}
                                    </span>

                                    {/* Recording Button */}
                                    <button 
                                        onClick={startVoiceNote}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                            recordingVoice 
                                                ? 'bg-red-500 text-white animate-pulse' 
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                    >
                                        <Mic className={`w-3 h-3 ${recordingVoice ? 'fill-current' : ''}`} />
                                        {recordingVoice ? 'Recording...' : 'Add Voice Note'}
                                    </button>

                                    {/* Host drawing toggle */}
                                    {isHost && (
                                        <button 
                                            onClick={toggleDrawingMode}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                activeRoom.allow_drawing !== false
                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                    : 'bg-zinc-900 text-white border border-zinc-900'
                                            }`}
                                        >
                                            {activeRoom.allow_drawing !== false ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                            {activeRoom.allow_drawing !== false ? 'Lock Board' : 'Unlock Board'}
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {!canDraw && !isHost && (
                                        <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium whitespace-nowrap">
                                            <EyeOff className="w-3 h-3" /> Drawing Disabled
                                        </div>
                                    )}
                                    <a
                                        href={wboUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hidden sm:flex text-[11px] text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors items-center gap-1"
                                    >
                                        Full screen ↗
                                    </a>
                                </div>
                            </div>

                            {/* Main Board Area */}
                            <div className="flex-1 relative overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950">
                                {/* Voice Notes Layer */}
                                <div 
                                    className={`absolute inset-0 z-10 ${draggingVnId ? 'pointer-events-auto cursor-grabbing' : 'pointer-events-none'}`}
                                >
                                    {voicenotes.map(vn => (
                                        <div 
                                            key={vn.id}
                                            className="absolute pointer-events-auto group/vn touch-none transition-transform active:scale-125"
                                            style={{ 
                                                left: `${vn.x_pos}%`, 
                                                top: `${vn.y_pos}%`,
                                                zIndex: draggingVnId === vn.id ? 50 : 10
                                            }}
                                            onPointerDown={(e) => handleDragStart(e, vn.id)}
                                        >
                                            <div className="relative">
                                                <button
                                                    onClick={() => playVoiceNote(vn)}
                                                    className={`w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center shadow-lg transition-all border-2 ${
                                                        playingVoiceId === vn.id 
                                                            ? 'bg-violet-600 border-white text-white scale-110 ring-4 ring-violet-500/20' 
                                                            : 'bg-white dark:bg-zinc-800 border-violet-500 text-violet-500 hover:bg-violet-50'
                                                    } ${draggingVnId === vn.id ? 'opacity-50 ring-2 ring-violet-400' : ''}`}
                                                >
                                                    {playingVoiceId === vn.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                                    
                                                    {playingVoiceId === vn.id && (
                                                        <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                    )}
                                                </button>

                                                {(isHost || vn.user_id === uid) && (
                                                    <button
                                                        onClick={() => deleteVoiceNote(vn)}
                                                        className="absolute -top-4 left-3 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover/vn:opacity-100 transition-opacity"
                                                        title="Delete voice note"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                                
                                                {/* Drag Handle Icon for UI hint */}
                                                {(isHost || vn.user_id === uid) && (
                                                    <div className="absolute -top-7 -left-2 opacity-0 group-hover/vn:opacity-100 transition-opacity bg-white dark:bg-zinc-800 p-1 rounded-md shadow-sm border border-slate-200 dark:border-zinc-700 cursor-grab active:cursor-grabbing">
                                                        <GripHorizontal className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                )}

                                                {/* Profile tooltip */}
                                                <div className="absolute top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/vn:opacity-100 transition-opacity bg-zinc-900/90 text-[9px] text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50">
                                                    {vn.title?.trim() || (vn.profiles?.name || 'User')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Board iframe */}
                                <div ref={boardRef} className={`w-full h-full relative z-0 ${!canDraw ? 'pointer-events-none grayscale-[0.5] opacity-90' : ''}`}>
                                    <iframe
                                        src={wboUrl}
                                        className="w-full h-full absolute inset-0 border-none"
                                        title="Collaborative Whiteboard"
                                        allow="clipboard-read; clipboard-write; display-capture"
                                    />
                                    {!canDraw && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Host disabled drawing</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── VOICE STRUCTURE ── */}
                {tab === 'structure' && (
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {voicenotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                                <Mic className="w-10 h-10 opacity-40" />
                                <p className="text-sm font-medium">No voice notes yet</p>
                                <p className="text-xs text-center max-w-xs">Record notes in the Board tab and they will appear here in order.</p>
                            </div>
                        ) : voicenotes.map((vn, idx) => (
                            <div key={vn.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar src={vn.profiles?.avatar_url} name={vn.profiles?.name} size={8} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{vn.title?.trim() || `Voice Note ${voicenotes.length - idx}`}</p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{vn.profiles?.name || 'User'} • {timeAgo(vn.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(isHost || vn.user_id === uid) && (
                                            <button
                                                onClick={() => renameVoiceNote(vn)}
                                                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                Rename
                                            </button>
                                        )}
                                        <button
                                            onClick={() => playVoiceNote(vn)}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                        >
                                            {playingVoiceId === vn.id ? 'Playing...' : 'Play'}
                                        </button>
                                        {(isHost || vn.user_id === uid) && (
                                            <button
                                                onClick={() => deleteVoiceNote(vn)}
                                                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400">Board position: {Math.round(vn.x_pos)}% x, {Math.round(vn.y_pos)}% y</p>
                            </div>
                        ))}
                    </div>
                )}

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
                                                    const url = await uploadFileForRoom(file, uid);
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
                                    <div 
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        onClick={() => setOpenDocId(openDocId === doc.id ? null : doc.id)}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.title}</p>
                                            <p className="text-xs text-slate-400">by {doc.profiles?.name || 'Host'} · {timeAgo(doc.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {doc.doc_url && (
                                                <a 
                                                    href={doc.doc_url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-emerald-600 transition-colors"
                                                    title="Open in new tab"
                                                >
                                                    <Link2 className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button 
                                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors pointer-events-none"
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDocId === doc.id ? 'rotate-180' : ''}`} />
                                            </button>
                                            {(doc.shared_by === uid || isHost) && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        void deleteDoc(doc);
                                                    }} 
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {openDocId === doc.id && (doc.content || doc.doc_url) && (
                                        <div className="border-t border-slate-100 dark:border-zinc-800 flex flex-col bg-slate-50 dark:bg-zinc-800/60">
                                            {doc.content && (
                                                <div className={`px-4 py-3 text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap font-sans overflow-y-auto leading-relaxed ${doc.doc_url ? 'max-h-32 border-b border-slate-200 dark:border-zinc-700/50' : 'max-h-64'}`}>
                                                    {doc.content}
                                                </div>
                                            )}
                                            {doc.doc_url && (
                                                <div className="w-full h-[50dvh] min-h-[400px]">
                                                    {doc.doc_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                        <img src={doc.doc_url} alt={doc.title} className="w-full h-full object-contain bg-zinc-100 dark:bg-zinc-950" />
                                                    ) : doc.doc_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                        <video src={doc.doc_url} controls className="w-full h-full bg-black object-contain" />
                                                    ) : (
                                                        <iframe 
                                                            src={doc.doc_url.includes('docs.google.com') ? doc.doc_url : `https://docs.google.com/viewer?url=${encodeURIComponent(doc.doc_url)}&embedded=true`} 
                                                            className="w-full h-full border-0 bg-white"
                                                            title={doc.title}
                                                        />
                                                    )}
                                                </div>
                                            )}
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
                                                    <button
                                                        onClick={() => supabase.from('study_room_polls').update({ is_active: !poll.is_active }).eq('id', poll.id).then(() => fetchPolls(activeRoom.id))}
                                                        className={`p-1.5 transition-colors ${poll.is_active ? 'text-emerald-500 hover:text-slate-400' : 'text-amber-500 hover:text-emerald-500'}`}
                                                        title={poll.is_active ? 'Close poll' : 'Reopen poll'}
                                                    >
                                                        <ToggleRight className={`w-5 h-5 ${poll.is_active ? '' : 'rotate-180'}`} />
                                                    </button>
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
                            {isHost && joinRequests.length > 0 && (
                                <div className="mb-3 bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-3 space-y-2">
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Join Requests</p>
                                    {joinRequests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">{req.profiles?.name || 'User'}</p>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">@{req.profiles?.username || 'user'} · requested {timeAgo(req.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleJoinRequest(req, true)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Approve</button>
                                                <button onClick={() => handleJoinRequest(req, false)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

                {/* ── Floating Bottom Tabs ── */}
                <div className="w-full flex-shrink-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 pb-[calc(env(safe-area-inset-bottom)+0.2rem)] pt-2 px-2 sm:rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10 w-full sm:max-w-7xl mx-auto sm:mb-4">
                    <div className="flex justify-around items-center w-full">
                        {tabs.map(({ id, label, icon: Icon, badge }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex flex-col items-center justify-center gap-1 flex-1 max-w-[80px] py-1 transition-all relative ${
                                    tab === id
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                <div className={`p-1 sm:p-1.5 rounded-full ${tab === id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                                    <Icon className={`w-5 h-5 sm:w-5 sm:h-5 ${tab === id ? 'fill-emerald-100 dark:fill-emerald-900/40 text-emerald-600' : ''}`} />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide">{label}</span>
                                {badge != null && (
                                    <span className="absolute top-0 right-1 sm:right-3 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // ROOMS LIST
    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:pb-8 space-y-6">
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
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-md"
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
                        <div key={room.id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-xl transition-all flex flex-col h-full overflow-hidden">
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
                                    {uid === room.creator_id && (
                                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void copyRoomInviteLink(room.id);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                                title="Copy invite link"
                                            >
                                                <Link2 className="w-3 h-3" /> Invite
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void deleteRoomFromList(room);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                title="Delete room"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
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
                                    (() => {
                                        const isCreator = room.creator_id === uid;
                                        const isMember = myJoinedRoomIds.has(room.id);
                                        const reqStatus = myJoinRequests[room.id];
                                        const needsRequest = !!room.is_private && !isCreator && !isMember;
                                        const label = joining === room.id
                                            ? 'Joining...'
                                            : needsRequest
                                                ? (reqStatus === 'pending' ? 'Request Sent' : reqStatus === 'rejected' ? 'Request Again' : 'Request Access')
                                                : (isCreator ? 'Enter Your Room' : 'Join Room');

                                        return (
                                            <button
                                                onClick={() => joinRoom(room)}
                                                disabled={joining === room.id || (needsRequest && reqStatus === 'pending')}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-xs transition-colors disabled:opacity-60 flex-shrink-0 ${
                                                    isCreator
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                        : needsRequest
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                                                            : 'bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:text-zinc-300 text-slate-700'
                                                }`}
                                            >
                                                {joining === room.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : label}
                                            </button>
                                        );
                                    })()
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
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 flex flex-col max-h-[90dvh]">
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
                        <div className="p-5 space-y-4 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:pb-5">
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
                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]">
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
