import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, Briefcase, Sparkles, CheckCircle2, Download, Star, Shield, Globe } from 'lucide-react';
// import { usePWAInstall } from '../../hooks/usePWAInstall';
// import InstallGuideModal from '../../components/InstallGuideModal';

import appMockup from '../../assets/app-mockup.png';
import campusHero from '../../assets/campus-hero.png';
import studentsCollaboration from '../../assets/students-collaboration.png';
import studentProfessional from '../../assets/student-professional.png';
import campusNetworking from '../../assets/campus-networking.png';

import { SEO } from '../../components/SEO/SEO';

// ... other imports ...

export default function LandingPage() {
    const [loading, setLoading] = useState(false);
    // ... existing state ...
    const [scrolled, setScrolled] = useState(false);
    // const { isInstallable, install, showInstallModal, setShowInstallModal, isIOs } = usePWAInstall();
    // const [showInstallHint, setShowInstallHint] = useState(false);

    // ... existing useEffects ...

    /*
    useEffect(() => {
        if (isInstallable) {
            const timer = setTimeout(() => setShowInstallHint(true), 2000);
            const hideTimer = setTimeout(() => setShowInstallHint(false), 10000);
            return () => { clearTimeout(timer); clearTimeout(hideTimer); };
        }
    }, [isInstallable]);
    */

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGoogleLogin = async () => {
        // ... existing login logic ...
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
        <>
            <SEO
                title="Connect & Learn with Nigerian Students"
                description="UniLink Nigeria is the #1 platform for university students to share resources, join study groups, and find career opportunities."
                keywords={['Nigerian Universities', 'Study Groups', 'Past Questions', 'Student Jobs', 'UniLink', 'Campus Network', 'Internships Nigeria']}
            />
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
                            <a
                                href="#download"
                                className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download App
                            </a>
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

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
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
                                    </button>

                                    {/* Android Download Button */}
                                    <a
                                        href="/UniLink.apk"
                                        download="UniLink.apk"
                                        className="h-14 px-6 rounded-full bg-emerald-600 text-white font-bold text-base hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 w-full sm:w-auto group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        {/* Official Android Robot Logo */}
                                        <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.523 15.3414C17.2597 15.3414 17.0459 15.1276 17.0459 14.8643V9.2571C17.0459 8.99378 17.2597 8.78 17.523 8.78C17.7863 8.78 18.0001 8.99378 18.0001 9.2571V14.8643C18.0001 15.1276 17.7863 15.3414 17.523 15.3414Z" />
                                            <path d="M6.47741 15.3414C6.21409 15.3414 6.00031 15.1276 6.00031 14.8643V9.2571C6.00031 8.99378 6.21409 8.78 6.47741 8.78C6.74072 8.78 6.9545 8.99378 6.9545 9.2571V14.8643C6.9545 15.1276 6.74072 15.3414 6.47741 15.3414Z" />
                                            <path d="M9.64471 18.9716C9.38139 18.9716 9.16761 18.7579 9.16761 18.4945V13.4133C9.16761 13.15 9.38139 12.9362 9.64471 12.9362C9.90802 12.9362 10.1218 13.15 10.1218 13.4133V18.4945C10.1218 18.7579 9.90802 18.9716 9.64471 18.9716Z" />
                                            <path d="M14.3553 18.9716C14.092 18.9716 13.8782 18.7579 13.8782 18.4945V13.4133C13.8782 13.15 14.092 12.9362 14.3553 12.9362C14.6186 12.9362 14.8324 13.15 14.8324 13.4133V18.4945C14.8324 18.7579 14.6186 18.9716 14.3553 18.9716Z" />
                                            <path d="M15.5834 8.78005H8.41659C8.28605 8.78005 8.18042 8.67442 8.18042 8.54388V8.01636C8.18042 5.80796 9.97065 4.0177 12.1791 4.0177C14.3875 4.0177 16.1777 5.80796 16.1777 8.01636V8.54388C16.1777 8.67442 16.072 8.78005 15.9415 8.78005H15.5834Z" />
                                            <path d="M8.41659 8.78H15.5834C16.1053 8.78 16.5265 9.20117 16.5265 9.72311V15.5636C16.5265 16.8607 15.4728 17.9144 14.1757 17.9144H9.82428C8.52718 17.9144 7.47351 16.8607 7.47351 15.5636V9.72311C7.47351 9.20117 7.89468 8.78 8.41659 8.78Z" />
                                            <path d="M10.2899 6.39993L9.50462 5.05423C9.43787 4.93804 9.47704 4.79001 9.59323 4.72326C9.70942 4.65651 9.85745 4.69568 9.9242 4.81187L10.7225 6.17729C11.1374 6.03855 11.5804 5.96309 12.0408 5.96309C12.4821 5.96309 12.9071 6.03344 13.3082 6.16321L14.1005 4.81187C14.1673 4.69568 14.3153 4.65651 14.4315 4.72326C14.5477 4.79001 14.5869 4.93804 14.5201 5.05423L13.7469 6.38405C14.8268 6.87636 15.5834 7.96777 15.5834 9.23558H8.41659C8.41659 7.97956 9.1561 6.89743 10.2899 6.39993Z" />
                                            <circle cx="10.2" cy="7.8" r="0.6" fill="white" />
                                            <circle cx="13.8" cy="7.8" r="0.6" fill="white" />
                                        </svg>
                                        <div className="relative z-10 text-left">
                                            <div className="text-[10px] leading-none opacity-80 font-normal">Download for</div>
                                            <div className="text-sm font-bold leading-tight">Android APK</div>
                                        </div>
                                    </a>
                                </div>

                                <p className="mt-3 text-xs text-slate-400 text-center lg:text-left animate-in fade-in duration-1000 delay-500">
                                    Free · No Play Store needed · Enable "Install unknown apps" to install
                                </p>
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

                {/* Download Section */}
                <section id="download" className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60" />
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60" />
                    </div>

                    <div className="max-w-5xl mx-auto px-6 md:px-8 relative">
                        {/* Header */}
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-6">
                                <Download className="w-4 h-4" />
                                Get the App
                            </div>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                                UniLink in your pocket
                            </h2>
                            <p className="text-lg text-slate-500 max-w-xl mx-auto">
                                Download the Android app and stay connected with your campus community anywhere, anytime.
                            </p>
                        </div>

                        {/* Download card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {/* Left: info */}
                                <div className="p-10 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-6">
                                        <img src="/icon-512.png" alt="UniLink" className="w-14 h-14 rounded-2xl shadow-lg" />
                                        <div>
                                            <h3 className="text-white font-bold text-xl">UniLink</h3>
                                            <p className="text-slate-400 text-sm">Campus Network · Nigeria</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-slate-400 text-sm">Free to download</span>
                                    </div>

                                    <a
                                        href="/UniLink.apk"
                                        download="UniLink.apk"
                                        className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-4 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-emerald-900/30 group w-full sm:w-auto justify-center sm:justify-start"
                                    >
                                        <Download className="w-5 h-5 group-hover:animate-bounce" />
                                        <div className="text-left">
                                            <div className="text-[10px] opacity-75 font-normal leading-none">TAP TO DOWNLOAD</div>
                                            <div className="text-base leading-tight">UniLink.apk · 10.3MB</div>
                                        </div>
                                    </a>

                                    <p className="text-slate-500 text-xs mt-4">
                                        Android 7.0+ required
                                    </p>
                                </div>

                                {/* Right: install steps */}
                                <div className="bg-slate-800/50 p-10 border-t md:border-t-0 md:border-l border-slate-700/50">
                                    <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">How to install</h4>
                                    <div className="space-y-5">
                                        {[
                                            { step: '1', title: 'Download the APK', desc: 'Tap the download button and save UniLink.apk to your phone.' },
                                            { step: '2', title: 'Allow unknown sources', desc: 'Go to Settings → Security → "Install unknown apps" and enable it for your browser or file manager.' },
                                            { step: '3', title: 'Open the APK', desc: 'Find UniLink.apk in your Downloads folder and tap it to install.' },
                                            { step: '4', title: 'Sign in & connect', desc: 'Open the app, sign in with Google, and join your campus network!' },
                                        ].map(({ step, title, desc }) => (
                                            <div key={step} className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                                    {step}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{title}</p>
                                                    <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share nudge */}
                        <p className="text-center text-slate-400 text-sm mt-8">
                            📲 No Play Store needed — just download & install. Share with your classmates!
                        </p>
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
                                    <li><a href="#download" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Download className="w-3 h-3" /> Download App</a></li>
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

                {/* <InstallGuideModal
                    isOpen={showInstallModal}
                    onClose={() => setShowInstallModal(false)}
                    isIOS={isIOs}
                /> */}
            </div>
        </>
    );
}
