import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Globe, Lock, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { type Community } from '../../../types';

interface EditCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    community: Community;
    onUpdate: () => void;
}

export default function EditCommunityModal({ isOpen, onClose, community, onUpdate }: EditCommunityModalProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description || '');
    const [privacy, setPrivacy] = useState<'public' | 'private'>(community.privacy as 'public' | 'private');

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>(community.icon_url || '');
    const [coverPreview, setCoverPreview] = useState<string>(community.cover_image_url || '');

    useEffect(() => {
        if (isOpen) {
            setName(community.name);
            setDescription(community.description || '');
            setPrivacy(community.privacy as 'public' | 'private');
            setIconPreview(community.icon_url || '');
            setCoverPreview(community.cover_image_url || '');
        }
    }, [isOpen, community]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let iconUrl = community.icon_url || '';
            let coverUrl = community.cover_image_url || '';

            // Upload new icon if provided
            if (iconFile) {
                const iconExt = iconFile.name.split('.').pop();
                const iconPath = `community-icons/${community.slug}-${Date.now()}.${iconExt}`;
                const { error: iconError } = await supabase.storage
                    .from('community-images')
                    .upload(iconPath, iconFile);

                if (!iconError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('community-images')
                        .getPublicUrl(iconPath);
                    iconUrl = publicUrl;
                }
            }

            // Upload new cover if provided
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop();
                const coverPath = `community-covers/${community.slug}-${Date.now()}.${coverExt}`;
                const { error: coverError } = await supabase.storage
                    .from('community-images')
                    .upload(coverPath, coverFile);

                if (!coverError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('community-images')
                        .getPublicUrl(coverPath);
                    coverUrl = publicUrl;
                }
            }

            // Update community
            const { error } = await supabase
                .from('communities')
                .update({
                    name,
                    description,
                    privacy,
                    icon_url: iconUrl || null,
                    cover_image_url: coverUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', community.id);

            if (error) throw error;

            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error updating community:', error);
            alert(error.message || 'Failed to update community');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you strictly sure you want to delete this community? This action CANNOT be undone and will delete all posts and memberships.')) {
            return;
        }

        if (prompt(`Please type "${community.name}" to confirm deletion:`) !== community.name) {
            alert('Community name verification failed.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', community.id);

            if (error) throw error;

            alert('Community deleted successfully.');
            navigate('/app/communities'); // Redirect to communities page
        } catch (error: any) {
            console.error('Error deleting community:', error);
            alert(error.message || 'Failed to delete community');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">Edit Community</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Community Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm sm:text-base"
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1.5">Description <span className="text-stone-400 font-normal">(Optional)</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this community about?"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all min-h-[70px] sm:min-h-[80px] resize-none text-sm sm:text-base"
                            rows={3}
                        />
                    </div>

                    {/* Image Uploads */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Icon Upload */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">Icon</label>
                            <label className="block cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setIconFile(file);
                                            setIconPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <div className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 transition-colors flex items-center justify-center bg-stone-50 hover:bg-indigo-50/30 overflow-hidden relative group">
                                    {iconPreview ? (
                                        <>
                                            <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-2">
                                            <ImageIcon className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                                            <p className="text-[10px] text-stone-500">Upload Icon</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Cover Upload */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">Cover</label>
                            <label className="block cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setCoverFile(file);
                                            setCoverPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <div className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 transition-colors flex items-center justify-center bg-stone-50 hover:bg-indigo-50/30 overflow-hidden relative group">
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-2">
                                            <ImageIcon className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                                            <p className="text-[10px] text-stone-500">Upload Cover</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Privacy Toggle */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">Privacy</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${privacy === 'public'
                                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                    : 'border-stone-100 hover:border-stone-200 bg-white'}`}
                            >
                                <Globe className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 ${privacy === 'public' ? 'text-indigo-600' : 'text-stone-400'}`} />
                                <div className="font-bold text-xs sm:text-sm text-stone-900">Public</div>
                                <div className="text-[10px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1 leading-tight">Anyone can join</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${privacy === 'private'
                                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                    : 'border-stone-100 hover:border-stone-200 bg-white'}`}
                            >
                                <Lock className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 ${privacy === 'private' ? 'text-indigo-600' : 'text-stone-400'}`} />
                                <div className="font-bold text-xs sm:text-sm text-stone-900">Private</div>
                                <div className="text-[10px] sm:text-xs text-stone-500 mt-0.5 sm:mt-1 leading-tight">Invite only</div>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 sm:pt-3 sticky bottom-0 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-0 space-y-3">
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full py-3 sm:py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all border border-red-100 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Community
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
