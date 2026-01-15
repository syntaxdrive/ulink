import React, { useState, useRef } from 'react';
import { Reply, FileText, Download, CheckCheck, Check } from 'lucide-react';
import { type Message, type Profile } from '../../../types';

export const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0]);

interface MessageItemProps {
    msg: Message;
    isMe: boolean;
    onReply: (msg: Message) => void;
    activeChat?: Profile | null;
    onImageClick: (url: string) => void;
}

export default function MessageItem({ msg, isMe, onReply, activeChat, onImageClick }: MessageItemProps) {
    const [offset, setOffset] = useState(0);
    const startX = useRef<number | null>(null);
    const startY = useRef<number | null>(null);
    const isSwiping = useRef(false);
    const threshold = 100;

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isSwiping.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX.current === null || startY.current === null) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX.current;
        const diffY = Math.abs(currentY - startY.current);

        // Cancel if vertical scroll is dominant
        if (!isSwiping.current && diffY > Math.abs(diffX)) {
            startX.current = null;
            return;
        }

        // Deal with resistance/threshold
        // Deadzone check - must be deliberate
        if (!isSwiping.current && Math.abs(diffX) > 30 && diffY < 20) {
            isSwiping.current = true;
        }

        if (isSwiping.current) {
            // Prevent scrolling when swiping
            e.preventDefault();

            // isMe (Right Aligned) -> Allow Swipe Left (negative diff)
            if (isMe && diffX < 0 && diffX > -120) {
                setOffset(diffX * 0.7);
            }
            // !isMe (Left Aligned) -> Allow Swipe Right (positive diff)
            else if (!isMe && diffX > 0 && diffX < 120) {
                setOffset(diffX * 0.7);
            }
        }
    };

    const handleTouchEnd = () => {
        if (Math.abs(offset) > threshold) {
            onReply(msg);
        }
        setOffset(0);
        startX.current = null;
        startY.current = null;
        isSwiping.current = false;
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

    return (
        <div
            className={`relative flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'} overflow-visible px-2`}
            style={{ touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Avatar for received messages */}
            {!isMe && activeChat && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 mb-1 shadow-sm shrink-0 border border-white">
                    <img
                        src={activeChat.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Reply Icon Indicator */}
            <div
                className={`absolute text-stone-300 transition-opacity duration-200 flex items-center justify-center top-0 bottom-0 ${isMe ? 'right-0' : 'left-0'}`}
                style={{
                    opacity: Math.abs(offset) > 15 ? 1 : 0,
                    // Dynamic transform based on side
                    transform: isMe
                        ? `translateX(${Math.abs(offset) > threshold ? -10 : 20}px)`
                        : `translateX(${offset > threshold ? 10 : -20}px)`
                }}
            >
                <Reply className={`w-5 h-5 ${isMe ? 'scale-x-[-1]' : ''}`} />
            </div>

            <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl text-sm transition-transform duration-200 relative z-10 shadow-sm ${isMe
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'
                    }`}
                style={{ transform: `translateX(${offset}px)` }}
            >
                {/* Quoted Message Preview */}
                {quoteContent && (
                    <div className={`mb-2 p-2 rounded-lg text-xs border-l-2 flex flex-col select-none ${isMe
                        ? 'bg-emerald-800/40 border-emerald-400 text-emerald-100'
                        : 'bg-stone-100 border-stone-300 text-stone-500'
                        }`}>
                        <span className="font-bold opacity-75 text-[10px] uppercase mb-0.5">Replying to</span>
                        <span className="line-clamp-2 italic">"{quoteContent}"</span>
                    </div>
                )}

                <div className="break-words whitespace-pre-wrap">{displayContent}</div>

                {/* Message Attachment (Image or Doc) */}
                {msg.image_url && (
                    isImage(msg.image_url) ? (
                        <div className="mt-2 rounded-lg overflow-hidden border border-black/10">
                            <img
                                src={msg.image_url}
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
                                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
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

                {/* Timestamp & Read Status */}
                <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 select-none ${isMe ? 'text-emerald-100/70' : 'text-stone-400'}`}>
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                        msg.read_at ? (
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

            {/* Desktop Reply Button */}
            <button
                onClick={() => onReply(msg)}
                className={`md:hidden group-hover:block hidden opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-300 hover:text-stone-500 ${isMe ? 'mr-1' : 'ml-1'}`}
            >
                <Reply className="w-4 h-4" />
            </button>
        </div>
    );
}
