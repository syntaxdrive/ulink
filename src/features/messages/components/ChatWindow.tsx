import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Send, Paperclip, Image as ImageIcon, X, FileText, Mic, Square, Loader2 } from 'lucide-react';
import type { Message, Profile } from '../../../types';
import MessageItem from './MessageItem';
import ForwardMessageModal from './ForwardMessageModal';
import { cloudinaryService, getOptimizedMediaUrl } from '../../../services/cloudinaryService';
import { compressImage } from '../../../lib/mediaCompression';

interface ChatWindowProps {
    activeChat: Profile;
    messages: Message[];
    userId: string | null;
    onlineUsers: Set<string>;
    onBack: () => void;
    onSendMessage: (content: string, imageUrl: string | null, replyTo?: Message, audioUrl?: string | null) => Promise<void>;
    onDeleteMessage: (id: string) => Promise<void>;
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Send, Paperclip, Image as ImageIcon, X, FileText, Mic, Square, Loader2 } from 'lucide-react';
import type { Message, Profile } from '../../../types';
import MessageItem from './MessageItem';
import ForwardMessageModal from './ForwardMessageModal';
import { cloudinaryService, getOptimizedMediaUrl } from '../../../services/cloudinaryService';
import { compressImage } from '../../../lib/mediaCompression';

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
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);

    // Typing Indicator Logic
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const lastTypedRef = useRef<number>(0);
    const typingChannelRef = useRef<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomAnchorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // Mark conversation as read when new messages arrive
    useEffect(() => {
        if (!userId || !activeChat || messages.length === 0) return;
        const firstMsg = messages[0];
        if (firstMsg?.conversation_id) {
            supabase.rpc('mark_conversation_as_read', {
                target_conversation_id: firstMsg.conversation_id
            }).then(({ error }) => {
                if (error) console.error('Error marking read:', error);
            });
        }
    }, [messages.length, userId, activeChat?.id]);

    // Subscribe to typing events — stable subscription, only changes when chat partner changes
    useEffect(() => {
        if (!userId || !activeChat) return;

        const sortedIds = [userId, activeChat.id].sort((a, b) => a.localeCompare(b));
        const channelId = `chat-room:${sortedIds.join('-')}`;

        const channel = supabase.channel(channelId)
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.sender_id === activeChat.id) {
                    setIsTyping(true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
                }
            })
            .subscribe();

        typingChannelRef.current = channel;

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingChannelRef.current = null;
            supabase.removeChannel(channel);
        };
    }, [userId, activeChat.id]);

    const handleTyping = useCallback(async () => {
        if (!userId || !activeChat) return;

        const now = Date.now();
        // Throttle sending typing events to once every 2 seconds
        if (now - lastTypedRef.current > 2000) {
            lastTypedRef.current = now;

            await typingChannelRef.current?.send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: userId }
            });
        }
    }, [userId, activeChat]);

    // Track scroll position to show/hide jump-to-bottom button
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const atBottom = distanceFromBottom < 80;
        setIsAtBottom(atBottom);
        setShowScrollBtn(!atBottom && scrollHeight > clientHeight + 200);
    }, []);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        bottomAnchorRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, []);

    // Auto-scroll to bottom on new messages — smooth when user is near bottom
    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom('smooth');
        }
    }, [messages.length, isTyping, isAtBottom, scrollToBottom]);

    // Scroll to bottom instantly when switching chats
    useEffect(() => {
        requestAnimationFrame(() => scrollToBottom('instant' as ScrollBehavior));
        setIsAtBottom(true);
        setShowScrollBtn(false);
    }, [activeChat.id, scrollToBottom]);

    // After reply/image added, scroll gently
    useEffect(() => {
        if (replyingTo || imageFile) scrollToBottom('smooth');
    }, [replyingTo, imageFile, scrollToBottom]);


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
            // Check if we're on native (APK) or Web
            const { Capacitor } = await import('@capacitor/core');
            const isNative = Capacitor.isNativePlatform();

            if (isNative) {
                // NATIVE APK PATH: Use Capacitor Plugin for permissions & stability
                const { VoiceRecorder } = await import('capacitor-voice-recorder');
                
                // Fast-check/ask for permissions
                const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
                if (!hasPermission) {
                    const { value: nowHasPermission } = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!nowHasPermission) {
                        alert('Microphone permission denied. Please enable it in Android settings.');
                        return;
                    }
                }

                await VoiceRecorder.startRecording();
            } else {
                // WEB BROWSER PATH: Use standard MediaRecorder
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
            }

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

    const stopRecording = async () => {
        if (!isRecording) return;
        
        const { Capacitor } = await import('@capacitor/core');
        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            const { VoiceRecorder } = await import('capacitor-voice-recorder');
            const { value: recording } = await VoiceRecorder.stopRecording();
            
            // Native recorder returns base64 directly — awesome for APK performance
            const base64Audio = `data:audio/aac;base64,${recording.recordDataBase64}`;
            
            setIsSending(true);
            try {
                await onSendMessage('', null, replyingTo || undefined, base64Audio);
                setReplyingTo(null);
            } catch (error) {
                console.error('Failed to send voice note:', error);
                alert('Failed to send voice note');
            } finally {
                setIsSending(false);
            }
        } else if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
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
                const isImage = imageFile.type.startsWith('image/');

                if (isImage) {
                    const compressedBlob = await compressImage(imageFile, 1280, 1280, 0.8);
                    const compressedImage = new File([compressedBlob], imageFile.name, { type: imageFile.type || 'image/jpeg' });
                    
                    if (cloudinaryService.isConfigured()) {
                        // Images → Cloudinary (f_auto,q_auto on delivery)
                        try {
                            const result = await cloudinaryService.uploadImage(compressedImage, { folder: 'ulink/messages' });
                            imageUrl = result.secureUrl;
                        } catch (cloudErr) {
                            console.warn('[Chat image] Cloudinary failed, falling back to Supabase:', cloudErr);
                            // Supabase fallback for images
                            const fileExt = compressedImage.name.split('.').pop();
                            const fileName = `chat/${Date.now()}_${Math.random()}.${fileExt}`;
                            const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, compressedImage);
                            if (uploadError) { alert('Failed to send image.'); return; }
                            imageUrl = supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl;
                        }
                    } else {
                        const fileExt = compressedImage.name.split('.').pop();
                        const fileName = `chat/${Date.now()}_${Math.random()}.${fileExt}`;
                        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, compressedImage);
                        if (uploadError) { alert('Failed to send image.'); return; }
                        imageUrl = supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl;
                    }
                } else {
                    // Non-image files (PDF, DOC, etc.) → always Supabase (uncompressed)
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `chat/${Date.now()}_${Math.random()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, imageFile);
                    if (uploadError) { alert('Failed to send file.'); return; }
                    imageUrl = supabase.storage.from('uploads').getPublicUrl(fileName).data.publicUrl;
                }
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
            const { data: { session } } = await supabase.auth.getSession();
                                handleTyping();
                            }}
                            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                            className="flex-1 px-4 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border-none outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600"
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
                                className="p-2 bg-stone-50 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
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
