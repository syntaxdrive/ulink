import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../../components/ThreeBackground';
import { Building2, GraduationCap, ArrowRight, Loader2, AtSign } from 'lucide-react';
import { NIGERIAN_UNIVERSITIES } from '../../lib/universities';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'student' | 'org'>('student');
    const [university, setUniversity] = useState('');
    const [username, setUsername] = useState('');
    const [showUniDropdown, setShowUniDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkExistingProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/');

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // If profile exists and has a role, skip onboarding
        if (profile && profile.role) {
            navigate('/app');
        }
    };

    useEffect(() => {
        checkExistingProfile();
    }, []);

    const handleOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            setLoading(false);
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('Username can only contain letters, numbers, and underscores');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const updates = {
                id: user.id,
                email: user.email,
                name: user.user_metadata.name || user.email?.split('@')[0],
                avatar_url: user.user_metadata.avatar_url,
                role,
                username: username.toLowerCase(),
                university: role === 'student' ? university : null,
                updated_at: new Date().toISOString(),
            };

            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (upsertError) {
                if (upsertError.code === '23505') { // Unique violation
                    throw new Error('Username is already taken. Please choose another.');
                }
                throw upsertError;
            }

            navigate('/app');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0"><ThreeBackground /></div>

            <div className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome back! 👋</h1>
                    <p className="text-slate-500 text-sm">We've updated our systems. Please set up your profile again to continue.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
                )}

                <form onSubmit={handleOnboarding} className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 group ${role === 'student'
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <GraduationCap className={`w-6 h-6 mb-2 transition-transform duration-300 ${role === 'student' ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-xs font-medium uppercase tracking-wider">Student</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('org')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 group ${role === 'org'
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <Building2 className={`w-6 h-6 mb-2 transition-transform duration-300 ${role === 'org' ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-xs font-medium uppercase tracking-wider">Organization</span>
                        </button>
                    </div>

                    {/* Username Input */}
                    <div className="relative group">
                        <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600 z-10" />
                        <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    {role === 'student' && (
                        <div className="relative group z-50">
                            <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600 z-10" />
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search University..."
                                    value={university}
                                    onChange={(e) => {
                                        setUniversity(e.target.value);
                                        setShowUniDropdown(true);
                                    }}
                                    onFocus={() => setShowUniDropdown(true)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    required
                                />
                                {showUniDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                                        {NIGERIAN_UNIVERSITIES.filter(uni =>
                                            uni.toLowerCase().includes(university.toLowerCase())
                                        ).map((uni) => (
                                            <button
                                                key={uni}
                                                type="button"
                                                onClick={() => {
                                                    setUniversity(uni);
                                                    setShowUniDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-100 last:border-0"
                                            >
                                                {uni}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Overlay to close dropdown when clicking outside */}
                    {showUniDropdown && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowUniDropdown(false)}
                        ></div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Exploring <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
