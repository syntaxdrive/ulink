import { ArrowRight, Users, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 py-3">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/icon-192.png" alt="UniLink" className="w-8 h-8 rounded-lg shadow-sm" />
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900">UniLink</span>
                    </Link>
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero */}
                <div className="max-w-3xl mx-auto px-6 text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-6">
                        <span>Our Mission</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                        Empowering the next generation of <span className="text-emerald-600">Nigerian Leaders</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        UniLink is more than just a social network. It's a professional ecosystem designed to bridge the gap between campus learning and career success for Nigerian students.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="max-w-7xl mx-auto px-6 mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Community First</h3>
                            <p className="text-slate-600">
                                We believe in the power of connection. Every student deserves access to a supportive network of peers, mentors, and alumni.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Career Focused</h3>
                            <p className="text-slate-600">
                                Our platform is built to launch careers. From internships to first jobs, we provide the tools to showcase your skills.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Safe & Verified</h3>
                            <p className="text-slate-600">
                                Trust is paramount. We vet our community to ensure a safe, professional environment for collaboration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team / Story */}
                <div className="max-w-4xl mx-auto px-6 mb-20">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Story</h2>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p className="mb-4">
                                Started in 2024, UniLink was born out of a simple observation: Nigerian universities are full of talent, but opportunities are often disconnected from students.
                            </p>
                            <p className="mb-4">
                                We set out to build a platform that unifies the student experience—bringing together social connection, academic collaboration, and professional development into one seamless app.
                            </p>
                            <p>
                                Today, we are growing rapidly across campuses, helping students build portfolios that get them hired and connections that last a lifetime.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                        Join the movement <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="/icon-192.png" alt="UniLink" className="w-6 h-6" />
                        <span className="font-bold text-slate-700">UniLink</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <Link to="/about" className="hover:text-slate-900 font-medium text-slate-900">About</Link>
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
