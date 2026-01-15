import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import ThreeBackground from '../../components/ThreeBackground';
import { NIGERIAN_UNIVERSITIES } from '../../lib/universities';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'student' | 'org'>('student');
    const [university, setUniversity] = useState('');
    const [showUniDropdown, setShowUniDropdown] = useState(false);
    const [checkEmail, setCheckEmail] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isLogin && !acceptedTerms) {
            setError('You must agree to the Terms and Conditions.');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/app');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                        data: {
                            name,
                            role,
                            university: role === 'student' ? university : null,
                            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
                        }
                    }
                });
                if (error) throw error;

                // Check if email confirmation is enabled (session will be null)
                if (data.user && !data.session) {
                    setCheckEmail(true);
                    return;
                }
                navigate('/app');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (checkEmail) {
        return (
            <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans">
                <div className="absolute inset-0 z-0"><ThreeBackground /></div>
                <div className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox</h2>
                    <p className="text-slate-500 mb-8">
                        We've sent a verification link to <span className="font-medium text-slate-700">{email}</span>.
                        <br />Please confirm your email to unlock access.
                    </p>
                    <button
                        onClick={() => {
                            setCheckEmail(false);
                            setIsLogin(true);
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden font-sans">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <ThreeBackground />
            </div>

            {/* Auth Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-8 pb-6 text-center">
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2 tracking-tight">
                        UniLink
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? 'Welcome back to the network' : 'Join the student community'}
                    </p>
                </div>

                <div className="p-8 pt-2">
                    {/* Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-lg transition-all duration-300 ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        ></div>
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 relative z-10 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 relative z-10 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">

                        {!isLogin && (
                            <>
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

                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>

                                {role === 'student' && (
                                    <>
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
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all custom-input"
                                                    required
                                                />
                                                {/* Dropdown */}
                                                {showUniDropdown && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 custom-scrollbar">
                                                        {NIGERIAN_UNIVERSITIES.filter(uni =>
                                                            uni.toLowerCase().includes(university.toLowerCase())
                                                        ).length > 0 ? (
                                                            NIGERIAN_UNIVERSITIES
                                                                .filter(uni => uni.toLowerCase().includes(university.toLowerCase()))
                                                                .map((uni) => (
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
                                                                ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-slate-400">No university found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overlay to close dropdown when clicking outside */}
                                        {showUniDropdown && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUniDropdown(false)}
                                            ></div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="flex items-start gap-3 px-1">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    />
                                </div>
                                <label htmlFor="terms" className="text-xs text-slate-500 leading-snug cursor-pointer select-none">
                                    I agree to the <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Terms of Service</a> and <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Privacy Policy</a>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-4 transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
}
