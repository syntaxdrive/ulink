import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSponsoredPosts } from '../../../hooks/useSponsoredPosts';
import type { CreateSponsoredPostData } from '../../../types/sponsored';
import {
    Plus, Trash2, Play, Pause, Image as ImageIcon, Eye, MousePointer,
    Calendar, Clock, Target, DollarSign, Upload, X, Loader2
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type { Profile } from '../../../types';

const DURATION_PRESETS = [
    { label: '3 Days', days: 3 },
    { label: '7 Days', days: 7 },
    { label: '14 Days', days: 14 },
    { label: '30 Days', days: 30 },
    { label: 'Custom', days: 0 },
];

const inputCls = 'w-full px-3 py-2.5 border border-stone-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';
const labelCls = 'block text-xs font-bold text-stone-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider';

export default function SponsoredPostsManager() {
    const { posts, loading, createPost, updatePost, deletePost } = useSponsoredPosts();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [organizations, setOrganizations] = useState<Profile[]>([]);
    const [selectedDuration, setSelectedDuration] = useState(7);
    const [customEndDate, setCustomEndDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState<CreateSponsoredPostData>({
        content: '',
        organization_id: '',
        cta_text: 'Learn More',
        cta_url: '',
        target_audience: 'all',
        media_url: '',
        media_type: 'image',
        priority: 5,
        start_date: new Date().toISOString().slice(0, 16),
        max_impressions: undefined,
        max_clicks: undefined,
    });

    useEffect(() => {
        const fetchOrgs = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'org')
                .order('name', { ascending: true });
            if (data) {
                setOrganizations(data);
                if (data.length > 0 && !formState.organization_id) {
                    setFormState(prev => ({ ...prev, organization_id: data[0].id }));
                }
            }
        };
        fetchOrgs();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop() ?? 'jpg';
            const path = `sponsored/${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
            if (!error) {
                const url = supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
                setFormState(prev => ({
                    ...prev,
                    media_url: url,
                    media_type: file.type.startsWith('video') ? 'video' : 'image',
                }));
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async () => {
        if (!formState.content || !formState.organization_id) return;
        try {
            let endDate: string | undefined;
            if (selectedDuration > 0) {
                const d = new Date(formState.start_date || Date.now());
                d.setDate(d.getDate() + selectedDuration);
                endDate = d.toISOString();
            } else if (customEndDate) {
                endDate = new Date(customEndDate).toISOString();
            }

            await createPost({
                ...formState,
                end_date: endDate,
            });
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err: any) {
            alert('Failed to create ad: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormState({
            content: '',
            organization_id: organizations[0]?.id || '',
            cta_text: 'Learn More',
            cta_url: '',
            target_audience: 'all',
            media_url: '',
            media_type: 'image',
            priority: 5,
            start_date: new Date().toISOString().slice(0, 16),
        });
        setSelectedDuration(7);
        setCustomEndDate('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this sponsored ad permanently?')) return;
        try { await deletePost(id); } catch (err: any) { alert('Failed: ' + err.message); }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try { await updatePost(id, { is_active: !current }); } catch (err: any) { alert('Failed: ' + err.message); }
    };

    const daysRemaining = (endDate: string | null) => {
        if (!endDate) return '∞';
        const diff = new Date(endDate).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const d = Math.ceil(diff / 86400000);
        return `${d}d left`;
    };

    const ctr = (impressions: number, clicks: number) => {
        if (impressions === 0) return '0%';
        return ((clicks / impressions) * 100).toFixed(1) + '%';
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Sponsored Ads</h2>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">{posts.length} campaign{posts.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-stone-200 dark:border-zinc-700">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No campaigns yet</p>
                    <p className="text-sm mt-1">Create your first sponsored ad to reach students</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => (
                        <div key={post.id} className={`bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                            post.is_active ? 'border-emerald-200 dark:border-emerald-800/40' : 'border-stone-200 dark:border-zinc-800 opacity-70'
                        }`}>
                            <div className="flex flex-col sm:flex-row">
                                {/* Media Preview */}
                                <div className="w-full sm:w-36 h-28 sm:h-auto bg-stone-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                    {post.media_url ? (
                                        post.media_type === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/10">
                                                <Play className="w-8 h-8 text-stone-400" />
                                            </div>
                                        ) : (
                                            <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-stone-300 dark:text-zinc-600" />
                                        </div>
                                    )}
                                    {/* Status badge overlay */}
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        post.is_active
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-stone-400 text-white'
                                    }`}>
                                        {post.is_active ? '● Live' : '● Paused'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-stone-900 dark:text-white text-sm truncate">
                                                {post.organization?.name || 'Unknown Org'}
                                            </h3>
                                            <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2 mt-0.5">{post.content}</p>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => toggleActive(post.id, post.is_active)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    post.is_active
                                                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                }`}
                                                title={post.is_active ? 'Pause campaign' : 'Resume campaign'}
                                            >
                                                {post.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
                                            <Eye className="w-3 h-3" /> {post.impressions.toLocaleString()} views
                                        </span>
                                        <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
                                            <MousePointer className="w-3 h-3" /> {post.clicks.toLocaleString()} clicks
                                        </span>
                                        <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
                                            <Target className="w-3 h-3" /> CTR {ctr(post.impressions, post.clicks)}
                                        </span>
                                        <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
                                            <Clock className="w-3 h-3" /> {daysRemaining(post.end_date)}
                                        </span>
                                        {post.max_impressions && (
                                            <span className="text-stone-400">Budget: {post.impressions}/{post.max_impressions}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Create Modal ── */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
                title="Create Sponsored Campaign"
                size="2xl"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium text-sm">
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!formState.content || !formState.organization_id}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
                        >
                            Launch Campaign
                        </button>
                    </div>
                }
            >
                <div className="space-y-5 p-1">
                    {/* Organization */}
                    <div>
                        <label className={labelCls}>Organization / Sponsor</label>
                        <select
                            value={formState.organization_id}
                            onChange={e => setFormState({ ...formState, organization_id: e.target.value })}
                            className={inputCls}
                        >
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className={labelCls}>Ad Content <span className="text-red-500">*</span></label>
                        <textarea
                            value={formState.content}
                            onChange={e => setFormState({ ...formState, content: e.target.value })}
                            placeholder="Write your sponsored message here..."
                            rows={3}
                            maxLength={500}
                            className={inputCls + ' resize-none'}
                        />
                        <p className="text-[10px] text-stone-400 mt-1 text-right">{formState.content.length}/500</p>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className={labelCls}>Media</label>
                        {formState.media_url ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700">
                                <img src={formState.media_url} alt="" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setFormState({ ...formState, media_url: '' })}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-28 rounded-xl border-2 border-dashed border-stone-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-stone-500"
                            >
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        <span className="text-xs font-medium">Upload image or video</span>
                                    </>
                                )}
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Button Text</label>
                            <input
                                type="text"
                                value={formState.cta_text || ''}
                                onChange={e => setFormState({ ...formState, cta_text: e.target.value })}
                                placeholder="Learn More"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Button URL</label>
                            <input
                                type="url"
                                value={formState.cta_url || ''}
                                onChange={e => setFormState({ ...formState, cta_url: e.target.value })}
                                placeholder="https://..."
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className={labelCls}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Campaign Duration
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {DURATION_PRESETS.map(dp => (
                                <button
                                    key={dp.label}
                                    type="button"
                                    onClick={() => setSelectedDuration(dp.days)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        selectedDuration === dp.days
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-stone-300'
                                    }`}
                                >
                                    {dp.label}
                                </button>
                            ))}
                        </div>
                        {selectedDuration === 0 && (
                            <input
                                type="datetime-local"
                                value={customEndDate}
                                onChange={e => setCustomEndDate(e.target.value)}
                                className={inputCls + ' mt-2'}
                            />
                        )}
                    </div>

                    {/* Target + Priority + Budget */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelCls}>
                                <Target className="w-3 h-3 inline mr-1" />
                                Audience
                            </label>
                            <select
                                value={formState.target_audience || 'all'}
                                onChange={e => setFormState({ ...formState, target_audience: e.target.value })}
                                className={inputCls}
                            >
                                <option value="all">Everyone</option>
                                <option value="students">Students</option>
                                <option value="organizations">Orgs</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>
                                <DollarSign className="w-3 h-3 inline mr-1" />
                                Max Views
                            </label>
                            <input
                                type="number"
                                value={formState.max_impressions || ''}
                                onChange={e => setFormState({ ...formState, max_impressions: e.target.value ? parseInt(e.target.value) : undefined })}
                                placeholder="∞"
                                min={0}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>
                                <MousePointer className="w-3 h-3 inline mr-1" />
                                Max Clicks
                            </label>
                            <input
                                type="number"
                                value={formState.max_clicks || ''}
                                onChange={e => setFormState({ ...formState, max_clicks: e.target.value ? parseInt(e.target.value) : undefined })}
                                placeholder="∞"
                                min={0}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Priority Slider */}
                    <div>
                        <label className={labelCls}>Priority (1–10)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={formState.priority || 5}
                                onChange={e => setFormState({ ...formState, priority: parseInt(e.target.value) })}
                                className="flex-1 accent-emerald-600"
                            />
                            <span className="text-sm font-bold text-stone-900 dark:text-white w-6 text-center">{formState.priority || 5}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Higher = shown more often in feeds</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
