import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Globe, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [slug, setSlug] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>('');
    const [coverPreview, setCoverPreview] = useState<string>('');

    if (!isOpen) return null;

    // Auto-generate slug from name
    const handleNameChange = (val: string) => {
        setName(val);
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    // Validate image file
    const validateImageFile = (file: File, type: 'icon' | 'cover'): string | null => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            return `${type === 'icon' ? 'Icon' : 'Cover'} image must be less than 5MB`;
        }

        if (!allowedTypes.includes(file.type)) {
            return `${type === 'icon' ? 'Icon' : 'Cover'} must be a valid image (JPEG, PNG, GIF, or WebP)`;
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to create a community');
            return;
        }

        // Validate name and slug
        if (name.trim().length < 3) {
            alert('Community name must be at least 3 characters long');
            return;
        }

        if (slug.trim().length < 3) {
            alert('Community URL must be at least 3 characters long');
            return;
        }

        // Validate image files
        if (iconFile) {
            const iconError = validateImageFile(iconFile, 'icon');
            if (iconError) {
                alert(iconError);
                return;
            }
        }

        if (coverFile) {
            const coverError = validateImageFile(coverFile, 'cover');
            if (coverError) {
                alert(coverError);
                return;
            }
        }

        setLoading(true);
        try {
            // Check slug availability
            const { data: existing, error: checkError } = await supabase
                .from('communities')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (checkError) {
                throw new Error('Failed to check community URL availability. Please try again.');
            }

            if (existing) {
                alert('This community URL identifier is already taken. Please try a different name.');
                setLoading(false);
                return;
            }

            // Upload images if provided
            let iconUrl = '';
            let coverUrl = '';

            if (iconFile) {
                try {
                    const iconExt = iconFile.name.split('.').pop();
                    const iconPath = `community-icons/${slug}-${Date.now()}.${iconExt}`;
                    const { error: iconError } = await supabase.storage
                        .from('community-images')
                        .upload(iconPath, iconFile, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (iconError) {
                        console.error('Icon upload error:', iconError);
                        throw new Error(`Failed to upload icon: ${iconError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('community-images')
                        .getPublicUrl(iconPath);
                    iconUrl = publicUrl;
                } catch (uploadError: any) {
                    console.error('Icon upload failed:', uploadError);
                    throw new Error(uploadError.message || 'Failed to upload icon image');
                }
            }

            if (coverFile) {
                try {
                    const coverExt = coverFile.name.split('.').pop();
                    const coverPath = `community-covers/${slug}-${Date.now()}.${coverExt}`;
                    const { error: coverError } = await supabase.storage
                        .from('community-images')
                        .upload(coverPath, coverFile, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (coverError) {
                        console.error('Cover upload error:', coverError);
                        throw new Error(`Failed to upload cover: ${coverError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('community-images')
                        .getPublicUrl(coverPath);
                    coverUrl = publicUrl;
                } catch (uploadError: any) {
                    console.error('Cover upload failed:', uploadError);
                    throw new Error(uploadError.message || 'Failed to upload cover image');
                }
            }

            // Create Community
            const { data, error } = await supabase
                .from('communities')
                .insert({
                    name: name.trim(),
                    slug: slug.trim(),
                    description: description.trim() || null,
                    privacy,
                    created_by: user.id,
                    icon_url: iconUrl || null,
                    cover_image_url: coverUrl || null
                })
                .select()
                .single();

            if (error) {
                console.error('Community creation error:', error);
                throw new Error(`Failed to create community: ${error.message}`);
            }

            if (!data) {
                throw new Error('Community created but no data returned');
            }

            // Note: Database trigger automatically adds creator as owner
            // See migrations/community_creator_trigger.sql

            // Success! Close modal and navigate
            onClose();

            // Small delay to ensure trigger has completed
            setTimeout(() => {
                navigate(`/app/communities/${data.slug}`);
            }, 150);

        } catch (error: any) {
            console.error('Error creating community:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to create community. Please try again.';

            if (error.message) {
                if (error.message.includes('storage')) {
                    errorMessage = 'Failed to upload images. Please check your internet connection and try again.';
                } else if (error.message.includes('permission')) {
                    errorMessage = 'You do not have permission to create communities. Please contact support.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else {
                    errorMessage = error.message;
                }
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] h-full sm:h-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col">
                {/* Header - Fixed */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">Create Community</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500 bg-stone-100 sm:bg-transparent">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 pb-28 sm:pb-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                    {/* Name & Slug */}
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1.5">Community Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g. Abuja Tech Devs"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm sm:text-base"
                                required
                                minLength={3}
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Community URL</label>
                            <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-500">
                                <span className="text-xs sm:text-sm whitespace-nowrap">unilink.app/c/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 ml-1 text-stone-900 font-bold text-xs sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
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

                    {/* Privacy Toggle - Compact on Mobile */}
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

                    {/* Image Uploads */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {/* Icon Upload */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">Icon <span className="text-stone-400 font-normal text-xs">(Optional)</span></label>
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
                                <div className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 transition-colors flex items-center justify-center bg-stone-50 hover:bg-indigo-50/30 overflow-hidden">
                                    {iconPreview ? (
                                        <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Globe className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                                            <p className="text-[10px] text-stone-500">Upload</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Cover Upload */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">Cover <span className="text-stone-400 font-normal text-xs">(Optional)</span></label>
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
                                <div className="aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 transition-colors flex items-center justify-center bg-stone-50 hover:bg-indigo-50/30 overflow-hidden">
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <Globe className="w-6 h-6 mx-auto text-stone-400 mb-1" />
                                            <p className="text-[10px] text-stone-500">Upload</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions - Sticky on Mobile */}
                    <div className="pt-2 sm:pt-3 absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-100 px-4 sm:px-6 pb-safe sm:pb-0 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full py-4 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                        >
                            {loading ? 'Creating...' : 'Create Community'}
                        </button>
                        {/* Empty spacer on mobile to prevent bottom nav overlap */}
                        <div className="h-20 sm:h-0"></div>
                    </div>
                </form>
            </div>
        </div>
    );
}
