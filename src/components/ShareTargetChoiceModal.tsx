
import { MessageCircle, Send, X, Share2 } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useNavigate } from 'react-router-dom';

/**
 * A modal that appears when content is shared to UniLink from another app.
 * Allows the user to choose whether to share as a post or send as a message.
 */
export default function ShareTargetChoiceModal() {
    const { incomingShare, setIncomingShare, setPostDrawerOpen } = useUIStore();
    const navigate = useNavigate();

    if (!incomingShare) return null;

    const handleShareAsPost = () => {
        const { content, images } = incomingShare;
        setIncomingShare(null);
        
        // If on mobile, open the drawer. Otherwise navigate with state.
        if (window.innerWidth < 768) {
            setPostDrawerOpen(true, content, images);
        } else {
            navigate('/app', { state: { shareContent: content, shareImages: images }, replace: true });
        }
    };

    const handleSendAsMessage = () => {
        const { content } = incomingShare;
        setIncomingShare(null);
        // Navigate to messages with pre-filled text
        // This will allow them to pick a chat and the text will be there
        navigate(`/app/messages?text=${encodeURIComponent(content)}`);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIncomingShare(null)}
            />

            {/* Container */}
            <div className="relative w-full max-w-sm bg-white dark:bg-bg-cardDark rounded-[2.5rem] shadow-2xl p-6 border border-stone-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Decorative background */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Share to UniLink</h2>
                    </div>
                    <button 
                        onClick={() => setIncomingShare(null)}
                        className="p-2 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6 leading-relaxed">
                    How would you like to share this content?
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={handleShareAsPost}
                        className="flex items-center gap-4 w-full p-4 bg-stone-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-stone-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-2xl transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-stone-900 dark:text-white">Share as Post</p>
                            <p className="text-xs text-stone-500 dark:text-zinc-500">Post to your campus feed</p>
                        </div>
                    </button>

                    <button
                        onClick={handleSendAsMessage}
                        className="flex items-center gap-4 w-full p-4 bg-stone-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-stone-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 rounded-2xl transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-stone-900 dark:text-white">Send as Message</p>
                            <p className="text-xs text-stone-500 dark:text-zinc-500">Send directly to a connection</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
