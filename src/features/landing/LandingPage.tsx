import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Users, Briefcase, Sparkles, CheckCircle2, Download, X, Star, Shield, Globe } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import InstallGuideModal from '../../components/InstallGuideModal';

import appMockup from '../../assets/app-mockup.png';
import campusHero from '../../assets/campus-hero.png';
import studentsCollaboration from '../../assets/students-collaboration.png';
import studentProfessional from '../../assets/student-professional.png';
import campusNetworking from '../../assets/campus-networking.png';

export default function LandingPage() {
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isInstallable, install, showInstallModal, setShowInstallModal, isIOs } = usePWAInstall();
    const [showInstallHint, setShowInstallHint] = useState(false);

    useEffect(() => {
        if (isInstallable) {
            const timer = setTimeout(() => setShowInstallHint(true), 2000);
            const hideTimer = setTimeout(() => setShowInstallHint(false), 10000);
            return () => { clearTimeout(timer); clearTimeout(hideTimer); };
        }
    }, [isInstallable]);

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

            {/* Hero Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white z-10"></div>
                <img src={campusHero} alt="Campus" className="w-full h-full object-cover opacity-30" />
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent ${scrolled ? 'bg-white/80 backdrop-blur-xl border-slate-200/50 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                            <img src="/icon-512.png" alt="UniLink" className="relative w-10 h-10 rounded-lg shadow-sm" />
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-slate-900">UniLink</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/about" className="hidden md:block text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">
                            About Us
                        </Link>

                        {isInstallable && (
                            <div className="relative">
                                <button
                                    onClick={install}
                                    className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-slate-800 hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Get App</span>
                                </button>

                                {showInstallHint && (
                                    <div className="absolute top-full right-0 mt-4 flex flex-col items-end animate-bounce z-50">
                                        <div className="relative bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500">
                                            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-emerald-600 rotate-45 border-l border-t border-emerald-500"></div>
                                            <span>Install for the best experience!</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowInstallHint(false);
                                                }}
                                                className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3 text-emerald-100" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">



                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                        {/* Left Content */}
                        <div className="lg:col-span-6 relative z-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <span>The #1 Network for Nigerian Students</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 text-slate-900">
                                Your Campus. <br />
                                Your <span className="text-emerald-600">Future.</span>
                            </h1>

                            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                Join the professional community built for Nigerian universities. Connect with peers, find internships, and launch your career—all in one place.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="h-14 px-8 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 w-full sm:w-auto group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <svg className="w-6 h-6 bg-white rounded-full p-1 relative z-10" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                                    </svg>
                                    <span className="relative z-10">Continue with Google</span>
                                    <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
                                </button>


                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="lg:col-span-6 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 perspective-1000">


                            <div className="relative transform transition-transform hover:scale-[1.02] duration-500 group">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 to-transparent rounded-2xl transform translate-x-4 translate-y-4 -z-10 blur-sm"></div>
                                <img
                                    src={appMockup}
                                    alt="App Dashboard"
                                    className="w-full rounded-2xl shadow-2xl border border-slate-200/50 bg-white"
                                />

                                {/* Floating Badges */}
                                <div className="absolute -left-6 top-1/3 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce delay-100 hidden md:flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Opportunities</p>
                                        <p className="text-xs text-slate-500">Verified Internships</p>
                                    </div>
                                </div>

                                <div className="absolute -right-6 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce delay-700 hidden md:flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Community</p>
                                        <p className="text-xs text-slate-500">Connect with Peers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">
                            Everything you need to succeed on campus
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            UniLink bridges the gap between your academic life and your professional future. We provide the tools you need to stand out.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                                title: "Campus Network",
                                desc: "Connect with students from universities across Nigeria. Share ideas, collaborate on projects, and build a network that lasts a lifetime.",
                                image: campusNetworking
                            },
                            {
                                icon: Briefcase,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                                title: "Jobs & Internships",
                                desc: "Stop searching aimlessly. Get access to verified job openings and internships tailored specifically for Nigerian students.",
                                image: studentProfessional
                            },
                            {
                                icon: Shield,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                                title: "Verified Profiles",
                                desc: "Authenticity matters. Our verification system ensures you're connecting with real students and genuine organizations.",
                                image: studentsCollaboration
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
                                <div className="mb-6 rounded-2xl overflow-hidden h-48 bg-slate-100">
                                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
            <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6 text-white">
                                <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg" />
                                <span className="font-display font-bold text-xl tracking-tight">UniLink</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                The professional network built for the ambitions of Nigerian students.
                            </p>
                            <div className="flex gap-4">
                                {/* Social placeholders */}
                                <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"></div>
                                <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"></div>
                                <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"></div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Press</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Resources</h4>
                            <ul className="space-y-4 text-sm">
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Community Guidelines</a></li>
                                <li><a href="mailto:unilinkrep@gmail.com" className="hover:text-emerald-400 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link to="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/legal/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                                <li><Link to="/legal/cookie" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <p>&copy; {new Date().getFullYear()} UniLink Nigeria. All rights reserved.</p>
                        <p className="flex items-center gap-1">
                            Made with <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> in Nigeria
                        </p>
                    </div>
                </div>
            </footer>

            <InstallGuideModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                isIOS={isIOs}
            />
        </div>
    );
}
