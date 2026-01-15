import { Search, BadgeCheck } from 'lucide-react';
import type { Profile } from '../../../types';

interface ChatSidebarProps {
    conversations: Profile[];
    activeChat: Profile | null;
    setActiveChat: (profile: Profile) => void;
    unreadCounts: Record<string, number>;
    onlineUsers: Set<string>;
}

export default function ChatSidebar({ conversations, activeChat, setActiveChat, unreadCounts, onlineUsers }: ChatSidebarProps) {
    return (
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
                                    <h3 className="font-medium text-stone-900 truncate flex items-center gap-1">
                                        {profile.name}
                                        {profile.gold_verified ? (
                                            <BadgeCheck className="w-4 h-4 text-yellow-500 fill-yellow-50 shrink-0" />
                                        ) : profile.is_verified ? (
                                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                                        ) : null}
                                    </h3>
                                    {unreadCounts[profile.id] > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-in zoom-in duration-300 shadow-sm flex items-center justify-center">
                                            {unreadCounts[profile.id]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-stone-500 truncate">{profile.headline || profile.university || profile.role}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
