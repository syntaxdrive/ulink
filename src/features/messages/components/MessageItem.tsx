import { memo, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Reply, FileText, Download, CheckCheck, Check, Trash2, Play, Pause, Clock, Forward, X, ShoppingCart, ExternalLink, Ban } from 'lucide-react';
import { type Message, type Profile } from '../../../types';
import { getOptimizedMediaUrl } from '../../../services/cloudinaryService';

export const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0]);

interface MessageItemProps {
    msg: Message;
    isMe: boolean;
    onReply: (msg: Message) => void;
    activeChat?: Profile | null;
    onImageClick: (url: string) => void;
    onDelete?: (id: string, mode?: 'me' | 'everyone') => void;
    onForward?: (msg: Message) => void;
}

function MessageItem({ msg, isMe, onReply, activeChat, onImageClick, onDelete, onForward }: MessageItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const longPressTimer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isDeleted = msg.is_deleted || msg.content === 'This message was deleted';

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
        if (isDeleted) return;
        longPressTimer.current = setTimeout(() => {
            setShowMenu(true);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 400); // 400ms long press
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

    const renderContent = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const parts = text.split(urlRegex);

        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold hover:underline break-all ${
                            isMe ? 'text-white underline decoration-white/40' : 'text-emerald-600 dark:text-emerald-500'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div
            className={`relative flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'} px-2`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onContextMenu={(e) => {
                if (isDeleted) return;
                e.preventDefault();
                setShowMenu(true);
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

            {/* Message Bubble or Deleted Placeholder */}
            {isDeleted ? (
                <div
                    className={`px-4 py-2.5 rounded-2xl text-xs italic select-none opacity-80 shadow-sm border flex items-center gap-1.5 ${
                        isMe
                            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200/80 rounded-br-none'
                            : 'bg-stone-100 dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-400 rounded-bl-none'
                    }`}
                >
                    <Ban className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    <span>This message was deleted</span>
                </div>
            ) : (
                <div
                    className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl text-sm relative z-10 shadow-sm transition-transform duration-200 ${isMe
                        ? 'bg-emerald-600 dark:bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 text-stone-800 dark:text-zinc-100 rounded-bl-none'
                        }`}
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
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                                    <ShoppingCart className="w-3 h-3" /> Marketplace Item
                                </div>
                                <div>{displayContent.replace(/\[Ref: [a-f0-9-]+\]/g, '').trim()}</div>
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
                            renderContent(displayContent)
                        )}
                    </div>

                    {/* Message Attachment */}
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
                </div>
            )}

            {/* Desktop Quick Actions (visible on hover for desktop) */}
            {!isDeleted && (
                <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hidden md:flex transition-opacity ${isMe ? 'order-first mr-1' : 'order-last ml-1'}`}>
                    <button
                        onClick={() => onReply(msg)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Reply"
                    >
                        <Reply className="w-4 h-4" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete message"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Action Menu Modal (Rendered via Portal at document.body level for absolute z-index priority) */}
            {showMenu && !isDeleted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowMenu(false)}
                    />
                    <div
                        className="relative z-10 w-full max-w-xs bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 py-2 animate-in zoom-in-95 duration-200 overflow-hidden space-y-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-2 border-b border-stone-100 dark:border-zinc-800/80">
                            <p className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">Message Options</p>
                        </div>

                        <button
                            onClick={() => { setShowMenu(false); onReply(msg); }}
                            className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800/80 flex items-center gap-3 active:bg-stone-100 dark:active:bg-zinc-800 font-medium transition-colors"
                        >
                            <Reply className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" /> Reply
                        </button>
                        
                        {onForward && (
                            <button
                                onClick={() => { setShowMenu(false); onForward(msg); }}
                                className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800/80 flex items-center gap-3 active:bg-stone-100 dark:active:bg-zinc-800 font-medium transition-colors"
                            >
                                <Forward className="w-4.5 h-4.5 text-blue-500" /> Forward
                            </button>
                        )}
                        
                        {onDelete && (
                            <button
                                onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 font-medium transition-colors"
                            >
                                <Trash2 className="w-4.5 h-4.5" /> Delete
                            </button>
                        )}

                        <div className="pt-1 border-t border-stone-100 dark:border-zinc-800">
                            <button
                                onClick={() => setShowMenu(false)}
                                className="w-full text-center py-2.5 text-xs text-stone-500 dark:text-zinc-400 font-medium hover:bg-stone-50 dark:hover:bg-zinc-800/50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Options Modal (Rendered via Portal at document.body level for absolute z-index priority) */}
            {showDeleteModal && createPortal(
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-stone-900 dark:text-white">Delete message?</h3>
                            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                                {isMe
                                    ? 'You can delete this message for yourself or for everyone in the chat.'
                                    : 'This message will be removed from your chat view.'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            {isMe && (
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        onDelete?.(msg.id, 'everyone');
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm"
                                >
                                    Delete for everyone
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    onDelete?.(msg.id, 'me');
                                }}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                                    isMe
                                        ? 'bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                                }`}
                            >
                                Delete for me
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-2 rounded-xl text-stone-500 dark:text-zinc-400 font-medium text-xs hover:bg-stone-50 dark:hover:bg-zinc-800/50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
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
