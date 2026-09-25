import { ArrowRight, Users, Shield, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SEO } from '../../components/SEO/SEO';

export default function AboutPage() {
    return (
        <>
            <SEO
                title="About Us - Empowering Nigerian Students"
                description="Learn about UniLink's mission to bridge the gap between campus learning and career success for every Nigerian university student."
                keywords={['About UniLink', 'Nigerian Student Community', 'University of Ibadan', 'Student Startups Nigeria', 'Career Development']}
            />
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">

                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-4">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
                            <span className="font-display font-bold text-xl tracking-tight text-slate-900">UniLink</span>
                        </Link>
                        <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2">
                            Back to Home <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </nav>

                <main className="pt-32 pb-20">
                    {/* Hero */}
                    <div className="max-w-4xl mx-auto px-6 text-center mb-24 relative">


                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
                            <span>Our Mission</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                            Empowering the next generation of <br />
                            <span className="text-emerald-600">Nigerian Leaders</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-light">
                            UniLink is more than just a social network. It's a professional ecosystem designed to bridge the gap between campus learning and career success for every Nigerian student.
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="max-w-7xl mx-auto px-6 mb-32">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Community First</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    We believe in the power of connection. Every student deserves access to a supportive network of peers, mentors, and alumni, regardless of their university.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Career Focused</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Our platform is built to launch careers. We replace the "who you know" barrier with "what you can do", providing tools to showcase your skills to the world.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">Safe & Verified</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Trust is paramount. We heavily vet our community to ensure a safe, professional, and authentic environment for collaboration and growth.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team / Story */}
                    <div className="max-w-5xl mx-auto px-6 mb-24">
                        <div className="bg-slate-900 text-slate-300 rounded-3xl overflow-hidden shadow-2xl relative">
                            {/* Background texture for card */}


                            <div className="p-10 md:p-16 relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-8 font-display">Our Story</h2>
                                <div className="space-y-6 text-lg font-light leading-relaxed">
                                    <p>
                                        Founded in 2026 by <span className="text-white font-semibold">Daniel Oyasor</span> and <span className="text-white font-semibold">Akele Divine</span>, two Economics students from the University of Ibadan, UniLink was born out of a simple observation: Nigerian universities are full of incredible talent, but opportunities are often hidden or disconnected from students.
                                    </p>
                                    <p>
                                        As students ourselves, we experienced firsthand the challenges of finding internships, connecting with like-minded peers, and accessing career opportunities. We saw brilliant students building amazing things in isolation, struggling to showcase their skills, and missing out on mentorship that could change their lives.
                                    </p>
                                    <p className="text-white font-medium">
                                        We set out to build a platform that unifies the student experience—bringing together social connection, academic collaboration, and professional development. Today, we are growing rapidly across campuses, helping students build portfolios that get them hired and connections that last a lifetime.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="text-center py-10">
                        <Link to="/" className="group inline-flex items-center gap-3 text-emerald-600 font-bold text-lg hover:text-emerald-700 transition-all bg-emerald-50 px-8 py-4 rounded-full border border-emerald-100 hover:border-emerald-200">
                            Join the movement <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </main>

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
            </div>
        </>
    );
}
