import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, X, AtSign, Image as ImageIcon, Instagram, Twitter, Upload, Linkedin, Globe, Facebook } from 'lucide-react';
import type { Profile } from '../../../types';

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
    const avatarInputRef = useRef<HTMLInputElement>(null);

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
        setSkills(user.skills || []);
    }, [user, isOpen]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
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
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
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
                bgUrl = publicUrl;
            }

            let avatarUrl = user.avatar_url;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('uploads') // Or 'avatars' if separated, keeping as uploads for consistency with bg
                    .upload(fileName, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
                avatarUrl = publicUrl;
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="font-bold text-lg text-stone-900">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <div className="relative mb-8">
                        {/* Background Image */}
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                            {bgPreview ? (
                                <img src={bgPreview} alt="Background" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-stone-400">
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
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
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

                    <div className="space-y-1 pt-4">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                            {user.role === 'org' ? 'Organization Name' : 'Full Name'}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Username</label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                                placeholder="username"
                            />
                        </div>
                        <p className="text-[10px] text-stone-400">Unique handle for your profile URL</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Headline</label>
                        <input
                            type="text"
                            value={formData.headline}
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                            placeholder={user.role === 'org' ? 'Leading Tech Company | Hiring Now' : 'Student at UNILAG | Frontend Dev'}
                        />
                    </div>

                    <div className={`grid ${user.role === 'org' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                                placeholder="Lagos, Nigeria"
                            />
                        </div>
                        {user.role === 'org' ? (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Industry</label>
                                <select
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
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
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">University</label>
                                <input
                                    type="text"
                                    value={formData.university}
                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                                    placeholder="University of Lagos"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">About</label>
                        <textarea
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Skills/Services Section */}
                    {user.role !== 'org' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Skills</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map((skill, index) => (
                                    <span key={index} className="px-2 py-1 bg-stone-100 text-stone-700 text-sm rounded-lg flex items-center gap-1 group">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="p-0.5 hover:bg-stone-200 rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3 text-stone-400 group-hover:text-red-500" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                onKeyDown={handleSkillKeyDown}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                                placeholder="Type a skill and press Enter (e.g. React, Design)"
                            />
                        </div>
                    )}

                    {user.role === 'org' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Services</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map((service, index) => (
                                    <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-lg flex items-center gap-1 group">
                                        {service}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(service)}
                                            className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3 text-emerald-400 group-hover:text-red-500" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                onKeyDown={handleSkillKeyDown}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Type a service and press Enter (e.g. Web Development, Consulting)"
                            />
                        </div>
                    )}

                    {/* Social Links */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Social Links (Optional)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {user.role === 'org' && (
                                <>
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <input
                                                type="url"
                                                value={formData.linkedin}
                                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm"
                                                placeholder="LinkedIn"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                                placeholder="Website"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="space-y-1">
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                    <input
                                        type="url"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm"
                                        placeholder="Instagram"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                    <input
                                        type="url"
                                        value={formData.twitter}
                                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                        placeholder="Twitter/X"
                                    />
                                </div>
                            </div>
                            {user.role === 'org' && (
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="url"
                                            value={formData.facebook}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition-all text-sm"
                                            placeholder="Facebook"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
