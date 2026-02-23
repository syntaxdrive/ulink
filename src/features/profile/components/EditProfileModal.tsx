import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, X, AtSign, Image as ImageIcon, Instagram, Twitter, Upload, Linkedin, Globe, Facebook } from 'lucide-react';
import type { Profile } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface EditProfileModalProps {
    user: Profile;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedProfile: Profile) => void;
}

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }: EditProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        headline: user.headline || '',
        location: user.location || '',
        university: user.university || '',
        about: user.about || '',
        instagram: user.instagram_url || '',
        twitter: user.twitter_url || '',
        linkedin: user.linkedin_url || '',
        website: user.website_url || '',
        facebook: user.facebook_url || '',
        industry: user.industry || '',
    });
    const [bgFile, setBgFile] = useState<File | null>(null);
    const [bgPreview, setBgPreview] = useState<string | null>(user.background_image_url || null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    // Avatar State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
    const [selectedPresetAvatar, setSelectedPresetAvatar] = useState<string | null>(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const PRESET_AVATARS = [
        // avataaars style — same seeds as test users
        'https://api.dicebear.com/7.x/avataaars/svg?seed=chidi&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=amara&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=tunde&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=ngozi&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=emeka&backgroundColor=ffd5dc',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=blessing&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=adaeze&backgroundColor=ffd5dc',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=seun&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=chisom&backgroundColor=b6e3f4',
        // avataaars — more variety
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan&backgroundColor=ffd5dc',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn&backgroundColor=c0aede',
        // lorelei style
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Hassan&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Kemi&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Bisi&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Tolu&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Ola&backgroundColor=ffd5dc',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=Dele&backgroundColor=b6e3f4',
        // micah style
        'https://api.dicebear.com/7.x/micah/svg?seed=Ada&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/micah/svg?seed=Chukwu&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/micah/svg?seed=Ife&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/micah/svg?seed=Nne&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/micah/svg?seed=Funke&backgroundColor=ffd5dc',
        'https://api.dicebear.com/7.x/micah/svg?seed=Yemi&backgroundColor=b6e3f4',
        // thumbs style
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Zara&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Kofi&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Amina&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Tobi&backgroundColor=d1d4f9',
        // fun / playful
        'https://api.dicebear.com/7.x/bottts/svg?seed=spark&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/bottts/svg?seed=nova&backgroundColor=d1d4f9',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=star&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=moon&backgroundColor=ffd5dc',
    ];

    const handleSelectPresetAvatar = (url: string) => {
        setAvatarPreview(url);
        setAvatarFile(null);
        setSelectedPresetAvatar(url);
        setShowAvatarPicker(false);
    };

    // Skills State
    const [skills, setSkills] = useState<string[]>(user.skills || []);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData({
            name: user.name || '',
            username: user.username || '',
            headline: user.headline || '',
            location: user.location || '',
            university: user.university || '',
            about: user.about || '',
            instagram: user.instagram_url || '',
            twitter: user.twitter_url || '',
            linkedin: user.linkedin_url || '',
            website: user.website_url || '',
            facebook: user.facebook_url || '',
            industry: user.industry || '',
        });
        setBgPreview(user.background_image_url || null);
        setAvatarPreview(user.avatar_url || null);
        setSelectedPresetAvatar(null);
        setShowAvatarPicker(false);
        setAvatarFile(null);
        setSkills(user.skills || []);
    }, [user, isOpen]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image must be less than 10MB');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !skills.includes(val)) {
                setSkills([...skills, val]);
                e.currentTarget.value = '';
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image must be less than 10MB');
                return;
            }
            setBgFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBgPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let bgUrl = user.background_image_url;

            if (bgFile) {
                try {
                    const fileExt = bgFile.name.split('.').pop();
                    const fileName = `backgrounds/${user.id}_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(fileName, bgFile, { upsert: true });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('uploads')
                        .getPublicUrl(fileName);
                    bgUrl = publicUrl;
                } catch (uploadErr: any) {
                    console.error('Background upload failed:', uploadErr.message);
                    // Continue saving profile data even if image upload fails
                }
            }

            let avatarUrl = user.avatar_url;
            if (avatarFile) {
                try {
                    const fileExt = avatarFile.name.split('.').pop();
                    const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(fileName, avatarFile, { upsert: true });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                    avatarUrl = publicUrl;
                } catch (uploadErr: any) {
                    console.error('Avatar upload failed:', uploadErr.message);
                    // Continue saving profile data even if image upload fails
                }
            } else if (selectedPresetAvatar) {
                // Use preset avatar URL directly — no upload needed
                avatarUrl = selectedPresetAvatar;
            }

            const updates: any = {
                ...formData,
                background_image_url: bgUrl,
                avatar_url: avatarUrl,
                skills: skills,
                instagram_url: formData.instagram,
                twitter_url: formData.twitter,
                linkedin_url: formData.linkedin,
                website_url: formData.website,
                facebook_url: formData.facebook,
                industry: formData.industry || null,
                updated_at: new Date().toISOString(),
            };

            // Clean up temp fields
            delete updates.instagram;
            delete updates.twitter;
            delete updates.linkedin;
            delete updates.website;
            delete updates.facebook;

            // Remove username if it hasn't changed to avoid unique constraint checks on self
            if (updates.username === user.username) {
                delete updates.username;
            } else {
                // Validate Username
                if (updates.username.length < 3) throw new Error('Username must be at least 3 chars');
                if (!/^[a-z0-9_]+$/.test(updates.username)) throw new Error('Invalid characters in username');
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (updateError) {
                if (updateError.code === '23505') throw new Error('Username taken');
                throw updateError;
            }

            onUpdate({
                ...user,
                ...formData,
                background_image_url: bgUrl,
                avatar_url: avatarUrl,
                skills: skills,
                instagram_url: formData.instagram,
                twitter_url: formData.twitter,
                linkedin_url: formData.linkedin,
                website_url: formData.website,
                facebook_url: formData.facebook,
                industry: formData.industry
            });
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Profile"
            size="2xl"
            footer={
                <button
                    type="submit"
                    form="edit-profile-form"
                    disabled={loading}
                    className="w-full bg-stone-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold py-3 rounded-xl hover:bg-stone-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-stone-200 dark:shadow-zinc-800 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
            }
        >
            <form id="edit-profile-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 text-sm rounded-xl font-medium">
                        {error}
                    </div>
                )}

                <div className="relative mb-8">
                    {/* Background Image */}
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 group">
                        {bgPreview ? (
                            <img src={bgPreview} alt="Background" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-stone-400 dark:text-zinc-600">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => bgInputRef.current?.click()}>
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={bgInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleBgChange}
                    />

                    {/* Avatar Upload (Overlapping) */}
                    <div className="absolute -bottom-12 left-6">
                        <div className="relative group/avatar">
                            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden bg-white dark:bg-zinc-900">
                                <img
                                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-full"
                                    onClick={() => avatarInputRef.current?.click()}
                                >
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Avatar actions — rendered in normal flow so they're never clipped */}
                <div className="pt-14 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="text-xs font-semibold text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 underline underline-offset-2 transition-colors"
                    >
                        Upload photo
                    </button>
                    <span className="text-stone-300 dark:text-zinc-700">·</span>
                    <button
                        type="button"
                        onClick={() => setShowAvatarPicker(v => !v)}
                        className="text-xs font-semibold text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 underline underline-offset-2 transition-colors"
                    >
                        {showAvatarPicker ? 'Hide avatars' : 'Choose avatar'}
                    </button>
                </div>

                {/* Avatar Picker — inline, never clipped */}
                {showAvatarPicker && (
                    <div className="bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700 rounded-2xl p-3">
                        <p className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Pick an avatar</p>
                        <div className="grid grid-cols-8 gap-2">
                            {PRESET_AVATARS.map((url, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectPresetAvatar(url)}
                                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                                        avatarPreview === url
                                            ? 'border-stone-900 dark:border-zinc-100 ring-2 ring-stone-400 dark:ring-zinc-500'
                                            : 'border-stone-200 dark:border-zinc-700 hover:border-stone-400'
                                    }`}
                                >
                                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-1 pt-4">
                    <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                        {user.role === 'org' ? 'Organization Name' : 'Full Name'}
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 focus:border-stone-900 dark:focus:border-zinc-100 outline-none transition-all font-medium text-stone-900 dark:text-zinc-100"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Username</label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                            className="w-full pl-9 pr-3 py-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-stone-900 dark:text-zinc-100"
                            placeholder="username"
                        />
                    </div>
                    <p className="text-[10px] text-stone-400 dark:text-zinc-600">Unique handle for your profile URL</p>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Headline</label>
                    <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 outline-none transition-all text-stone-900 dark:text-zinc-100"
                        placeholder={user.role === 'org' ? 'Leading Tech Company | Hiring Now' : 'Student at UNILAG | Frontend Dev'}
                    />
                </div>

                <div className={`grid ${user.role === 'org' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 outline-none transition-all text-stone-900 dark:text-zinc-100"
                            placeholder="Lagos, Nigeria"
                        />
                    </div>
                    {user.role === 'org' ? (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Industry</label>
                            <select
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer text-stone-900 dark:text-zinc-100"
                            >
                                <option value="">Select Industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance & Banking</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Retail">Retail & E-commerce</option>
                                <option value="Telecommunications">Telecommunications</option>
                                <option value="Energy">Energy & Oil/Gas</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Media">Media & Entertainment</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Logistics">Logistics & Transportation</option>
                                <option value="Hospitality">Hospitality & Tourism</option>
                                <option value="Non-Profit">Non-Profit</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">University</label>
                            <input
                                type="text"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 outline-none transition-all text-stone-900 dark:text-zinc-100"
                                placeholder="University of Lagos"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">About</label>
                    <textarea
                        value={formData.about}
                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                        className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 outline-none transition-all min-h-[100px] resize-none text-stone-900 dark:text-zinc-100"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                {/* Skills/Services Section */}
                {user.role !== 'org' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-sm rounded-lg flex items-center gap-1 group">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3 text-stone-400 dark:text-zinc-500 group-hover:text-red-500" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            onKeyDown={handleSkillKeyDown}
                            className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-zinc-100 outline-none transition-all text-stone-900 dark:text-zinc-100"
                            placeholder="Type a skill and press Enter (e.g. React, Design)"
                        />
                    </div>
                )}

                {user.role === 'org' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Services</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {skills.map((service, index) => (
                                <span key={index} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 text-sm rounded-lg flex items-center gap-1 group">
                                    {service}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(service)}
                                        className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3 text-emerald-400 group-hover:text-red-500" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            onKeyDown={handleSkillKeyDown}
                            className="w-full p-3 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-zinc-100"
                            placeholder="Type a service and press Enter (e.g. Web Development, Consulting)"
                        />
                    </div>
                )}

                {/* Social Links */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Social Links (Optional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.role === 'org' && (
                            <>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-3 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                        <input
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm text-stone-900 dark:text-zinc-100"
                                            placeholder="LinkedIn"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-stone-900 dark:text-zinc-100"
                                            placeholder="Website"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="space-y-1">
                            <div className="relative">
                                <Instagram className="absolute left-3 top-3 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={formData.instagram}
                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm text-stone-900 dark:text-zinc-100"
                                    placeholder="Instagram"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="relative">
                                <Twitter className="absolute left-3 top-3 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                <input
                                    type="url"
                                    value={formData.twitter}
                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-stone-900 dark:text-zinc-100"
                                    placeholder="Twitter/X"
                                />
                            </div>
                        </div>
                        {user.role === 'org' && (
                            <div className="space-y-1">
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-3 w-4 h-4 text-stone-400 dark:text-zinc-600" />
                                    <input
                                        type="url"
                                        value={formData.facebook}
                                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition-all text-sm text-stone-900 dark:text-zinc-100"
                                        placeholder="Facebook"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
