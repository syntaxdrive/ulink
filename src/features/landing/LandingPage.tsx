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
                        <img src="/icon-192.png" alt="UniLink" className="w-8 h-8 rounded-lg shadow-sm" />
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

                    <a
                        href="/unilink.apk"
                        download
                        className="h-14 px-8 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all text-lg w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.523 15.3414C17.523 15.3414 17.4795 15.3414 17.436 15.3414C17.436 15.3414 17.3925 15.3414 17.349 15.3414C17.349 15.3414 17.3055 15.3414 17.262 15.3414C16.9575 15.3414 16.74 15.2544 16.566 15.1239C16.392 14.9934 16.305 14.7759 16.305 14.4714V11.2089H17.523V14.4714C17.523 14.4714 17.6535 14.4714 17.697 14.4714C17.7405 14.4714 17.784 14.4714 17.8275 14.4714C17.871 14.4714 17.9145 14.4714 17.958 14.4714C18.0015 14.4714 18.045 14.4714 18.0885 14.4714C18.132 14.4714 18.1755 14.4714 18.219 14.4714V14.7759C18.219 14.9499 18.132 15.1239 18.0015 15.2109C17.871 15.2979 17.697 15.3414 17.523 15.3414ZM14.913 15.3414C14.739 15.3414 14.565 15.2979 14.4345 15.2109C14.304 15.1239 14.217 14.9499 14.217 14.7759V11.2089H15.435V14.4714C15.435 14.8629 15.6525 15.0369 16.0875 15.0369C16.392 15.0369 16.566 14.9499 16.566 14.7759V11.2089H17.784V14.7759C17.784 14.9499 17.697 15.1239 17.5665 15.2109C17.436 15.2979 17.262 15.3414 17.088 15.3414C16.827 15.3414 16.6095 15.2979 16.4355 15.2109C16.2615 15.1239 16.131 14.9934 16.0875 14.7324C16.044 14.9934 15.9135 15.1239 15.7395 15.2109C15.5655 15.2979 15.348 15.3414 15.087 15.3414H14.913ZM12.303 15.3414C12.129 15.3414 11.955 15.2979 11.8245 15.2109C11.694 15.1239 11.607 14.9499 11.607 14.7759V11.2089H12.825V14.4714C12.825 14.8629 13.0425 15.0369 13.4775 15.0369C13.782 15.0369 13.956 14.9499 13.956 14.7759V11.2089H15.174V14.7759C15.174 14.9499 15.087 15.1239 14.9565 15.2109C14.826 15.2979 14.652 15.3414 14.478 15.3414C14.217 15.3414 13.9995 15.2979 13.8255 15.2109C13.6515 15.1239 13.521 14.9934 13.4775 14.7324C13.434 14.9934 13.3035 15.1239 13.1295 15.2109C12.9555 15.2979 12.738 15.3414 12.477 15.3414H12.303ZM17.062 9.1419C16.804 9.1419 16.591 9.2279 16.423 9.4209C16.255 9.6139 16.171 9.8719 16.171 10.2159V15.2539H15.04V10.2159C15.04 9.8719 14.956 9.6139 14.788 9.4209C14.62 9.2279 14.407 9.1419 14.149 9.1419C13.805 9.1419 13.5685 9.2599 13.4395 9.4854C13.3965 9.2489 13.2565 9.1419 12.9985 9.1419C12.6545 9.1419 12.418 9.2599 12.289 9.4854V9.2279H11.257V15.2539H12.388V10.4739C12.388 9.9579 12.5595 9.7004 12.934 9.7004C13.321 9.7004 13.493 9.9579 13.493 10.4739V15.2539H14.624V10.4739C14.624 9.9579 14.8065 9.7004 15.181 9.7004C15.5555 9.7004 15.7385 9.9579 15.7385 10.4739V15.2539H16.8695V10.2159C16.8695 9.8719 16.7855 9.6139 16.6175 9.4209C16.4495 9.2279 16.2365 9.1419 15.9785 9.1419C15.6345 9.1419 15.398 9.2599 15.269 9.4854C15.226 9.2489 15.086 9.1419 14.828 9.1419C14.484 9.1419 14.2475 9.2599 14.1185 9.4854V9.2279H13.0865V15.2539H14.2175V10.4739C14.2175 9.9579 14.389 9.7004 14.7635 9.7004C15.1505 9.7004 15.3225 9.9579 15.3225 10.4739V15.2539H16.4535V10.4739C16.4535 9.9579 16.6255 9.7004 17.0005 9.7004C17.3755 9.7004 17.5585 9.9579 17.5585 10.4739V15.2539H18.6895V10.2159C18.6895 9.8719 18.6055 9.6139 18.4375 9.4209C18.2695 9.2279 18.0565 9.1419 17.7985 9.1419H17.062ZM3.81691 6.5504L3.81691 17.4496L14.7161 17.4496L14.7161 6.5504L3.81691 6.5504ZM18.5333 13.9997C19.1492 13.3838 19.5 12.5693 19.5 11.6667C19.5 10.7641 19.1492 9.94958 18.5333 9.33366L17.2003 10.6667C17.4333 10.8997 17.5833 11.2333 17.5833 11.6667C17.5833 12.1001 17.4333 12.4337 17.2003 12.6667L18.5333 13.9997ZM19.8667 15.333C20.925 14.2747 21.5833 12.8596 21.5833 11.6667C21.5833 10.4738 20.925 9.05867 19.8667 8.00033L18.5337 9.33333C19.2087 10.0083 19.5833 10.8333 19.5833 11.6667C19.5833 12.5001 19.2087 13.3251 18.5337 13.9997L19.8667 15.333Z" />
                        </svg>
                        Download App
                    </a>
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
                        <img src="/icon-192.png" alt="UniLink" className="w-6 h-6" />
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
