import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import {
    Building2, GraduationCap, ArrowRight, Loader2, AtSign,
    UserPlus, CheckCircle2, Users, ChevronRight,
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
const inputCls = 'w-full px-4 py-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider';

function isOnboardingComplete(profile: any) {
    if (!profile?.name?.trim() || profile.name === 'null') return false;
    if (!profile?.username?.trim() || profile.username === 'null') return false;
    if (!profile?.role || profile.role === 'null') return false;
    if (profile.role === 'student' && (!profile?.university?.trim() || profile.university === 'null')) return false;
    return true;
}

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

    useEffect(() => {
        checkExistingProfile();
    }, []);

    const checkExistingProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
            navigate('/welcome', { replace: true });
            return;
        }

        const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || '';
        if (nameFromMeta) setDisplayName(nameFromMeta);

        const emailPrefix = (user.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (emailPrefix) setUsername(emailPrefix);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile && isOnboardingComplete(profile)) {
            navigate('/app', { replace: true });
        }
    };

    const handleOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!displayName.trim()) {
            setError('Please enter your display name.');
            return;
        }
        if (!username.trim()) {
            setError('Please choose a username.');
            return;
        }
        if (role === 'student' && !university.trim()) {
            setError('Please select your university.');
            return;
        }
        if (role === 'org' && !industry) {
            setError('Please select your organization category.');
            return;
        }
        if (!agreed) {
            setError('You must agree to the Terms of Service to continue.');
            return;
        }

        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) throw new Error('Not authenticated.');

            const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', cleanUsername)
                .neq('id', user.id)
                .maybeSingle();

            if (existingUser) {
                setError('That username is already taken. Please choose another.');
                setLoading(false);
                return;
            }

            const updates: any = {
                id: user.id,
                email: user.email,
                name: displayName.trim(),
                username: cleanUsername,
                role,
                headline: headline.trim() || null,
                location: location.trim() || null,
                updated_at: new Date().toISOString(),
            };

            if (role === 'student') {
                updates.university = university.trim();
                updates.department = department.trim() || null;
                updates.study_year = studyYear || null;
                updates.graduation_year = graduationYear ? parseInt(graduationYear, 10) : null;
            } else {
                updates.industry = industry;
                updates.website_url = websiteUrl.trim() || null;
                updates.about = about.trim() || null;
                updates.university = location.trim() || 'Global';
            }

            const { error: updateErr } = await supabase
                .from('profiles')
                .upsert(updates);

            if (updateErr) {
                console.warn('Full onboarding update warning:', updateErr.message);
                // Fallback: If newer columns like department/study_year aren't in Supabase DB yet,
                // save essential core fields so onboarding succeeds!
                delete updates.department;
                delete updates.study_year;
                delete updates.graduation_year;

                const { error: fallbackErr } = await supabase
                    .from('profiles')
                    .upsert(updates);

                if (fallbackErr) throw fallbackErr;
            }

            // Process referrals
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
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            await supabase
                .from('connections')
                .delete()
                .or(`and(requester_id.eq.${user.id},recipient_id.eq.${profileId}),and(requester_id.eq.${profileId},recipient_id.eq.${user.id})`);

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
            <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans">
                {/* Left Side Banner */}
                <div className="lg:w-5/12 bg-gradient-to-br from-slate-900 via-emerald-950 to-zinc-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <img src="/icon-192.png" alt="UniLink" className="w-10 h-10 rounded-xl shadow-md border border-white/10" />
                        <span className="font-display font-bold text-xl tracking-tight text-white">UniLink</span>
                    </div>

                    <div className="my-12">
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3 tracking-tight">
                            Safe, Verified & Connected
                        </h1>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            UniLink is designed specifically for university students across Nigeria. Grant permissions to unlock real-time campus features.
                        </p>
                    </div>

                    <div className="text-xs text-slate-400">Step 1 of 2 — Device Permissions</div>
                </div>

                {/* Right Main Form Container */}
                <div className="lg:w-7/12 flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-zinc-900">
                    <div className="max-w-xl mx-auto w-full space-y-8">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Device Features</h2>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Enable these permissions for the full student experience:</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: Bell, label: 'Notifications', desc: 'Instant updates on connection requests, course notes, and messages.', bg: 'bg-indigo-50 dark:bg-indigo-950/40', color: 'text-indigo-600 dark:text-indigo-400' },
                                { icon: CameraIcon, label: 'Camera & Media', desc: 'Share photos of your campus events, notes, and marketplace listings.', bg: 'bg-rose-50 dark:bg-rose-950/40', color: 'text-rose-600 dark:text-rose-400' },
                                { icon: Mic, label: 'Microphone', desc: 'Participate in live campus radio, podcasts, and audio study rooms.', bg: 'bg-emerald-50 dark:bg-emerald-950/40', color: 'text-emerald-600 dark:text-emerald-400' },
                            ].map(({ icon: Icon, label, desc, bg, color }) => (
                                <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 transition-all">
                                    <div className={`p-3 ${bg} rounded-xl shrink-0`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{label}</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGrantPermissions}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <span>Continue to Profile Setup</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── STEP 2: People You May Know ──────────────────────────────────────────
    if (step === 'connect') {
        return (
            <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans">
                <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
                        Profile Setup Complete
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">People You May Know</h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-md mx-auto mt-1">
                        {university ? `Connect with fellow students from ${university}` : 'Build your network by connecting with classmates'}
                    </p>
                </div>

                <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 pb-28">
                    {loadingSuggestions ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                            <p className="text-sm">Finding students at your university...</p>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8">
                            <Users className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No suggestions right now</h3>
                            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">You can start discovering students anytime from the main feed!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {suggestions.map(profile => {
                                const isConnected = connected.has(profile.id);
                                const isConnecting = connectingId === profile.id;

                                return (
                                    <div
                                        key={profile.id}
                                        className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="relative mb-3">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-zinc-800" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl border-2 border-slate-100 dark:border-zinc-800">
                                                    {profile.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate w-full">{profile.name}</p>
                                        {profile.username && (
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-1">@{profile.username}</p>
                                        )}
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed h-8">
                                            {profile.headline || profile.university || 'UniLink Member'}
                                        </p>

                                        <button
                                            onClick={() => !isConnected && handleConnect(profile.id)}
                                            disabled={isConnected || isConnecting}
                                            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mt-auto ${isConnected
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
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

                {/* Sticky Action Footer */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 p-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 dark:text-zinc-400">
                            {connected.size > 0
                                ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{connected.size} connection{connected.size > 1 ? 's' : ''} made</span>
                                : 'Connect with classmates to see their updates'}
                        </div>
                        <button
                            onClick={() => navigate('/app')}
                            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                        >
                            {connected.size > 0 ? 'Go to Campus Feed' : 'Skip for now'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── STEP 1: Profile Setup (Full-Screen Layout) ────────────────────────────
    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans overflow-x-hidden">
            {/* Left Column Showcase Banner */}
            <div className="lg:w-4/12 bg-gradient-to-br from-slate-900 via-emerald-950 to-zinc-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/icon-192.png" alt="UniLink" className="w-10 h-10 rounded-xl shadow-md border border-white/10" />
                    <span className="font-display font-bold text-xl tracking-tight text-white">UniLink</span>
                </div>

                <div className="my-10 max-w-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                        Student Profile Setup
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mb-3">
                        Build your campus presence.
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Complete your account details to connect with peers at your university, access course materials, and discover campus opportunities.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 border border-white/10 p-3 rounded-xl">
                            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Academic verification & university network</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 border border-white/10 p-3 rounded-xl">
                            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Study groups, podcasts & campus marketplace</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
                    <span>Step 1 of 2</span>
                    <span>UniLink Nigeria</span>
                </div>
            </div>

            {/* Right Main Form Container (Full Screen Width / Expands Gracefully) */}
            <div className="lg:w-8/12 flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-14 bg-white dark:bg-zinc-900 border-l border-slate-200/60 dark:border-zinc-800">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            Welcome to UniLink!
                        </h2>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                            Tell us about yourself to customize your campus experience.
                        </p>
                    </div>

                    {/* Step Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-emerald-500" />
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-zinc-800" />
                        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">50% Complete</span>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleOnboarding} className="space-y-6">
                        {/* Account Type Selector */}
                        <div>
                            <label className={labelCls}>Select Account Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                {([
                                    { value: 'student', label: 'Student', desc: 'Undergraduate, Postgraduate, Alumni', Icon: GraduationCap },
                                    { value: 'org', label: 'Organization', desc: 'Campus Society, Tech Hub, Press', Icon: Building2 },
                                ] as const).map(({ value, label, desc, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRole(value)}
                                        className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${role === value
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500'
                                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl mb-2 ${role === value ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{label}</span>
                                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2-Column Grid for Primary Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>
                                    {role === 'org' ? 'Organization Name' : 'Full Name'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
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
                                    <AtSign className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="e.g. amaka_j"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        className={inputCls + ' pl-11'}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Headline & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>{role === 'org' ? 'Tagline / Motto' : 'Headline / Bio'}</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
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
                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
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

                        {/* ── Student Academic Information ── */}
                        {role === 'student' && (
                            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
                                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Academic Information</p>

                                {/* University Selection */}
                                <div className="relative group z-50">
                                    <label className={labelCls}>University <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
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
                                            <div className="absolute top-full left-0 right-0 mt-2 max-h-52 overflow-y-auto bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-50">
                                                {NIGERIAN_UNIVERSITIES.filter(uni =>
                                                    uni.toLowerCase().includes(university.toLowerCase())
                                                ).slice(0, 20).map((uni) => (
                                                    <button
                                                        key={uni}
                                                        type="button"
                                                        onClick={() => { setUniversity(uni); setShowUniDropdown(false); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors border-b border-slate-100 dark:border-zinc-700/50 last:border-0"
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

                                {/* Department & Year Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-1">
                                        <label className={labelCls}>Department</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                                            <input
                                                type="text"
                                                placeholder="e.g. Computer Science"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className={inputCls + ' pl-11'}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Year of Study</label>
                                        <div className="relative">
                                            <CalendarDays className="absolute left-3 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
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
                                            <GraduationCap className="absolute left-3 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
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

                        {/* ── Organization Information ── */}
                        {role === 'org' && (
                            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
                                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Organization Details</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Category / Industry <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
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
                                            <Globe className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                                            <input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={websiteUrl}
                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                className={inputCls + ' pl-11'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>About your Organization</label>
                                    <textarea
                                        placeholder="Tell students what your organization does and how they can participate..."
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

                        {/* Agreement Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                                    required
                                />
                                <span className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    I agree to UniLink's{' '}
                                    <Link to="/legal/terms" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-bold underline">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/legal/privacy" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-bold underline">
                                        Privacy Policy
                                    </Link>.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreed}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Complete Profile & Connect</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
