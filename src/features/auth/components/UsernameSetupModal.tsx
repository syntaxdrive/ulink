import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, AtSign, Check, X } from 'lucide-react';

interface UsernameSetupModalProps {
    user: any;
    onComplete: (username: string) => void;
}

export default function UsernameSetupModal({ user, onComplete }: UsernameSetupModalProps) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanUsername = username.trim().toLowerCase();

        // Validation
        if (cleanUsername.length < 3) {
            setError('Minimum 3 characters required');
            setLoading(false);
            return;
        }
        if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
            setError('Only letters, numbers, and underscores');
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ username: cleanUsername })
                .eq('id', user.id);

            if (updateError) {
                if (updateError.code === '23505') throw new Error('Username taken. Try another.');
                throw updateError;
            }

            onComplete(cleanUsername);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-300"></div>

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AtSign className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your Username</h2>
                    <p className="text-slate-500">
                        UniLink has been updated! Set a unique username to personalize your profile link and mentions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-medium">@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            placeholder="username"
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-lg lowercase"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-in slide-in-from-top-1">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Claim Username <Check className="w-5 h-5" /></>}
                    </button>

                    <p className="text-xs text-center text-slate-400 mt-4">
                        This cannot be easily changed later.
                    </p>
                </form>
            </div>
        </div>
    );
}
