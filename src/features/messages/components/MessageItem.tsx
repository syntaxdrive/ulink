import { memo, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reply, FileText, Download, CheckCheck, Check, Trash2, Play, Pause, Clock, Forward, X, ShoppingCart, ExternalLink } from 'lucide-react';
import { type Message, type Profile } from '../../../types';
import { getOptimizedMediaUrl } from '../../../services/cloudinaryService';

export const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0]);

interface MessageItemProps {
    msg: Message;
    isMe: boolean;
    onReply: (msg: Message) => void;
    activeChat?: Profile | null;
    onImageClick: (url: string) => void;
    onDelete?: (id: string) => void;
    onForward?: (msg: Message) => void;
}

function MessageItem({ msg, isMe, onReply, activeChat, onImageClick, onDelete, onForward }: MessageItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const longPressTimer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowMenu(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500); // 500ms long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleTouchMove = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    // Parsing quoted content
    const isQuote = msg.content.startsWith('> ') && msg.content.indexOf('\n\n') !== -1;
    let quoteContent = '';
    let displayContent = msg.content;

    if (isQuote) {
        const splitIndex = msg.content.indexOf('\n\n');
        quoteContent = msg.content.substring(2, splitIndex);
        displayContent = msg.content.substring(splitIndex + 2);
    }

    const waveformBars = useMemo(() => {
        const seedSource = `${msg.id}-${msg.audio_url || ''}`;
        let seed = 0;
        for (let i = 0; i < seedSource.length; i += 1) {
            seed = (seed * 31 + seedSource.charCodeAt(i)) % 9973;
        }

        return Array.from({ length: 15 }, (_, i) => {
            const value = (seed + i * 97) % 70;
            return 30 + value;
        });
    }, [msg.id, msg.audio_url]);

    return (
        <div
            className={`relative flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'} px-2`}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '120px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onContextMenu={(e) => {
                e.preventDefault(); // Prevent native browser menu
                // Also trigger menu on right click for desktop consistency if desired
                // setShowMenu(true); 
            }}
        >
            {/* Avatar for received messages */}
            {!isMe && activeChat && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-zinc-800 mb-1 shadow-sm shrink-0 border border-white dark:border-zinc-900">
                    <img
                        src={getOptimizedMediaUrl(activeChat.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl text-sm relative z-10 shadow-sm transition-transform duration-200 ${isMe
                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 text-stone-800 dark:text-zinc-100 rounded-bl-none'
                    } ${showMenu ? 'scale-105 shadow-md ring-2 ring-emerald-500/20' : ''}`}
            >
                {/* Quoted Message Preview */}
                {quoteContent && (
                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-2 flex flex-col select-none ${isMe
                        ? 'bg-emerald-800/40 border-emerald-400 text-emerald-100'
                        : 'bg-stone-100 dark:bg-zinc-800/50 border-stone-300 dark:border-zinc-600 text-stone-500 dark:text-zinc-400'
                        }`}>
                        <span className="font-bold opacity-75 text-[10px] uppercase mb-0.5">Replying to</span>
                        <span className="line-clamp-2 italic">"{quoteContent}"</span>
                    </div>
                )}

                <div className="break-words whitespace-pre-wrap">
                    {displayContent.includes('🛒') ? (
                        <div className="space-y-2">
                            {/* Header for Market Message */}
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                                <ShoppingCart className="w-3 h-3" /> Marketplace Item
                            </div>
                            
                            {/* Main Content */}
                            <div>{displayContent.replace(/\[Ref: [a-f0-9-]+\]/g, '').trim()}</div>

                            {/* View Item Card */}
                            {displayContent.match(/\[Ref: ([a-f0-9-]+)\]/) && (
                                <Link
                                    to={`/app/marketplace?id=${displayContent.match(/\[Ref: ([a-f0-9-]+)\]/)?.[1]}`}
                                    className={`mt-3 flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
                                        isMe 
                                            ? 'bg-emerald-700/40 border-emerald-500/30 hover:bg-emerald-700/60 text-emerald-50' 
                                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`p-1.5 rounded-lg ${isMe ? 'bg-emerald-800/50' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'}`}>
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[11px] font-bold truncate">View Marketplace Listing</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        displayContent
                    )}
                </div>

                {/* Message Attachment (Image or Doc) */}
                {msg.image_url && (
                    isImage(msg.image_url) ? (
                        <div className="mt-2 rounded-lg overflow-hidden border border-black/10">
                            <img
                                src={getOptimizedMediaUrl(msg.image_url)}
                                alt="Attachment"
                                className="max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => msg.image_url && onImageClick(msg.image_url)}
                            />
                        </div>
                    ) : (
                        <a
                            href={msg.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-2 flex items-center gap-3 p-3 rounded-xl border transition-colors group/file ${isMe
                                ? 'bg-emerald-700/50 border-emerald-500/30 hover:bg-emerald-700/70 text-emerald-50'
                                : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${isMe ? 'bg-emerald-800/50' : 'bg-stone-200'}`}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate opacity-90">
                                    {decodeURIComponent(msg.image_url.split('/').pop()?.split('?')[0] || 'Document')}
                                </p>
                                <p className="text-[10px] opacity-70">Tap to view</p>
                            </div>
                            <Download className="w-4 h-4 opacity-70" />
                        </a>
                    )
                )}

                {/* Audio Message */}
                {msg.audio_url && (
                    <div className={`mt-2 flex items-center gap-3 p-3 rounded-xl min-w-[200px] ${isMe ? 'bg-emerald-800/20' : 'bg-stone-100 dark:bg-zinc-800/50'
                        }`}>
                        <button
                            onClick={togglePlay}
                            className={`p-2 rounded-full shrink-0 transition-colors ${isMe ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-stone-900 dark:bg-black text-white hover:bg-stone-700 dark:hover:bg-zinc-900'
                                }`}
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <div className="flex-1 h-8 flex items-center">
                            {/* Visualizer Placeholder */}
                            <div className="flex items-center gap-0.5 h-full w-full opacity-60">
                                {waveformBars.map((height, i) => (
                                    <div
                                        key={i}
                                        className={`w-1 rounded-full ${isMe ? 'bg-white' : 'bg-stone-400'} animate-pulse`}
                                        style={{
                                            height: `${height}%`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <audio
                            ref={audioRef}
                            src={msg.audio_url}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Timestamp & Read Status */}
                <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 select-none ${isMe ? 'text-emerald-100/70' : 'text-stone-400'}`}>
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                        msg.id.startsWith('temp-') ? (
                            <div className="flex items-center gap-0.5" title="Sending...">
                                <Clock className="w-3 h-3 text-emerald-100/70" />
                            </div>
                        ) : msg.read_at ? (
                            <div className="flex items-center gap-0.5" title={`Seen ${new Date(msg.read_at).toLocaleString()}`}>
                                <CheckCheck className="w-3.5 h-3.5 text-white" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-0.5" title="Delivered">
                                <Check className="w-3.5 h-3.5 text-emerald-200" />
                            </div>
                        )
                    )}
                </div>

                {/* Context Menu Popover */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                        />
                        <div
                            className={`absolute z-[101] bottom-full mb-2 ${isMe ? 'right-0' : 'left-0'} bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-zinc-800 py-1 min-w-[160px] animate-in zoom-in-95 duration-200 overflow-hidden`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { setShowMenu(false); onReply(msg); }}
                                className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center gap-3 active:bg-stone-100 dark:active:bg-zinc-700"
                            >
                                <Reply className="w-4 h-4 text-emerald-600" /> Reply
                            </button>
                            {onForward && (
                                <button
                                    onClick={() => { setShowMenu(false); onForward(msg); }}
                                    className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center gap-3 active:bg-stone-100 dark:active:bg-zinc-700 border-t border-stone-50 dark:border-zinc-800"
                                >
                                    <Forward className="w-4 h-4 text-blue-500" /> Forward
                                </button>
                            )}
                            {isMe && onDelete && (
                                <button
                                    onClick={() => { setShowMenu(false); onDelete(msg.id); }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 border-t border-stone-50 dark:border-zinc-800 active:bg-red-50 dark:active:bg-red-900/30"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            )}
                            <button
                                onClick={() => setShowMenu(false)}
                                className="w-full text-left px-4 py-3 text-sm text-stone-400 dark:text-zinc-500 hover:bg-stone-50 dark:hover:bg-zinc-800 flex items-center gap-3 border-t border-stone-50 dark:border-zinc-800 active:bg-stone-100 dark:active:bg-zinc-700"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Reply Button (Keep for desktop hover) */}
            <button
                onClick={() => onReply(msg)}
                className={`p-2 text-stone-300 hover:text-stone-500 transition-opacity ${isMe ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 hidden md:block`}
                title="Reply"
            >
                <Reply className="w-4 h-4" />
            </button>
        </div>
    );
}

function arePropsEqual(prev: MessageItemProps, next: MessageItemProps) {
    return (
        prev.msg === next.msg &&
        prev.isMe === next.isMe &&
        prev.activeChat?.id === next.activeChat?.id
    );
}

export default memo(MessageItem, arePropsEqual);
