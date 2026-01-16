import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Users, Briefcase, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/app`,
                },
            });
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to sign in with Google');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg shadow-sm" />
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900">UniLink</span>
                    </div>
                    {/* Sign In removed as requested */}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-32 flex flex-col items-center text-center">

                {/* Subtle decorative blob */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-50/40 to-transparent pointer-events-none -z-10" />

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>The Professional Network for Nigerian Students</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 text-slate-900">
                    Connect. Collaborate.<br />
                    <span className="text-emerald-600">Grow Together.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    UniLink connects you with brilliant minds across Nigerian universities.
                    Find internships, share projects, and build your career before you graduate.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 w-full sm:w-auto">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="h-14 px-8 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 w-full sm:w-auto group"
                    >
                        {/* Google Icon SVG (Simplified) */}
                        <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                        <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button className="h-14 px-8 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all text-lg w-full sm:w-auto">
                        Learn More
                    </button>
                </div>

                {/* Dashboard Preview - Clean UI representation */}
                <div className="mt-20 relative w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 pb-20">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                        {/* Browser Bar */}
                        <div className="bg-slate-50 border-b border-slate-200 h-10 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                            </div>
                            <div className="mx-auto w-1/3 h-5 bg-white rounded-md border border-slate-200 shadow-sm flex items-center justify-center">
                                <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>

                        {/* UI Content Mock */}
                        <div className="p-6 grid grid-cols-12 gap-6 bg-slate-50/30 min-h-[400px]">
                            {/* Sidebar */}
                            <div className="hidden md:block col-span-3 space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-32"></div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64"></div>
                            </div>
                            {/* Feed */}
                            <div className="col-span-12 md:col-span-6 space-y-4">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100"></div>
                                        <div className="space-y-2">
                                            <div className="w-32 h-3 bg-slate-100 rounded-full"></div>
                                            <div className="w-20 h-2 bg-slate-50 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="w-full h-20 bg-slate-50 rounded-lg mb-4"></div>
                                    <div className="flex gap-4">
                                        <div className="w-16 h-8 bg-slate-100 rounded-lg"></div>
                                        <div className="w-16 h-8 bg-slate-100 rounded-lg"></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-40 opacity-70"></div>
                            </div>
                            {/* Widgets */}
                            <div className="hidden md:block col-span-3 space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-48"></div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-40"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute top-10 -right-4 md:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce cursor-default">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Verified Student</p>
                                <p className="text-xs text-slate-500">Access Granted</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Features Section */}
            <section className="relative z-10 py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to <br />succeed on campus</h2>
                        <p className="text-slate-600">UniLink gives you the tools to network, learn, and earn while keeping up with your studies.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                color: "text-blue-600",
                                bg: "bg-blue-50",
                                title: "Student Community",
                                desc: "Join a thriving community of scholars. Connect with peers from your department or across the country."
                            },
                            {
                                icon: Briefcase,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                                title: "Jobs & Internships",
                                desc: "Access exclusive opportunities curated for students. From side gigs to full-time graduate roles."
                            },
                            {
                                icon: Zap,
                                color: "text-amber-600",
                                bg: "bg-amber-50",
                                title: "Campus Trends",
                                desc: "Don's miss out. Stay updated with the latest news, events, and viral topics on your campus."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="/icon-512.png" alt="UniLink" className="w-6 h-6" />
                        <span className="font-bold text-slate-700">UniLink</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <Link to="/about" className="hover:text-slate-900">About</Link>
                        <a href="mailto:unilinkrep@gmail.com" className="hover:text-slate-900">Contact</a>
                        <Link to="/legal/terms" className="hover:text-slate-900">Terms</Link>
                    </div>
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} UniLink Nigeria.
                    </p>
                </div>
            </footer>
        </div>
    );
}
