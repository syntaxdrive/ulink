import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, X, AtSign } from 'lucide-react';
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
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData({
            name: user.name || '',
            username: user.username || '',
            headline: user.headline || '',
            location: user.location || '',
            university: user.university || '',
            about: user.about || '',
        });
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updates: any = {
                ...formData,
                updated_at: new Date().toISOString(),
            };

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

            onUpdate({ ...user, ...formData });
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
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
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
                            placeholder="Student at UNILAG | Frontend Dev"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
