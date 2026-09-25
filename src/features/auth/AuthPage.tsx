import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Users, ShieldCheck, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth, type AuthUser } from '../../contexts/AuthContext';

export default function AuthPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        username: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: err } = await api.post<{ access_token: string; user: any }>(
            '/auth/login',
            { email: form.email, password: form.password },
        );

        if (err || !data) {
            setError(err || 'Login failed. Check your email and password.');
            setLoading(false);
            return;
        }

        // Store JWT and user
        localStorage.setItem('ulink_jwt_token', data.access_token);
        const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.email,
            username: data.user.username,
            avatar_url: data.user.avatar_url,
            user_metadata: {
                full_name: data.user.name,
                avatar_url: data.user.avatar_url,
            },
        };
        setUser(authUser);
        navigate('/app');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!form.name || !form.email || !form.password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        const { data, error: err } = await api.post<{ access_token: string; user: any }>(
            '/auth/register',
            {
                email: form.email,
                password: form.password,
                name: form.name,
                username: form.username || form.email.split('@')[0],
            },
        );

        if (err || !data) {
            setError(err || 'Registration failed. Try a different email.');
            setLoading(false);
            return;
        }

        localStorage.setItem('ulink_jwt_token', data.access_token);
        const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || form.name,
            username: data.user.username,
            avatar_url: data.user.avatar_url,
            user_metadata: {
                full_name: data.user.name || form.name,
                avatar_url: data.user.avatar_url,
            },
        };
        setUser(authUser);
        navigate('/app');
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans overflow-hidden">
            {/* Left Hero Panel */}
            <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-zinc-950 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3">
                    <img src="/icon-192.png" alt="UniLink" className="w-10 h-10 rounded-xl shadow-lg border border-white/10" />
                    <span className="font-display font-bold text-xl tracking-tight text-white">UniLink</span>
                </div>

                <div className="relative z-10 my-12 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                        Student Network in Nigeria
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight mb-6">
                        Connect, collaborate &amp; build your campus legacy.
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed mb-8">
                        Join thousands of students across Nigerian universities. Share study resources, join active student communities, and launch your career.
                    </p>

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

                <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Secure, encrypted authentication</span>
                </div>
            </div>

            {/* Right Form Area */}
            <div className="lg:w-1/2 flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white dark:bg-zinc-900 border-l border-slate-200/60 dark:border-zinc-800">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            {tab === 'login' ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2">
                            {tab === 'login' ? 'Sign in to your UniLink account.' : 'Join thousands of Nigerian students.'}
                        </p>
                    </div>

                    {/* Tab toggle */}
                    <div className="flex rounded-xl bg-slate-100 dark:bg-zinc-800 p-1">
                        <button
                            onClick={() => { setTab('login'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setTab('signup'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'signup' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
                        {tab === 'signup' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Amaka Okonkwo"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="e.g. amaka_okonkwo"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@university.edu.ng"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

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
