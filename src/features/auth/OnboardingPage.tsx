import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import ThreeBackground from '../../components/ThreeBackground';
import {
    Building2, GraduationCap, ArrowRight, Loader2, AtSign,
    UserPlus, CheckCircle2, Users, ChevronRight, Sparkles,
    ShieldCheck, Bell, Camera as CameraIcon, Mic, User,
    BookOpen, CalendarDays, MapPin, Globe, FileText, Briefcase
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

const STUDY_YEARS = [
    { value: '1', label: '100L — Year 1' },
    { value: '2', label: '200L — Year 2' },
    { value: '3', label: '300L — Year 3' },
    { value: '4', label: '400L — Year 4' },
    { value: '5', label: '500L — Year 5' },
    { value: '6', label: '600L — Year 6 (Medical/Law)' },
    { value: 'pg', label: 'Postgraduate' },
    { value: 'alumni', label: 'Alumni' },
];

const GRADUATION_YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);

const ORG_INDUSTRIES = [
    'Student Body / Union',
    'Tech Hub / Startup',
    'NGO / Non-profit',
    'Religious Organization',
    'Cultural / Arts',
    'Sports / Athletics',
    'Academic Society',
    'Media / Press',
    'Professional Network',
    'Other',
];

// Shared input class
const inputCls = 'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm';
const labelCls = 'block text-xs font-bold text-slate-700 mb-1';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const isNative = Capacitor.isNativePlatform();
    const [step, setStep] = useState<'welcome' | 'profile' | 'connect'>(isNative ? 'welcome' : 'profile');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'student' | 'org'>('student');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Shared Fields ──────────────────────────────────────────────────────────
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('');

    // ── Student Fields ─────────────────────────────────────────────────────────
    const [university, setUniversity] = useState('');
    const [showUniDropdown, setShowUniDropdown] = useState(false);
    const [studyYear, setStudyYear] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [department, setDepartment] = useState('');

    // ── Org Fields ─────────────────────────────────────────────────────────────
    const [industry, setIndustry] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [about, setAbout] = useState('');

    // ── Connect step ───────────────────────────────────────────────────────────
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
        } else if (profile?.name) {
            // Pre-fill display name from OAuth
            setDisplayName(profile.name);
        }
    };

    useEffect(() => {
        checkExistingProfile();
    }, []);

    // Pre-fill username suggestion from display name
    useEffect(() => {
        if (displayName && !username) {
            const suggested = displayName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .slice(0, 20);
            setUsername(suggested);
        }
    }, [displayName]);

    const handleOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!displayName.trim()) {
            setError('Please enter your full name');
            setLoading(false);
            return;
        }
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
        if (role === 'student' && !university) {
            setError('Please select your university');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const updates: Record<string, any> = {
                id: user.id,
                email: user.email,
                name: displayName.trim(),
                avatar_url: user.user_metadata.avatar_url,
                role,
                username: username.toLowerCase(),
                headline: headline.trim() || null,
                location: location.trim() || null,
                university: role === 'student' ? university : null,
                updated_at: new Date().toISOString(),
            };

            if (role === 'student') {
                if (studyYear) updates.about = `Year ${studyYear} student${department ? `, ${department}` : ''}`;
                if (graduationYear) updates.expected_graduation_year = parseInt(graduationYear);
            } else {
                updates.industry = industry.trim() || null;
                updates.website = websiteUrl.trim() || null;
                updates.about = about.trim() || null;
            }

            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert(updates);

            if (upsertError) {
                if (upsertError.code === '23505') {
                    throw new Error('Username is already taken. Please choose another.');
                }
                throw upsertError;
            }

            // --- Referral System Logic ---
            const referralCode = sessionStorage.getItem('referral_code');
            if (referralCode) {
                try {
                    await supabase.rpc('process_referral', {
                        p_referred_user_id: user.id,
                        p_referral_code: referralCode
                    });
                    sessionStorage.removeItem('referral_code');
                } catch (referralErr) {
                    console.error('Referral processing failed:', referralErr);
                }
            }

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

    // ── STEP 0: Welcome & Permissions ─────────────────────────────────────────
    if (step === 'welcome') {
        const handleGrantPermissions = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    await LocalNotifications.requestPermissions();
                    await Camera.requestPermissions();
                    await Filesystem.requestPermissions();
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach(track => track.stop());
                    } catch (err) {
                        console.warn('Mic permission denied:', err);
                    }
                } catch (e) {
                    console.warn('Permission request sequence failed:', e);
                }
            }
            setStep('profile');
        };

        return (
            <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans text-center">
                <div className="absolute inset-0 z-0"><ThreeBackground /></div>
                <div className="relative z-10 w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Safe & Connected</h1>
                        <p className="text-slate-500 text-sm">To provide the best experience on campus, UniLink works best when you enable these features:</p>
                    </div>

                    <div className="space-y-4 mb-8 text-left">
                        {[
                            { icon: Bell, label: 'Notifications', desc: 'Stay updated on likes, mentions, and campus news.', bg: 'bg-indigo-50', color: 'text-indigo-600' },
                            { icon: CameraIcon, label: 'Camera & Media', desc: 'Share photos of your campus life and study notes.', bg: 'bg-rose-50', color: 'text-rose-600' },
                            { icon: Mic, label: 'Microphone', desc: 'Engage in group voice chats and campus radio.', bg: 'bg-emerald-50', color: 'text-emerald-600' },
                        ].map(({ icon: Icon, label, desc, bg, color }) => (
                            <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-emerald-100">
                                <div className={`p-2.5 ${bg} rounded-xl`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{label}</p>
                                    <p className="text-xs text-slate-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleGrantPermissions}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Get Started
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-[10px] text-center text-slate-400">
                        Permissions will be requested individually when you use these features.
                    </p>
                </div>
            </div>
        );
    }

    // ── STEP 2: People You May Know ──────────────────────────────────────────
    if (step === 'connect') {
        return (
            <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden font-sans">
                <div className="absolute inset-0 z-0"><ThreeBackground /></div>

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

    // ── STEP 1: Profile Setup ─────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0"><ThreeBackground /></div>

            <div className="relative z-10 w-full max-w-[480px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-8 animate-in fade-in zoom-in-95 duration-500 my-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">Welcome to UniLink! 👋</h1>
                    <p className="text-slate-500 text-sm">Tell us a bit about yourself to get started.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium">Step 1 of 2</span>
                </div>

                {error && (
                    <div className="mb-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
                )}

                <form onSubmit={handleOnboarding} className="space-y-5">
                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3">
                        {([
                            { value: 'student', label: 'Student', Icon: GraduationCap },
                            { value: 'org', label: 'Organization', Icon: Building2 },
                        ] as const).map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRole(value)}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 group ${role === value
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 ${role === value ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Shared: Name & Username ── */}
                    <div className="space-y-3">
                        <div>
                            <label className={labelCls}>
                                {role === 'org' ? 'Organization Name' : 'Full Name'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={role === 'org' ? 'e.g. Tech Guild UNILAG' : 'e.g. Amaka Johnson'}
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className={inputCls + ' pl-11'}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Username <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. amaka_j"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className={inputCls + ' pl-11'}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">Letters, numbers, and underscores only</p>
                        </div>

                        <div>
                            <label className={labelCls}>{role === 'org' ? 'Tagline / Motto' : 'Headline / Bio'}</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={role === 'org' ? 'e.g. Empowering future builders' : 'e.g. CS Student | Web Dev | Tech enthusiast'}
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    className={inputCls + ' pl-11'}
                                    maxLength={120}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>City / Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Lagos, Nigeria"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className={inputCls + ' pl-11'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Student-specific ── */}
                    {role === 'student' && (
                        <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Info</p>

                            {/* University */}
                            <div className="relative group z-50">
                                <label className={labelCls}>University <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search your university..."
                                        value={university}
                                        onChange={(e) => { setUniversity(e.target.value); setShowUniDropdown(true); }}
                                        onFocus={() => setShowUniDropdown(true)}
                                        className={inputCls + ' pl-11'}
                                        required
                                    />
                                    {showUniDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                                            {NIGERIAN_UNIVERSITIES.filter(uni =>
                                                uni.toLowerCase().includes(university.toLowerCase())
                                            ).slice(0, 20).map((uni) => (
                                                <button
                                                    key={uni}
                                                    type="button"
                                                    onClick={() => { setUniversity(uni); setShowUniDropdown(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-100 last:border-0"
                                                >
                                                    {uni}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {showUniDropdown && (
                                <div className="fixed inset-0 z-40" onClick={() => setShowUniDropdown(false)} />
                            )}

                            {/* Department */}
                            <div>
                                <label className={labelCls}>Department / Course of Study</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Computer Science, Medicine"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className={inputCls + ' pl-11'}
                                    />
                                </div>
                            </div>

                            {/* Study Year & Graduation Year */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Year of Study</label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            value={studyYear}
                                            onChange={(e) => setStudyYear(e.target.value)}
                                            className={inputCls + ' pl-9 pr-2 appearance-none cursor-pointer'}
                                        >
                                            <option value="">Select year</option>
                                            {STUDY_YEARS.map(y => (
                                                <option key={y.value} value={y.value}>{y.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Graduation Year</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <select
                                            value={graduationYear}
                                            onChange={(e) => setGraduationYear(e.target.value)}
                                            className={inputCls + ' pl-9 pr-2 appearance-none cursor-pointer'}
                                        >
                                            <option value="">Select year</option>
                                            {GRADUATION_YEARS.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Org-specific ── */}
                    {role === 'org' && (
                        <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization Info</p>

                            <div>
                                <label className={labelCls}>Category / Industry <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className={inputCls + ' pl-9 pr-2 appearance-none cursor-pointer'}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {ORG_INDUSTRIES.map(ind => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        className={inputCls + ' pl-11'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>About your Organization</label>
                                <textarea
                                    placeholder="Tell students what you're about, what you do, and how they can get involved..."
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    rows={3}
                                    maxLength={300}
                                    className={inputCls + ' resize-none'}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 text-right">{about.length}/300</p>
                            </div>
                        </div>
                    )}

                    {/* Legal Checkbox */}
                    <div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    required
                                />
                            </div>
                            <span className="text-xs text-slate-500 leading-tight">
                                I agree to UniLink's{' '}
                                <Link to="/legal/terms" target="_blank" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-emerald-200">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link to="/legal/privacy" target="_blank" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-emerald-200">
                                    Privacy Policy
                                </Link>.
                                <br />
                                <span className="text-[10px] text-slate-400 mt-1 block italic opacity-70">
                                    I certify that I am a student or an authorized representative of my campus/organization.
                                </span>
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] ${!agreed ? 'opacity-70' : ''}`}
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
