import { X, Globe } from 'lucide-react';
import { useAuthModalStore } from '../../stores/useAuthModalStore';
import { signInWithGoogle } from '../../lib/auth-helpers';

export default function AuthModal() {
    const { isOpen, message, closeAuthModal } = useAuthModalStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="text-center mt-2 mb-8">
                    <img src="/icon-512.png" alt="UniLink" className="w-16 h-16 rounded-2xl mx-auto shadow-md mb-4" />
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-2">Join UniLink</h2>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">{message}</p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/20 transition-all"
                >
                    <Globe className="w-5 h-5" />
                    Continue with Google
                </button>
                
                <p className="text-center text-[11px] text-slate-400 dark:text-zinc-500 mt-6 leading-relaxed">
                    By joining, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
