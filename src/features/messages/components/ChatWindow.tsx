import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Send, Paperclip, Image as ImageIcon, X, FileText, Mic, Square, Loader2, Smile } from 'lucide-react';
import type { Message, Profile } from '../../../types';
import MessageItem from './MessageItem';
import ForwardMessageModal from './ForwardMessageModal';

interface ChatWindowProps {
    activeChat: Profile;
    messages: Message[];
    userId: string | null;
    onlineUsers: Set<string>;
    onBack: () => void;
    onSendMessage: (content: string, imageUrl: string | null, replyTo?: Message, audioUrl?: string | null) => Promise<void>;
    onDeleteMessage: (id: string) => Promise<void>;
}

export default function ChatWindow({ activeChat, messages, userId, onlineUsers, onBack, onSendMessage, onDeleteMessage }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [showStickers, setShowStickers] = useState(false);
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);

    // Typing Indicator Logic
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const lastTypedRef = useRef<number>(0);

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Subscribe to Typing Events
    useEffect(() => {
        if (!userId || !activeChat) return;

        // Mark messages as read
        const markRead = async () => {
            // Get conversation_id from the first message
            if (messages.length > 0 && messages[0].conversation_id) {
                const { error } = await supabase.rpc('mark_conversation_as_read', {
                    target_conversation_id: messages[0].conversation_id
                });
                if (error) console.error('Error marking read:', error);
            }
        };
        markRead();

        // Subscribe to typing ... (existing code below)
        // Create unique channel ID for this 1-on-1 chat
        // Use consistent sorting to ensure both users join "chat-room:userA-userB"
        const sortedIds = [userId, activeChat.id].sort((a, b) => a.localeCompare(b));
        const channelId = `chat-room:${sortedIds.join('-')}`;

        console.log(`Subscribing to typing channel: ${channelId}`);

        const channel = supabase.channel(channelId)
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.sender_id === activeChat.id) {
                    setIsTyping(true);

                    // Clear existing timeout
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

                    // Hide after 3 seconds of no activity
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                    }, 3000);
                }
            })
            .subscribe();

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            supabase.removeChannel(channel);
        };
    }, [userId, activeChat.id, messages.length]);

    const handleTyping = async () => {
        if (!userId || !activeChat) return;

        const now = Date.now();
        // Throttle sending typing events to once every 2 seconds
        if (now - lastTypedRef.current > 2000) {
            lastTypedRef.current = now;

            const sortedIds = [userId, activeChat.id].sort((a, b) => a.localeCompare(b));
            const channelId = `chat-room:${sortedIds.join('-')}`;

            await supabase.channel(channelId).send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: userId }
            });
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeChat, replyingTo, isTyping]); // scroll when typing appears too


    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                alert('Image size must be less than 10MB. Please choose a smaller image.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // Check file type (Images + Docs)
            const allowedTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file format. Please upload an Image, PDF, DOC, XLS, PPT, or TXT file.');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setImageFile(file);
            if (file.type.startsWith('image/')) {
                setImagePreview(URL.createObjectURL(file));
            } else {
                setImagePreview(null);
            }
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [isSending, setIsSending] = useState(false);

    // Voice Notes State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<any>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Check supported types (Safari prefers mp4, Chrome prefers webm)
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
                : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
                    : '';

            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
                await sendAudioMessage(audioBlob);
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Cannot access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
    };

    const sendAudioMessage = async (audioBlob: Blob) => {
        setIsSending(true);
        try {
            // Convert audio blob to Base64 to bypass Supabase Storage MIME type restrictions
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64Audio = reader.result as string;

                try {
                    await onSendMessage('', null, replyingTo || undefined, base64Audio);
                    setReplyingTo(null);
                } catch (error) {
                    console.error('Failed to send voice note:', error);
                    alert('Failed to send voice note');
                } finally {
                    setIsSending(false);
                }
            };

            reader.onerror = () => {
                console.error('Failed to read audio file');
                alert('Failed to process voice note');
                setIsSending(false);
            };
        } catch (error) {
            console.error('Failed to send voice note:', error);
            alert('Failed to send voice note');
            setIsSending(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ... (Keep existing typing logic hooks)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !userId || isSending) return;

        setIsSending(true);
        try {
            let imageUrl = null;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `chat/${Date.now()}_${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, imageFile);

                if (uploadError) {
                    console.error('Error uploading chat image:', uploadError);
                    alert('Failed to send image.');
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // Pass simple args to parent/hook
            await onSendMessage(newMessage, imageUrl, replyingTo || undefined);

            setNewMessage('');
            setReplyingTo(null);
            clearImage();
        } finally {
            setIsSending(false);
        }
    };

    const handleForward = (msg: Message) => {
        setForwardingMessage(msg);
        setShowForwardModal(true);
    };

    const handleForwardToRecipients = async (recipientIds: string[], message: Message) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Send message to each recipient
            for (const recipientId of recipientIds) {
                // Get or create conversation with recipient
                const { data: existingConv } = await supabase
                    .from('conversation_participants')
                    .select('conversation_id')
                    .eq('user_id', user.id)
                    .single();

                let conversationId = existingConv?.conversation_id;

                if (!conversationId) {
                    // Create new conversation
                    const { data: newConv } = await supabase
                        .from('conversations')
                        .insert({ type: 'private' })
                        .select()
                        .single();

                    if (newConv) {
                        conversationId = newConv.id;
                        // Add participants
                        await supabase.from('conversation_participants').insert([
                            { conversation_id: conversationId, user_id: user.id },
                            { conversation_id: conversationId, user_id: recipientId }
                        ]);
                    }
                }

                // Insert forwarded message
                await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    recipient_id: recipientId,
                    content: message.content,
                    image_url: message.image_url,
                    audio_url: message.audio_url
                });
            }
        } catch (error) {
            console.error('Error forwarding message:', error);
            throw error;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-stone-50/50 flex">
            {/* Header */}
            <div className="p-4 bg-white border-b border-stone-100 flex items-center gap-3 shadow-sm z-10">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-800 active:bg-stone-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <Link to={`/app/profile/${activeChat.username || activeChat.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:bg-stone-50 p-2 -my-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden relative shrink-0">
                        <img
                            src={activeChat.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random`}
                            alt={activeChat.name}
                            className="w-full h-full object-cover"
                        />
                        {onlineUsers.has(activeChat.id) && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full z-10"></div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-stone-900 flex items-center gap-1 truncate">
                            {activeChat.name}
                            {activeChat.gold_verified ? (
                                <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 shrink-0" />
                            ) : activeChat.is_verified ? (
                                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                            ) : null}
                        </h3>
                        <p className="text-xs text-stone-500 truncate">
                            {onlineUsers.has(activeChat.id) ? (
                                <span className="text-green-600 font-medium">Online</span>
                            ) : (
                                activeChat.headline || activeChat.university || activeChat.role
                            )}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Messages List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        msg={msg}
                        isMe={msg.sender_id === userId}
                        onReply={setReplyingTo}
                        activeChat={activeChat}
                        onImageClick={setLightboxImage}
                        onDelete={onDeleteMessage}
                        onForward={handleForward}
                    />
                ))}

                {/* Typing Indicator Bubble */}
                {isTyping && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Reply Preview */}
            {(replyingTo || imageFile) && (
                <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex justify-between items-center text-sm text-stone-600">
                    <div className="flex items-center gap-2">
                        {replyingTo && (
                            <>
                                <React.Fragment>
                                    <span className="truncate max-w-[150px] md:max-w-md">Replying to: {replyingTo.content}</span>
                                </React.Fragment>
                            </>
                        )}
                        {imageFile && (
                            <div className="flex items-center gap-2 ml-4">
                                {imagePreview ? (
                                    <>
                                        <ImageIcon className="w-4 h-4" />
                                        <img src={imagePreview} className="w-8 h-8 rounded object-cover border" alt="preview" />
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4" />
                                        <span className="font-medium text-stone-900 truncate max-w-[120px]">{imageFile.name}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setReplyingTo(null); clearImage(); }} className="p-1 hover:text-stone-900 shrink-0 ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            {isRecording ? (
                <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-between pb-safe">
                    <div className="flex items-center gap-3 text-red-500 animate-pulse">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="text-sm text-stone-500 font-medium">Recording voice note...</div>
                    <button
                        onClick={stopRecording}
                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-200"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-white border-t border-stone-100 pb-safe relative">
                    {/* Sticker Picker Popover */}
                    {showStickers && (
                        <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-4 w-72 grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-5 z-20">
                            <div className="col-span-4 flex justify-between items-center mb-2 pb-2 border-b border-stone-50">
                                <span className="text-xs font-bold text-stone-500 uppercase">Stickers</span>
                                <button onClick={() => setShowStickers(false)} className="bg-stone-100 p-1 rounded-full"><X className="w-3 h-3" /></button>
                            </div>
                            {['happy', 'love', 'cool', 'wink', 'cry', 'surprised', 'angry', 'confused', 'sleep', 'laugh', 'kiss', 'shades'].map(seed => (
                                <button
                                    key={seed}
                                    onClick={() => {
                                        const stickerUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}&radius=50&backgroundColor=transparent`;
                                        onSendMessage('', stickerUrl, replyingTo || undefined);
                                        setShowStickers(false);
                                    }}
                                    className="hover:bg-stone-50 p-1 rounded-xl transition-colors"
                                >
                                    <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}&radius=50&backgroundColor=transparent`} alt={seed} className="w-full h-auto" />
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleFileChange} />

                        <button
                            type="button"
                            onClick={() => setShowStickers(!showStickers)}
                            className={`p-2 rounded-xl transition-all ${showStickers ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:text-emerald-600'}`}
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleImageClick}
                            className={`p-2 rounded-xl transition-all ${imageFile ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:text-emerald-600'}`}
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                            className="flex-1 px-4 py-2 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-emerald-100"
                            autoFocus
                        />
                        {newMessage.trim() || imageFile ? (
                            <button
                                type="submit"
                                disabled={isSending}
                                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="p-2 bg-stone-50 text-stone-500 rounded-xl hover:bg-stone-200 transition-colors"
                                title="Record Voice Note"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Lightbox / Image Viewer */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxImage(null)}
                >
                    <img
                        src={lightboxImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}

            {/* Forward Message Modal */}
            <ForwardMessageModal
                message={forwardingMessage}
                isOpen={showForwardModal}
                onClose={() => {
                    setShowForwardModal(false);
                    setForwardingMessage(null);
                }}
                onForward={handleForwardToRecipients}
            />
        </div>
    );
}
