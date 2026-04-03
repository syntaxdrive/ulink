import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Mic2, CheckCircle, Clock, XCircle, AlertCircle,
    Upload, Plus, Loader2, Trash2, Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cloudinaryService } from '../../services/cloudinaryService';
import { fetchMyPodcast, fetchMyEpisodes, applyForPodcast, uploadEpisode } from './hooks/usePodcasts';
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
    const editCoverInputRef = useRef<HTMLInputElement>(null);

    // undefined = loading, null = no podcast
    const [podcast, setPodcast] = useState<Podcast | null | undefined>(undefined);
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
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
        fetchMyPodcast()
            .then(async p => {
                setPodcast(p);
                if (p?.status === 'approved') {
                    const eps = await fetchMyEpisodes(p.id);
                    setEpisodes(eps);
                }
            })
            .catch(console.error);
    }, []);

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
            setPodcast(result);
        } catch (err: any) {
            if (err?.code === '23505') {
                setAppError('You already have a podcast application.');
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

    /* ── Start editing podcast ── */
    const startEdit = () => {
        if (!podcast) return;
        setEditForm({
            title: podcast.title,
            description: podcast.description ?? '',
            category: podcast.category,
            cover_url: podcast.cover_url ?? '',
        });
        setEditMode(true);
        setEditError('');
    };

    /* ── Save podcast edits ── */
    const handleUpdatePodcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.title.trim()) { setEditError('Podcast name is required.'); return; }
        if (!podcast?.id) return;
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
                .eq('id', podcast.id)
                .select()
                .single();
            if (error) throw error;
            setPodcast(data as Podcast);
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
        if (!podcast?.id) return;

        setEpSubmitting(true);
        setEpError('');
        try {
            const ep = await uploadEpisode(podcast.id, {
                title: epForm.title.trim(),
                description: epForm.description.trim() || undefined,
                audio_url: epForm.audio_url,
                cover_url: epForm.cover_url || undefined,
                duration_seconds: epForm.duration_seconds,
                episode_number: epForm.episode_number ? parseInt(epForm.episode_number, 10) : undefined,
            });
            setEpisodes(prev => [ep, ...prev]);
            setPodcast(p => p ? { ...p, episodes_count: p.episodes_count + 1 } : p);
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
    if (podcast === undefined) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-32">
            <button
                onClick={() => navigate('/app/podcasts')}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Podcasts
            </button>

            <div className="flex items-center gap-2 mb-6">
                <Mic2 className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your Podcast</h1>
            </div>

            {/* ── No podcast yet: application form ── */}
            {!podcast && (
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

            {/* ── Podcast exists ── */}
            {podcast && (
                <div>
                    {/* Channel card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 mb-6 flex gap-4 items-start">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
                            {podcast.cover_url ? (
                                <img src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                                    <Mic2 className="w-8 h-8 text-white/80" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-bold text-slate-900 dark:text-white truncate">{podcast.title}</h2>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={startEdit}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors"
                                        title="Edit podcast"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <StatusBadge status={podcast.status} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{podcast.category}</p>
                            {podcast.status === 'approved' && (
                                <div className="flex gap-3 mt-2 text-xs text-slate-400 dark:text-zinc-500">
                                    <span>{podcast.episodes_count} episodes</span>
                                    <span>·</span>
                                    <span>{podcast.followers_count} followers</span>
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
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={() => editCoverInputRef.current?.click()}
                                    className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-600 cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center shrink-0"
                                >
                                    {editForm.cover_url ? (
                                        <img src={editForm.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                    ) : editCoverUploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    ) : (
                                        <Upload className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400">
                                    <p className="font-semibold">Cover Art</p>
                                    <p>Click to change · Max 5 MB</p>
                                </div>
                                <input
                                    ref={editCoverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0], 'edit'); }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                    Podcast Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    maxLength={80}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Category</label>
                                <select
                                    value={editForm.category}
                                    onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                                />
                            </div>

                            {editError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{editError}</p>}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting || editCoverUploading}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Status-specific banners */}
                    {podcast.status === 'pending' && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Application Under Review</h3>
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Your podcast is being reviewed. You'll get a notification once it's approved or if we need more info.
                            </p>
                        </div>
                    )}

                    {podcast.status === 'rejected' && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Application Not Approved</h3>
                            </div>
                            {podcast.rejection_reason && (
                                <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                                    Reason: {podcast.rejection_reason}
                                </p>
                            )}
                            <p className="text-xs text-red-600/70 dark:text-red-500/70">
                                Contact support if you believe this was a mistake.
                            </p>
                        </div>
                    )}

                    {podcast.status === 'suspended' && (
                        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Podcast Suspended</h3>
                            </div>
                            <p className="text-sm text-orange-700 dark:text-orange-400">
                                Your podcast has been suspended. Please contact support for more information.
                            </p>
                        </div>
                    )}

                    {/* ── Approved: episode management ── */}
                    {podcast.status === 'approved' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                                    Episodes
                                </h2>
                                <button
                                    onClick={() => setShowUploadForm(v => !v)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> New Episode
                                </button>
                            </div>

                            {/* Episode upload form */}
                            {showUploadForm && (
                                <form
                                    onSubmit={handlePublishEpisode}
                                    className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 mb-5 space-y-4"
                                >
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Upload New Episode</h3>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                            Episode Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={epForm.title}
                                            onChange={e => setEpForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="e.g. Episode 1: Getting Started"
                                            maxLength={120}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                                Episode #
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={epForm.episode_number}
                                                onChange={e => setEpForm(f => ({ ...f, episode_number: e.target.value }))}
                                                placeholder="Optional"
                                                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                                Episode Art
                                            </label>
                                            <div
                                                onClick={() => epCoverInputRef.current?.click()}
                                                className="w-full h-10 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-emerald-400 transition-colors flex items-center gap-2 px-2"
                                            >
                                                {epForm.cover_url ? (
                                                    <>
                                                        <img
                                                            src={epForm.cover_url}
                                                            alt="Episode cover"
                                                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                                                        />
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex-1">
                                                            Image selected
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.stopPropagation(); setEpForm(f => ({ ...f, cover_url: '' })); }}
                                                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                                        >
                                                            ×
                                                        </button>
                                                    </>
                                                ) : epCoverUploading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500 mx-auto" />
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-zinc-500 mx-auto">
                                                        Choose image
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                ref={epCoverInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0], 'ep'); }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={epForm.description}
                                            onChange={e => setEpForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="What's this episode about?"
                                            rows={2}
                                            maxLength={500}
                                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                                        />
                                    </div>

                                    {/* Audio upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                                            Audio File <span className="text-red-500">*</span>
                                            <span className="font-normal text-slate-400 ml-1">
                                                (MP3, M4A, WAV · min 1 min · max {MAX_FILE_MB} MB)
                                            </span>
                                        </label>

                                        {epForm.audio_url ? (
                                            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex-1 truncate">
                                                    Audio uploaded successfully
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEpForm(f => ({ ...f, audio_url: '', duration_seconds: 0 }))}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : epAudioUploading ? (
                                            <div className="px-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                                                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                                                        Uploading... {epAudioProgress}%
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-300"
                                                        style={{ width: `${epAudioProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => audioInputRef.current?.click()}
                                                className="w-full px-3 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-dashed border-slate-200 dark:border-zinc-600 rounded-xl text-sm text-slate-500 dark:text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" /> Choose audio file
                                            </button>
                                        )}

                                        <input
                                            ref={audioInputRef}
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={e => { if (e.target.files?.[0]) handleAudioFile(e.target.files[0]); }}
                                        />
                                    </div>

                                    {epError && (
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{epError}</p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowUploadForm(false); setEpError(''); }}
                                            className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={epSubmitting || epAudioUploading || !epForm.audio_url}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {epSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Publish Episode
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Episodes list */}
                            {episodes.length === 0 && !showUploadForm ? (
                                <div className="text-center py-12">
                                    <Mic2 className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">No episodes yet.</p>
                                    <button
                                        onClick={() => setShowUploadForm(true)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
                                    >
                                        Upload your first episode
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                    {episodes.map((ep, i) => (
                                        <EpisodeItem
                                            key={ep.id}
                                            episode={ep}
                                            podcastTitle={podcast.title}
                                            podcastCover={podcast.cover_url}
                                            queue={episodes}
                                            queueIndex={i}
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
