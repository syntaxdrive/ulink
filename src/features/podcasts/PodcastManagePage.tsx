import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Mic2, CheckCircle, Clock, XCircle, AlertCircle,
    Upload, Plus, Loader2, Trash2, Pencil, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cloudinaryService } from '../../services/cloudinaryService';
import { fetchMyPodcasts, fetchMyEpisodes, applyForPodcast, uploadEpisode } from './hooks/usePodcasts';
import EpisodeItem from './components/EpisodeItem';
import type { Podcast, PodcastEpisode } from '../../types';

const CATEGORIES = [
    'Technology', 'Business', 'Education', 'Entertainment',
    'Health', 'Sports', 'News', 'Comedy', 'Arts', 'Other',
];

const MIN_DURATION_SECS = 120; // 2 minutes (Must match database CHECK constraint)
const MAX_FILE_MB = 200;
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/webm'];

function StatusBadge({ status }: { status: Podcast['status'] }) {
    const cfg = {
        pending:   { Icon: Clock,         cls: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400',   label: 'Under Review' },
        approved:  { Icon: CheckCircle,   cls: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400', label: 'Approved' },
        rejected:  { Icon: XCircle,       cls: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400',                 label: 'Not Approved' },
        suspended: { Icon: AlertCircle,   cls: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400', label: 'Suspended' },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.cls}`}>
            <cfg.Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
}

export default function PodcastManagePage() {
    const navigate = useNavigate();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const epCoverInputRef = useRef<HTMLInputElement>(null);
    
    // undefined = loading, array = loaded
    const [podcasts, setPodcasts] = useState<Podcast[] | undefined>(undefined);
    const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
    
    // UI state
    const [showAppForm, setShowAppForm] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);

    // Application form
    const [appForm, setAppForm] = useState({ title: '', description: '', category: 'Technology', cover_url: '' });
    const [appCoverUploading, setAppCoverUploading] = useState(false);
    const [appSubmitting, setAppSubmitting] = useState(false);
    const [appError, setAppError] = useState('');

    // Episode upload form
    const [epForm, setEpForm] = useState({
        title: '', description: '', episode_number: '',
        audio_url: '', duration_seconds: 0, cover_url: '',
    });
    const [epAudioUploading, setEpAudioUploading] = useState(false);
    const [epAudioProgress, setEpAudioProgress] = useState(0);
    const [epCoverUploading, setEpCoverUploading] = useState(false);
    const [epSubmitting, setEpSubmitting] = useState(false);
    const [epError, setEpError] = useState('');

    // Edit podcast form
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: 'Technology', cover_url: '' });
    const [editCoverUploading, setEditCoverUploading] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => {
        fetchMyPodcasts()
            .then(async (ps: Podcast[]) => {
                setPodcasts(ps);
                if (ps.length === 0) {
                    setShowAppForm(true);
                } else if (ps.length === 1 && ps[0].status === 'approved') {
                    // Auto-select if they only have one approved podcast
                    handleSelectPodcast(ps[0].id);
                }
            })
            .catch(console.error);
    }, []);

    const handleSelectPodcast = async (id: string) => {
        setSelectedPodcastId(id);
        setShowAppForm(false);
        const p = podcasts?.find(p => p.id === id);
        if (p?.status === 'approved') {
            const eps = await fetchMyEpisodes(id);
            setEpisodes(eps);
        } else {
            setEpisodes([]);
        }
    };

    /* ── Application submit ── */
    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appForm.title.trim()) { setAppError('Podcast name is required.'); return; }
        setAppSubmitting(true);
        setAppError('');
        try {
            const result = await applyForPodcast({
                title: appForm.title.trim(),
                description: appForm.description.trim(),
                category: appForm.category,
                cover_url: appForm.cover_url || undefined,
            });
            setPodcasts(prev => [...(prev || []), result]);
            setShowAppForm(false);
            if (!selectedPodcastId) {
                handleSelectPodcast(result.id);
            }
        } catch (err: any) {
            if (err?.code === '23505') {
                setAppError('You already have a podcast application with this name.');
            } else if (err?.code === '42501') {
                setAppError('Permission denied. You need at least 100 points to apply for a podcast channel.');
            } else if (err?.message?.includes('points')) {
                setAppError('You need at least 100 points to apply.');
            } else {
                setAppError(err?.message ?? 'Failed to submit. Please try again.');
            }
        } finally {
            setAppSubmitting(false);
        }
    };

    /* ── Cover art upload ── */
    const handleCoverUpload = async (file: File, target: 'app' | 'ep' | 'edit') => {
        if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Cover image must be under 5 MB.'); return; }
        if (target === 'app') setAppCoverUploading(true);
        else if (target === 'ep') setEpCoverUploading(true);
        else setEditCoverUploading(true);
        try {
            let coverUrl = '';

            if (cloudinaryService.isConfigured()) {
                try {
                    const result = await cloudinaryService.uploadImage(file, { folder: 'ulink/podcasts/covers' });
                    coverUrl = result.secureUrl;
                } catch {
                    // fall through to Supabase
                }
            }

            if (!coverUrl) {
                const ext = file.name.split('.').pop() ?? 'jpg';
                const fileName = `podcast-covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                const { error } = await supabase.storage.from('uploads').upload(fileName, file, { upsert: true });
                if (error) throw error;
                coverUrl = supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl;
            }

            if (target === 'app') setAppForm(f => ({ ...f, cover_url: coverUrl }));
            else if (target === 'ep') setEpForm(f => ({ ...f, cover_url: coverUrl }));
            else setEditForm(f => ({ ...f, cover_url: coverUrl }));
        } catch {
            alert('Image upload failed. Please try again.');
        } finally {
            if (target === 'app') setAppCoverUploading(false);
            else if (target === 'ep') setEpCoverUploading(false);
            else setEditCoverUploading(false);
        }
    };

    const selectedPodcast = podcasts?.find(p => p.id === selectedPodcastId);

    /* ── Start editing podcast ── */
    const startEdit = () => {
        if (!selectedPodcast) return;
        setEditForm({
            title: selectedPodcast.title,
            description: selectedPodcast.description ?? '',
            category: selectedPodcast.category,
            cover_url: selectedPodcast.cover_url ?? '',
        });
        setEditMode(true);
        setEditError('');
    };

    /* ── Save podcast edits ── */
    const handleUpdatePodcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.title.trim()) { setEditError('Podcast name is required.'); return; }
        if (!selectedPodcast?.id) return;
        setEditSubmitting(true);
        setEditError('');
        try {
            const { data, error } = await supabase
                .from('podcasts')
                .update({
                    title: editForm.title.trim(),
                    description: editForm.description.trim() || null,
                    category: editForm.category,
                    cover_url: editForm.cover_url || null,
                })
                .eq('id', selectedPodcast.id)
                .select()
                .single();
            if (error) throw error;
            setPodcasts(prev => prev?.map(p => p.id === selectedPodcast.id ? (data as Podcast) : p));
            setEditMode(false);
        } catch (err: any) {
            setEditError(err?.message ?? 'Failed to save changes.');
        } finally {
            setEditSubmitting(false);
        }
    };

    /* ── Audio file selection + validation ── */
    const handleAudioFile = async (file: File) => {
        const isValidType = ALLOWED_AUDIO_TYPES.includes(file.type) ||
            /\.(mp3|m4a|ogg|wav|aac|webm)$/i.test(file.name);

        if (!isValidType) {
            setEpError('Please upload an audio file (MP3, M4A, OGG, WAV, AAC).');
            return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setEpError(`Audio file must be under ${MAX_FILE_MB} MB.`);
            return;
        }

        if (!cloudinaryService.isConfigured()) {
            setEpError('Audio uploads require Cloudinary. Ask your admin to configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
            return;
        }

        // Validate duration client-side before uploading
        const duration = await new Promise<number>((resolve, reject) => {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            audio.onloadedmetadata = () => { resolve(audio.duration); URL.revokeObjectURL(url); };
            audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read audio metadata.')); };
            audio.src = url;
        }).catch(() => 0);

        if (duration < MIN_DURATION_SECS) {
            const minMins = MIN_DURATION_SECS / 60;
            setEpError(`Episode must be at least ${minMins} ${minMins === 1 ? 'minute' : 'minutes'} long.`);
            return;
        }

        setEpError('');
        setEpAudioUploading(true);
        setEpAudioProgress(0);
        try {
            const result = await cloudinaryService.uploadDocument(file, {
                folder: 'ulink/podcasts/audio',
                onProgress: p => setEpAudioProgress(Math.round(p)),
            });
            setEpForm(f => ({ ...f, audio_url: result.secureUrl, duration_seconds: Math.floor(duration) }));
        } catch (err: any) {
            setEpError(err?.message ?? 'Audio upload failed. Please try again.');
        } finally {
            setEpAudioUploading(false);
            setEpAudioProgress(0);
        }
    };

    /* ── Episode publish ── */
    const handlePublishEpisode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!epForm.title.trim()) { setEpError('Episode title is required.'); return; }
        if (!epForm.audio_url) { setEpError('Please upload an audio file first.'); return; }
        if (!selectedPodcast?.id) return;

        setEpSubmitting(true);
        setEpError('');
        try {
            const ep = await uploadEpisode(selectedPodcast.id, {
                title: epForm.title.trim(),
                description: epForm.description.trim() || undefined,
                audio_url: epForm.audio_url,
                cover_url: epForm.cover_url || undefined,
                duration_seconds: epForm.duration_seconds,
                episode_number: epForm.episode_number ? parseInt(epForm.episode_number, 10) : undefined,
            });
            setEpisodes(prev => [ep, ...prev]);
            setPodcasts(prev => prev?.map(p => p.id === selectedPodcast.id ? { ...p, episodes_count: p.episodes_count + 1 } : p));
            setEpForm({ title: '', description: '', episode_number: '', audio_url: '', duration_seconds: 0, cover_url: '' });
            setShowUploadForm(false);
        } catch (err: any) {
            if (err?.code === 'P0001' || err?.message?.toLowerCase().includes('rate')) {
                setEpError('Episode limit reached. You can upload max 3 episodes per day and 10 per week.');
            } else if (err?.code === '23514') {
                setEpError('Duration violation: Episodes must be at least 2 minutes (120 seconds) long.');
            } else if (err?.code === '42501') {
                setEpError('Permission denied. Ensure your podcast is approved before uploading episodes.');
            } else {
                setEpError(err?.message ?? 'Failed to publish episode.');
            }
        } finally {
            setEpSubmitting(false);
        }
    };

    /* ── Loading state ── */
    if (podcasts === undefined) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    // LIST VIEW
    if (selectedPodcastId === null && !showAppForm) {
        return (
            <div className="max-w-2xl mx-auto pb-32">
                <button
                    onClick={() => navigate('/app/podcasts')}
                    className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Discover Podcasts
                </button>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-emerald-600" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your Podcasts</h1>
                    </div>
                    <button
                        onClick={() => setShowAppForm(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Create Another
                    </button>
                </div>

                {podcasts.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <Mic2 className="w-12 h-12 text-emerald-600/50 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Podcasts Yet</h3>
                        <p className="text-slate-500 dark:text-zinc-400 mb-6">Start your own podcast channel and share your voice.</p>
                        <button
                            onClick={() => setShowAppForm(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Apply for a Podcast
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {podcasts.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => handleSelectPodcast(p.id)}
                                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md group"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
                                    {p.cover_url ? (
                                        <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                            <Mic2 className="w-6 h-6 text-white/80" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.title}</h3>
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400 truncate">{p.category}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-32">
            <button
                onClick={() => {
                    if (showAppForm && podcasts && podcasts.length > 0) {
                        setShowAppForm(false);
                    } else if (selectedPodcastId) {
                        setSelectedPodcastId(null);
                    } else {
                        navigate('/app/podcasts');
                    }
                }}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> {selectedPodcastId || showAppForm ? 'Back to Podcasts' : 'Podcasts'}
            </button>

            <div className="flex items-center gap-2 mb-6">
                <Mic2 className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{showAppForm ? 'Create Podcast' : 'Manage Podcast'}</h1>
            </div>

            {/* ── Application form ── */}
            {showAppForm && (
                <div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6">
                        <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2">How it works</h2>
                        <ol className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                            <li>1. Apply with your podcast name and description.</li>
                            <li>2. Our team reviews it (usually within 24–48 hours).</li>
                            <li>3. Once approved, publish up to 3 episodes per day.</li>
                        </ol>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-2 font-medium">
                            Requires 100+ points to apply.
                        </p>
                    </div>

                    <form onSubmit={handleApply} className="space-y-4">
                        {/* Cover art */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                                Cover Art
                            </label>
                            <div
                                onClick={() => document.getElementById('app-cover-input')?.click()}
                                className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-600 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center"
                            >
                                {appForm.cover_url ? (
                                    <img src={appForm.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                ) : appCoverUploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                ) : (
                                    <Upload className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <input
                                id="app-cover-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0], 'app'); }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                Podcast Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={appForm.title}
                                onChange={e => setAppForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. UNILAG Tech Talk"
                                maxLength={80}
                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={appForm.category}
                                onChange={e => setAppForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={appForm.description}
                                onChange={e => setAppForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="What is your podcast about? Who is it for?"
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                            />
                        </div>

                        {appError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{appError}</p>}

                        <button
                            type="submit"
                            disabled={appSubmitting}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {appSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic2 className="w-4 h-4" />}
                            Submit Application
                        </button>
                    </form>
                </div>
            )}

            {/* ── Podcast Management View ── */}
            {selectedPodcast && (
                <div>
                    {/* Channel card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 mb-6 flex gap-4 items-start">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
                            {selectedPodcast.cover_url ? (
                                <img src={selectedPodcast.cover_url} alt={selectedPodcast.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                    <Mic2 className="w-8 h-8 text-white/80" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-bold text-slate-900 dark:text-white truncate">{selectedPodcast.title}</h2>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={startEdit}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors"
                                        title="Edit podcast"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <StatusBadge status={selectedPodcast.status} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{selectedPodcast.category}</p>
                            {selectedPodcast.status === 'approved' && (
                                <div className="flex gap-3 mt-2 text-xs text-slate-400 dark:text-zinc-500">
                                    <span>{selectedPodcast.episodes_count} episodes</span>
                                    <span>·</span>
                                    <span>{selectedPodcast.followers_count} followers</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Edit form ── */}
                    {editMode && (
                        <form
                            onSubmit={handleUpdatePodcast}
                            className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 mb-6 space-y-4"
                        >
                            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Edit Podcast</h3>

                            {/* Cover art */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Cover Art</label>
                                <div
                                    onClick={() => document.getElementById('edit-cover-input')?.click()}
                                    className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-600 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center"
                                >
                                    {editForm.cover_url ? (
                                        <img src={editForm.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                    ) : editCoverUploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                    ) : (
                                        <Upload className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <input
                                    id="edit-cover-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0], 'edit'); }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Podcast Name</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Category</label>
                                <select
                                    value={editForm.category}
                                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl resize-none"
                                />
                            </div>

                            {editError && <p className="text-xs text-red-500">{editError}</p>}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm flex justify-center items-center"
                                >
                                    {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Actions / New Episode ── */}
                    {selectedPodcast.status === 'approved' && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Episodes</h3>
                                {!showUploadForm && (
                                    <button
                                        onClick={() => setShowUploadForm(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Episode
                                    </button>
                                )}
                            </div>

                            {/* ── Upload Form ── */}
                            {showUploadForm && (
                                <form onSubmit={handlePublishEpisode} className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-5 mb-6 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-slate-800 dark:text-zinc-100">Upload New Episode</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowUploadForm(false);
                                                setEpForm({ title: '', description: '', episode_number: '', audio_url: '', duration_seconds: 0, cover_url: '' });
                                                setEpError('');
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                            Audio File <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                ref={audioInputRef}
                                                className="hidden"
                                                onChange={e => { if (e.target.files?.[0]) handleAudioFile(e.target.files[0]); }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => audioInputRef.current?.click()}
                                                disabled={epAudioUploading}
                                                className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 hover:border-emerald-400 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {epAudioUploading ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {epAudioProgress}%</>
                                                ) : epForm.audio_url ? (
                                                    <><CheckCircle className="w-4 h-4 text-emerald-500" /> Audio Ready</>
                                                ) : (
                                                    <><Upload className="w-4 h-4" /> Choose Audio File</>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">MP3, M4A, OGG, WAV (Max 200MB, min 2 mins)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                                            Episode Cover Art (Optional)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                onClick={() => epCoverInputRef.current?.click()}
                                                className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center shrink-0"
                                            >
                                                {epForm.cover_url ? (
                                                    <img src={epForm.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                                ) : epCoverUploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                                ) : (
                                                    <Upload className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                                Unique cover for this episode. If skipped, the podcast cover is used.
                                            </p>
                                        </div>
                                        <input
                                            ref={epCoverInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0], 'ep'); }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="col-span-3">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Episode Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={epForm.title}
                                                onChange={e => setEpForm(f => ({ ...f, title: e.target.value }))}
                                                placeholder="e.g. #1: Getting Started"
                                                maxLength={100}
                                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                                Ep. #
                                            </label>
                                            <input
                                                type="number"
                                                value={epForm.episode_number}
                                                onChange={e => setEpForm(f => ({ ...f, episode_number: e.target.value }))}
                                                placeholder="1"
                                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={epForm.description}
                                            onChange={e => setEpForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="What is this episode about?"
                                            rows={2}
                                            maxLength={500}
                                            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>

                                    {epError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{epError}</p>}

                                    <button
                                        type="submit"
                                        disabled={epSubmitting || epAudioUploading}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {epSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Publish Episode
                                    </button>
                                </form>
                            )}

                            {/* ── List of Episodes ── */}
                            {episodes.length === 0 && !showUploadForm ? (
                                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <Mic2 className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-zinc-400">No episodes yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {episodes.map(ep => (
                                        <EpisodeItem
                                            key={ep.id}
                                            episode={ep}
                                            podcastTitle={selectedPodcast.title}
                                            podcastCover={selectedPodcast.cover_url}
                                            queue={episodes}
                                            queueIndex={episodes.findIndex(e => e.id === ep.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
