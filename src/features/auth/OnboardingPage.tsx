import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../../components/ThreeBackground';
import {
    Building2, GraduationCap, ArrowRight, Loader2, AtSign,
    UserPlus, CheckCircle2, Users, ChevronRight, Sparkles
} from 'lucide-react';
import { NIGERIAN_UNIVERSITIES } from '../../lib/universities';

interface SuggestedProfile {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
    university: string | null;
    headline: string | null;
    is_verified: boolean;
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'profile' | 'connect'>('profile');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'student' | 'org'>('student');
    const [university, setUniversity] = useState('');
    const [username, setUsername] = useState('');
    const [showUniDropdown, setShowUniDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Org specific fields
    const [industry, setIndustry] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [headline, setHeadline] = useState('');

    // Step 2 — People You May Know
    const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);
    const [connected, setConnected] = useState<Set<string>>(new Set());
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [connectingId, setConnectingId] = useState<string | null>(null);

    const checkExistingProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/');

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

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
                ...(role === 'org' && {
                    industry: industry.trim() || null,
                    website: websiteUrl.trim() || null,
                    headline: headline.trim() || null
                })
            };

            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (upsertError) {
                if (upsertError.code === '23505') {
                    throw new Error('Username is already taken. Please choose another.');
                }
                throw upsertError;
            }

            // Move to step 2 — fetch suggestions
            await fetchSuggestions(user.id, role === 'student' ? university : null);
            setStep('connect');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (userId: string, userUniversity: string | null) => {
        setLoadingSuggestions(true);
        try {
            let query = supabase
                .from('profiles')
                .select('id, name, username, avatar_url, university, headline, is_verified')
                .neq('id', userId)
                .limit(12);

            if (userUniversity) {
                query = query.eq('university', userUniversity);
            }

            const { data } = await query;
            if (data) {
                setSuggestions(data.sort(() => Math.random() - 0.5));
            }
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleConnect = async (profileId: string) => {
        setConnectingId(profileId);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('connections').insert({
                requester_id: user.id,
                recipient_id: profileId,
                status: 'pending',
            });

            setConnected(prev => new Set([...prev, profileId]));
        } catch (err) {
            console.error('Error connecting:', err);
        } finally {
            setConnectingId(null);
        }
    };

    // ── STEP 2: People You May Know ──────────────────────────────────────────
    if (step === 'connect') {
        return (
            <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden font-sans">
                <div className="absolute inset-0 z-0"><ThreeBackground /></div>

                {/* Header */}
                <div className="relative z-10 pt-10 pb-6 text-center px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-4">
                        <Sparkles className="w-4 h-4" />
                        You're all set!
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                        People You May Know
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto">
                        {university
                            ? `Connect with fellow students from ${university}`
                            : 'Connect with other students on UniLink'}
                    </p>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Profile</span>
                        </div>
                        <div className="w-8 h-px bg-emerald-300" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-700">Connect</span>
                        </div>
                    </div>
                </div>

                {/* Suggestions grid */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 pb-32">
                    {loadingSuggestions ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No suggestions yet — more people are joining every day!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {suggestions.map((profile, i) => {
                                const isConnected = connected.has(profile.id);
                                const isConnecting = connectingId === profile.id;
                                return (
                                    <div
                                        key={profile.id}
                                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        {/* Avatar */}
                                        <div className="relative mb-3">
                                            <img
                                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=059669&color=fff`}
                                                alt={profile.name}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100"
                                            />
                                            {profile.is_verified && (
                                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </span>
                                            )}
                                        </div>

                                        <p className="font-bold text-slate-900 text-sm truncate w-full">{profile.name}</p>
                                        {profile.username && (
                                            <p className="text-xs text-slate-400 mb-1">@{profile.username}</p>
                                        )}
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                            {profile.headline || profile.university || 'UniLink Student'}
                                        </p>

                                        {/* Connect button */}
                                        <button
                                            onClick={() => !isConnected && handleConnect(profile.id)}
                                            disabled={isConnected || isConnecting}
                                            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${isConnected
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-200 hover:shadow-md'
                                                }`}
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : isConnected ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5" /> Connected</>
                                            ) : (
                                                <><UserPlus className="w-3.5 h-3.5" /> Connect</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sticky bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4">
                    <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                            {connected.size > 0
                                ? <span className="text-emerald-600 font-semibold">🎉 {connected.size} connection{connected.size > 1 ? 's' : ''} made!</span>
                                : 'Connect with classmates to see their posts'}
                        </div>
                        <button
                            onClick={() => navigate('/app')}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm whitespace-nowrap"
                        >
                            {connected.size > 0 ? 'Go to Feed' : 'Skip for now'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── STEP 1: Profile Setup ────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0"><ThreeBackground /></div>

            <div className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome to UniLink! 👋</h1>
                    <p className="text-slate-500 text-sm">Set up your profile to get started.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">Step 1 of 2</span>
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

                    {showUniDropdown && (
                        <div className="fixed inset-0 z-40" onClick={() => setShowUniDropdown(false)}></div>
                    )}

                    {role === 'org' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Organization Category / Industry</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NGO, Tech Hub, Student Body"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Empowering Students in Tech"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <>Next: Find Connections <ArrowRight className="w-5 h-5" /></>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
