import { Download, ChevronLeft, ShieldCheck, Zap, ArrowRight, CheckCircle2, Moon, Sun, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function DownloadPage() {
    const APK_URL = "https://github.com/syntaxdrive/ulink/releases/download/v1.0.0/UniLink-Nigeria.apk";
    const { isDarkMode, toggleDarkMode } = useUIStore();
    const { isInstallable, install } = usePWAInstall();

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = APK_URL;
        link.download = 'UniLink-Nigeria.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-emerald-500/10 selection:text-emerald-600 transition-colors duration-300">
            {/* Minimal Header */}
            <nav className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-slate-900 dark:text-white">UniLink</span>
                            <img src="/icon-512.png" alt="UniLink" className="w-8 h-8 rounded-lg" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Action Card */}
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Verified Secure Build
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                            Ready to join your campus?
                        </h1>
                        <p className="text-slate-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            Install UniLink as an app or download the APK for Android devices.
                        </p>

                        <div className="space-y-4">
                            {/* Option 1: PWA (Easiest) */}
                            {isInstallable && (
                                <button
                                    onClick={install}
                                    className="w-full h-16 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    <Smartphone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-medium leading-none uppercase tracking-widest">Recommended</div>
                                        <div className="text-lg">Install UniLink App</div>
                                    </div>
                                </button>
                            )}

                            {/* Option 2: APK (Alternative) */}
                            <button
                                onClick={handleDownload}
                                className={`w-full h-16 bg-slate-800 dark:bg-zinc-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-700 dark:hover:bg-zinc-700 hover:scale-[1.02] active:scale-[0.98] group ${!isInstallable ? 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400' : ''}`}
                            >
                                <Download className={`w-6 h-6 group-hover:animate-bounce text-white`} />
                                <div className="text-left">
                                    <div className="text-[10px] font-medium leading-none uppercase tracking-widest">Android APK</div>
                                    <div className="text-lg">Download UniLink-Nigeria.apk</div>
                                </div>
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-6">
                            Size: ~41.0 MB • Requires Android 7.0+
                        </p>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-tight">Fast Install</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-tight">No Spam</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Installation Guide */}
                    <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
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
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-bold text-slate-400 dark:text-zinc-600 group-hover:border-emerald-200 dark:group-hover:border-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all flex-shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-zinc-200 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{s.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
                                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                    <strong>100% Safe & Secure:</strong> This app is completely safe to install. Our APK has been verified and contains no malicious code. It only requires basic permissions to run the campus network correctly.
                                </p>
                            </div>

                            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                    <strong>Tip:</strong> If you see a "Harmful App Blocked" warning, tap "More details" and then "Install anyway". This is just a standard Android warning for apps downloaded outside the Play Store.
                                </p>
                            </div>
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
