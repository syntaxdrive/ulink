import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSponsoredPosts } from '../../../hooks/useSponsoredPosts';
import type { CreateSponsoredPostData } from '../../../types/sponsored';
import { Plus, Trash2, Play, Image as ImageIcon, Eye, MousePointer } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import type { Profile } from '../../../types';

export default function SponsoredPostsManager() {
    const { posts, loading, createPost, deletePost } = useSponsoredPosts();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [organizations, setOrganizations] = useState<Profile[]>([]);

    const [formState, setFormState] = useState<CreateSponsoredPostData>({
        content: '',
        organization_id: '',
        cta_text: 'Learn More',
        cta_url: '',
        target_audience: 'all',
        media_url: '',
        media_type: 'image',
        priority: 0
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

    const handleCreate = async () => {
        if (!formState.content || !formState.organization_id) return;
        try {
            await createPost(formState);
            setIsCreateModalOpen(false);
            setFormState({
                content: '',
                organization_id: organizations[0]?.id || '',
                cta_text: 'Learn More',
                cta_url: '',
                target_audience: 'all',
                media_url: '',
                media_type: 'image',
                priority: 0
            });
        } catch (err: any) {
            alert('Failed to create post: ' + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sponsored post?')) return;
        try {
            await deletePost(id);
        } catch (err: any) {
            alert('Failed to delete post: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">Sponsored Posts</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Ad
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center p-8 text-stone-500 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-stone-200 dark:border-zinc-700">
                    No sponsored posts yet. Create one to get started!
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-stone-200 dark:border-zinc-800 shadow-sm flex items-start gap-4">
                            {/* Preview Image/Video */}
                            <div className="w-32 h-20 bg-stone-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative">
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
                                        <ImageIcon className="w-6 h-6 text-stone-300" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-stone-900 dark:text-white truncate">
                                        {post.organization?.name || 'Unknown Org'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 mb-2">{post.content}</p>

                                {/* Stats */}
                                <div className="flex gap-4 text-xs text-stone-500">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> {post.impressions} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MousePointer className="w-3 h-3" /> {post.clicks} clicks
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${post.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {post.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Sponsored Post"
                size="2xl"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm"
                        >
                            Create Ad
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 p-1">
                    {/* Organization Select */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Organization</label>
                        <select
                            value={formState.organization_id}
                            onChange={(e) => setFormState({ ...formState, organization_id: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        >
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Ad Content</label>
                        <textarea
                            value={formState.content}
                            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                            placeholder="Write your sponsored message here..."
                            rows={4}
                            className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                    </div>

                    {/* Media */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Media URL</label>
                            <input
                                type="text"
                                value={formState.media_url || ''}
                                onChange={(e) => setFormState({ ...formState, media_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Media Type</label>
                            <select
                                value={formState.media_type || 'image'}
                                onChange={(e) => setFormState({ ...formState, media_type: e.target.value as 'image' | 'video' })}
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Button Text</label>
                            <input
                                type="text"
                                value={formState.cta_text || ''}
                                onChange={(e) => setFormState({ ...formState, cta_text: e.target.value })}
                                placeholder="Learn More"
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Button URL</label>
                            <input
                                type="text"
                                value={formState.cta_url || ''}
                                onChange={(e) => setFormState({ ...formState, cta_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Target Audience</label>
                            <select
                                value={formState.target_audience || 'all'}
                                onChange={(e) => setFormState({ ...formState, target_audience: e.target.value })}
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="all">All Users</option>
                                <option value="students">Students Only</option>
                                <option value="organizations">Organizations Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">Priority (Higher = More Frequent)</label>
                            <input
                                type="number"
                                value={formState.priority || 0}
                                onChange={(e) => setFormState({ ...formState, priority: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-stone-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
