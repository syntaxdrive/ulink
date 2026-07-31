import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import { signInWithGoogle } from '../../lib/auth-helpers';

export default function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans overflow-hidden">
            {/* Left Hero Panel */}
            <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-zinc-950 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
                {/* Background Glow Accents */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <img src="/icon-192.png" alt="UniLink" className="w-10 h-10 rounded-xl shadow-lg border border-white/10" />
                    <span className="font-display font-bold text-xl tracking-tight text-white">UniLink</span>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 my-12 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                        Student Network in Nigeria
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight mb-6">
                        Connect, collaborate & build your campus legacy.
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed mb-8">
                        Join thousands of students across Nigerian universities. Share study resources, join active student communities, and launch your career.
                    </p>

                    {/* Value Props Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <GraduationCap className="w-5 h-5 text-emerald-400 mb-2" />
                            <h3 className="font-semibold text-sm text-white">Verified Campus Profiles</h3>
                            <p className="text-xs text-slate-400 mt-1">Connect with verified peers from your university.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Users className="w-5 h-5 text-emerald-400 mb-2" />
                            <h3 className="font-semibold text-sm text-white">Student Communities</h3>
                            <p className="text-xs text-slate-400 mt-1">Join tech hubs, study groups, and campus clubs.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Secure, encrypted authentication</span>
                </div>
            </div>

            {/* Right Main Form Area */}
            <div className="lg:w-1/2 flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-zinc-900 border-l border-slate-200/60 dark:border-zinc-800">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            Get started with UniLink
                        </h2>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2">
                            Sign in or register in seconds with your Google account.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span>Sign Up / Sign In</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-zinc-500 leading-relaxed text-center">
                        By continuing, you agree to our{' '}
                        <Link to="/legal/terms" className="underline hover:text-slate-600 dark:hover:text-zinc-300">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/legal/privacy" className="underline hover:text-slate-600 dark:hover:text-zinc-300">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
