import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile, Message } from '../../types';
import { Loader2, Send, Search, ArrowLeft, X, Reply, Image as ImageIcon } from 'lucide-react';

// Helper component for swipeable messages
// Helper component for swipeable messages
const MessageItem = ({ msg, isMe, onReply, activeChat }: { msg: Message, isMe: boolean, onReply: (msg: Message) => void, activeChat?: Profile | null }) => {
    const [offset, setOffset] = useState(0);
    const startX = useRef<number | null>(null);
    const threshold = 50;

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX.current === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // Only allow sliding right (to reply) and clamp
        if (diff > 0 && diff < 100) {
            setOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        if (offset > threshold) {
            onReply(msg);
        }
        setOffset(0);
        startX.current = null;
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
            className={`relative flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
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

            {/* Reply Icon Indicator (visible when swiping) */}
            <div
                className="absolute left-0 text-stone-300 transition-opacity duration-200"
                style={{
                    opacity: offset > 10 ? 1 : 0,
                    transform: `translateX(${offset > threshold ? 10 : -20}px)`
                }}
            >
                <Reply className="w-5 h-5" />
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

                {/* Message Image */}
                {msg.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-black/10">
                        <img src={msg.image_url} alt="Attachment" className="max-w-full max-h-60 object-cover" />
                    </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] mt-1 flex justify-end select-none ${isMe ? 'text-emerald-100/70' : 'text-stone-400'}`}>
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
};


export default function MessagesPage() {
    const [conversations, setConversations] = useState<Profile[]>([]);
    const [activeChat, setActiveChat] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const activeChatRef = useRef<Profile | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const params = new URLSearchParams(window.location.search);
    const initialChatId = params.get('chat');

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);
            await fetchConversations(user.id);
            setLoading(false);
        };
        init();
    }, []);

    // Sync activeChat to Ref and clear counts
    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat) {
            setUnreadCounts(prev => {
                if (!prev[activeChat.id]) return prev;
                const newCounts = { ...prev };
                delete newCounts[activeChat.id];
                return newCounts;
            });
        }
    }, [activeChat]);

    // Global Listener for Session Unread Counts
    useEffect(() => {
        if (!userId) return;
        const channel = supabase.channel('global-messages-sidebar')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
                (payload) => {
                    const senderId = payload.new.sender_id;

                    // If currently viewing this chat, don't increment
                    if (activeChatRef.current?.id === senderId) return;

                    setUnreadCounts(prev => ({
                        ...prev,
                        [senderId]: (prev[senderId] || 0) + 1
                    }));
                })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // Presence Tracking
    useEffect(() => {
        if (!userId) return;

        const presence = supabase.channel('global-presence');
        presence
            .on('presence', { event: 'sync' }, () => {
                const state = presence.presenceState();
                const ids = new Set<string>();
                for (const key in state) {
                    // Supabase presence state values are arrays of objects
                    state[key].forEach((p: any) => {
                        if (p.user_id) ids.add(p.user_id);
                    });
                }
                setOnlineUsers(ids);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presence.track({ user_id: userId, online_at: new Date().toISOString() });
                }
            });

        return () => {
            presence.untrack().then(() => {
                supabase.removeChannel(presence);
            });
        };
    }, [userId]);

    // ... (UseEffect for fetching messages is mostly same, just adding check for initialChatId if conversations loaded)
    useEffect(() => {
        if (initialChatId && conversations.length > 0) {
            // Prevent unnecessary updates if already on the correct chat
            if (activeChat?.id === initialChatId) return;

            const target = conversations.find(c => c.id === initialChatId);
            if (target) setActiveChat(target);
        }
    }, [initialChatId, conversations, activeChat]);


    useEffect(() => {
        if (!activeChat || !userId) return;

        // Fetch initial messages for this chat
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},recipient_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},recipient_id.eq.${userId})`)
                .order('created_at', { ascending: true });

            setMessages(data || []);
        };
        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${activeChat.id}`) // Unique channel per chat to avoid conflicts
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const newMsg = payload.new as Message;

                    // Check relevance
                    if (
                        (newMsg.sender_id === activeChat.id && newMsg.recipient_id === userId) ||
                        (newMsg.sender_id === userId && newMsg.recipient_id === activeChat.id)
                    ) {
                        setMessages((prev) => {
                            // Dedupe: If message with this ID already exists, ignore
                            if (prev.some(m => m.id === newMsg.id)) return prev;

                            // If it's a message from ME, we might have an optimistic "temp-..." version.
                            // We should try to remove the temp one if we can match it (e.g. by content/time),
                            // or simple strategy: If we received a real message from me, filter out the latest temp message? 
                            // Too risky.
                            // Better: Just add it. If we have duplicates (1 temp, 1 real), it's better than missing.
                            // To fix duplicates: We can filter out `temp-` IDs that match the content of this new real ID.

                            const realFromMe = newMsg.sender_id === userId;
                            if (realFromMe) {
                                // Find a temp message with same content
                                const tempMatch = prev.find(m => m.id.startsWith('temp-') && m.content === newMsg.content);
                                if (tempMatch) {
                                    // Replace temp with real
                                    return prev.map(m => m.id === tempMatch.id ? newMsg : m);
                                }
                            }

                            return [...prev, newMsg];
                        });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log('Ready to receive messages');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeChat, userId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeChat, replyingTo]); // scroll when reply opens too

    const fetchConversations = async (myId: string) => {
        const { data: connections } = await supabase
            .from('connections')
            .select(`
                requester_id,
                recipient_id,
                requester:profiles!requester_id(*),
                recipient:profiles!recipient_id(*)
            `)
            .eq('status', 'accepted')
            .or(`requester_id.eq.${myId},recipient_id.eq.${myId}`);

        if (!connections) return;

        const profiles = connections.map((conn: any) => {
            if (conn.requester_id === myId) return conn.recipient;
            return conn.requester;
        });

        const uniqueProfiles = profiles.filter((profile, index, self) =>
            index === self.findIndex((p) => p.id === profile.id)
        );
        setConversations(uniqueProfiles);
    };

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !activeChat || !userId) return;

        const contentToSend = newMessage;

        let finalContent = contentToSend;
        if (replyingTo) {
            finalContent = `> ${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? '...' : ''}\n\n${contentToSend}`;
        }

        let imageUrl = null;
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `chat/${Date.now()}_${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads') // Using the same bucket
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

        const tempMsg: any = {
            id: 'temp-' + Date.now(),
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent,
            created_at: new Date().toISOString(),
            image_url: imageUrl || imagePreview // Optimistic image
        };

        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage('');
        setReplyingTo(null);
        clearImage();

        const { error } = await supabase.from('messages').insert({
            sender_id: userId,
            recipient_id: activeChat.id,
            content: finalContent,
            image_url: imageUrl
        });

        if (error) {
            console.error('Error sending message:', error);
            // Ideally handle error state to user
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        // Fullscreen Overlay
        <div className="fixed inset-0 top-[64px] md:top-0 left-0 md:left-[280px] right-0 bottom-[60px] md:bottom-0 bg-white z-20 flex">

            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-stone-100 flex flex-col h-full bg-white ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-stone-100">
                    <h2 className="font-bold text-lg mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search connections..."
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 text-sm">
                            <p>No connections yet.</p>
                        </div>
                    ) : (
                        conversations.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => setActiveChat(profile)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-all duration-300 text-left 
                                    ${activeChat?.id === profile.id ? 'bg-emerald-50' : ''}
                                    ${unreadCounts[profile.id] ? 'bg-emerald-50/50' : ''}
                                `}
                            >
                                <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 relative">
                                    <img
                                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {onlineUsers.has(profile.id) && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full z-10"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-stone-900 truncate">{profile.name}</h3>
                                        {unreadCounts[profile.id] > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-in zoom-in duration-300 shadow-sm">
                                                {unreadCounts[profile.id]}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-500 truncate">{profile.university || profile.role}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col h-full bg-stone-50/50 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 bg-white border-b border-stone-100 flex items-center gap-3 shadow-sm z-10">
                            <button
                                onClick={() => setActiveChat(null)}
                                className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-800"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden relative">
                                <img
                                    src={activeChat.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random`}
                                    alt={activeChat.name}
                                    className="w-full h-full object-cover"
                                />
                                {onlineUsers.has(activeChat.id) && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full z-10"></div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900">{activeChat.name}</h3>
                                <p className="text-xs text-stone-500">
                                    {onlineUsers.has(activeChat.id) ? (
                                        <span className="text-green-600 font-medium">Online</span>
                                    ) : (
                                        activeChat.role
                                    )}
                                </p>
                            </div>
                        </div>

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
                                />
                            ))}
                        </div>

                        {/* Reply Preview Banner */}
                        {(replyingTo || imagePreview) && (
                            <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex justify-between items-center text-sm text-stone-600">
                                <div className="flex items-center gap-2">
                                    {replyingTo && (
                                        <>
                                            <Reply className="w-4 h-4" />
                                            <span className="truncate max-w-[150px] md:max-w-md">Replying to: {replyingTo.content}</span>
                                        </>
                                    )}
                                    {imagePreview && (
                                        <div className="flex items-center gap-2 ml-4">
                                            <ImageIcon className="w-4 h-4" />
                                            <img src={imagePreview} className="w-8 h-8 rounded object-cover border" />
                                            <span className="text-xs">Image attached</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => { setReplyingTo(null); clearImage(); }} className="p-1 hover:text-stone-900 shrink-0 ml-2">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="p-4 bg-white border-t border-stone-100 pb-safe">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <button
                                    type="button"
                                    onClick={handleImageClick}
                                    className={`p-2 rounded-xl transition-all ${imageFile ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:text-emerald-600'}`}
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                                    className="flex-1 px-4 py-2 rounded-xl bg-stone-50 border-none outline-none focus:ring-2 focus:ring-emerald-100"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() && !imageFile}
                                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-20" />
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div >
    );
}
