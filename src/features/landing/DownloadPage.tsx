import { Download, ChevronLeft, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DownloadPage() {
    const APK_URL = "https://github.com/syntaxdrive/ulink/releases/download/v1.0.0/UniLink-Nigeria.apk";

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = APK_URL;
        link.download = 'UniLink-Nigeria.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500/10 selection:text-emerald-600">
            {/* Minimal Header */}
            <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group text-slate-600 hover:text-emerald-600 transition-colors">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900">UniLink</span>
                        <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg" />
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Action Card */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Verified Secure Build
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                            Ready to join your campus?
                        </h1>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Get the latest version of UniLink. Connect with peers, find internships, and stay updated with your campus community.
                        </p>

                        <button
                            onClick={handleDownload}
                            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                        >
                            <Download className="w-6 h-6 group-hover:animate-bounce" />
                            <div className="text-left">
                                <div className="text-[10px] opacity-80 font-normal leading-none uppercase tracking-widest">Version v1.0.0</div>
                                <div className="text-lg">Download UniLink.apk</div>
                            </div>
                        </button>

                        <p className="text-center text-xs text-slate-400 mt-6">
                            Size: ~24.0 MB • Requires Android 7.0+
                        </p>

                        <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-tight">Fast Install</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-tight">No Spam</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Installation Guide */}
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                            Installation Guide
                            <ArrowRight className="w-5 h-5 text-emerald-500" />
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    step: '1',
                                    title: 'Download the file',
                                    desc: 'Tap the green download button to start. The APK will be saved to your Downloads folder.'
                                },
                                {
                                    step: '2',
                                    title: 'Allow Unknown Apps',
                                    desc: 'If prompted, go to Settings → Security and enable "Install unknown apps" for your browser.'
                                },
                                {
                                    step: '3',
                                    title: 'Finish Install',
                                    desc: 'Open the downloaded file and tap "Install". Once done, tap "Open".'
                                },
                                {
                                    step: '4',
                                    title: 'Sign in with Google',
                                    desc: 'Open the app and sign in with your student email to join your university network.'
                                }
                            ].map((s) => (
                                <div key={s.step} className="flex gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:border-emerald-200 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all flex-shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-1">{s.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                <strong>Tip:</strong> If you see a "Harmful App Blocked" warning, tap "More details" and then "Install anyway". This is common for apps not yet in the Play Store.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Background elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/30 rounded-full blur-3xl opacity-40 -translate-x-1/2 translate-y-1/2"></div>
            </div>
        </div>
    );
}
